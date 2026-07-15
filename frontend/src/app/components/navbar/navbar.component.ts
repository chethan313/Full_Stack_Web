import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
  ],
  template: `
    <mat-toolbar class="navbar">
      <!-- Logo -->
      <a routerLink="/dashboard" class="nav-logo">
        <mat-icon class="logo-icon">task_alt</mat-icon>
        <span class="logo-text">Smart<span class="logo-accent">Task</span></span>
      </a>

      <span class="nav-spacer"></span>

      <!-- Desktop Nav Links (authenticated) -->
      @if (authService.isLoggedIn()) {
        <nav class="nav-links desktop-nav">
          <a routerLink="/dashboard" routerLinkActive="nav-active" class="nav-link">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a routerLink="/tasks" routerLinkActive="nav-active" class="nav-link">
            <mat-icon>checklist</mat-icon>
            <span>My Tasks</span>
          </a>
          <a routerLink="/tasks/add" class="nav-link nav-add-btn">
            <mat-icon>add_circle</mat-icon>
            <span>Add Task</span>
          </a>
        </nav>

        <!-- User Menu -->
        <div class="user-menu" [matMenuTriggerFor]="userMenu">
          <div class="avatar">
            {{ getInitials() }}
          </div>
          <span class="user-name desktop-only">{{ authService.currentUser()?.name }}</span>
          <mat-icon class="chevron">expand_more</mat-icon>
        </div>

        <mat-menu #userMenu="matMenu" class="user-dropdown">
          <div class="menu-header">
            <div class="menu-avatar">{{ getInitials() }}</div>
            <div class="menu-user-info">
              <strong>{{ authService.currentUser()?.name }}</strong>
              <small>{{ authService.currentUser()?.email }}</small>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </button>
          <button mat-menu-item routerLink="/tasks">
            <mat-icon>checklist</mat-icon>
            <span>My Tasks</span>
          </button>
          <button mat-menu-item routerLink="/profile">
            <mat-icon>manage_accounts</mat-icon>
            <span>Profile Settings</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item class="logout-btn" (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>

      } @else {
        <!-- Not authenticated -->
        <div class="auth-nav">
          <a routerLink="/login" mat-button class="login-btn">Sign In</a>
          <a routerLink="/register" mat-raised-button class="register-btn">Get Started</a>
        </div>
      }
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: rgba(9, 9, 11, 0.95) !important;
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 0 24px;
      height: 64px;
    }

    .nav-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .nav-logo:hover { opacity: 0.85; }

    .logo-icon {
      color: #E50914;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .logo-text {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.5rem;
      color: #fff;
      letter-spacing: 1px;
    }
    .logo-accent { color: #E50914; }

    .nav-spacer { flex: 1; }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-right: 16px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      text-decoration: none;
      color: rgba(255,255,255,0.7);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
    }
    .nav-link mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .nav-link:hover {
      color: #fff;
      background: rgba(255,255,255,0.08);
    }
    .nav-active {
      color: #E50914 !important;
      background: rgba(229, 9, 20, 0.1) !important;
    }

    .nav-add-btn {
      background: #E50914 !important;
      color: #fff !important;
      font-weight: 600 !important;
    }
    .nav-add-btn:hover {
      background: #c4060f !important;
      transform: translateY(-1px);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 10px;
      transition: background 0.2s;
    }
    .user-menu:hover { background: rgba(255,255,255,0.08); }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #E50914, #8B0000);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      color: #fff;
      font-family: 'Inter', sans-serif;
    }

    .user-name {
      color: rgba(255,255,255,0.85);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .chevron {
      color: rgba(255,255,255,0.5);
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    .auth-nav {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .login-btn {
      color: rgba(255,255,255,0.8) !important;
    }

    .register-btn {
      background: #E50914 !important;
      color: #fff !important;
      font-weight: 600 !important;
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
    }
    .menu-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #E50914, #8B0000);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      color: #fff;
      flex-shrink: 0;
    }
    .menu-user-info {
      display: flex;
      flex-direction: column;
    }
    .menu-user-info strong {
      color: #1a1a2e;
      font-size: 0.9rem;
    }
    .menu-user-info small {
      color: #666;
      font-size: 0.75rem;
    }

    .logout-btn { color: #E50914 !important; }

    @media (max-width: 768px) {
      .desktop-nav { display: none; }
      .desktop-only { display: none; }
      .navbar { padding: 0 16px; }
    }
  `]
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  getInitials(): string {
    const name = this.authService.currentUser()?.name || 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
