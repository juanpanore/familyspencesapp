import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export interface GeneralBalance {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class BalanceService {

  private apiUrl = 'http://localhost:8080/api/home/balances';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getGeneralBalance(familyId: string): Observable<GeneralBalance> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<GeneralBalance>(`${this.apiUrl}/${familyId}`, { headers });
  }
}
