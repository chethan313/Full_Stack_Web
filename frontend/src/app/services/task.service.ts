import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Task,
  TasksResponse,
  TaskStats,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  ApiResponse,
} from '../models/task.model';

/**
 * TaskService - Handles all task CRUD operations with the backend API
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  /**
   * Get all tasks with optional filters and pagination
   */
  getTasks(filters?: TaskFilters): Observable<TasksResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        params = params.set('status', filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        params = params.set('priority', filters.priority);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.sortBy) {
        params = params.set('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params = params.set('sortOrder', filters.sortOrder);
      }
      if (filters.page) {
        params = params.set('page', filters.page.toString());
      }
      if (filters.limit) {
        params = params.set('limit', filters.limit.toString());
      }
    }

    return this.http
      .get<TasksResponse>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get task statistics for dashboard
   */
  getTaskStats(): Observable<{ success: boolean; data: TaskStats }> {
    return this.http
      .get<{ success: boolean; data: TaskStats }>(`${this.apiUrl}/stats`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get a single task by ID
   */
  getTask(id: string): Observable<{ success: boolean; data: Task }> {
    return this.http
      .get<{ success: boolean; data: Task }>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new task
   */
  createTask(data: CreateTaskRequest): Observable<{ success: boolean; data: Task; message: string }> {
    return this.http
      .post<{ success: boolean; data: Task; message: string }>(this.apiUrl, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update an existing task
   */
  updateTask(
    id: string,
    data: UpdateTaskRequest
  ): Observable<{ success: boolean; data: Task; message: string }> {
    return this.http
      .put<{ success: boolean; data: Task; message: string }>(
        `${this.apiUrl}/${id}`,
        data
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a task by ID
   */
  deleteTask(id: string): Observable<ApiResponse<{ id: string }>> {
    return this.http
      .delete<ApiResponse<{ id: string }>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    return throwError(() => error);
  }
}
