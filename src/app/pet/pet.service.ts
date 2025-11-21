import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PetService {

  private apiUrl = 'http://localhost:8080/api/v1/rest/pets';

  constructor(private http: HttpClient) {}

  // Obtener mascotas por familia
  getPetsByFamily(familyId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/family?familyId=${familyId}`);
  }

  // Crear mascota (petData + familyId)
  createPet(petData: any, familyId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?familyId=${familyId}`, petData);
  }

  // Actualizar mascota
  updatePet(id: string, petData: any, familyId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}?familyId=${familyId}`, petData);
  }

  deletePet(petId: string, familyId: string): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/${petId}?familyId=${familyId}`);
}



}
