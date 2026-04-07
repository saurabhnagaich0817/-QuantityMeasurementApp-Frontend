import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class QuantityService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private baseUrl = `${environment.apiUrl}/QuantityMeasurement`;

  // Conversion factors to base unit (mm for length)
  private conversionFactors: any = {
    length: { mm: 1, cm: 10, m: 1000, km: 1000000, inch: 25.4, ft: 304.8, yd: 914.4, mile: 1609344 },
    weight: { mg: 1, g: 1000, kg: 1000000, tonne: 1000000000, oz: 28349.5, lb: 453592, stone: 6350290 },
    volume: { ml: 1, l: 1000, gallon: 3785.41, quart: 946.353, pint: 473.176, cup: 236.588, tbsp: 14.7868, tsp: 4.92892 },
    temperature: { Celsius: 1, Fahrenheit: 1, Kelvin: 1 }
  };

  // Convert to base unit
  private toBaseUnit(value: number, unit: string, type: string): number {
    if (type === 'temperature') {
      if (unit === 'Celsius') return value;
      if (unit === 'Fahrenheit') return (value - 32) * 5 / 9;
      if (unit === 'Kelvin') return value - 273.15;
      return value;
    }
    const factor = this.conversionFactors[type]?.[unit];
    return factor ? value * factor : value;
  }

  // Convert from base unit
  private fromBaseUnit(value: number, unit: string, type: string): number {
    if (type === 'temperature') {
      if (unit === 'Celsius') return value;
      if (unit === 'Fahrenheit') return (value * 9 / 5) + 32;
      if (unit === 'Kelvin') return value + 273.15;
      return value;
    }
    const factor = this.conversionFactors[type]?.[unit];
    return factor ? value / factor : value;
  }

  // ADD operation - frontend calculation
  add(request: any): Observable<any> {
    const { first, second, resultUnit } = request;
    
    // Convert both to base unit
    const base1 = this.toBaseUnit(first.value, first.unit, first.measurementType);
    const base2 = this.toBaseUnit(second.value, second.unit, second.measurementType);
    
    // Add in base unit
    const baseResult = base1 + base2;
    
    // Convert to result unit
    const targetUnit = resultUnit || first.unit;
    const finalResult = this.fromBaseUnit(baseResult, targetUnit, first.measurementType);
    
    const response = {
      id: Date.now(),
      operation: 'Add',
      measurementType: first.measurementType,
      fromValue: first.value,
      fromUnit: first.unit,
      toValue: second.value,
      toUnit: second.unit,
      result: parseFloat(finalResult.toFixed(6)),
      resultUnit: targetUnit,
      isError: false,
      errorMessage: null,
      createdAt: new Date().toISOString()
    };
    
    // Save to history
    this.saveToHistory(response);
    return of(response);
  }

  // SUBTRACT operation - frontend calculation
  subtract(request: any): Observable<any> {
    const { first, second, resultUnit } = request;
    
    const base1 = this.toBaseUnit(first.value, first.unit, first.measurementType);
    const base2 = this.toBaseUnit(second.value, second.unit, second.measurementType);
    
    const baseResult = base1 - base2;
    const targetUnit = resultUnit || first.unit;
    const finalResult = this.fromBaseUnit(baseResult, targetUnit, first.measurementType);
    
    const response = {
      id: Date.now(),
      operation: 'Subtract',
      measurementType: first.measurementType,
      fromValue: first.value,
      fromUnit: first.unit,
      toValue: second.value,
      toUnit: second.unit,
      result: parseFloat(finalResult.toFixed(6)),
      resultUnit: targetUnit,
      isError: false,
      errorMessage: null,
      createdAt: new Date().toISOString()
    };
    
    this.saveToHistory(response);
    return of(response);
  }

  // DIVIDE operation - frontend calculation
  divide(request: any): Observable<any> {
    const { first, second } = request;
    
    if (second.value === 0) {
      return of({
        id: Date.now(),
        operation: 'Divide',
        measurementType: first.measurementType,
        fromValue: first.value,
        fromUnit: first.unit,
        toValue: second.value,
        toUnit: second.unit,
        result: 0,
        resultUnit: '',
        isError: true,
        errorMessage: 'Cannot divide by zero',
        createdAt: new Date().toISOString()
      });
    }
    
    const base1 = this.toBaseUnit(first.value, first.unit, first.measurementType);
    const base2 = this.toBaseUnit(second.value, second.unit, second.measurementType);
    
    const result = base1 / base2;
    
    const response = {
      id: Date.now(),
      operation: 'Divide',
      measurementType: first.measurementType,
      fromValue: first.value,
      fromUnit: first.unit,
      toValue: second.value,
      toUnit: second.unit,
      result: parseFloat(result.toFixed(6)),
      resultUnit: '',
      isError: false,
      errorMessage: null,
      createdAt: new Date().toISOString()
    };
    
    this.saveToHistory(response);
    return of(response);
  }

  // COMPARE operation - frontend calculation
  compare(request: any): Observable<any> {
    const { first, second } = request;
    
    const base1 = this.toBaseUnit(first.value, first.unit, first.measurementType);
    const base2 = this.toBaseUnit(second.value, second.unit, second.measurementType);
    
    let result: number;
    if (base1 > base2) result = 1;
    else if (base1 < base2) result = -1;
    else result = 0;
    
    const response = {
      id: Date.now(),
      operation: 'Compare',
      measurementType: first.measurementType,
      fromValue: first.value,
      fromUnit: first.unit,
      toValue: second.value,
      toUnit: second.unit,
      result: result,
      resultUnit: '',
      isError: false,
      errorMessage: null,
      createdAt: new Date().toISOString()
    };
    
    this.saveToHistory(response);
    return of(response);
  }

  // CONVERT operation - frontend calculation
  convert(request: any): Observable<any> {
    const { source, target } = request;
    
    const baseValue = this.toBaseUnit(source.value, source.unit, source.measurementType);
    const convertedValue = this.fromBaseUnit(baseValue, target.unit, source.measurementType);
    
    const response = {
      id: Date.now(),
      operation: 'Convert',
      measurementType: source.measurementType,
      fromValue: source.value,
      fromUnit: source.unit,
      toValue: 0,
      toUnit: target.unit,
      result: parseFloat(convertedValue.toFixed(6)),
      resultUnit: target.unit,
      isError: false,
      errorMessage: null,
      createdAt: new Date().toISOString()
    };
    
    this.saveToHistory(response);
    return of(response);
  }

  // Save operation to localStorage history
  private saveToHistory(operation: any): void {
    const userId = this.tokenService.getUser()?.id || 'guest';
    const storageKey = `history_${userId}`;
    const existingHistory = localStorage.getItem(storageKey);
    let history = existingHistory ? JSON.parse(existingHistory) : [];
    history.unshift(operation); // Add to beginning
    // Keep only last 100 operations
    if (history.length > 100) history = history.slice(0, 100);
    localStorage.setItem(storageKey, JSON.stringify(history));
  }

  // Get user operations from localStorage
  getUserOperations(): Observable<any[]> {
    const userId = this.tokenService.getUser()?.id || 'guest';
    const storageKey = `history_${userId}`;
    const history = localStorage.getItem(storageKey);
    return of(history ? JSON.parse(history) : []);
  }

  // Clear history (optional)
  clearHistory(): void {
    const userId = this.tokenService.getUser()?.id || 'guest';
    const storageKey = `history_${userId}`;
    localStorage.removeItem(storageKey);
  }
}