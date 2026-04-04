import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuantityService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/QuantityMeasurement`;

  add(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, request);
  }

  subtract(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/subtract`, request);
  }

  divide(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/divide`, request);
  }

  compare(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/compare`, request);
  }

  convert(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/convert`, request);
  }

  getUserOperations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my-operations`);
  }
}