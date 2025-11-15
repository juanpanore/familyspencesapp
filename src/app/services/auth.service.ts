// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para las credenciales de entrada
export interface LoginUser {
  email: string;
  password: string;
}

// Interfaz para la respuesta exitosa
interface LoginResponse {
  token: string;
}

// Interfaz para la respuesta de error
interface ErrorResponse {
  error: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ⚠️ CORRECCIÓN: La URL correcta según tu backend
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  /**
   * Envía las credenciales y devuelve un Observable tipado como LoginResponse.
   */
  login(credentials: LoginUser): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      credentials,
      { headers }
    );
  }

  /**
   * Guarda el token en localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Obtiene el token de localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Elimina el token (logout)
   */
  logout(): void {
    localStorage.removeItem('auth_token');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token !== '';
  }

  /**
   * Decodifica el token JWT para obtener los datos del usuario
   * Retorna el payload del token o null si es inválido
   */
  decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Obtiene el ID de la familia del token
   */
  getFamilyId(): string | null {
    const decoded = this.decodeToken();
    return decoded?.idFamily || null;
  }

  /**
   * Obtiene el ID del usuario del token
   */
  getUserId(): string | null {
    const decoded = this.decodeToken();
    return decoded?.idUser || null;
  }
}
