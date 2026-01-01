const { check, validationResult } = require('express-validator');

const validateRegister = [
  check('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateLogin = [
  check('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  check('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateProjectCreate = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  check('description').optional().isString().withMessage('Description must be a string'),
  check('status')
    .optional()
    .isIn(['draft', 'editing', 'processing', 'completed'])
    .withMessage('Status must be one of: draft, editing, processing, completed'),
  check('clips')
    .optional()
    .custom(value => {
      // Allow null, undefined, or valid JSON/array
      if (value === null || value === undefined) return true;
      if (Array.isArray(value)) return true;
      if (typeof value === 'object') return true;
      return false;
    })
    .withMessage('Clips must be an array or object'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateProjectUpdate = [
  check('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  check('description').optional().isString().withMessage('Description must be a string'),
  check('status')
    .optional()
    .isIn(['draft', 'editing', 'processing', 'completed'])
    .withMessage('Status must be one of: draft, editing, processing, completed'),
  check('clips')
    .optional()
    .custom(value => {
      // Allow null, undefined, or valid JSON/array
      if (value === null || value === undefined) return true;
      if (Array.isArray(value)) return true;
      if (typeof value === 'object') return true;
      return false;
    })
    .withMessage('Clips must be an array or object'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateVideoExport = [
  check('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
  check('format')
    .notEmpty()
    .withMessage('Format is required')
    .isIn(['mp4', 'mov'])
    .withMessage('Format must be either mp4 or mov'),
  check('resolution')
    .notEmpty()
    .withMessage('Resolution is required')
    .isIn(['720p', '1080p', '4K'])
    .withMessage('Resolution must be one of: 720p, 1080p, 4K'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProjectCreate,
  validateProjectUpdate,
  validateVideoExport,
};
