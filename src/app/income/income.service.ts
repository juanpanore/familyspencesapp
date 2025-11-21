// src/app/income/income.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Income, Responsible, UserProfile } from './income.model';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  constructor(private http: HttpClient) { }

  // 1. PERFIL (USA /api)
  getProfile(email: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`http://localhost:8080/api/users/profile?email=${email}`);
  }

  // 2. RESPONSABLES (USA /api/v1)
  getResponsiblesByFamily(familyId: string): Observable<Responsible[]> {
    return this.http.get<Responsible[]>(`http://localhost:8080/api/v1/family/members?familyId=${familyId}`);
  }

  // 3. LISTAR INGRESOS (USA /api/income)
  getAllIncomesByFamily(familyId: string): Observable<Income[]> {
    return this.http.get<Income[]>(`http://localhost:8080/api/income/family/${familyId}`);
  }

  // 4. CREAR (POST - USA /api/income)
  createIncome(income: Income): Observable<Income> {
    return this.http.post<Income>(`http://localhost:8080/api/income`, income);
  }

  // 5. ACTUALIZAR (PUT - ¡RUTA CORREGIDA! - USA /api/income/{id})
  updateIncome(income: Income): Observable<Income> {
    // income.id debe ser el UUID que se envía como variable de ruta
    return this.http.put<Income>(`http://localhost:8080/api/income/${income.id}`, income);
  }

  // 6. ELIMINAR (DELETE - USA /api/income/{id})
  deleteIncome(id: string): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/income/${id}`);
  }
}
