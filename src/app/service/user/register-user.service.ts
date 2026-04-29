import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  /** Obtener tipos de documento (endpoint público, no requiere token) */
  getDocumentTypes(): Observable<DocumentType[]> {
    return this.http.get<DocumentType[]>(`${this.base}/document-types`);
  }

  /** Obtener relationships (endpoint público, no requiere token) */
  getRelationships(): Observable<Relationship[]> {
    return this.http.get<Relationship[]>(`${this.base}/relationships`);
  }

  /** Registrar usuario (endpoint público, no requiere token) */
  registerUser(payload: any): Observable<any> {
    return this.http.post(
      `${this.base}/users/register`,
      payload,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }
}
