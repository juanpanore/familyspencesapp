// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from './cookie.service';
import { environment } from '../../environments/environment';

export interface LoginUser {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  login(credentials: LoginUser, rememberMe: boolean = false): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,  // ← Debe ser /login, NO /login1
      credentials,
      { headers }
    );
  }

  saveToken(token: string, rememberMe: boolean = false): void {
    this.cookieService.setToken(token, rememberMe);
  }

  getToken(): string | null {
    return this.cookieService.getToken();
  }

  logout(): void {
    this.cookieService.deleteToken();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.decodeToken();
    if (decoded?.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    }

    return true;
  }

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

  getFamilyId(): string | null {
    const decoded = this.decodeToken();
    return decoded?.idFamily || null;
  }

  getUserId(): string | null {
    const decoded = this.decodeToken();
    return decoded?.idUser || null;
  }

  isTokenExpiringSoon(): boolean {
    const decoded = this.decodeToken();
    if (decoded?.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const fiveMinutes = 5 * 60;
      return (decoded.exp - currentTime) < fiveMinutes;
    }
    return false;
  }
}
