import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private readonly token = this.authService.getToken();

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  }

  constructor(private http: HttpClient, private authService: AuthService) { }

  getExpenses(familyId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `http://localhost:8080/api/v1/rest/expenses/by-family/${familyId}`,
      { headers: this.getHeaders() }
    );
  }

  addExpense(expense: any, familyId: string, mail: string): Observable<any> {
    return this.http.post<any>(
      `http://localhost:8080/api/v1/rest/expenses/${familyId}/${mail}`,
      expense,
      { headers: this.getHeaders() }
    );
  }

  updateExpense(expenseId: string, mail : string, expense: any): Observable<any> {
    return this.http.put<any>(
      `http://localhost:8080/api/v1/rest/expenses/${mail}/${expenseId}`,
      expense,
      { headers: this.getHeaders() }
    );
  }

  deleteExpense(expenseId: string): Observable<void> {
    return this.http.delete<void>(
      `http://localhost:8080/api/v1/rest/expenses/${expenseId}`,
      { headers: this.getHeaders() }
    );
  }

    getMembers(familyId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `http://localhost:8080/api/v1/family/members`,
      { headers: this.getHeaders(), 
        params: {familyId}}
    );
  }
}
