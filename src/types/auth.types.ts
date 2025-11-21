// src/types/auth.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
  enabled: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: User;
  expiresIn: number;
}