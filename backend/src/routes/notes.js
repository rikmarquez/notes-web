const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const authMiddleware = require('../middleware/auth');
const { noteValidation } = require('../middleware/validation');

// All routes require authentication
router.use(authMiddleware);

// Notes CRUD
router.post('/', noteValidation.create, notesController.createNote);
router.post('/import', notesController.importNotes);
router.get('/', notesController.getNotes);
router.get('/search', notesController.searchNotes);
router.get('/tags', notesController.getUserTags);
router.get('/tag/:tag', notesController.getNotesByTag);
router.get('/:id', notesController.getNote);
router.put('/:id', noteValidation.update, notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

module.exports = router;