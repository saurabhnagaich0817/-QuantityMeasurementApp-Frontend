import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private baseUrl = `${environment.apiUrl}/Auth`;

  register(request: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request);
  }

  login(request: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request);
  }


  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/google-login`, { idToken });
  }

  logout(): void {
    this.tokenService.clearTokens();
  }

  isLoggedIn(): boolean {
    const token = this.tokenService.getToken();
    if (!token) return false;
    return !this.tokenService.isTokenExpired();
  }
}