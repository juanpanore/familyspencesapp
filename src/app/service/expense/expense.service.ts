import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private readonly token = "eyJhbGciOiJIUzI1NiJ9.eyJpZFVzZXIiOiJjZGM1NWE1Mi1jMGRkLTRlNzctOWQyNi05Nzg0Yjk3Mzg4MDEiLCJpZEZhbWlseSI6IjQ3ZTJhMTAzLTljNGYtNGNiNi1iOTZiLWI3MTAwOWMyYWQ1MyIsImlhdCI6MTc2MzE0NzUyNSwiZXhwIjoxNzYzMjMzOTI1fQ.QrKi2unHEgPjICaShhvlHMTBRxSjPpwe8U2D5HjElEA";

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  }

  constructor(private http: HttpClient) { }

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

  updateExpense(expenseId: string, expense: any): Observable<any> {
    return this.http.put<any>(
      `http://localhost:8080/api/v1/rest/expenses/${expenseId}`,
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
}
