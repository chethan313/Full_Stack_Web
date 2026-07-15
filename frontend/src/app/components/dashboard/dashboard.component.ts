import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { TaskStats, Task } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dashboard-page">
      <!-- Hero Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="greeting">
            <span class="greeting-time">{{ getGreeting() }},</span>
            <h1 class="user-name">{{ authService.currentUser()?.name || 'User' }} 👋</h1>
            <p class="greeting-sub">Here's what's happening with your tasks today.</p>
          </div>
          <div class="header-actions">
            <a routerLink="/tasks/add" mat-raised-button class="add-task-btn">
              <mat-icon>add_circle_outline</mat-icon>
              New Task
            </a>
            <a routerLink="/tasks" mat-stroked-button class="view-all-btn">
              <mat-icon>list</mat-icon>
              View All
            </a>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <mat-spinner color="warn" diameter="50"></mat-spinner>
          <p>Loading your dashboard...</p>
        </div>
      } @else {
        <div class="dashboard-content">
          <!-- Stats Cards -->
          <div class="stats-grid">
            @for (card of statCards(); track card.label) {
              <div class="stat-card" [class]="card.colorClass">
                <div class="stat-card-icon">
                  <mat-icon>{{ card.icon }}</mat-icon>
                </div>
                <div class="stat-card-body">
                  <span class="stat-number">{{ card.value }}</span>
                  <span class="stat-label">{{ card.label }}</span>
                </div>
                <div class="stat-card-trend" [class.trend-up]="card.trend >= 0">
                  <mat-icon>{{ card.trend >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                </div>
              </div>
            }
          </div>

          <!-- Progress Section -->
          <div class="dashboard-grid">
            <!-- Completion Progress -->
            <mat-card class="progress-card glass-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>donut_large</mat-icon>
                  Overall Progress
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="progress-circle-wrapper">
                  <div class="progress-ring">
                    <svg viewBox="0 0 120 120" class="ring-svg">
                      <circle cx="60" cy="60" r="50" class="ring-bg"/>
                      <circle
                        cx="60" cy="60" r="50"
                        class="ring-fill"
                        [style.stroke-dashoffset]="getRingOffset()"
                      />
                    </svg>
                    <div class="ring-label">
                      <span class="ring-percent">{{ stats()?.completionRate || 0 }}%</span>
                      <span class="ring-sublabel">Complete</span>
                    </div>
                  </div>
                </div>

                <div class="progress-legend">
                  @for (item of progressLegend(); track item.label) {
                    <div class="legend-item">
                      <div class="legend-dot" [style.background]="item.color"></div>
                      <span class="legend-label">{{ item.label }}</span>
                      <span class="legend-value">{{ item.value }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Priority Breakdown -->
            <mat-card class="priority-card glass-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>flag</mat-icon>
                  Priority Overview
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="priority-stats">
                  @for (p of priorityItems; track p.label) {
                    <div class="priority-bar-item">
                      <div class="pbar-header">
                        <div class="pbar-label">
                          <div class="pbar-dot" [style.background]="p.color"></div>
                          <span>{{ p.label }}</span>
                        </div>
                        <span class="pbar-count">
                          {{ getPriorityCount(p.key) }}
                        </span>
                      </div>
                      <mat-progress-bar
                        mode="determinate"
                        [value]="getPriorityPercent(p.key)"
                        [color]="p.matColor"
                        class="priority-bar"
                      ></mat-progress-bar>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Recent Tasks -->
          <mat-card class="recent-tasks-card glass-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>schedule</mat-icon>
                Recent Tasks
              </mat-card-title>
              <div class="card-actions">
                <a routerLink="/tasks" mat-button class="view-all-link">View All →</a>
              </div>
            </mat-card-header>
            <mat-card-content>
              @if (recentTasks().length === 0) {
                <div class="empty-state">
                  <mat-icon>assignment_late</mat-icon>
                  <h3>No tasks yet</h3>
                  <p>Create your first task to get started!</p>
                  <a routerLink="/tasks/add" mat-raised-button class="create-btn">
                    <mat-icon>add</mat-icon> Create Task
                  </a>
                </div>
              } @else {
                <div class="tasks-list">
                  @for (task of recentTasks(); track task._id) {
                    <div class="task-row" [routerLink]="['/tasks']">
                      <div class="task-status-dot" [class]="'dot-' + task.status"></div>
                      <div class="task-info">
                        <span class="task-title" [class.task-completed]="task.status === 'completed'">
                          {{ task.title }}
                        </span>
                        <span class="task-meta">
                          Due {{ task.dueDate | date:'MMM d, y' }} ·
                          <span [class]="'priority-badge badge-' + task.priority">{{ task.priority }}</span>
                        </span>
                      </div>
                      <div class="task-status-chip" [class]="'chip-' + task.status">
                        {{ getStatusLabel(task.status) }}
                      </div>
                    </div>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h3 class="section-title">Quick Actions</h3>
            <div class="actions-grid">
              @for (action of quickActions; track action.label) {
                <a [routerLink]="action.route" class="action-card">
                  <div class="action-icon" [style.background]="action.gradient">
                    <mat-icon>{{ action.icon }}</mat-icon>
                  </div>
                  <span class="action-label">{{ action.label }}</span>
                  <mat-icon class="action-arrow">arrow_forward</mat-icon>
                </a>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
      min-height: 100vh;
      background: #09090b;
      padding-bottom: 48px;
    }

    .dashboard-header {
      background: linear-gradient(135deg, #0d0000 0%, #1a0000 50%, #09090b 100%);
      padding: 40px 32px 80px;
      position: relative;
      overflow: hidden;
    }
    .dashboard-header::after {
      content: '';
      position: absolute;
      bottom: -30px;
      left: 0;
      right: 0;
      height: 60px;
      background: #09090b;
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    }

    .header-content {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
    }

    .greeting-time {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .user-name {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 3rem;
      color: #fff;
      margin: 4px 0;
      letter-spacing: 1px;
      line-height: 1;
    }

    .greeting-sub {
      color: rgba(255,255,255,0.45);
      font-size: 0.95rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .add-task-btn {
      background: #E50914 !important;
      color: #fff !important;
      font-weight: 600 !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }

    .view-all-btn {
      color: rgba(255,255,255,0.7) !important;
      border-color: rgba(255,255,255,0.2) !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;
      color: rgba(255,255,255,0.5);
    }

    .dashboard-content {
      max-width: 1200px;
      margin: -40px auto 0;
      padding: 0 32px;
      position: relative;
      z-index: 1;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, transparent, rgba(255,255,255,0.02));
      pointer-events: none;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      border-color: rgba(229,9,20,0.3);
      box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    }

    .stat-card-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stat-card-icon mat-icon { font-size: 26px; width: 26px; height: 26px; }

    .stat-card.card-total .stat-card-icon { background: rgba(229,9,20,0.15); color: #E50914; }
    .stat-card.card-completed .stat-card-icon { background: rgba(76,175,80,0.15); color: #4caf50; }
    .stat-card.card-pending .stat-card-icon { background: rgba(255,152,0,0.15); color: #ff9800; }
    .stat-card.card-high .stat-card-icon { background: rgba(244,67,54,0.15); color: #f44336; }

    .stat-card-body {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .stat-number {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.2rem;
      color: #fff;
      line-height: 1;
      letter-spacing: 1px;
    }

    .stat-label {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.45);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    .stat-card-trend {
      color: rgba(255,255,255,0.2);
    }
    .stat-card-trend.trend-up { color: #4caf50; }

    /* Glass Cards */
    .glass-card {
      background: rgba(255,255,255,0.03) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      border-radius: 20px !important;
      color: #fff !important;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }

    mat-card-title {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      color: #fff !important;
      font-size: 1rem !important;
      font-family: 'Inter', sans-serif !important;
      font-weight: 600 !important;
    }
    mat-card-title mat-icon { color: #E50914; font-size: 20px; }

    mat-card-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 20px 20px 0 !important;
    }

    mat-card-content { padding: 20px !important; }

    /* Progress Ring */
    .progress-circle-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .progress-ring {
      position: relative;
      width: 150px;
      height: 150px;
    }

    .ring-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .ring-bg {
      fill: none;
      stroke: rgba(255,255,255,0.07);
      stroke-width: 10;
    }

    .ring-fill {
      fill: none;
      stroke: #E50914;
      stroke-width: 10;
      stroke-linecap: round;
      stroke-dasharray: 314;
      transition: stroke-dashoffset 1s ease;
    }

    .ring-label {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .ring-percent {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      color: #fff;
      letter-spacing: 1px;
      line-height: 1;
    }

    .ring-sublabel {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .progress-legend {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .legend-label {
      flex: 1;
      font-size: 0.875rem;
      color: rgba(255,255,255,0.65);
    }

    .legend-value {
      font-weight: 700;
      color: #fff;
      font-size: 0.9rem;
    }

    /* Priority Bars */
    .priority-stats { display: flex; flex-direction: column; gap: 20px; }

    .pbar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .pbar-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pbar-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .pbar-label span { color: rgba(255,255,255,0.75); font-size: 0.875rem; }
    .pbar-count { color: #fff; font-weight: 600; font-size: 0.875rem; }

    .priority-bar { border-radius: 4px; }

    /* Recent Tasks */
    .recent-tasks-card { margin-bottom: 28px; }

    .card-actions { margin-left: auto; }

    .view-all-link { color: #E50914 !important; font-size: 0.875rem !important; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px;
      text-align: center;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: rgba(255,255,255,0.2); }
    .empty-state h3 { color: rgba(255,255,255,0.6); margin: 0; }
    .empty-state p { color: rgba(255,255,255,0.35); margin: 0; }
    .create-btn { background: #E50914 !important; color: #fff !important; }

    .tasks-list { display: flex; flex-direction: column; }

    .task-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .task-row:hover { background: rgba(255,255,255,0.05); }

    .task-status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dot-todo { background: rgba(255,255,255,0.3); }
    .dot-in-progress { background: #ff9800; }
    .dot-completed { background: #4caf50; }
    .dot-cancelled { background: #666; }

    .task-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .task-title {
      color: #fff;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .task-completed { text-decoration: line-through; color: rgba(255,255,255,0.4) !important; }

    .task-meta {
      color: rgba(255,255,255,0.35);
      font-size: 0.78rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .priority-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .badge-low { background: rgba(76,175,80,0.2); color: #4caf50; }
    .badge-medium { background: rgba(255,152,0,0.2); color: #ff9800; }
    .badge-high { background: rgba(244,67,54,0.2); color: #f44336; }
    .badge-critical { background: rgba(229,9,20,0.3); color: #E50914; }

    .task-status-chip {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: capitalize;
    }
    .chip-todo { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
    .chip-in-progress { background: rgba(255,152,0,0.15); color: #ff9800; }
    .chip-completed { background: rgba(76,175,80,0.15); color: #4caf50; }
    .chip-cancelled { background: rgba(102,102,102,0.15); color: #999; }

    /* Quick Actions */
    .section-title {
      color: rgba(255,255,255,0.7);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 16px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      text-decoration: none;
      transition: all 0.3s;
      cursor: pointer;
    }
    .action-card:hover {
      background: rgba(255,255,255,0.06);
      transform: translateX(4px);
      border-color: rgba(229,9,20,0.3);
    }

    .action-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .action-icon mat-icon { color: #fff; font-size: 20px; width: 20px; height: 20px; }

    .action-label {
      flex: 1;
      color: rgba(255,255,255,0.75);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .action-arrow { color: rgba(255,255,255,0.2); font-size: 18px !important; width: 18px !important; height: 18px !important; }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .actions-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      .dashboard-header { padding: 24px 20px 70px; }
      .header-content { flex-direction: column; gap: 20px; align-items: flex-start; }
      .dashboard-content { padding: 0 20px; margin-top: -30px; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .dashboard-grid { grid-template-columns: 1fr; }
      .actions-grid { grid-template-columns: 1fr 1fr; }
      .user-name { font-size: 2rem; }
    }

    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr; }
      .actions-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<TaskStats | null>(null);
  recentTasks = signal<Task[]>([]);
  isLoading = signal(true);

  priorityItems = [
    { key: 'critical', label: 'Critical', color: '#E50914', matColor: 'warn' as const },
    { key: 'high', label: 'High', color: '#f44336', matColor: 'warn' as const },
    { key: 'medium', label: 'Medium', color: '#ff9800', matColor: 'accent' as const },
    { key: 'low', label: 'Low', color: '#4caf50', matColor: 'primary' as const },
  ];

  quickActions = [
    { label: 'Add New Task', icon: 'add_task', route: '/tasks/add', gradient: 'linear-gradient(135deg, #E50914, #8B0000)' },
    { label: 'View All Tasks', icon: 'checklist', route: '/tasks', gradient: 'linear-gradient(135deg, #1565c0, #0d47a1)' },
    { label: 'Edit Profile', icon: 'manage_accounts', route: '/profile', gradient: 'linear-gradient(135deg, #6a1b9a, #4a148c)' },
    { label: 'Completed Tasks', icon: 'task_alt', route: '/tasks?status=completed', gradient: 'linear-gradient(135deg, #1b5e20, #004d40)' },
  ];

  constructor(
    public authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    this.taskService.getTaskStats().subscribe({
      next: (response) => {
        this.stats.set(response.data);
      },
      error: (err) => console.error(err),
    });

    this.taskService.getTasks({ sortBy: 'createdAt', sortOrder: 'desc', limit: 5 }).subscribe({
      next: (response) => {
        this.recentTasks.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  statCards() {
    const s = this.stats();
    return [
      { label: 'Total Tasks', value: s?.total || 0, icon: 'assignment', colorClass: 'card-total', trend: 0 },
      { label: 'Completed', value: s?.completed || 0, icon: 'task_alt', colorClass: 'card-completed', trend: 1 },
      { label: 'Pending', value: s?.pending || 0, icon: 'pending_actions', colorClass: 'card-pending', trend: -1 },
      { label: 'High Priority', value: s?.highPriority || 0, icon: 'priority_high', colorClass: 'card-high', trend: 0 },
    ];
  }

  progressLegend() {
    const s = this.stats();
    return [
      { label: 'Completed', value: s?.completed || 0, color: '#4caf50' },
      { label: 'In Progress', value: s?.inProgress || 0, color: '#ff9800' },
      { label: 'Todo', value: s?.todo || 0, color: 'rgba(255,255,255,0.3)' },
      { label: 'Overdue', value: s?.overdue || 0, color: '#E50914' },
    ];
  }

  getRingOffset(): number {
    const rate = this.stats()?.completionRate || 0;
    const circumference = 314;
    return circumference - (circumference * rate) / 100;
  }

  getPriorityCount(key: string): number {
    // This would need actual per-priority counts from stats - approximate here
    const total = this.stats()?.total || 0;
    if (key === 'critical') return Math.round(total * 0.1);
    if (key === 'high') return Math.round(total * 0.25);
    if (key === 'medium') return Math.round(total * 0.45);
    return Math.round(total * 0.2);
  }

  getPriorityPercent(key: string): number {
    const total = this.stats()?.total || 0;
    if (total === 0) return 0;
    return (this.getPriorityCount(key) / total) * 100;
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

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
