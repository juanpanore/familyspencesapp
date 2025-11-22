import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export interface MonthlyClosing {
    id: string;
    familyId: string;
    closingDate: string;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    month: string;
}

export interface ClosingResponse {
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class MonthlyClosingService {

    private apiUrl = 'http://localhost:8080/api/home/balances/monthlyclosings';

    constructor(private http: HttpClient, private authService: AuthService) { }

    createMonthlyClosing(familyId: string, month?: string): Observable<ClosingResponse> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        const url = month
            ? `${this.apiUrl}/${familyId}?month=${month}`
            : `${this.apiUrl}/${familyId}`;

        return this.http.put<ClosingResponse>(url, {}, { headers });
    }

    getClosingHistory(familyId: string): Observable<MonthlyClosing[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.get<MonthlyClosing[]>(`${this.apiUrl}/history/${familyId}`, { headers });
    }
}
