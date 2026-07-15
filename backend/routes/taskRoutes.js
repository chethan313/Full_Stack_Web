const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  getTaskStats,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All task routes are protected
router.use(protect);

// Validation rules for task creation
const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Task description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Priority must be low, medium, high, or critical'),
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Please provide a valid date'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

// Validation rules for task update (all fields optional)
const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority value'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status value'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Please provide a valid date'),
];

// Routes
router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', taskValidation, createTask);
router.put('/:id', updateTaskValidation, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
