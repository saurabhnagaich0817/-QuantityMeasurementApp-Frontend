import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuantityService } from '../../core/services/quantity.service';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="welcome">
        <h1>Welcome, {{ username }}! </h1>
        <p>Perform quantity measurements and track your history</p>
      </div>

      <div class="stats">
        <div class="stat-card">
          <div class="stat-icon"></div>
          <div class="stat-value">{{ totalOps }}</div>
          <div class="stat-label">Total Operations</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"></div>
          <div class="stat-value">{{ successOps }}</div>
          <div class="stat-label">Successful</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"></div>
          <div class="stat-value">{{ errorOps }}</div>
          <div class="stat-label">Errors</div>
        </div>
      </div>

      <div class="operations">
        <div class="op-card" *ngFor="let op of operations" [routerLink]="op.route">
          <div class="op-icon">{{ op.icon }}</div>
          <h3>{{ op.name }}</h3>
          <p>{{ op.desc }}</p>
        </div>
      </div>

      <div class="recent" *ngIf="recentOps.length > 0">
        <h2> Recent Operations</h2>
        <div class="recent-list">
          <div class="recent-item" *ngFor="let op of recentOps.slice(0, 5)">
            <span class="badge" [class]="op.operation.toLowerCase()">{{ getIcon(op.operation) }} {{ op.operation }}</span>
            <span class="details">{{ op.fromValue }} {{ op.fromUnit }} → {{ op.result }} {{ op.resultUnit }}</span>
            <small class="date">{{ op.createdAt | date:'short' }}</small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .welcome { text-align: center; margin-bottom: 40px; }
    .welcome h1 { font-size: 32px; color: #333; margin-bottom: 10px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: white; padding: 25px; border-radius: 20px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .stat-icon { font-size: 40px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .operations { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .op-card { background: white; padding: 25px; border-radius: 20px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .op-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .op-icon { font-size: 48px; }
    .recent { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .recent-list { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
    .recent-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 12px; flex-wrap: wrap; gap: 10px; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge.add { background: #e8f5e9; color: #4caf50; }
    .badge.subtract { background: #ffebee; color: #f44336; }
    .badge.divide { background: #e3f2fd; color: #2196f3; }
    .badge.compare { background: #fff3e0; color: #ff9800; }
    .badge.convert { background: #f3e5f5; color: #9c27b0; }
    .details { font-weight: 500; }
    .date { color: #999; font-size: 12px; }
  `]
})
export class DashboardComponent implements OnInit {
  private quantityService = inject(QuantityService);
  private tokenService = inject(TokenService);

  username = '';
  totalOps = 0;
  successOps = 0;
  errorOps = 0;
  recentOps: any[] = [];

  operations = [
    { name: 'Addition', desc: 'Add two quantities', icon: '➕', route: '/add' },
    { name: 'Subtraction', desc: 'Subtract two quantities', icon: '➖', route: '/subtract' },
    { name: 'Division', desc: 'Divide two quantities', icon: '➗', route: '/divide' },
    { name: 'Comparison', desc: 'Compare two quantities', icon: '⚖️', route: '/compare' },
    { name: 'Conversion', desc: 'Convert between units', icon: '🔄', route: '/convert' },
    { name: 'History', desc: 'View operation history', icon: '📜', route: '/history' }
  ];

  ngOnInit() {
    const user = this.tokenService.getUser();
    this.username = user?.username || 'User';
    this.loadData();
  }

  loadData() {
    this.quantityService.getUserOperations().subscribe({
      next: (ops) => {
        this.totalOps = ops.length;
        this.successOps = ops.filter((o: any) => !o.isError).length;
        this.errorOps = ops.filter((o: any) => o.isError).length;
        this.recentOps = ops;
      }
    });
  }

  getIcon(op: string): string {
    const icons: Record<string, string> = {
      'Add': '➕', 'Subtract': '➖', 'Divide': '➗', 'Compare': '⚖️', 'Convert': '🔄'
    };
    return icons[op] || '';
  }
}