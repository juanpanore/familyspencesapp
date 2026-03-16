import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Income, Responsible, UserProfile } from '../../income/income.model';
import { AuthService } from '../../services/auth.service'; 
const API_BASE_URL = 'http://localhost:8080/api'; 

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  constructor(private http: HttpClient, private authService: AuthService) { }
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    if (!token) {
      console.warn('Advertencia: Intento de llamar a la API sin token JWT. Podría fallar.');
    }
    
    return new HttpHeaders({

      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401 || error.status === 403) {
     
      console.error(`Error ${error.status}: Fallo de autenticación/autorización. Revisar token.`);
    }
    return throwError(() => error);
  }

  getProfile(email: string): Observable<UserProfile> {
    const headers = this.getHeaders();
    return this.http.get<UserProfile>(`${API_BASE_URL}/users/profile?email=${email}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getResponsiblesByFamily(familyId: string): Observable<Responsible[]> {
    const headers = this.getHeaders();
    return this.http.get<Responsible[]>(`${API_BASE_URL}/v1/family/members?familyId=${familyId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getAllIncomesByFamily(familyId: string): Observable<Income[]> {
    const headers = this.getHeaders();
    return this.http.get<Income[]>(`${API_BASE_URL}/income/family/${familyId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  createIncome(income: Income): Observable<Income> {
    const headers = this.getHeaders();
    return this.http.post<Income>(`${API_BASE_URL}/income`, income, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateIncome(income: Income): Observable<Income> {
    const headers = this.getHeaders();
    return this.http.put<Income>(`${API_BASE_URL}/income/${income.id}`, income, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteIncome(id: string): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${API_BASE_URL}/income/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}