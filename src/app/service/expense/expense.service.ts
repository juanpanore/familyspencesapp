import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private apiUrl = `${environment.apiUrl}/api/v1/rest/expenses`;
  private familyApiUrl = `${environment.apiUrl}/api/v1/family`;
  private readonly token = this.authService.getToken();

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  }

  constructor(private http: HttpClient, private authService: AuthService) { }

  getExpenses(familyId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/by-family/${familyId}`,
      { headers: this.getHeaders() }
    );
  }

  addExpense(expense: any, familyId: string, mail: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${familyId}/${mail}`,
      expense,
      { headers: this.getHeaders() }
    );
  }

  updateExpense(expenseId: string, mail : string, expense: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${mail}/${expenseId}`,
      expense,
      { headers: this.getHeaders() }
    );
  }

  deleteExpense(expenseId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${expenseId}`,
      { headers: this.getHeaders() }
    );
  }

    getMembers(familyId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.familyApiUrl}/members`,
      { headers: this.getHeaders(), 
        params: {familyId}}
    );
  }
}
