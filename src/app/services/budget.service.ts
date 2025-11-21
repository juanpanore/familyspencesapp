// src/app/services/budget.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = `http://localhost:8080/api/v1`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  public getAllBudgetsByFamily(id: any): Observable<any>{
    return this.http.get(this.apiUrl + "/families" + id + "/budgets")


  }



}
