const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/noteController');

const router = express.Router();

router.get('/insights', protect, getInsights);
router.get('/shared/:shareId', getSharedNote);

router.get('/', protect, getAllNotes);
router.post('/', protect, createNote);
router.patch('/:id', protect, updateNote);
router.patch('/:id/archive', protect, archiveNote);
router.patch('/:id/unarchive', protect, unarchiveNote);
router.patch('/:id/pin', protect, togglePin);
router.post('/:id/generate-summary', protect, generateSummary);
router.post('/:id/extract-actions', protect, generateSummary);
router.post('/:id/share', protect, shareNote);

module.exports = router;
