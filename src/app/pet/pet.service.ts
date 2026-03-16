import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; 

@Injectable({
  providedIn: 'root'
})
export class PetService {

  private apiUrl = 'http://localhost:8080/api/pets';
  private readonly token = this.authService.getToken(); 

  constructor(
    private http: HttpClient,
    private authService: AuthService 
  ) {}

  // ✅ Método para obtener headers con token
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
  }

  // Obtener mascotas por familia
  getPetsByFamily(familyId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/family?familyId=${familyId}`,
      { headers: this.getHeaders() } 
    );
  }

  // Crear mascota
  createPet(petData: any, familyId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}?familyId=${familyId}`,
      petData,
      { headers: this.getHeaders() } 
    );
  }

  // Actualizar mascota
  updatePet(id: string, petData: any, familyId: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}?familyId=${familyId}`,
      petData,
      { headers: this.getHeaders() }
    );
  }

  // Eliminar mascota
  deletePet(petId: string, familyId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${petId}?familyId=${familyId}`,
      { headers: this.getHeaders() } 
    );
  }
}