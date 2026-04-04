import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuantityService } from '../../../core/services/quantity.service';

@Component({
  selector: 'app-subtract',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <h1>Subtraction</h1>
        <p class="subtitle">Subtract one quantity from another</p>

        <div class="form-group">
          <label> Measurement Type</label>
          <select [(ngModel)]="measurementType" (change)="onTypeChange()" class="form-control">
            <option *ngFor="let type of measurementTypes" [value]="type.value">{{ type.label }}</option>
          </select>
        </div>

        <div class="row">
          <div class="col">
            <label> First Quantity</label>
            <input type="number" [(ngModel)]="firstValue" class="form-control">
            <select [(ngModel)]="firstUnit" class="form-control" style="margin-top: 10px;">
              <option *ngFor="let unit of availableUnits" [value]="unit">{{ unit }}</option>
            </select>
          </div>
          <div class="operator-box"><div class="operator">-</div></div>
          <div class="col">
            <label>Second Quantity</label>
            <input type="number" [(ngModel)]="secondValue" class="form-control">
            <select [(ngModel)]="secondUnit" class="form-control" style="margin-top: 10px;">
              <option *ngFor="let unit of availableUnits" [value]="unit">{{ unit }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label> Result Unit (Optional)</label>
          <select [(ngModel)]="resultUnit" class="form-control">
            <option value="">Same as first unit</option>
            <option *ngFor="let unit of availableUnits" [value]="unit">{{ unit }}</option>
          </select>
        </div>

        <button (click)="calculate()" [disabled]="isLoading" class="btn-calculate">
          {{ isLoading ? 'Calculating...' : 'Calculate' }}
        </button>

        <div class="result-area" *ngIf="result && !isLoading">
          <div class="result-box" *ngIf="!result.isError">
            <div class="result-label"> RESULT</div>
            <div class="result-value">
              {{ firstValue }} {{ firstUnit }} - {{ secondValue }} {{ secondUnit }} = 
              <span class="answer">{{ result.result }} {{ result.resultUnit || resultUnit || firstUnit }}</span>
            </div>
            <div class="result-meta">
              <span> ID: {{ result.id }}</span>
              <span> {{ result.createdAt | date:'medium' }}</span>
            </div>
          </div>
          <div class="error-box" *ngIf="result.isError">{{ result.errorMessage }}</div>
        </div>

        <div class="error-area" *ngIf="errorMessage && !isLoading">
          <div class="error-box"> {{ errorMessage }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #333; margin-bottom: 10px; }
    .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
    .form-group { margin-bottom: 24px; }
    label { display: block; margin-bottom: 8px; font-weight: 500; color: #555; }
    .form-control { width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 12px; font-size: 16px; }
    .form-control:focus { outline: none; border-color: #667eea; }
    .row { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
    .col { flex: 1; min-width: 200px; }
    .operator-box { display: flex; align-items: center; justify-content: center; }
    .operator { font-size: 48px; font-weight: bold; color: #f44336; }
    .btn-calculate { width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 600; cursor: pointer; transition: transform 0.2s; margin-top: 10px; }
    .btn-calculate:hover { transform: translateY(-2px); }
    .btn-calculate:disabled { opacity: 0.6; cursor: not-allowed; }
    .result-area { margin-top: 30px; }
    .result-box { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 16px; padding: 24px; text-align: center; border: 2px solid #2196f3; animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .result-label { font-size: 14px; font-weight: 600; color: #1565c0; letter-spacing: 2px; margin-bottom: 12px; }
    .result-value { font-size: 20px; margin: 15px 0; }
    .answer { font-size: 32px; font-weight: bold; color: #2196f3; background: white; padding: 8px 20px; border-radius: 40px; display: inline-block; margin-left: 10px; }
    .result-meta { margin-top: 15px; color: #555; font-size: 12px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
    .error-box { background: #ffebee; border-radius: 16px; padding: 20px; text-align: center; color: #c62828; border: 2px solid #f44336; }
    @media (max-width: 600px) { .card { padding: 24px; } .row { flex-direction: column; } .operator-box { justify-content: center; margin: 10px 0; } .answer { font-size: 20px; margin-left: 0; margin-top: 10px; display: inline-block; } }
  `]
})
export class SubtractComponent {
  private quantityService = inject(QuantityService);

  measurementTypes = [
    { value: 'length', label: 'Length' },
    { value: 'weight', label: 'Weight' },
    { value: 'volume', label: 'Volume' },
    { value: 'temperature', label: 'Temperature' }
  ];

  units: any = {
    length: ['mm', 'cm', 'm', 'km', 'inch', 'ft', 'yd', 'mile'],
    weight: ['mg', 'g', 'kg', 'tonne', 'oz', 'lb', 'stone'],
    volume: ['ml', 'l', 'gallon', 'quart', 'pint', 'cup', 'tbsp', 'tsp'],
    temperature: ['Celsius', 'Fahrenheit', 'Kelvin']
  };

  measurementType = 'length';
  availableUnits: string[] = [];
  firstValue = 10;
  firstUnit = 'cm';
  secondValue = 5;
  secondUnit = 'cm';
  resultUnit = '';
  result: any = null;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.onTypeChange();
  }

  onTypeChange() {
    this.availableUnits = this.units[this.measurementType] || [];
    this.firstUnit = this.availableUnits[0] || 'cm';
    this.secondUnit = this.availableUnits[0] || 'cm';
    this.result = null;
    this.errorMessage = '';
  }

  calculate() {
    this.result = null;
    this.errorMessage = '';
    this.isLoading = true;

    const request = {
      first: { value: Number(this.firstValue), unit: this.firstUnit, measurementType: this.measurementType },
      second: { value: Number(this.secondValue), unit: this.secondUnit, measurementType: this.measurementType },
      resultUnit: this.resultUnit || undefined
    };

    this.quantityService.subtract(request).subscribe({
      next: (res) => {
        this.result = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || err.message || 'Subtraction failed';
        this.isLoading = false;
      }
    });
  }
}