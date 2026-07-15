import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { NotificationService } from '../../services/notification.service';
import { Task, TaskFilters, TaskStatus, TaskPriority } from '../../models/task.model';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  template: `
    <div class="tasks-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-inner">
          <div class="header-title">
            <mat-icon>checklist</mat-icon>
            <div>
              <h1>My Tasks</h1>
              <p>{{ totalCount() }} tasks found</p>
            </div>
          </div>
          <a routerLink="/tasks/add" mat-raised-button class="add-btn">
            <mat-icon>add</mat-icon>
            Add Task
          </a>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="filters-section">
        <div class="filters-inner">
          <!-- Search -->
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search tasks...</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)" />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <!-- Status Filter -->
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilters()">
              <mat-option value="all">All Status</mat-option>
              <mat-option value="todo">Todo</mat-option>
              <mat-option value="in-progress">In Progress</mat-option>
              <mat-option value="completed">Completed</mat-option>
              <mat-option value="cancelled">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Priority Filter -->
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Priority</mat-label>
            <mat-select [(ngModel)]="selectedPriority" (ngModelChange)="applyFilters()">
              <mat-option value="all">All Priority</mat-option>
              <mat-option value="critical">Critical</mat-option>
              <mat-option value="high">High</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="low">Low</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Sort -->
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Sort By</mat-label>
            <mat-select [(ngModel)]="selectedSort" (ngModelChange)="applyFilters()">
              <mat-option value="createdAt">Date Created</mat-option>
              <mat-option value="dueDate">Due Date</mat-option>
              <mat-option value="priority">Priority</mat-option>
              <mat-option value="title">Title</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- View Toggle -->
          <div class="view-toggle">
            <button mat-icon-button (click)="viewMode.set('grid')" [class.active-view]="viewMode() === 'grid'" matTooltip="Grid View">
              <mat-icon>grid_view</mat-icon>
            </button>
            <button mat-icon-button (click)="viewMode.set('list')" [class.active-view]="viewMode() === 'list'" matTooltip="List View">
              <mat-icon>view_list</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="tasks-content">
        @if (isLoading()) {
          <div class="loading-state">
            <mat-spinner color="warn" diameter="48"></mat-spinner>
            <p>Loading tasks...</p>
          </div>
        } @else if (tasks().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <mat-icon>inbox</mat-icon>
            </div>
            <h2>No tasks found</h2>
            <p>{{ hasFilters() ? 'Try adjusting your filters or search.' : 'Get started by creating your first task!' }}</p>
            @if (!hasFilters()) {
              <a routerLink="/tasks/add" mat-raised-button class="add-btn-empty">
                <mat-icon>add</mat-icon> Create First Task
              </a>
            } @else {
              <button mat-stroked-button (click)="clearFilters()" class="clear-btn">
                <mat-icon>clear</mat-icon> Clear Filters
              </button>
            }
          </div>
        } @else {
          <!-- Grid View -->
          @if (viewMode() === 'grid') {
            <div class="tasks-grid">
              @for (task of tasks(); track task._id) {
                <div class="task-card" [class]="'priority-border-' + task.priority">
                  <!-- Card Header -->
                  <div class="task-card-header">
                    <div class="task-priority-badge" [class]="'badge-' + task.priority">
                      <mat-icon>flag</mat-icon>
                      {{ task.priority }}
                    </div>
                    <div class="task-card-menu" [matMenuTriggerFor]="taskMenu">
                      <mat-icon>more_vert</mat-icon>
                    </div>
                    <mat-menu #taskMenu="matMenu">
                      <button mat-menu-item [routerLink]="['/tasks/edit', task._id]">
                        <mat-icon>edit</mat-icon> Edit Task
                      </button>
                      <button mat-menu-item (click)="quickStatusChange(task, 'completed')" [disabled]="task.status === 'completed'">
                        <mat-icon>task_alt</mat-icon> Mark Complete
                      </button>
                      <button mat-menu-item (click)="confirmDelete(task)" class="delete-menu-item">
                        <mat-icon>delete</mat-icon> Delete
                      </button>
                    </mat-menu>
                  </div>

                  <!-- Title -->
                  <h3 class="task-card-title" [class.completed-title]="task.status === 'completed'">
                    {{ task.title }}
                  </h3>

                  <!-- Description -->
                  <p class="task-card-desc">{{ task.description | slice:0:100 }}{{ task.description.length > 100 ? '...' : '' }}</p>

                  <!-- Tags -->
                  @if (task.tags?.length) {
                    <div class="task-tags">
                      @for (tag of task.tags.slice(0, 3); track tag) {
                        <span class="task-tag">{{ tag }}</span>
                      }
                    </div>
                  }

                  <!-- Footer -->
                  <div class="task-card-footer">
                    <div class="task-due" [class.overdue]="task.isOverdue">
                      <mat-icon>{{ task.isOverdue ? 'warning' : 'calendar_today' }}</mat-icon>
                      <span>{{ task.dueDate | date:'MMM d, y' }}</span>
                    </div>
                    <div class="task-status-chip" [class]="'chip-' + task.status">
                      {{ getStatusLabel(task.status) }}
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="task-card-actions">
                    <a [routerLink]="['/tasks/edit', task._id]" mat-stroked-button class="edit-btn">
                      <mat-icon>edit</mat-icon> Edit
                    </a>
                    <button mat-icon-button class="delete-btn" (click)="confirmDelete(task)" matTooltip="Delete Task">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          }

          <!-- List View -->
          @if (viewMode() === 'list') {
            <div class="tasks-table">
              <div class="table-header">
                <span class="col-title">Task</span>
                <span class="col-priority">Priority</span>
                <span class="col-status">Status</span>
                <span class="col-due">Due Date</span>
                <span class="col-actions">Actions</span>
              </div>
              @for (task of tasks(); track task._id) {
                <div class="table-row" [class.row-completed]="task.status === 'completed'">
                  <div class="col-title">
                    <div class="row-dot" [class]="'dot-' + task.status"></div>
                    <div class="row-info">
                      <span class="row-title" [class.completed-title]="task.status === 'completed'">{{ task.title }}</span>
                      <span class="row-desc">{{ task.description | slice:0:60 }}...</span>
                    </div>
                  </div>
                  <div class="col-priority">
                    <span class="priority-badge" [class]="'badge-' + task.priority">{{ task.priority }}</span>
                  </div>
                  <div class="col-status">
                    <span class="status-chip" [class]="'chip-' + task.status">{{ getStatusLabel(task.status) }}</span>
                  </div>
                  <div class="col-due" [class.overdue-text]="task.isOverdue">
                    {{ task.dueDate | date:'MMM d' }}
                  </div>
                  <div class="col-actions row-actions">
                    <a [routerLink]="['/tasks/edit', task._id]" mat-icon-button matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </a>
                    <button mat-icon-button (click)="quickStatusChange(task, 'completed')" matTooltip="Mark Complete" [disabled]="task.status === 'completed'">
                      <mat-icon>check_circle_outline</mat-icon>
                    </button>
                    <button mat-icon-button (click)="confirmDelete(task)" matTooltip="Delete" class="delete-action">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Pagination -->
          <mat-paginator
            [length]="totalCount()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[6, 12, 24]"
            (page)="onPageChange($event)"
            class="paginator"
          ></mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [`
    .tasks-page {
      min-height: 100vh;
      background: #09090b;
      padding-bottom: 48px;
    }

    .page-header {
      background: linear-gradient(135deg, #0d0000, #1a0000, #09090b);
      padding: 32px 32px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .header-title mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #E50914;
    }
    .header-title h1 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      color: #fff;
      margin: 0;
      letter-spacing: 1px;
    }
    .header-title p {
      color: rgba(255,255,255,0.4);
      font-size: 0.85rem;
      margin: 0;
    }

    .add-btn {
      background: #E50914 !important;
      color: #fff !important;
      font-weight: 600 !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }

    /* Filters */
    .filters-section {
      background: rgba(255,255,255,0.02);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding: 16px 32px;
    }

    .filters-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .search-field { flex: 1; min-width: 200px; }
    .filter-field { min-width: 150px; }

    .view-toggle {
      display: flex;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      padding: 4px;
    }

    .active-view {
      background: rgba(229,9,20,0.2) !important;
      color: #E50914 !important;
    }

    /* Content */
    .tasks-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 32px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      gap: 16px;
      color: rgba(255,255,255,0.4);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;
      text-align: center;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(229,9,20,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .empty-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: rgba(229,9,20,0.5);
    }

    .empty-state h2 { color: rgba(255,255,255,0.7); margin: 0; }
    .empty-state p { color: rgba(255,255,255,0.35); margin: 0; }
    .add-btn-empty { background: #E50914 !important; color: #fff !important; }
    .clear-btn { color: rgba(255,255,255,0.6) !important; border-color: rgba(255,255,255,0.2) !important; }

    /* Grid View */
    .tasks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .task-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 20px;
      transition: all 0.3s;
      position: relative;
      border-left-width: 4px;
    }
    .task-card:hover {
      background: rgba(255,255,255,0.05);
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.3);
    }

    .priority-border-critical { border-left-color: #E50914; }
    .priority-border-high { border-left-color: #f44336; }
    .priority-border-medium { border-left-color: #ff9800; }
    .priority-border-low { border-left-color: #4caf50; }

    .task-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .task-priority-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .task-priority-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .badge-critical { background: rgba(229,9,20,0.2); color: #E50914; }
    .badge-high { background: rgba(244,67,54,0.2); color: #f44336; }
    .badge-medium { background: rgba(255,152,0,0.2); color: #ff9800; }
    .badge-low { background: rgba(76,175,80,0.2); color: #4caf50; }

    .task-card-menu {
      cursor: pointer;
      color: rgba(255,255,255,0.3);
      padding: 4px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .task-card-menu:hover { background: rgba(255,255,255,0.08); color: #fff; }

    .task-card-title {
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 8px;
      line-height: 1.4;
    }
    .completed-title { text-decoration: line-through; color: rgba(255,255,255,0.35) !important; }

    .task-card-desc {
      color: rgba(255,255,255,0.45);
      font-size: 0.85rem;
      line-height: 1.5;
      margin: 0 0 12px;
    }

    .task-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .task-tag {
      padding: 3px 8px;
      background: rgba(255,255,255,0.07);
      border-radius: 6px;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.5);
    }

    .task-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-bottom: 12px;
    }

    .task-due {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(255,255,255,0.4);
      font-size: 0.8rem;
    }
    .task-due mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .task-due.overdue { color: #E50914; }

    .task-status-chip {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 500;
    }
    .chip-todo { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }
    .chip-in-progress { background: rgba(255,152,0,0.15); color: #ff9800; }
    .chip-completed { background: rgba(76,175,80,0.15); color: #4caf50; }
    .chip-cancelled { background: rgba(102,102,102,0.15); color: #888; }

    .task-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .edit-btn {
      color: rgba(255,255,255,0.6) !important;
      border-color: rgba(255,255,255,0.15) !important;
      font-size: 0.8rem !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
    }
    .edit-btn mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
    .edit-btn:hover { border-color: #E50914 !important; color: #E50914 !important; }

    .delete-btn { color: rgba(229,9,20,0.6) !important; }
    .delete-btn:hover { color: #E50914 !important; }

    /* List View */
    .tasks-table {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 24px;
    }

    .table-header {
      display: grid;
      grid-template-columns: 1fr 120px 130px 120px 140px;
      padding: 12px 20px;
      background: rgba(255,255,255,0.04);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: rgba(255,255,255,0.35);
      font-weight: 600;
    }

    .table-row {
      display: grid;
      grid-template-columns: 1fr 120px 130px 120px 140px;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      align-items: center;
      transition: background 0.2s;
    }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: rgba(255,255,255,0.03); }
    .row-completed { opacity: 0.6; }

    .col-title { display: flex; align-items: center; gap: 12px; }

    .row-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dot-todo { background: rgba(255,255,255,0.25); }
    .dot-in-progress { background: #ff9800; }
    .dot-completed { background: #4caf50; }
    .dot-cancelled { background: #666; }

    .row-info { display: flex; flex-direction: column; gap: 4px; }

    .row-title {
      color: #fff;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .row-desc {
      color: rgba(255,255,255,0.35);
      font-size: 0.78rem;
    }

    .priority-badge {
      padding: 4px 10px;
      border-radius: 10px;
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .status-chip {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
    }

    .col-due { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
    .overdue-text { color: #E50914 !important; }

    .row-actions { display: flex; gap: 4px; }
    .delete-action { color: rgba(229,9,20,0.7) !important; }
    .delete-menu-item { color: #E50914 !important; }

    /* Paginator */
    .paginator {
      background: transparent !important;
      color: rgba(255,255,255,0.6) !important;
    }

    /* Material Form overrides */
    ::ng-deep .tasks-page .mat-mdc-form-field {
      --mdc-outlined-text-field-outline-color: rgba(255,255,255,0.1);
      --mdc-outlined-text-field-hover-outline-color: rgba(255,255,255,0.25);
      --mdc-outlined-text-field-focus-outline-color: #E50914;
      --mdc-outlined-text-field-label-text-color: rgba(255,255,255,0.4);
      --mdc-outlined-text-field-input-text-color: #fff;
    }
    ::ng-deep .tasks-page .mat-mdc-form-field .mat-mdc-text-field-wrapper {
      background: rgba(255,255,255,0.03) !important;
    }
    ::ng-deep .mat-mdc-select-value { color: rgba(255,255,255,0.8); }
    ::ng-deep .mat-mdc-paginator { background: transparent !important; color: rgba(255,255,255,0.5) !important; }
    ::ng-deep .mat-mdc-paginator-icon { fill: rgba(255,255,255,0.5) !important; }
    ::ng-deep .mat-mdc-paginator-range-label { color: rgba(255,255,255,0.4) !important; }

    @media (max-width: 768px) {
      .page-header { padding: 20px; }
      .filters-section { padding: 16px 20px; }
      .tasks-content { padding: 20px; }
      .tasks-grid { grid-template-columns: 1fr; }
      .table-header, .table-row {
        grid-template-columns: 1fr 90px 100px;
      }
      .col-due, .col-actions { display: none; }
    }
  `]
})
export class TaskListComponent implements OnInit {
  tasks = signal<Task[]>([]);
  isLoading = signal(true);
  totalCount = signal(0);
  viewMode = signal<'grid' | 'list'>('grid');

  searchQuery = '';
  selectedStatus: string = 'all';
  selectedPriority: string = 'all';
  selectedSort = 'createdAt';
  pageSize = 9;
  currentPage = 0;

  private searchSubject = new Subject<string>();

  constructor(
    private taskService: TaskService,
    private notify: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadTasks();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => this.loadTasks());
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadTasks();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'all';
    this.selectedPriority = 'all';
    this.selectedSort = 'createdAt';
    this.loadTasks();
  }

  hasFilters(): boolean {
    return !!(
      this.searchQuery ||
      this.selectedStatus !== 'all' ||
      this.selectedPriority !== 'all'
    );
  }

  loadTasks(): void {
    this.isLoading.set(true);

    const filters: TaskFilters = {
      page: this.currentPage + 1,
      limit: this.pageSize,
      sortBy: this.selectedSort as any,
      sortOrder: 'desc',
    };

    if (this.selectedStatus !== 'all') filters.status = this.selectedStatus as TaskStatus;
    if (this.selectedPriority !== 'all') filters.priority = this.selectedPriority as TaskPriority;
    if (this.searchQuery) filters.search = this.searchQuery;

    this.taskService.getTasks(filters).subscribe({
      next: (response) => {
        this.tasks.set(response.data);
        this.totalCount.set(response.pagination.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notify.error('Failed to load tasks');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTasks();
  }

  quickStatusChange(task: Task, status: TaskStatus): void {
    this.taskService.updateTask(task._id, { status }).subscribe({
      next: () => {
        this.notify.success('Task status updated!');
        this.loadTasks();
      },
      error: () => this.notify.error('Failed to update task status'),
    });
  }

  confirmDelete(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        isDanger: true,
      },
      panelClass: 'dark-dialog',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.deleteTask(task._id);
    });
  }

  private deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.notify.success('Task deleted successfully');
        this.loadTasks();
      },
      error: () => this.notify.error('Failed to delete task'),
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'todo': 'Todo',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
    };
    return map[status] || status;
  }
}
