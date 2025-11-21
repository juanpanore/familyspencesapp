import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DocumentType { id: string; type: string }
export interface Relationship { id: string; type: string }

@Injectable({ providedIn: 'root' })
export class RegisterUserService {

  private readonly base = 'http://localhost:8080/api';

  // 🔥 Token quemado solo temporalmente
  private readonly token = "eyJhbGciOiJIUzI1NiJ9.eyJpZFVzZXIiOiJjZGM1NWE1Mi1jMGRkLTRlNzctOWQyNi05Nzg0Yjk3Mzg4MDEiLCJpZEZhbWlseSI6IjQ3ZTJhMTAzLTljNGYtNGNiNi1iOTZiLWI3MTAwOWMyYWQ1MyIsImlhdCI6MTc2MzIxNzgyMSwiZXhwIjoxNzYzMzA0MjIxfQ.wk8RJLZz5Pbuv2-g_bLc9GV-SRUie0e6UXwcpEK166Q";

  
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  }

  constructor(private http: HttpClient) {}

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
