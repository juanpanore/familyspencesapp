import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RankingResponse } from '../models/ranking.model';

@Injectable({
  providedIn: 'root' // Será un singleton, como se ve en tus clases
})
export class RankingService {

  // TODO: Mover esto a environments/environment.ts
  private apiUrl = 'http://localhost:8080/api/family';
  
  // ID de familia (debe venir del auth.service cuando lo implementemos)
  private familyId = '47e2a103-9c4f-4cb6-b96b-b71009c2ad53'; // Hardcodeado por ahora

  constructor(private http: HttpClient) { }

  /**
   * (POST) Llama al endpoint para calcular y guardar el ranking.
   * Corresponde al botón "Generar Ranking".
   */
  generarRanking(period: string): Observable<any> {
    // Llama al endpoint de tu API
    return this.http.post(`${this.apiUrl}/ranking/calculate/${this.familyId}/${period}`, {});
  }

  /**
   * (GET) Llama al endpoint para consultar el ranking de gastos.
   */
  consultarRankingGastos(period: string): Observable<RankingResponse> {
    return this.http.get<RankingResponse>(`${this.apiUrl}/ranking/expenses/${this.familyId}/by-period/${period}`);
  }

  /**
   * (GET) Llama al endpoint para consultar el ranking de ingresos.
   */
  consultarRankingIngresos(period: string): Observable<RankingResponse> {
    return this.http.get<RankingResponse>(`${this.apiUrl}/ranking/income/${this.familyId}/by-period/${period}`);
  }
}