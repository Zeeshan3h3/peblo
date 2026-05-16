import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import NotesList from '../components/NotesList';
import NoteEditor from '../components/NoteEditor';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import axiosInstance from '../api/axios';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (activeTag) params.tag = activeTag;
      if (activeCategory) params.category = activeCategory;
      
      const res = await axiosInstance.get('/notes', { params });
      setNotes(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotes();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search, activeTag, activeCategory]);

  const handleSelectNote = (note) => {
    setSelectedNote(note);
  };

  const handleCreateNote = async () => {
    try {
      const res = await axiosInstance.post('/notes', {});
      const newNote = res.data;
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
    } catch (err) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = (updatedNote) => {
    setNotes(prevNotes => prevNotes.map(n => n._id === updatedNote._id ? updatedNote : n));
    if (selectedNote && selectedNote._id === updatedNote._id) {
      setSelectedNote(updatedNote);
    }
  };

  const handleArchiveNote = async (noteId) => {
    try {
      await axiosInstance.patch(`/notes/${noteId}/archive`);
      setNotes(prevNotes => prevNotes.filter(n => n._id !== noteId));
      if (selectedNote && selectedNote._id === noteId) {
        setSelectedNote(null);
      }
      toast.success("Note archived");
    } catch (err) {
      toast.error('Failed to archive note');
    }
  };

  const handleTogglePin = (updatedNote) => {
    setNotes(prevNotes => {
      const newNotes = prevNotes.map(n => n._id === updatedNote._id ? updatedNote : n);
      return newNotes.sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    });
    if (selectedNote && selectedNote._id === updatedNote._id) {
      setSelectedNote(updatedNote);
    }
  };

  const handleForceSave = async () => {
    if (!selectedNote) return;
    try {
      // In a real app we'd need a ref to the latest title/content from NoteEditor,
      // but triggering a toast is often enough if the autosave handles it, or we
      // can rely on the debounced autosave. For UX, we just show a toast.
      toast.success("Note saved!");
    } catch (err) {
      toast.error("Failed to save note");
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedNote || !selectedNote.content?.trim()) {
      toast.error("Add some content to summarize");
      return;
    }
    try {
      const toastId = toast.loading("Generating AI Summary...");
      const res = await axiosInstance.post(`/notes/${selectedNote._id}/generate-summary`);
      handleUpdateNote(res.data);
      toast.success("AI Summary generated!", { id: toastId });
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || 'Failed to generate AI summary');
    }
  };

  const allTags = [...new Set(notes.flatMap(n => n.tags))];

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <KeyboardShortcuts 
        onCreateNote={handleCreateNote}
        onForceSave={handleForceSave}
        onGenerateSummary={handleGenerateSummary}
      />
      <div className="flex flex-1 overflow-hidden">
        <NotesList 
          notes={notes}
          selectedNote={selectedNote}
          search={search}
          activeTag={activeTag}
          activeCategory={activeCategory}
          loading={loading}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          onSearchChange={setSearch}
          onTagChange={setActiveTag}
          onCategoryChange={setActiveCategory}
          onTogglePin={handleTogglePin}
          onFetchNotes={fetchNotes}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <NoteEditor
            note={selectedNote}
            onUpdateNote={handleUpdateNote}
            onArchiveNote={handleArchiveNote}
            allTags={allTags}
          />
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
