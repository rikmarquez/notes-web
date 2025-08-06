const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');

// Public routes
router.post('/register', userValidation.register, authController.register);
router.post('/login', userValidation.login, authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;