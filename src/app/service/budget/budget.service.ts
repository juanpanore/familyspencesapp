import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  public getAllBudgetsByFamily(): Observable<any> {
    const idFamily = this.authService.getFamilyId();
    return this.http.get(`${this.apiUrl}/families/${idFamily}/budgets`, {
      headers: this.getAuthHeaders()
    });
  }

  public getAllFamilies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/v1/family`, {
      headers: this.getAuthHeaders()
    });
  }

  public saveBudget(budget: any): Observable<any> {
    const idFamily = this.authService.getFamilyId();
    if (!idFamily) {
      return throwError(() => new Error('No se encontró el id de la familia'));
    }
    return this.http.post(`${this.apiUrl}/families/${idFamily}/budgets`, budget, {
      headers: this.getAuthHeaders()
    });
  }

  public getBudgetDetail(idBudget: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/budgets/${idBudget}`, {
      headers: this.getAuthHeaders()
    });
  }

  public deleteBudget(idBudget: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/budgets/${idBudget}`, {
      headers: this.getAuthHeaders()
    });
  }
}
