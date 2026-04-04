import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h1> Create Account</h1>
        <p>Join the Quantity Measurement System</p>

        <input type="text" [(ngModel)]="username" placeholder="Username" class="input">
        <input type="email" [(ngModel)]="email" placeholder="Email" class="input">
        <input type="password" [(ngModel)]="password" placeholder="Password (min 8 chars)" class="input">
        <input type="password" [(ngModel)]="confirmPassword" placeholder="Confirm Password" class="input">

        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

        <button (click)="onSubmit()" [disabled]="isLoading" class="btn">
          {{ isLoading ? 'Creating account...' : 'Register' }}
        </button>

        <p class="link">Already have an account? <a routerLink="/login">Login</a></p>
      </div>
    </div>
  `,
  styles: [`
    .register-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .register-card { background: white; padding: 40px; border-radius: 20px; width: 450px; text-align: center; }
    h1 { margin-bottom: 10px; color: #333; }
    p { margin-bottom: 30px; color: #666; }
    .input { width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; }
    .input:focus { outline: none; border-color: #667eea; }
    .btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; }
    .error { color: #c62828; margin-bottom: 15px; }
    .link { margin-top: 20px; color: #666; }
    .link a { color: #667eea; text-decoration: none; }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill all fields';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.register({ username: this.username, email: this.email, password: this.password, confirmPassword: this.confirmPassword }).subscribe({
      next: (res) => {
        this.tokenService.setToken(res.token);
        this.tokenService.setUser({ id: res.id, username: res.username, email: res.email, role: res.role });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error || 'Registration failed';
        this.isLoading = false;
      }
    });
  }
}