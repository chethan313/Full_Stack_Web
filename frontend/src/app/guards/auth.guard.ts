import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects private routes from unauthenticated users
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirect to login with return URL
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

/**
 * Guest Guard - Prevents authenticated users from accessing login/register
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Redirect authenticated users to dashboard
  router.navigate(['/dashboard']);
  return false;
};
