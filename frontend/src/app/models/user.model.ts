/**
 * User model interface
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}
