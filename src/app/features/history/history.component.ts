import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { QuantityService } from '../../core/services/quantity.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="card">
        <h1> Operation History</h1>
        <p class="subtitle">View all your quantity measurement operations</p>

        <div class="filters">
          <select [(ngModel)]="filterOperation" (change)="applyFilter()" class="filter-select">
            <option value="all">All Operations</option>
            <option value="Add">Addition (+)</option>
            <option value="Subtract">Subtraction (-)</option>
            <option value="Divide">Division (÷)</option>
            <option value="Compare">Comparison ()</option>
            <option value="Convert">Conversion ()</option>
          </select>
          <button (click)="refresh()" class="refresh-btn">⟳ Refresh</button>
        </div>

        <div class="stats">
          <div class="stat"> Total: {{ filteredOps.length }}</div>
          <div class="stat success">Success: {{ successCount }}</div>
          <div class="stat error"> Errors: {{ errorCount }}</div>
        </div>

        <div class="loading" *ngIf="isLoading"> Loading your history...</div>
        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="empty" *ngIf="!isLoading && filteredOps.length === 0">
          <p>No operations found. Start performing operations!</p>
          <button routerLink="/dashboard" class="btn-primary">Go to Dashboard</button>
        </div>

        <div class="history-list" *ngIf="!isLoading && filteredOps.length > 0">
          <div class="history-item" *ngFor="let op of filteredOps">
            <div class="item-header">
              <span class="badge" [class]="op.operation.toLowerCase()">{{ getIcon(op.operation) }} {{ op.operation }}</span>
              <span class="date">{{ op.createdAt | date:'medium' }}</span>
            </div>
            <div class="item-content" *ngIf="!op.isError">
              <span class="value">{{ op.fromValue }}</span>
              <span class="unit">{{ op.fromUnit }}</span>
              <span class="op-symbol">{{ getSymbol(op.operation) }}</span>
              <span class="value">{{ op.toValue }}</span>
              <span class="unit">{{ op.toUnit }}</span>
              <span class="equals">=</span>
              <span class="result-value">{{ op.result }}</span>
              <span class="result-unit">{{ op.resultUnit }}</span>
            </div>
            <div class="item-error" *ngIf="op.isError">
               Error: {{ op.errorMessage }}
            </div>
            <div class="item-footer">
              <span> {{ op.measurementType | titlecase }}</span>
              <span> ID: {{ op.id }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #333; margin-bottom: 10px; }
    .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
    .filters { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-select { flex: 1; padding: 12px; border: 2px solid #e0e0e0; border-radius: 12px; font-size: 16px; background: white; cursor: pointer; }
    .refresh-btn { padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 16px; }
    .stats { display: flex; gap: 20px; margin-bottom: 25px; padding: 15px 20px; background: #f8f9fa; border-radius: 12px; }
    .stat { font-weight: 500; }
    .stat.success { color: #4caf50; }
    .stat.error { color: #f44336; }
    .loading, .empty { text-align: center; padding: 50px; color: #666; }
    .error { background: #ffebee; color: #c62828; padding: 15px; border-radius: 12px; text-align: center; }
    .history-list { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
    .history-item { border: 1px solid #eee; border-radius: 16px; padding: 20px; transition: all 0.2s; background: white; }
    .history-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateX(4px); }
    .item-header { display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; flex-wrap: wrap; gap: 10px; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge.add { background: #e8f5e9; color: #4caf50; }
    .badge.subtract { background: #ffebee; color: #f44336; }
    .badge.divide { background: #e3f2fd; color: #2196f3; }
    .badge.compare { background: #fff3e0; color: #ff9800; }
    .badge.convert { background: #f3e5f5; color: #9c27b0; }
    .date { color: #999; font-size: 12px; }
    .item-content { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 16px; }
    .value { font-weight: bold; font-size: 18px; }
    .unit { font-size: 14px; color: #666; margin-right: 5px; }
    .op-symbol { font-weight: bold; font-size: 18px; color: #667eea; }
    .equals { font-weight: bold; margin: 0 5px; font-size: 18px; }
    .result-value { font-weight: bold; color: #4caf50; font-size: 20px; }
    .result-unit { font-size: 14px; color: #4caf50; margin-left: 2px; }
    .item-error { background: #ffebee; padding: 12px; border-radius: 10px; color: #c62828; margin: 10px 0; }
    .item-footer { margin-top: 12px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #999; display: flex; justify-content: space-between; }
    .btn-primary { padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
  `]
})
export class HistoryComponent implements OnInit {
  private quantityService = inject(QuantityService);
  private router = inject(Router);
  
  allOps: any[] = [];
  filteredOps: any[] = [];
  filterOperation = 'all';
  isLoading = true;
  errorMessage = '';
  successCount = 0;
  errorCount = 0;

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.quantityService.getUserOperations().subscribe({
      next: (res) => {
        console.log('History loaded:', res);
        this.allOps = res || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('History error:', err);
        this.errorMessage = err.error?.detail || err.message || 'Failed to load history';
        this.isLoading = false;
        this.allOps = [];
        this.filteredOps = [];
      }
    });
  }

  applyFilter() {
    if (this.filterOperation === 'all') {
      this.filteredOps = [...this.allOps];
    } else {
      this.filteredOps = this.allOps.filter(op => op.operation === this.filterOperation);
    }
    this.successCount = this.filteredOps.filter(op => !op.isError).length;
    this.errorCount = this.filteredOps.filter(op => op.isError).length;
  }

  refresh() {
    this.loadHistory();
  }

  getIcon(op: string): string {
    const icons: Record<string, string> = {
      'Add': '➕', 'Subtract': '➖', 'Divide': '➗', 'Compare': '⚖️', 'Convert': '🔄'
    };
    return icons[op] || '';
  }

  getSymbol(op: string): string {
    const symbols: Record<string, string> = {
      'Add': '+', 'Subtract': '-', 'Divide': '÷', 'Compare': 'vs', 'Convert': '→'
    };
    return symbols[op] || '•';
  }
}