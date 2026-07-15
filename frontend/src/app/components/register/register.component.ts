import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

/** Custom validator to check password match */
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
  ],
  template: `
    <div class="auth-page">
      <div class="bg-glow"></div>

      <div class="auth-container">
        <!-- Left Visual -->
        <div class="auth-visual">
          <div class="visual-content">
            <div class="brand-logo">
              <mat-icon>task_alt</mat-icon>
              <span>Smart<span class="accent">Task</span></span>
            </div>
            <h1>Start Your<br><span class="gradient-text">Productivity Journey</span></h1>
            <p>Create your free account and start managing tasks like a professional in under 60 seconds.</p>

            <div class="stats-grid">
              @for (stat of stats; track stat.label) {
                <div class="stat-card">
                  <span class="stat-number">{{ stat.value }}</span>
                  <span class="stat-label">{{ stat.label }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="auth-form-panel">
          <div class="form-card">
            <div class="form-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
              <!-- Name -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="name" placeholder="John Doe" autocomplete="name" />
                <mat-icon matSuffix>person</mat-icon>
                @if (f['name'].hasError('required') && f['name'].touched) {
                  <mat-error>Full name is required</mat-error>
                } @else if (f['name'].hasError('minlength') && f['name'].touched) {
                  <mat-error>Name must be at least 2 characters</mat-error>
                }
              </mat-form-field>

              <!-- Email -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <input matInput type="email" formControlName="email" placeholder="you@example.com" />
                <mat-icon matSuffix>alternate_email</mat-icon>
                @if (f['email'].hasError('required') && f['email'].touched) {
                  <mat-error>Email is required</mat-error>
                } @else if (f['email'].hasError('email') && f['email'].touched) {
                  <mat-error>Please enter a valid email</mat-error>
                }
              </mat-form-field>

              <!-- Password -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput [type]="showPass() ? 'text' : 'password'" formControlName="password" placeholder="Min 6 chars with letter & number" />
                <button mat-icon-button matSuffix type="button" (click)="toggleShowPass()">
                  <mat-icon>{{ showPass() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (f['password'].hasError('required') && f['password'].touched) {
                  <mat-error>Password is required</mat-error>
                } @else if (f['password'].hasError('minlength') && f['password'].touched) {
                  <mat-error>Password must be at least 6 characters</mat-error>
                } @else if (f['password'].hasError('pattern') && f['password'].touched) {
                  <mat-error>Must contain at least one letter and one number</mat-error>
                }
              </mat-form-field>

              <!-- Confirm Password -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirm Password</mat-label>
                <input matInput [type]="showConfirm() ? 'text' : 'password'" formControlName="confirmPassword" placeholder="Re-enter your password" />
                <button mat-icon-button matSuffix type="button" (click)="toggleShowConfirm()">
                  <mat-icon>{{ showConfirm() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (f['confirmPassword'].hasError('required') && f['confirmPassword'].touched) {
                  <mat-error>Please confirm your password</mat-error>
                } @else if (registerForm.hasError('passwordMismatch') && f['confirmPassword'].touched) {
                  <mat-error>Passwords do not match</mat-error>
                }
              </mat-form-field>

              <!-- Password Strength -->
              @if (f['password'].value) {
                <div class="password-strength">
                  <div class="strength-bar">
                    <div class="strength-fill" [class]="strengthClass()" [style.width]="strengthWidth()"></div>
                  </div>
                  <span class="strength-label" [class]="strengthClass()">{{ strengthLabel() }}</span>
                </div>
              }

              <!-- Error -->
              @if (errorMessage()) {
                <div class="error-alert">
                  <mat-icon>error_outline</mat-icon>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <!-- Submit -->
              <button mat-raised-button type="submit" class="submit-btn" [disabled]="isLoading() || registerForm.invalid">
                @if (isLoading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>Creating Account...</span>
                } @else {
                  <mat-icon>person_add</mat-icon>
                  <span>Create Free Account</span>
                }
              </button>

              <div class="form-divider">
                <span>Already have an account?</span>
              </div>

              <a routerLink="/login" class="login-link">Sign in instead →</a>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      background: #09090b;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .bg-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(229,9,20,0.08) 0%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 4s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
      50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
    }

    .auth-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      max-width: 1100px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 24px;
      overflow: hidden;
      margin: 24px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.5);
      position: relative;
      z-index: 1;
    }

    .auth-visual {
      background: linear-gradient(135deg, #0d0000 0%, #1a0000 50%, #09090b 100%);
      padding: 48px;
      display: flex;
      align-items: center;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 40px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      color: #fff;
      letter-spacing: 2px;
    }
    .brand-logo mat-icon { color: #E50914; font-size: 32px; width: 32px; height: 32px; }
    .accent { color: #E50914; }

    .visual-content h1 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.6rem;
      color: #fff;
      line-height: 1.15;
      margin: 0 0 20px;
      letter-spacing: 1px;
    }

    .gradient-text {
      background: linear-gradient(135deg, #E50914, #ff6b6b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .visual-content p {
      color: rgba(255,255,255,0.5);
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0 0 40px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .stat-card {
      background: rgba(229,9,20,0.08);
      border: 1px solid rgba(229,9,20,0.15);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-number {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      color: #E50914;
      letter-spacing: 1px;
    }

    .stat-label {
      color: rgba(255,255,255,0.5);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .auth-form-panel {
      background: #111113;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 40px;
    }

    .form-card { width: 100%; max-width: 400px; }

    .form-header { margin-bottom: 28px; }
    .form-header h2 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      color: #fff;
      margin: 0 0 8px;
      letter-spacing: 1px;
    }
    .form-header p { color: rgba(255,255,255,0.4); font-size: 0.875rem; margin: 0; }

    .auth-form { display: flex; flex-direction: column; gap: 2px; }

    .full-width { width: 100%; }

    .password-strength {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: -4px 0 4px;
    }
    .strength-bar {
      flex: 1;
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    .strength-fill {
      height: 100%;
      border-radius: 2px;
      transition: all 0.3s;
    }
    .strength-fill.weak { background: #E50914; }
    .strength-fill.fair { background: #ff9800; }
    .strength-fill.good { background: #4caf50; }
    .strength-fill.strong { background: #00e676; }
    .strength-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .strength-label.weak { color: #E50914; }
    .strength-label.fair { color: #ff9800; }
    .strength-label.good { color: #4caf50; }
    .strength-label.strong { color: #00e676; }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(229,9,20,0.12);
      border: 1px solid rgba(229,9,20,0.3);
      border-radius: 8px;
      padding: 12px 16px;
      color: #ff6b6b;
      font-size: 0.875rem;
    }

    .submit-btn {
      width: 100% !important;
      height: 52px !important;
      background: linear-gradient(135deg, #E50914, #c4060f) !important;
      color: #fff !important;
      font-size: 1rem !important;
      font-weight: 600 !important;
      border-radius: 10px !important;
      margin-top: 8px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      transition: all 0.3s !important;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(229,9,20,0.4) !important;
    }

    .form-divider {
      text-align: center;
      color: rgba(255,255,255,0.3);
      font-size: 0.875rem;
      margin-top: 12px;
    }

    .login-link {
      display: block;
      text-align: center;
      color: #E50914;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .login-link:hover { opacity: 0.8; }

    ::ng-deep .mat-mdc-form-field {
      --mdc-outlined-text-field-outline-color: rgba(255,255,255,0.12);
      --mdc-outlined-text-field-hover-outline-color: rgba(255,255,255,0.3);
      --mdc-outlined-text-field-focus-outline-color: #E50914;
      --mdc-outlined-text-field-label-text-color: rgba(255,255,255,0.5);
      --mdc-outlined-text-field-input-text-color: #fff;
    }
    ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper {
      background: rgba(255,255,255,0.04) !important;
      border-radius: 10px !important;
    }

    @media (max-width: 768px) {
      .auth-container { grid-template-columns: 1fr; margin: 16px; }
      .auth-visual { display: none; }
      .auth-form-panel { padding: 32px 24px; }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  showPass = signal(false);
  showConfirm = signal(false);
  errorMessage = signal('');

  stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '50K+', label: 'Tasks Created' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9★', label: 'Rating' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)/)]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

  get f() {
    return this.registerForm.controls;
  }

  toggleShowPass(): void { this.showPass.update(v => !v); }
  toggleShowConfirm(): void { this.showConfirm.update(v => !v); }

  strengthClass(): string {
    const pwd = this.f['password'].value || '';
    if (pwd.length < 6) return 'weak';
    if (pwd.length < 8) return 'fair';
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return 'strong';
    return 'good';
  }

  strengthWidth(): string {
    const map: Record<string, string> = { weak: '25%', fair: '50%', good: '75%', strong: '100%' };
    return map[this.strengthClass()];
  }

  strengthLabel(): string {
    const map: Record<string, string> = { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' };
    return map[this.strengthClass()];
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { name, email, password } = this.registerForm.value;
    this.authService.register({ name, email, password }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.notify.success('Account created successfully! Welcome to Smart Task Manager!');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        const msg = error.error?.message || 'Registration failed. Please try again.';
        this.errorMessage.set(msg);
      },
    });
  }
}
