import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

export interface DocumentType { 
  id: string;
  type: string;
}

export interface Relationship { 
  id: string; 
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterUserService {

  private readonly base = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService      // ← INYECTAMOS EL AUTHSERVICE
  ) {}

  /** Obtener headers con token real de cookies */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();  // ← TOKEN REAL

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /** Obtener tipos de documento */
  getDocumentTypes(): Observable<DocumentType[]> {
    return this.http.get<DocumentType[]>(
      `${this.base}/document-types`,
      { headers: this.getHeaders() }
    );
  }

  /** Obtener relationships */
  getRelationships(): Observable<Relationship[]> {
    return this.http.get<Relationship[]>(
      `${this.base}/relationships`,
      { headers: this.getHeaders() }
    );
  }

  /** Registrar usuario */
  registerUser(payload: any): Observable<any> {
    return this.http.post(
      `${this.base}/users/register`,
      payload,
      { headers: this.getHeaders() }
    );
  }
}
