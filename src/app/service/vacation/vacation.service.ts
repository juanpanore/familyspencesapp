// src/app/vacation/vacation.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export interface Vacation {
  id?: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  presupuesto: number;
}

export interface VacationRequest {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  presupuesto: number;
}

@Injectable({
  providedIn: 'root'
})
export class VacationService {

  private apiUrl = 'http://localhost:8080/api/vacations';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllVacations(): Observable<Vacation[]> {
    return this.http.get<Vacation[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getVacationById(id: string): Observable<Vacation> {
    return this.http.get<Vacation>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createVacation(vacation: VacationRequest): Observable<Vacation> {
    return this.http.post<Vacation>(this.apiUrl, vacation, { headers: this.getHeaders() });
  }

  updateVacation(id: string, vacation: VacationRequest): Observable<Vacation> {
    return this.http.put<Vacation>(`${this.apiUrl}/${id}`, vacation, { headers: this.getHeaders() });
  }

  deleteVacation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
