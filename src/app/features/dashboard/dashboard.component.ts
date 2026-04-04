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
        <div class="stat-card"><div class="stat-icon"></div><div class="stat-value">{{ totalOps }}</div><div class="stat-label">Total Operations</div></div>
        <div class="stat-card"><div class="stat-icon"></div><div class="stat-value">{{ successOps }}</div><div class="stat-label">Successful</div></div>
        <div class="stat-card"><div class="stat-icon"></div><div class="stat-value">{{ errorOps }}</div><div class="stat-label">Errors</div></div>
      </div>

      <div class="operations">
        <div class="op-card" *ngFor="let op of operations" [routerLink]="op.route"><div class="op-icon">{{ op.icon }}</div><h3>{{ op.name }}</h3><p>{{ op.desc }}</p></div>
      </div>

      <div class="recent" *ngIf="recentOps.length > 0">
        <h2>Recent Operations</h2>
        <div class="recent-list"><div class="recent-item" *ngFor="let op of recentOps"><span class="badge">{{ op.operation }}</span><span>{{ op.fromValue }} {{ op.fromUnit }} → {{ op.result }} {{ op.resultUnit }}</span><small>{{ op.createdAt | date:'short' }}</small></div></div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .welcome { text-align: center; margin-bottom: 40px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: white; padding: 25px; border-radius: 16px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .stat-icon { font-size: 40px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .operations { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .op-card { background: white; padding: 25px; border-radius: 16px; text-align: center; cursor: pointer; transition: 0.3s; }
    .op-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .op-icon { font-size: 48px; }
    .recent { background: white; border-radius: 16px; padding: 25px; }
    .recent-list { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
    .recent-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 10px; flex-wrap: wrap; }
    .badge { padding: 4px 12px; border-radius: 20px; background: #667eea; color: white; font-size: 12px; }
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
        this.recentOps = ops.slice(0, 5);
      },
      error: (err) => console.error(err)
    });
  }
}