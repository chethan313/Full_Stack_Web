/**
 * Task model interfaces
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'cancelled';

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  tags: string[];
  userId: string;
  isOverdue?: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  tags?: string[];
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus;
}

export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TaskStats {
  _id: null;
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  cancelled: number;
  highPriority: number;
  overdue: number;
  completionRate: number;
  pending: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}
