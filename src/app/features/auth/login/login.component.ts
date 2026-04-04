import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <h1> Quantity Measurement</h1>
          <p>Sign in to continue</p>
        </div>

        <!-- Email Login -->
        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" class="form-control" placeholder="user@example.com">
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="password-wrapper">
            <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" class="form-control" placeholder="Enter your password">
            <button type="button" class="password-toggle" (click)="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div class="error-message" *ngIf="errorMessage">
          <span></span> {{ errorMessage }}
        </div>

        <button (click)="onSubmit()" [disabled]="isLoading" class="btn-login">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>

        <!-- Divider -->
        <div class="divider">
          <span>OR</span>
        </div>

        <!--  Google Sign-In Button -->
        <div id="google-signin-button" class="google-btn-container"></div>

        <div class="register-link">
          Don't have an account? <a routerLink="/register">Register here</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .login-card {
      background: white;
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .card-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .card-header h1 {
      font-size: 28px;
      color: #333;
      margin-bottom: 8px;
    }
    .card-header p {
      color: #666;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
    }
    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s;
    }
    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }
    .password-wrapper {
      position: relative;
    }
    .password-wrapper input {
      padding-right: 50px;
    }
    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
    }
    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-login {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-login:hover {
      transform: translateY(-2px);
    }
    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .divider {
      text-align: center;
      margin: 20px 0;
      position: relative;
    }
    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e0e0e0;
    }
    .divider span {
      background: white;
      padding: 0 15px;
      position: relative;
      color: #999;
      font-size: 14px;
    }
    .google-btn-container {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }
    .register-link {
      text-align: center;
      margin-top: 24px;
      color: #666;
    }
    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
  `]
})
export class LoginComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  ngAfterViewInit() {
    this.initializeGoogleSignIn();
  }

  initializeGoogleSignIn() {
    // Check if google script is loaded
    if (typeof window.google !== 'undefined') {
      window.google.accounts.id.initialize({
        client_id: '597479349777-s0j8310elap3e0u4tcmf88c6cc9lqqp2.apps.googleusercontent.com', // YAHAN APNA CLIENT ID LAGAO
        callback: (response: any) => this.handleGoogleLogin(response)
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
  }

  handleGoogleLogin(response: any) {
    console.log('Google login response:', response);
    const idToken = response.credential;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.googleLogin(idToken).subscribe({
      next: (authResponse) => {
        console.log('Backend response:', authResponse);
        this.tokenService.setToken(authResponse.token);
        this.tokenService.setUser({
          id: authResponse.id,
          username: authResponse.username,
          email: authResponse.email,
          role: authResponse.role
        });
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Google login error:', error);
        this.errorMessage = error.error?.detail || error.error?.error || 'Google login failed';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.tokenService.setToken(response.token);
        this.tokenService.setUser({
          id: response.id,
          username: response.username,
          email: response.email,
          role: response.role
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = error.error || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      }
    });
  }
}