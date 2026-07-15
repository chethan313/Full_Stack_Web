import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Auth Interceptor - Attaches JWT token to every outgoing HTTP request
 * and handles 401 Unauthorized responses globally
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Get token from localStorage
  const token = localStorage.getItem('stm_token');

  // Clone request and add auth header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 - token expired or invalid
      if (error.status === 401) {
        localStorage.removeItem('stm_token');
        localStorage.removeItem('stm_user');
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url },
        });
      }
      return throwError(() => error);
    })
  );
};
