import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { TaskService } from '../../services/task.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="task-form-page">
      <div class="page-header">
        <div class="header-inner">
          <button mat-icon-button routerLink="/tasks" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-title">
            <mat-icon>{{ isEditMode() ? 'edit_note' : 'add_task' }}</mat-icon>
            <div>
              <h1>{{ isEditMode() ? 'Edit Task' : 'Create New Task' }}</h1>
              <p>{{ isEditMode() ? 'Update task details below' : 'Fill in the details to create a new task' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="form-container">
        @if (loadingTask()) {
          <div class="loading-state">
            <mat-spinner color="warn" diameter="48"></mat-spinner>
            <p>Loading task...</p>
          </div>
        } @else {
          <div class="form-grid">
            <!-- Main Form -->
            <div class="form-main">
              <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
                <!-- Title -->
                <div class="form-section">
                  <label class="form-label">Task Title *</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <input
                      matInput
                      formControlName="title"
                      placeholder="Enter a clear, descriptive title..."
                      maxlength="100"
                    />
                    <mat-hint align="end">{{ taskForm.get('title')?.value?.length || 0 }}/100</mat-hint>
                    @if (f['title'].hasError('required') && f['title'].touched) {
                      <mat-error>Title is required</mat-error>
                    } @else if (f['title'].hasError('minlength') && f['title'].touched) {
                      <mat-error>Title must be at least 3 characters</mat-error>
                    }
                  </mat-form-field>
                </div>

                <!-- Description -->
                <div class="form-section">
                  <label class="form-label">Description *</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <textarea
                      matInput
                      formControlName="description"
                      placeholder="Describe the task in detail..."
                      rows="5"
                      maxlength="1000"
                    ></textarea>
                    <mat-hint align="end">{{ taskForm.get('description')?.value?.length || 0 }}/1000</mat-hint>
                    @if (f['description'].hasError('required') && f['description'].touched) {
                      <mat-error>Description is required</mat-error>
                    }
                  </mat-form-field>
                </div>

                <!-- Priority and Due Date Row -->
                <div class="form-row">
                  <!-- Priority -->
                  <div class="form-section">
                    <label class="form-label">Priority *</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Select priority</mat-label>
                      <mat-select formControlName="priority">
                        <mat-option value="low">
                          <span class="priority-option low">
                            <mat-icon>flag</mat-icon> Low
                          </span>
                        </mat-option>
                        <mat-option value="medium">
                          <span class="priority-option medium">
                            <mat-icon>flag</mat-icon> Medium
                          </span>
                        </mat-option>
                        <mat-option value="high">
                          <span class="priority-option high">
                            <mat-icon>flag</mat-icon> High
                          </span>
                        </mat-option>
                        <mat-option value="critical">
                          <span class="priority-option critical">
                            <mat-icon>priority_high</mat-icon> Critical
                          </span>
                        </mat-option>
                      </mat-select>
                      @if (f['priority'].hasError('required') && f['priority'].touched) {
                        <mat-error>Priority is required</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <!-- Due Date -->
                  <div class="form-section">
                    <label class="form-label">Due Date *</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Pick a due date</mat-label>
                      <input matInput [matDatepicker]="picker" formControlName="dueDate" />
                      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                      <mat-datepicker #picker></mat-datepicker>
                      @if (f['dueDate'].hasError('required') && f['dueDate'].touched) {
                        <mat-error>Due date is required</mat-error>
                      }
                    </mat-form-field>
                  </div>
                </div>

                <!-- Status (edit mode only) -->
                @if (isEditMode()) {
                  <div class="form-section">
                    <label class="form-label">Status</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Task status</mat-label>
                      <mat-select formControlName="status">
                        <mat-option value="todo">Todo</mat-option>
                        <mat-option value="in-progress">In Progress</mat-option>
                        <mat-option value="completed">Completed</mat-option>
                        <mat-option value="cancelled">Cancelled</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                }

                <!-- Tags -->
                <div class="form-section">
                  <label class="form-label">Tags (optional)</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-chip-grid #chipGrid>
                      @for (tag of tags(); track tag) {
                        <mat-chip-row (removed)="removeTag(tag)">
                          {{ tag }}
                          <button matChipRemove>
                            <mat-icon>cancel</mat-icon>
                          </button>
                        </mat-chip-row>
                      }
                    </mat-chip-grid>
                    <input
                      placeholder="Add tags..."
                      [matChipInputFor]="chipGrid"
                      [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                      (matChipInputTokenEnd)="addTag($event)"
                    />
                    <mat-hint>Press Enter or comma to add tags</mat-hint>
                  </mat-form-field>
                </div>

                <!-- Error -->
                @if (errorMessage()) {
                  <div class="error-alert">
                    <mat-icon>error_outline</mat-icon>
                    <span>{{ errorMessage() }}</span>
                  </div>
                }

                <!-- Actions -->
                <div class="form-actions">
                  <button mat-stroked-button type="button" routerLink="/tasks" class="cancel-btn">
                    <mat-icon>close</mat-icon> Cancel
                  </button>
                  <button
                    mat-raised-button
                    type="submit"
                    class="submit-btn"
                    [disabled]="isLoading() || taskForm.invalid"
                  >
                    @if (isLoading()) {
                      <mat-spinner diameter="20"></mat-spinner>
                      <span>{{ isEditMode() ? 'Updating...' : 'Creating...' }}</span>
                    } @else {
                      <mat-icon>{{ isEditMode() ? 'save' : 'add_task' }}</mat-icon>
                      <span>{{ isEditMode() ? 'Update Task' : 'Create Task' }}</span>
                    }
                  </button>
                </div>
              </form>
            </div>

            <!-- Sidebar Tips -->
            <div class="form-sidebar">
              <div class="tips-card">
                <h3><mat-icon>lightbulb</mat-icon> Tips</h3>
                <ul>
                  <li>Use a clear, action-oriented title</li>
                  <li>Set a realistic due date</li>
                  <li>Break large tasks into smaller ones</li>
                  <li>Use tags to organize related tasks</li>
                  <li>Set priority based on impact, not urgency</li>
                </ul>
              </div>

              <!-- Priority Guide -->
              <div class="priority-guide">
                <h3><mat-icon>flag</mat-icon> Priority Guide</h3>
                <div class="priority-item">
                  <span class="pguide-dot critical"></span>
                  <div>
                    <strong>Critical</strong>
                    <p>Urgent & important. Do immediately.</p>
                  </div>
                </div>
                <div class="priority-item">
                  <span class="pguide-dot high"></span>
                  <div>
                    <strong>High</strong>
                    <p>Important. Schedule soon.</p>
                  </div>
                </div>
                <div class="priority-item">
                  <span class="pguide-dot medium"></span>
                  <div>
                    <strong>Medium</strong>
                    <p>Normal priority tasks.</p>
                  </div>
                </div>
                <div class="priority-item">
                  <span class="pguide-dot low"></span>
                  <div>
                    <strong>Low</strong>
                    <p>Can be done when time allows.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .task-form-page {
      min-height: 100vh;
      background: #09090b;
      padding-bottom: 48px;
    }

    .page-header {
      background: linear-gradient(135deg, #0d0000, #1a0000, #09090b);
      padding: 24px 32px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .header-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-btn { color: rgba(255,255,255,0.6) !important; }
    .back-btn:hover { color: #fff !important; }

    .header-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .header-title mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #E50914;
    }
    .header-title h1 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      color: #fff;
      margin: 0;
      letter-spacing: 1px;
    }
    .header-title p {
      color: rgba(255,255,255,0.4);
      font-size: 0.85rem;
      margin: 0;
    }

    .form-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 80px;
      color: rgba(255,255,255,0.4);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 28px;
    }

    .form-main {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 32px;
    }

    .form-section { margin-bottom: 20px; }

    .form-label {
      display: block;
      color: rgba(255,255,255,0.65);
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 8px;
      letter-spacing: 0.3px;
    }

    .full-width { width: 100%; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .priority-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .priority-option mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .priority-option.low mat-icon { color: #4caf50; }
    .priority-option.medium mat-icon { color: #ff9800; }
    .priority-option.high mat-icon { color: #f44336; }
    .priority-option.critical mat-icon { color: #E50914; }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(229,9,20,0.1);
      border: 1px solid rgba(229,9,20,0.25);
      border-radius: 8px;
      padding: 12px 16px;
      color: #ff6b6b;
      font-size: 0.875rem;
      margin-bottom: 20px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 8px;
    }

    .cancel-btn {
      color: rgba(255,255,255,0.5) !important;
      border-color: rgba(255,255,255,0.15) !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }

    .submit-btn {
      background: linear-gradient(135deg, #E50914, #c4060f) !important;
      color: #fff !important;
      font-weight: 600 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 0 24px !important;
      height: 44px !important;
    }
    .submit-btn:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(229,9,20,0.4) !important;
    }

    /* Sidebar */
    .form-sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .tips-card, .priority-guide {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 20px;
    }

    .tips-card h3, .priority-guide h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,0.7);
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0 0 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tips-card h3 mat-icon, .priority-guide h3 mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #E50914;
    }

    .tips-card ul {
      padding: 0 0 0 20px;
      margin: 0;
    }
    .tips-card ul li {
      color: rgba(255,255,255,0.45);
      font-size: 0.82rem;
      line-height: 1.6;
      margin-bottom: 6px;
    }

    .priority-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 14px;
    }
    .priority-item:last-child { margin-bottom: 0; }

    .pguide-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 4px;
    }
    .pguide-dot.critical { background: #E50914; }
    .pguide-dot.high { background: #f44336; }
    .pguide-dot.medium { background: #ff9800; }
    .pguide-dot.low { background: #4caf50; }

    .priority-item strong { color: rgba(255,255,255,0.7); font-size: 0.85rem; display: block; margin-bottom: 2px; }
    .priority-item p { color: rgba(255,255,255,0.35); font-size: 0.78rem; margin: 0; }

    /* Material overrides */
    ::ng-deep .task-form-page .mat-mdc-form-field {
      --mdc-outlined-text-field-outline-color: rgba(255,255,255,0.1);
      --mdc-outlined-text-field-hover-outline-color: rgba(255,255,255,0.25);
      --mdc-outlined-text-field-focus-outline-color: #E50914;
      --mdc-outlined-text-field-label-text-color: rgba(255,255,255,0.45);
      --mdc-outlined-text-field-input-text-color: #fff;
    }
    ::ng-deep .task-form-page .mat-mdc-form-field .mat-mdc-text-field-wrapper {
      background: rgba(255,255,255,0.04) !important;
    }
    ::ng-deep .mat-mdc-chip { background: rgba(229,9,20,0.15) !important; color: #ff9191 !important; }
    ::ng-deep .mat-calendar { background: #1a1a1f !important; color: #fff !important; }
    ::ng-deep .mat-calendar-body-cell-content { color: rgba(255,255,255,0.7) !important; }
    ::ng-deep .mat-calendar-body-selected { background: #E50914 !important; }
    ::ng-deep .mat-mdc-select-value { color: rgba(255,255,255,0.8) !important; }

    @media (max-width: 900px) {
      .form-grid { grid-template-columns: 1fr; }
      .form-sidebar { display: none; }
    }
    @media (max-width: 600px) {
      .form-container { padding: 20px; }
      .form-main { padding: 20px; }
      .form-row { grid-template-columns: 1fr; }
      .page-header { padding: 16px 20px; }
    }
  `]
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isLoading = signal(false);
  loadingTask = signal(false);
  errorMessage = signal('');
  isEditMode = signal(false);
  tags = signal<string[]>([]);
  taskId: string | null = null;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private notify: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      priority: ['medium', Validators.required],
      dueDate: ['', Validators.required],
      status: ['todo'],
    });
  }

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId) {
      this.isEditMode.set(true);
      this.loadTask(this.taskId);
    }
  }

  get f() { return this.taskForm.controls; }

  private loadTask(id: string): void {
    this.loadingTask.set(true);
    this.taskService.getTask(id).subscribe({
      next: (response) => {
        const task = response.data;
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: new Date(task.dueDate),
          status: task.status,
        });
        this.tags.set(task.tags || []);
        this.loadingTask.set(false);
      },
      error: () => {
        this.notify.error('Failed to load task');
        this.router.navigate(['/tasks']);
      },
    });
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim().toLowerCase();
    if (value && !this.tags().includes(value)) {
      this.tags.update((tags) => [...tags, value]);
    }
    event.chipInput.clear();
  }

  removeTag(tag: string): void {
    this.tags.update((tags) => tags.filter((t) => t !== tag));
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { title, description, priority, dueDate, status } = this.taskForm.value;
    const payload = { title, description, priority, dueDate, status, tags: this.tags() };

    const request$ = this.isEditMode()
      ? this.taskService.updateTask(this.taskId!, payload)
      : this.taskService.createTask(payload);

    request$.subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.notify.success(response.message || (this.isEditMode() ? 'Task updated!' : 'Task created!'));
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        this.isLoading.set(false);
        const msg = error.error?.message || 'An error occurred. Please try again.';
        this.errorMessage.set(msg);
      },
    });
  }
}
