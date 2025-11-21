import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export interface Vacation {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: string; // approved | pending | rejected
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
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener vacaciones por familia/usuario
  getVacationsByUser(userId: string): Observable<Vacation[]> {
    return this.http.get<Vacation[]>(`${this.apiUrl}/user/${userId}`, {
      headers: this.getHeaders()
    });
  }

  // Crear solicitud de vacaciones
  createVacation(vacationData: Partial<Vacation>): Observable<Vacation> {
    return this.http.post<Vacation>(`${this.apiUrl}`, vacationData, {
      headers: this.getHeaders()
    });
  }

  // Actualizar vacaciones
  updateVacation(id: string, vacationData: Partial<Vacation>): Observable<Vacation> {
    return this.http.put<Vacation>(`${this.apiUrl}/${id}`, vacationData, {
      headers: this.getHeaders()
    });
  }

  // Eliminar vacaciones
  deleteVacation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
