import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="logo">📏 Quantity Measurement</div>
      <div class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/add" routerLinkActive="active">Add</a>
        <a routerLink="/subtract" routerLinkActive="active">Subtract</a>
        <a routerLink="/divide" routerLinkActive="active">Divide</a>
        <a routerLink="/compare" routerLinkActive="active">Compare</a>
        <a routerLink="/convert" routerLinkActive="active">Convert</a>
        <a routerLink="/history" routerLinkActive="active">History</a>
      </div>
      <div class="user-info">
        <span>👤 {{ username }}</span>
        <button (click)="logout()" class="logout-btn">Logout</button>
      </div>
    </nav>
    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .navbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
    .logo { font-size: 20px; font-weight: bold; }
    .nav-links { display: flex; gap: 20px; flex-wrap: wrap; }
    .nav-links a { color: white; text-decoration: none; padding: 8px 16px; border-radius: 20px; }
    .nav-links a:hover, .nav-links a.active { background: rgba(255,255,255,0.2); }
    .logout-btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 16px; border-radius: 20px; cursor: pointer; }
    .content { padding: 20px; min-height: calc(100vh - 70px); }
    @media (max-width: 768px) { .navbar { flex-direction: column; gap: 15px; } .nav-links { justify-content: center; } }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  username = this.tokenService.getUser()?.username || 'User';
  logout() { this.authService.logout(); this.router.navigate(['/login']); }
}