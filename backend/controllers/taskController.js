const { validationResult } = require('express-validator');
const Task = require('../models/Task');

/**
 * @desc    Get all tasks for the authenticated user
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build query filter
    const filter = { userId: req.user._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Build sort object
    const sort = {};
    const validSortFields = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute queries in parallel for efficiency
    const [tasks, totalCount] = await Promise.all([
      Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Task.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks. Please try again.',
    });
  }
};

/**
 * @desc    Get task statistics for dashboard
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Aggregate stats in a single query
    const stats = await Task.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          todo: {
            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
          highPriority: {
            $sum: {
              $cond: [
                { $in: ['$priority', ['high', 'critical']] },
                1,
                0,
              ],
            },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', now] },
                    { $not: [ { $in: ['$status', ['completed', 'cancelled']] } ] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const taskStats = stats[0] || {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      cancelled: 0,
      highPriority: 0,
      overdue: 0,
    };

    // Calculate completion rate
    const completionRate =
      taskStats.total > 0
        ? Math.round((taskStats.completed / taskStats.total) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        ...taskStats,
        completionRate,
        pending: taskStats.todo + taskStats.inProgress,
      },
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics. Please try again.',
    });
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean({ virtuals: true });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Get task error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const { title, description, priority, dueDate, tags } = req.body;

    // Create task associated with authenticated user
    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      tags: tags || [],
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating task. Please try again.',
    });
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const { title, description, priority, status, dueDate, tags } = req.body;

    // Find task and ensure it belongs to the user
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Update allowed fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags !== undefined) task.tags = tags;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: task,
    });
  } catch (error) {
    console.error('Update task error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating task. Please try again.',
    });
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error('Delete task error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error deleting task. Please try again.',
    });
  }
};

module.exports = {
  getTasks,
  getTaskStats,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
