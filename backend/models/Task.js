const mongoose = require('mongoose');

/**
 * Task Schema
 * Stores individual task information linked to a user
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: 'Priority must be low, medium, high, or critical',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'completed', 'cancelled'],
        message: 'Status must be todo, in-progress, completed, or cancelled',
      },
      default: 'todo',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Index for faster queries
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Compound index for efficient user-task queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

/**
 * Pre-save middleware: Set completedAt when status changes to completed
 */
taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  } else if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = null;
  }
  next();
});

/**
 * Virtual: Check if task is overdue
 */
taskSchema.virtual('isOverdue').get(function () {
  return (
    this.dueDate < new Date() &&
    this.status !== 'completed' &&
    this.status !== 'cancelled'
  );
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
