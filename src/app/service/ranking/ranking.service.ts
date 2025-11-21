
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

interface RankingApiResponse {
  ranking: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class RankingService {

  private readonly apiUrl = 'http://localhost:8080/api/family';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }



  calculateRanking(familyId: string, period: string): Observable<any> {
    return this.http.post<any>(

      `${this.apiUrl}/ranking/calculate/${familyId}/${period}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Llama al GET /api/family/ranking/expenses/{familyId}/by-period/{period}
   */
  getRankingExpenses(familyId: string, period: string): Observable<Record<string, number>> {
    return this.http.get<RankingApiResponse>(
      `${this.apiUrl}/ranking/expenses/${familyId}/by-period/${period}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.ranking || {}) 
    );
  }

  /**
   * Llama al GET /api/family/ranking/income/{familyId}/by-period/{period}
   */
  getRankingIncome(familyId: string, period: string): Observable<Record<string, number>> {
    return this.http.get<RankingApiResponse>(
      `${this.apiUrl}/ranking/income/${familyId}/by-period/${period}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.ranking || {}) 
    );
  }
  
  downloadRankingExcel(familyId: string, period: string): Observable<Blob> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(
      `${this.apiUrl}/rankingExcel/${familyId}/${period}`,
      {},
      { 
        headers: headers,
        responseType: 'blob'
      }
    );
  }

  
  deleteRanking(familyId: string, period: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/ranking/delete/${familyId}/${period}`,
      { headers: this.getHeaders() }
    );
  }
}
