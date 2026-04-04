export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}