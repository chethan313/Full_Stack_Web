import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-icon" [class.danger-icon]="data.isDanger">
        <mat-icon>{{ data.isDanger ? 'warning' : 'help_outline' }}</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-stroked-button (click)="onCancel()" class="cancel-btn">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button (click)="onConfirm()" [class]="data.isDanger ? 'danger-btn' : 'confirm-btn'">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 8px;
      text-align: center;
      background: #1a1a1f;
      color: #fff;
    }

    .dialog-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255,255,255,0.07);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .dialog-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: rgba(255,255,255,0.5);
    }
    .danger-icon { background: rgba(229,9,20,0.12) !important; }
    .danger-icon mat-icon { color: #E50914 !important; }

    h2 {
      color: #fff !important;
      font-size: 1.25rem !important;
      margin: 0 0 8px !important;
      font-family: 'Inter', sans-serif !important;
    }

    p {
      color: rgba(255,255,255,0.55);
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0;
    }

    mat-dialog-actions {
      justify-content: center !important;
      gap: 12px !important;
      padding: 20px 0 8px !important;
    }

    .cancel-btn {
      color: rgba(255,255,255,0.6) !important;
      border-color: rgba(255,255,255,0.15) !important;
    }

    .danger-btn {
      background: #E50914 !important;
      color: #fff !important;
      font-weight: 600 !important;
    }

    .confirm-btn {
      background: #1565c0 !important;
      color: #fff !important;
      font-weight: 600 !important;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
