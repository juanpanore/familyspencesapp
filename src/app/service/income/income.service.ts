import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Income, Responsible, UserProfile } from '../../income/income.model';

// Asegúrate de que esta ruta sea correcta para tu servicio de autenticación
import { AuthService } from '../../services/auth.service'; 

// URL Base unificada, basada en tu código
const API_BASE_URL = 'http://localhost:8080/api'; 

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  // 1. Inyectamos HttpClient y AuthService
  constructor(private http: HttpClient, private authService: AuthService) { }
  
  /**
   * Genera los encabezados HTTP necesarios, incluyendo el token JWT.
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    if (!token) {
      // Manejar la falta de token (opcional: lanzar un error, forzar logout)
      console.warn('Advertencia: Intento de llamar a la API sin token JWT. Podría fallar.');
      // Devolveremos un encabezado sin token, dejando que el backend devuelva 401
    }
    
    return new HttpHeaders({
      // Si el token existe, se añade el prefijo 'Bearer '
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json'
    });
  }

  /**
   * Manejador de errores centralizado para las llamadas HTTP.
   */
  private handleError(error: HttpErrorResponse) {
    if (error.status === 401 || error.status === 403) {
      // 401 (No autorizado) o 403 (Prohibido) -> Redirigir a login si es necesario.
      console.error(`Error ${error.status}: Fallo de autenticación/autorización. Revisar token.`);
    }
    return throwError(() => error);
  }

  // ------------------------------------------
  // LÓGICA DE NEGOCIO (Actualizada para usar JWT)
  // ------------------------------------------

  // 1. OBTENER PERFIL (USA /api/users)
  getProfile(email: string): Observable<UserProfile> {
    const headers = this.getHeaders();
    return this.http.get<UserProfile>(`${API_BASE_URL}/users/profile?email=${email}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // 2. RESPONSABLES (USA /api/v1/family)
  getResponsiblesByFamily(familyId: string): Observable<Responsible[]> {
    const headers = this.getHeaders();
    return this.http.get<Responsible[]>(`${API_BASE_URL}/v1/family/members?familyId=${familyId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // 3. LISTAR INGRESOS (USA /api/income)
  getAllIncomesByFamily(familyId: string): Observable<Income[]> {
    const headers = this.getHeaders();
    return this.http.get<Income[]>(`${API_BASE_URL}/income/family/${familyId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // 4. CREAR (POST - USA /api/income)
  createIncome(income: Income): Observable<Income> {
    const headers = this.getHeaders();
    return this.http.post<Income>(`${API_BASE_URL}/income`, income, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // 5. ACTUALIZAR (PUT - USA /api/income/{id})
  updateIncome(income: Income): Observable<Income> {
    const headers = this.getHeaders();
    return this.http.put<Income>(`${API_BASE_URL}/income/${income.id}`, income, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // 6. ELIMINAR (DELETE - USA /api/income/{id})
  deleteIncome(id: string): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${API_BASE_URL}/income/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}