import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-page">
      <!-- Background particles -->
      <div class="bg-particles">
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="particle" [class]="'particle-' + i"></div>
        }
      </div>

      <div class="auth-container">
        <!-- Left Panel -->
        <div class="auth-visual">
          <div class="visual-content">
            <div class="brand-logo">
              <mat-icon>task_alt</mat-icon>
              <span>Smart<span class="accent">Task</span></span>
            </div>
            <h1>Organize Your Work,<br><span class="gradient-text">Amplify Results</span></h1>
            <p>Join thousands of professionals managing tasks smarter with our AI-powered platform.</p>
            <div class="features-list">
              @for (feat of features; track feat.icon) {
                <div class="feature-item">
                  <div class="feature-icon">
                    <mat-icon>{{ feat.icon }}</mat-icon>
                  </div>
                  <span>{{ feat.text }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right Panel - Form -->
        <div class="auth-form-panel">
          <div class="form-card">
            <div class="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
              <!-- Email -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                />
                <mat-icon matSuffix>alternate_email</mat-icon>
                @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                  <mat-error>Email is required</mat-error>
                } @else if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                  <mat-error>Please enter a valid email</mat-error>
                }
              </mat-form-field>

              <!-- Password -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input
                  matInput
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="togglePassword()"
                >
                  <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                  <mat-error>Password is required</mat-error>
                } @else if (loginForm.get('password')?.hasError('minlength') && loginForm.get('password')?.touched) {
                  <mat-error>Password must be at least 6 characters</mat-error>
                }
              </mat-form-field>

              <!-- Remember Me -->
              <div class="form-options">
                <mat-checkbox color="warn">Remember me</mat-checkbox>
              </div>

              <!-- Error Message -->
              @if (errorMessage()) {
                <div class="error-alert">
                  <mat-icon>error_outline</mat-icon>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <!-- Submit Button -->
              <button
                mat-raised-button
                type="submit"
                class="submit-btn"
                [disabled]="isLoading() || loginForm.invalid"
              >
                @if (isLoading()) {
                  <mat-spinner diameter="20" color="accent"></mat-spinner>
                  <span>Signing In...</span>
                } @else {
                  <mat-icon>login</mat-icon>
                  <span>Sign In</span>
                }
              </button>

              <!-- Divider -->
              <div class="form-divider">
                <span>Don't have an account?</span>
              </div>

              <!-- Register Link -->
              <a routerLink="/register" class="register-link">
                Create a free account →
              </a>
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

    .bg-particles .particle {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(229,9,20,0.15), transparent);
      animation: float 6s ease-in-out infinite;
    }
    .particle-1 { width: 300px; height: 300px; top: -100px; left: -100px; animation-delay: 0s; }
    .particle-2 { width: 200px; height: 200px; top: 50%; right: -50px; animation-delay: 1s; }
    .particle-3 { width: 150px; height: 150px; bottom: -50px; left: 30%; animation-delay: 2s; }
    .particle-4 { width: 250px; height: 250px; top: 20%; left: 40%; animation-delay: 0.5s; }
    .particle-5 { width: 100px; height: 100px; bottom: 10%; right: 10%; animation-delay: 1.5s; }
    .particle-6 { width: 180px; height: 180px; top: 60%; left: 10%; animation-delay: 3s; }

    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
      50% { transform: translateY(-20px) scale(1.05); opacity: 0.7; }
    }

    .auth-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      max-width: 1100px;
      min-height: 600px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 24px;
      overflow: hidden;
      backdrop-filter: blur(10px);
      margin: 24px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.5);
    }

    /* Left Visual Panel */
    .auth-visual {
      background: linear-gradient(135deg, #1a0000 0%, #0d0000 40%, #09090b 100%);
      padding: 48px;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    .auth-visual::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E50914' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    .visual-content {
      position: relative;
      z-index: 1;
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
    .brand-logo mat-icon {
      color: #E50914;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .accent { color: #E50914; }

    .visual-content h1 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.8rem;
      font-weight: 400;
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
      color: rgba(255,255,255,0.55);
      font-size: 1rem;
      line-height: 1.6;
      margin: 0 0 32px;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .feature-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(229,9,20,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .feature-icon mat-icon {
      color: #E50914;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .feature-item span {
      color: rgba(255,255,255,0.75);
      font-size: 0.9rem;
    }

    /* Right Form Panel */
    .auth-form-panel {
      background: #111113;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 40px;
    }

    .form-card {
      width: 100%;
      max-width: 400px;
    }

    .form-header {
      margin-bottom: 32px;
    }
    .form-header h2 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      color: #fff;
      margin: 0 0 8px;
      letter-spacing: 1px;
    }
    .form-header p {
      color: rgba(255,255,255,0.45);
      font-size: 0.875rem;
      margin: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .full-width { width: 100%; }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 4px 0;
    }

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
    .error-alert mat-icon { font-size: 18px; }

    .submit-btn {
      width: 100% !important;
      height: 52px !important;
      background: linear-gradient(135deg, #E50914, #c4060f) !important;
      color: #fff !important;
      font-size: 1rem !important;
      font-weight: 600 !important;
      border-radius: 10px !important;
      letter-spacing: 0.5px !important;
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
    .submit-btn:disabled {
      opacity: 0.6 !important;
    }

    .form-divider {
      text-align: center;
      color: rgba(255,255,255,0.3);
      font-size: 0.875rem;
      margin-top: 8px;
    }

    .register-link {
      display: block;
      text-align: center;
      color: #E50914;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: opacity 0.2s;
    }
    .register-link:hover { opacity: 0.8; }

    /* Material overrides */
    ::ng-deep .mat-mdc-form-field {
      --mdc-outlined-text-field-outline-color: rgba(255,255,255,0.12);
      --mdc-outlined-text-field-hover-outline-color: rgba(255,255,255,0.3);
      --mdc-outlined-text-field-focus-outline-color: #E50914;
      --mdc-outlined-text-field-label-text-color: rgba(255,255,255,0.5);
      --mdc-outlined-text-field-input-text-color: #fff;
      --mdc-outlined-text-field-caret-color: #E50914;
    }
    ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper {
      background: rgba(255,255,255,0.04) !important;
      border-radius: 10px !important;
    }
    ::ng-deep .mat-icon.mat-mdc-form-field-icon-suffix { color: rgba(255,255,255,0.35); }

    @media (max-width: 768px) {
      .auth-container {
        grid-template-columns: 1fr;
        margin: 16px;
      }
      .auth-visual { display: none; }
      .auth-form-panel { padding: 32px 24px; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  features = [
    { icon: 'task_alt', text: 'Smart task organization & tracking' },
    { icon: 'analytics', text: 'Real-time progress analytics' },
    { icon: 'notifications_active', text: 'Priority-based reminders' },
    { icon: 'security', text: 'Enterprise-grade security' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notify: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.notify.success(response.message || 'Login successful!');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.isLoading.set(false);
        const msg = error.error?.message || 'Login failed. Please try again.';
        this.errorMessage.set(msg);
      },
    });
  }
}
