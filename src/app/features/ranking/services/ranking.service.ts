import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RankingService {

  private apiUrl = 'http://localhost:8080/api/family';

  constructor(private http: HttpClient) { }

  /**
   * (POST) Llama al endpoint para calcular y guardar el ranking..
   */
  generarRanking(familyId: string, period: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ranking/calculate/${familyId}/${period}`, {});
  }

  /**
   * (GET) Llama al endpoint para consultar el ranking de gastos.
   */
  consultarRankingGastos(familyId: string, period: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/ranking/expenses/${familyId}/by-period/${period}`);
  }

  /**
   * (GET) Llama al endpoint para consultar el ranking de ingresos.
   * Corresponde al botón "Consultar Ranking por Mes" (para el podio de Ingresos).
   */
  consultarRankingIngresos(familyId: string, period: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/ranking/income/${familyId}/by-period/${period}`);
  }
}