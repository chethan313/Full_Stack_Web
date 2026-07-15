import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="profile-page">
      <div class="page-header">
        <div class="header-inner">
          <mat-icon>manage_accounts</mat-icon>
          <div>
            <h1>Profile Settings</h1>
            <p>Manage your account information</p>
          </div>
        </div>
      </div>

      <div class="profile-content">
        <!-- Avatar Section -->
        <div class="avatar-section">
          <div class="avatar-large">{{ getInitials() }}</div>
          <div class="avatar-info">
            <h2>{{ authService.currentUser()?.name }}</h2>
            <p>{{ authService.currentUser()?.email }}</p>
            <span class="role-badge">{{ authService.currentUser()?.role }}</span>
          </div>
        </div>

        <div class="profile-grid">
          <!-- Update Profile -->
          <mat-card class="glass-card">
            <mat-card-header>
              <mat-card-title><mat-icon>person</mat-icon> Personal Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="name" />
                  <mat-icon matSuffix>person</mat-icon>
                  @if (pf['name'].hasError('required') && pf['name'].touched) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email Address</mat-label>
                  <input matInput [value]="authService.currentUser()?.email || ''" disabled />
                  <mat-icon matSuffix>lock</mat-icon>
                  <mat-hint>Email cannot be changed</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Member Since</mat-label>
                  <input matInput [value]="getMemberSince()" disabled />
                  <mat-icon matSuffix>calendar_today</mat-icon>
                </mat-form-field>

                <button
                  mat-raised-button
                  type="submit"
                  class="save-btn"
                  [disabled]="profileLoading() || profileForm.invalid"
                >
                  @if (profileLoading()) {
                    <mat-spinner diameter="18"></mat-spinner>
                  } @else {
                    <mat-icon>save</mat-icon>
                  }
                  <span>Save Changes</span>
                </button>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Change Password -->
          <mat-card class="glass-card">
            <mat-card-header>
              <mat-card-title><mat-icon>lock</mat-icon> Change Password</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Current Password</mat-label>
                  <input matInput [type]="showCurrent() ? 'text' : 'password'" formControlName="currentPassword" />
                  <button mat-icon-button matSuffix type="button" (click)="toggleCurrent()">
                    <mat-icon>{{ showCurrent() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (pwf['currentPassword'].hasError('required') && pwf['currentPassword'].touched) {
                    <mat-error>Current password is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>New Password</mat-label>
                  <input matInput [type]="showNew() ? 'text' : 'password'" formControlName="newPassword" />
                  <button mat-icon-button matSuffix type="button" (click)="toggleNew()">
                    <mat-icon>{{ showNew() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (pwf['newPassword'].hasError('minlength') && pwf['newPassword'].touched) {
                    <mat-error>Password must be at least 6 characters</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Confirm New Password</mat-label>
                  <input matInput [type]="showConfirm() ? 'text' : 'password'" formControlName="confirmPassword" />
                  <button mat-icon-button matSuffix type="button" (click)="toggleConfirm()">
                    <mat-icon>{{ showConfirm() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (passwordForm.hasError('mismatch') && pwf['confirmPassword'].touched) {
                    <mat-error>Passwords do not match</mat-error>
                  }
                </mat-form-field>

                @if (pwError()) {
                  <div class="error-alert">
                    <mat-icon>error_outline</mat-icon>
                    {{ pwError() }}
                  </div>
                }

                <button
                  mat-raised-button
                  type="submit"
                  class="save-btn danger-btn"
                  [disabled]="pwLoading() || passwordForm.invalid"
                >
                  @if (pwLoading()) {
                    <mat-spinner diameter="18"></mat-spinner>
                  } @else {
                    <mat-icon>lock_reset</mat-icon>
                  }
                  <span>Update Password</span>
                </button>
              </form>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Danger Zone -->
        <mat-card class="glass-card danger-zone-card">
          <mat-card-header>
            <mat-card-title><mat-icon>warning</mat-icon> Account Info</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="danger-zone-content">
              <div>
                <h4>Sign Out</h4>
                <p>Sign out of your account on this device</p>
              </div>
              <button mat-stroked-button class="logout-btn" (click)="authService.logout()">
                <mat-icon>logout</mat-icon> Sign Out
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      min-height: 100vh;
      background: #09090b;
      padding-bottom: 48px;
    }

    .page-header {
      background: linear-gradient(135deg, #0d0000, #1a0000, #09090b);
      padding: 32px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .header-inner {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .header-inner mat-icon { font-size: 36px; width: 36px; height: 36px; color: #E50914; }
    .header-inner h1 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      color: #fff;
      margin: 0;
      letter-spacing: 1px;
    }
    .header-inner p { color: rgba(255,255,255,0.4); font-size: 0.85rem; margin: 0; }

    .profile-content {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px;
    }

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 32px;
      padding: 24px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
    }

    .avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #E50914, #8B0000);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }

    .avatar-info h2 {
      color: #fff;
      font-size: 1.4rem;
      margin: 0 0 4px;
      font-family: 'Bebas Neue', sans-serif;
      letter-spacing: 0.5px;
    }

    .avatar-info p {
      color: rgba(255,255,255,0.45);
      font-size: 0.9rem;
      margin: 0 0 10px;
    }

    .role-badge {
      padding: 4px 12px;
      background: rgba(229,9,20,0.15);
      border: 1px solid rgba(229,9,20,0.3);
      border-radius: 20px;
      color: #E50914;
      font-size: 0.75rem;
      text-transform: capitalize;
      font-weight: 600;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .glass-card {
      background: rgba(255,255,255,0.03) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      border-radius: 20px !important;
      color: #fff !important;
    }

    mat-card-title {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      color: rgba(255,255,255,0.8) !important;
      font-size: 0.95rem !important;
    }
    mat-card-title mat-icon { color: #E50914 !important; }

    mat-card-header { padding: 20px 20px 0 !important; }
    mat-card-content { padding: 20px !important; }

    .full-width { width: 100%; margin-bottom: 4px; }

    .save-btn {
      background: linear-gradient(135deg, #E50914, #c4060f) !important;
      color: #fff !important;
      font-weight: 600 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      margin-top: 8px !important;
      width: 100% !important;
      height: 44px !important;
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(229,9,20,0.1);
      border: 1px solid rgba(229,9,20,0.25);
      border-radius: 8px;
      padding: 10px 14px;
      color: #ff6b6b;
      font-size: 0.85rem;
      margin-bottom: 12px;
    }

    .danger-zone-card { border-color: rgba(229,9,20,0.15) !important; }

    .danger-zone-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .danger-zone-content h4 {
      color: rgba(255,255,255,0.7);
      margin: 0 0 4px;
      font-size: 0.9rem;
    }

    .danger-zone-content p {
      color: rgba(255,255,255,0.35);
      margin: 0;
      font-size: 0.82rem;
    }

    .logout-btn {
      color: #E50914 !important;
      border-color: rgba(229,9,20,0.3) !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }

    ::ng-deep .profile-page .mat-mdc-form-field {
      --mdc-outlined-text-field-outline-color: rgba(255,255,255,0.1);
      --mdc-outlined-text-field-hover-outline-color: rgba(255,255,255,0.25);
      --mdc-outlined-text-field-focus-outline-color: #E50914;
      --mdc-outlined-text-field-label-text-color: rgba(255,255,255,0.45);
      --mdc-outlined-text-field-input-text-color: #fff;
      --mdc-outlined-text-field-disabled-input-text-color: rgba(255,255,255,0.3);
    }
    ::ng-deep .profile-page .mat-mdc-form-field .mat-mdc-text-field-wrapper {
      background: rgba(255,255,255,0.04) !important;
    }

    @media (max-width: 768px) {
      .profile-content { padding: 20px; }
      .profile-grid { grid-template-columns: 1fr; }
      .avatar-section { flex-direction: column; text-align: center; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  profileLoading = signal(false);
  pwLoading = signal(false);
  pwError = signal('');
  showCurrent = signal(false);
  showNew = signal(false);
  showConfirm = signal(false);

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private notify: NotificationService
  ) {
    this.profileForm = this.fb.group({
      name: [authService.currentUser()?.name || '', [Validators.required, Validators.minLength(2)]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, {
      validators: (g) => {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
          ? null : { mismatch: true };
      }
    });
  }

  ngOnInit(): void {}

  get pf() { return this.profileForm.controls; }
  get pwf() { return this.passwordForm.controls; }

  toggleCurrent(): void { this.showCurrent.update(v => !v); }
  toggleNew(): void { this.showNew.update(v => !v); }
  toggleConfirm(): void { this.showConfirm.update(v => !v); }

  getInitials(): string {
    const name = this.authService.currentUser()?.name || 'U';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getMemberSince(): string {
    const created = this.authService.currentUser()?.createdAt;
    if (!created) return '-';
    return new Date(created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;
    this.profileLoading.set(true);

    this.authService.updateProfile({ name: this.profileForm.value.name }).subscribe({
      next: () => {
        this.profileLoading.set(false);
        this.notify.success('Profile updated successfully!');
      },
      error: () => {
        this.profileLoading.set(false);
        this.notify.error('Failed to update profile');
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.pwLoading.set(true);
    this.pwError.set('');

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.pwLoading.set(false);
        this.notify.success('Password changed successfully!');
        this.passwordForm.reset();
      },
      error: (error) => {
        this.pwLoading.set(false);
        this.pwError.set(error.error?.message || 'Failed to change password');
      },
    });
  }
}
