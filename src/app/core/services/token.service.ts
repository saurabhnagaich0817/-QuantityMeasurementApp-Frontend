import { Injectable } from '@angular/core';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

@Injectable({ providedIn: 'root' })
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getUser(): any {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return true;
    return new Date(decoded.exp * 1000) < new Date();
  }
}