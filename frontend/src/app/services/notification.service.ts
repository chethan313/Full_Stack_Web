import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * NotificationService - Provides toast notifications via Angular Material Snackbar
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      panelClass: ['snack-success'],
    });
  }

  error(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      duration: 6000,
      panelClass: ['snack-error'],
    });
  }

  warning(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      panelClass: ['snack-warning'],
    });
  }

  info(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      panelClass: ['snack-info'],
    });
  }
}
