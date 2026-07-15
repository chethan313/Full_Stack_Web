import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-page">
      <div class="not-found-content">
        <div class="error-number">404</div>
        <div class="error-divider"></div>
        <h1>Page Not Found</h1>
        <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
        <div class="not-found-actions">
          <a routerLink="/dashboard" mat-raised-button class="home-btn">
            <mat-icon>home</mat-icon> Go to Dashboard
          </a>
          <a routerLink="/tasks" mat-stroked-button class="tasks-btn">
            <mat-icon>checklist</mat-icon> View Tasks
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 100vh;
      background: #09090b;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .not-found-content {
      text-align: center;
      max-width: 500px;
    }

    .error-number {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 10rem;
      color: #E50914;
      line-height: 1;
      letter-spacing: 8px;
      opacity: 0.8;
      text-shadow: 0 0 60px rgba(229,9,20,0.3);
    }

    .error-divider {
      width: 60px;
      height: 3px;
      background: #E50914;
      margin: 16px auto 24px;
      border-radius: 2px;
    }

    h1 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      color: #fff;
      margin: 0 0 16px;
      letter-spacing: 1px;
    }

    p {
      color: rgba(255,255,255,0.45);
      font-size: 1rem;
      line-height: 1.6;
      margin: 0 0 32px;
    }

    .not-found-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .home-btn {
      background: #E50914 !important;
      color: #fff !important;
      font-weight: 600 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .tasks-btn {
      color: rgba(255,255,255,0.6) !important;
      border-color: rgba(255,255,255,0.2) !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
  `]
})
export class NotFoundComponent {}
