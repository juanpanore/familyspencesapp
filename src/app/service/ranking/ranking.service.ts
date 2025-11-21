// src/app/service/ranking/ranking.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RankingService {

  // ATENCIÓN: Usando el token de ExpenseService. Esto debe ser reemplazado por un servicio de Auth.
  private readonly token = "eyJhbGciOiJIUzI1NiJ9.eyJpZFVzZXIiOiJjZGM1NWE1Mi1jMGRkLTRlNzctOWQyNi05Nzg0Yjk3Mzg4MDEiLCJpZEZhbWlseSI6IjQ3ZTJhMTAzLTljNGYtNGNiNi1iOTZiLWI3MTAwOWMyYWQ1MyIsImlhdCI6MTc2MzIyMzI4NCwiZXhwIjoxNzYzMzA5Njg0fQ.mH7k5fSdw3SMWjSo_rpYGEFAajaAgdhIQ86zOiXJfzw";
  private readonly apiUrl = 'http://localhost:8080/api/family';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  }

  constructor(private http: HttpClient) { }

  
  calculateRanking(familyId: string, period: string): Observable<any> {
    return this.http.post<any>(
      `http://localhost:8080/api/family/ranking/calculate/${familyId}/${period}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Llama al GET /api/family/ranking/expenses/{familyId}/by-period/{period}
   */
  getRankingExpenses(familyId: string, period: string): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `http://localhost:8080/api/family/ranking/expenses/${familyId}/by-period/${period}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Llama al GET /api/family/ranking/income/{familyId}/by-period/{period}
   */
  getRankingIncome(familyId: string, period: string): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `http://localhost:8080/api/family/ranking/income/${familyId}/by-period/${period}`,
      { headers: this.getHeaders() }
    );
  }
}