const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const userValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Name cannot exceed 255 characters'),
    handleValidationErrors
  ],
  
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ]
};

const noteValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 500 })
      .withMessage('Title cannot exceed 500 characters'),
    body('summary')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Summary cannot exceed 2000 characters'),
    body('content')
      .optional()
      .trim(),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Each tag cannot exceed 50 characters'),
    handleValidationErrors
  ],
  
  update: [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 500 })
      .withMessage('Title cannot exceed 500 characters'),
    body('summary')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Summary cannot exceed 2000 characters'),
    body('content')
      .optional()
      .trim(),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Each tag cannot exceed 50 characters'),
    handleValidationErrors
  ]
};

const connectionValidation = {
  create: [
    body('targetNoteId')
      .notEmpty()
      .withMessage('Target note ID is required')
      .isUUID()
      .withMessage('Target note ID must be a valid UUID'),
    body('connectionType')
      .isIn(['relacionado', 'contradice', 'ejemplifica', 'inspira', 'causa_efecto', 'parte_de'])
      .withMessage('Invalid connection type'),
    handleValidationErrors
  ]
};

module.exports = {
  userValidation,
  noteValidation,
  connectionValidation,
  handleValidationErrors
};