import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuantityService } from '../../../core/services/quantity.service';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <h1> Compare</h1>
        <p class="subtitle">Compare two quantities to see which is larger</p>

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
          <div class="vs-box"><div class="vs">VS</div></div>
          <div class="col">
            <label> Second Quantity</label>
            <input type="number" [(ngModel)]="secondValue" class="form-control">
            <select [(ngModel)]="secondUnit" class="form-control" style="margin-top: 10px;">
              <option *ngFor="let unit of availableUnits" [value]="unit">{{ unit }}</option>
            </select>
          </div>
        </div>

        <button (click)="compare()" [disabled]="isLoading" class="btn-calculate">
          {{ isLoading ? ' Comparing...' : ' Compare' }}
        </button>

        <div class="result-area" *ngIf="result && !isLoading">
          <div class="result-box" [class.equal]="comparisonResult === 'EQUAL'" [class.larger]="comparisonResult === 'LARGER'" [class.smaller]="comparisonResult === 'SMALLER'">
            <div class="result-label"> COMPARISON RESULT</div>
            <div class="comparison-text">{{ comparisonText }}</div>
            <div class="comparison-details">
              <span class="value">{{ firstValue }} {{ firstUnit }}</span>
              <span class="symbol">{{ comparisonSymbol }}</span>
              <span class="value">{{ secondValue }} {{ secondUnit }}</span>
            </div>
            <div class="result-meta">
              <span> ID: {{ result.id }}</span>
              <span> {{ result.createdAt | date:'medium' }}</span>
            </div>
          </div>
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
    .row { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; align-items: center; }
    .col { flex: 1; min-width: 200px; }
    .vs-box { display: flex; align-items: center; justify-content: center; }
    .vs { font-size: 24px; font-weight: bold; background: #fff3e0; padding: 8px 24px; border-radius: 30px; color: #ff9800; }
    .btn-calculate { width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 600; cursor: pointer; transition: transform 0.2s; margin-top: 10px; }
    .btn-calculate:hover { transform: translateY(-2px); }
    .result-area { margin-top: 30px; }
    .result-box { border-radius: 16px; padding: 24px; text-align: center; animation: fadeIn 0.4s ease; }
    .result-box.equal { background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 2px solid #4caf50; }
    .result-box.larger { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 2px solid #2196f3; }
    .result-box.smaller { background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 2px solid #f44336; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .result-label { font-size: 14px; font-weight: 600; letter-spacing: 2px; margin-bottom: 12px; }
    .equal .result-label { color: #2e7d32; }
    .larger .result-label { color: #1565c0; }
    .smaller .result-label { color: #c62828; }
    .comparison-text { font-size: 20px; font-weight: bold; margin: 15px 0; }
    .equal .comparison-text { color: #4caf50; }
    .larger .comparison-text { color: #2196f3; }
    .smaller .comparison-text { color: #f44336; }
    .comparison-details { display: flex; align-items: center; justify-content: center; gap: 20px; font-size: 20px; margin: 15px 0; }
    .symbol { font-size: 28px; font-weight: bold; }
    .equal .symbol { color: #4caf50; }
    .larger .symbol { color: #2196f3; }
    .smaller .symbol { color: #f44336; }
    .value { font-weight: bold; }
    .result-meta { margin-top: 15px; color: #555; font-size: 12px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
    .error-box { background: #ffebee; border-radius: 16px; padding: 20px; text-align: center; color: #c62828; border: 2px solid #f44336; }
    @media (max-width: 600px) { .card { padding: 24px; } .row { flex-direction: column; } .vs-box { margin: 10px 0; } }
  `]
})
export class CompareComponent {
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
  result: any = null;
  isLoading = false;
  errorMessage = '';
  comparisonText = '';
  comparisonSymbol = '';
  comparisonResult = '';

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

  compare() {
    this.result = null;
    this.errorMessage = '';
    this.isLoading = true;

    const request = {
      first: { value: Number(this.firstValue), unit: this.firstUnit, measurementType: this.measurementType },
      second: { value: Number(this.secondValue), unit: this.secondUnit, measurementType: this.measurementType }
    };

    this.quantityService.compare(request).subscribe({
      next: (res) => {
        this.result = res;
        if (res.result > 0) {
          this.comparisonText = 'First quantity is LARGER than second';
          this.comparisonSymbol = '>';
          this.comparisonResult = 'LARGER';
        } else if (res.result < 0) {
          this.comparisonText = 'First quantity is SMALLER than second';
          this.comparisonSymbol = '<';
          this.comparisonResult = 'SMALLER';
        } else {
          this.comparisonText = 'Both quantities are EQUAL';
          this.comparisonSymbol = '=';
          this.comparisonResult = 'EQUAL';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || err.message || 'Comparison failed';
        this.isLoading = false;
      }
    });
  }
}