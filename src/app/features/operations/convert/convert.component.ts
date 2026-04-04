import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuantityService } from '../../../core/services/quantity.service';

@Component({
  selector: 'app-convert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <h1> Unit Conversion</h1>
        <p class="subtitle">Convert a quantity from one unit to another</p>

        <div class="form-group">
          <label> Measurement Type</label>
          <select [(ngModel)]="measurementType" (change)="onTypeChange()" class="form-control">
            <option *ngFor="let type of measurementTypes" [value]="type.value">{{ type.label }}</option>
          </select>
        </div>

        <div class="conversion-row">
          <div class="source">
            <label> From</label>
            <input type="number" [(ngModel)]="sourceValue" class="form-control">
            <select [(ngModel)]="sourceUnit" class="form-control" style="margin-top: 10px;">
              <option *ngFor="let unit of availableUnits" [value]="unit">{{ unit }}</option>
            </select>
          </div>
          <button (click)="swapUnits()" class="swap-btn">⇄</button>
          <div class="target">
            <label> To</label>
            <div class="target-preview" *ngIf="result && result.result !== undefined">
              {{ result.result }} {{ targetUnit }}
            </div>
            <select [(ngModel)]="targetUnit" class="form-control">
              <option *ngFor="let unit of availableUnits" [value]="unit">{{ unit }}</option>
            </select>
          </div>
        </div>

        <button (click)="convert()" [disabled]="isLoading" class="btn-calculate">
          {{ isLoading ? '⏳ Converting...' : '🔄 Convert' }}
        </button>

        <div class="result-area" *ngIf="result && !isLoading">
          <div class="result-box" *ngIf="!result.isError">
            <div class="result-label"> CONVERSION RESULT</div>
            <div class="result-value">
              {{ sourceValue }} {{ sourceUnit }} → 
              <span class="answer">{{ result.result }} {{ targetUnit }}</span>
            </div>
            <div class="conversion-equation">
              <small>1 {{ sourceUnit }} = {{ (result.result / sourceValue) | number:'1.2-6' }} {{ targetUnit }}</small>
            </div>
            <div class="result-meta">
              <span> ID: {{ result.id }}</span>
              <span> {{ result.createdAt | date:'medium' }}</span>
            </div>
          </div>
          <div class="error-box" *ngIf="result.isError"> {{ result.errorMessage }}</div>
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
    .conversion-row { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; align-items: flex-end; }
    .source, .target { flex: 1; min-width: 200px; }
    .target-preview { background: #e8f5e9; padding: 12px; border-radius: 12px; margin-bottom: 10px; font-size: 18px; font-weight: bold; text-align: center; color: #4caf50; border: 1px solid #4caf50; }
    .swap-btn { background: #667eea; color: white; border: none; padding: 12px 20px; border-radius: 12px; font-size: 20px; cursor: pointer; transition: transform 0.2s; margin-bottom: 10px; }
    .swap-btn:hover { transform: scale(1.05); }
    .btn-calculate { width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 600; cursor: pointer; transition: transform 0.2s; margin-top: 10px; }
    .btn-calculate:hover { transform: translateY(-2px); }
    .result-area { margin-top: 30px; }
    .result-box { background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border-radius: 16px; padding: 24px; text-align: center; border: 2px solid #9c27b0; animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .result-label { font-size: 14px; font-weight: 600; color: #6a1b9a; letter-spacing: 2px; margin-bottom: 12px; }
    .result-value { font-size: 20px; margin: 15px 0; }
    .answer { font-size: 32px; font-weight: bold; color: #9c27b0; background: white; padding: 8px 20px; border-radius: 40px; display: inline-block; margin-left: 10px; }
    .conversion-equation { margin-top: 15px; color: #555; font-size: 12px; }
    .result-meta { margin-top: 10px; color: #555; font-size: 12px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
    .error-box { background: #ffebee; border-radius: 16px; padding: 20px; text-align: center; color: #c62828; border: 2px solid #f44336; }
    @media (max-width: 600px) { .card { padding: 24px; } .conversion-row { flex-direction: column; } .swap-btn { align-self: center; } .answer { font-size: 20px; margin-left: 0; margin-top: 10px; display: inline-block; } }
  `]
})
export class ConvertComponent {
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
  sourceValue = 10;
  sourceUnit = 'cm';
  targetUnit = 'mm';
  result: any = null;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.onTypeChange();
  }

  onTypeChange() {
    this.availableUnits = this.units[this.measurementType] || [];
    this.sourceUnit = this.availableUnits[0] || 'cm';
    this.targetUnit = this.availableUnits[1] || this.availableUnits[0] || 'mm';
    this.result = null;
    this.errorMessage = '';
  }

  swapUnits() {
    const temp = this.sourceUnit;
    this.sourceUnit = this.targetUnit;
    this.targetUnit = temp;
    this.result = null;
  }

  convert() {
    this.result = null;
    this.errorMessage = '';
    this.isLoading = true;

    const request = {
      source: { value: Number(this.sourceValue), unit: this.sourceUnit, measurementType: this.measurementType },
      target: { value: 0, unit: this.targetUnit, measurementType: this.measurementType }
    };

    this.quantityService.convert(request).subscribe({
      next: (res) => {
        this.result = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || err.message || 'Conversion failed';
        this.isLoading = false;
      }
    });
  }
}