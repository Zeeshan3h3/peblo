const Note = require('../models/Note');
const crypto = require('crypto');
require('dotenv').config();

const getAllNotes = async (req, res) => {
  try {
    const { search, tag, sort, category, archived } = req.query;
    const query = { userId: req.user._id };

    if (archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = false;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Default sort is descending by isPinned and updatedAt
    let sortObj = { isPinned: -1, updatedAt: -1 };
    if (sort === 'asc') sortObj = { updatedAt: 1 };

    const notes = await Note.find(query).sort(sortObj);
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    const note = new Note({
      userId: req.user._id,
      title,
      content,
      tags,
      category,
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const { title, content, tags, category } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (category !== undefined) note.category = category;

    const updatedNote = await note.save();
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const archiveNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isArchived = true;
    await note.save();
    res.status(200).json({ message: 'Note archived' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const unarchiveNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isArchived = false;
    await note.save();
    res.status(200).json({ message: 'Note restored' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    const updatedNote = await note.save();
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const generateSummary = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!note.content || note.content.trim() === '') {
      return res.status(400).json({ message: 'Note has no content to summarize' });
    }

    const plainContent = note.content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful assistant. Analyze the following note and return ONLY a valid JSON object with no extra text, no markdown, no code blocks.

The JSON must have exactly these three keys:
- summary: a 2-3 sentence summary of the note
- action_items: an array of strings, each a clear action item found in the note (empty array if none)
- suggested_title: a short, descriptive title for the note

Note content:
${plainContent}`
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return res.status(500).json({ message: 'Server error' });
    }

    const data = await geminiResponse.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      return res.status(500).json({ message: 'AI refused to generate summary' });
    }

    let aiText = data.candidates[0].content?.parts?.[0]?.text;
    if (!aiText) {
      return res.status(500).json({ message: 'Server error' });
    }
    
    // Clean up potential markdown formatting that causes JSON.parse to crash
    aiText = aiText.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim();
    
    let aiData;
    try {
      aiData = JSON.parse(aiText);
    } catch (parseError) {
      return res.status(500).json({ message: 'Server error' });
    }

    note.aiSummary = aiData.summary || '';
    note.aiActionItems = aiData.action_items || [];
    note.aiSuggestedTitle = aiData.suggested_title || '';
    note.aiUsageCount = (note.aiUsageCount || 0) + 1;

    await note.save();

    res.status(200).json(note);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const shareNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.shareId) {
      return res.status(200).json({
        shareId: note.shareId,
        shareUrl: `/shared/${note.shareId}`,
      });
    }

    const shareId = crypto.randomUUID();
    note.isPublic = true;
    note.shareId = shareId;
    await note.save();

    res.status(200).json({
      shareId: note.shareId,
      shareUrl: `/shared/${note.shareId}`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSharedNote = async (req, res) => {
  try {
    const note = await Note.findOne({ shareId: req.params.shareId, isPublic: true });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or not public' });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Count total notes for user (not archived)
    const totalNotes = await Note.countDocuments({ userId, isArchived: false });

    // 2. Count notes updated in last 7 days for user
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyEdited = await Note.countDocuments({
      userId,
      updatedAt: { $gte: sevenDaysAgo },
    });

    // 3. Top 5 tags
    const topTagsAgg = await Note.aggregate([
      { $match: { userId } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]);

    // 4. Sum up all aiUsageCount for user's notes
    const aiUsageAgg = await Note.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalAiUsage: { $sum: '$aiUsageCount' } } },
    ]);
    const totalAiUsage = aiUsageAgg.length > 0 ? aiUsageAgg[0].totalAiUsage : 0;

    res.status(200).json({
      totalNotes,
      recentlyEdited,
      topTags: topTagsAgg,
      totalAiUsage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  archiveNote,
  unarchiveNote,
  togglePin,
  generateSummary,
  shareNote,
  getSharedNote,
  getInsights,
};
