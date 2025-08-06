const express = require('express');
const router = express.Router();
const connectionsController = require('../controllers/connectionsController');
const authMiddleware = require('../middleware/auth');
const { connectionValidation } = require('../middleware/validation');

// All routes require authentication
router.use(authMiddleware);

// Connection types
router.get('/types', connectionsController.getConnectionTypes);

// Note connections
router.get('/note/:noteId', connectionsController.getNoteConnections);
router.post('/note/:noteId', connectionValidation.create, connectionsController.createConnection);
router.delete('/:connectionId', connectionsController.deleteConnection);

module.exports = router;