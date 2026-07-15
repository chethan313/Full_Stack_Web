import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../models/user.model';

const TOKEN_KEY = 'stm_token';
const USER_KEY = 'stm_user';

/**
 * AuthService - Handles all authentication operations
 * Stores JWT token and user data in localStorage
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Reactive signal for current user
  currentUser = signal<User | null>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Register a new user account
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        if (response.success) {
          this.storeAuthData(response.token, response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Login with email and password
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        if (response.success) {
          this.storeAuthData(response.token, response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get current user profile from server
   */
  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http
      .get<{ success: boolean; user: User }>(`${this.apiUrl}/me`)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.currentUser.set(response.user);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update user profile
   */
  updateProfile(data: Partial<User>): Observable<{ success: boolean; user: User; message: string }> {
    return this.http
      .put<{ success: boolean; user: User; message: string }>(`${this.apiUrl}/update-profile`, data)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.currentUser.set(response.user);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Change user password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/change-password`, { currentPassword, newPassword })
      .pipe(catchError(this.handleError));
  }

  /**
   * Logout - clear storage and redirect to login
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is currently authenticated
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decode JWT payload (basic check, not cryptographic verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get current user from localStorage
   */
  private getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Store authentication data in localStorage and update signal
   */
  private storeAuthData(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    return throwError(() => error);
  }
}
