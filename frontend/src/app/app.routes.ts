import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Public routes (only for non-authenticated users)
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [guestGuard],
    title: 'Login - Smart Task Manager',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [guestGuard],
    title: 'Register - Smart Task Manager',
  },

  // Protected routes (require authentication)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
    title: 'Dashboard - Smart Task Manager',
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./components/task-list/task-list.component').then(
        (m) => m.TaskListComponent
      ),
    canActivate: [authGuard],
    title: 'My Tasks - Smart Task Manager',
  },
  {
    path: 'tasks/add',
    loadComponent: () =>
      import('./components/task-form/task-form.component').then(
        (m) => m.TaskFormComponent
      ),
    canActivate: [authGuard],
    title: 'Add Task - Smart Task Manager',
  },
  {
    path: 'tasks/edit/:id',
    loadComponent: () =>
      import('./components/task-form/task-form.component').then(
        (m) => m.TaskFormComponent
      ),
    canActivate: [authGuard],
    title: 'Edit Task - Smart Task Manager',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
    title: 'Profile - Smart Task Manager',
  },

  // Wildcard - 404
  {
    path: '**',
    loadComponent: () =>
      import('./components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: '404 - Smart Task Manager',
  },
];
