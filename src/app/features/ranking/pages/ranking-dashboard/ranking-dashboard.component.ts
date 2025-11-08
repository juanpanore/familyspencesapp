import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RankingService } from '../../services/ranking.service';
import { RankingEntry, RankingResponse } from '../../models/ranking.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-ranking-dashboard',
  templateUrl: './ranking-dashboard.component.html',
  styleUrls: ['./ranking-dashboard.component.scss']
})
export class RankingDashboardComponent implements OnInit {

  periodoForm: FormGroup;
  rankingGastos: RankingEntry[] = []; // Datos para el podio de gastos
  rankingIngresos: RankingEntry[] = []; // Datos para el podio de ingresos
  
  isLoading = false;
  mensajeFeedback = ''; // Para mostrar feedback (ej. "Cálculo iniciado")

  constructor(
    private fb: FormBuilder,
    private rankingService: RankingService
  ) {
    // Creamos el Formulario Reactivo
    this.periodoForm = this.fb.group({
      // formato YYYY-MM, ej: "2024-10"
      periodo: [this.getPeriodoActual(), Validators.required]
    });
  }

  ngOnInit(): void {
    // Cargar el ranking del mes actual al iniciar
    this.onConsultar();
  }

  /**
   * Acción para el botón "Generar Ranking"
   */
  onGenerar(): void {
    if (this.periodoForm.invalid) return;
    
    const periodo = this.periodoForm.value.periodo;
    this.isLoading = true;
    this.mensajeFeedback = 'Iniciando cálculo...';
    
    this.rankingService.generarRanking(periodo).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.mensajeFeedback = '¡Cálculo enviado! Presiona "Consultar" en unos segundos.';
      },
      error: (err) => {
        this.isLoading = false;
        this.mensajeFeedback = 'Error al generar: ' + (err.error?.message || 'Error de servidor');
      }
    });
  }

  /**
   * Acción para el botón "Consultar Ranking por Mes"
   */
  onConsultar(): void {
    if (this.periodoForm.invalid) return;

    const periodo = this.periodoForm.value.periodo;
    this.isLoading = true;
    this.mensajeFeedback = 'Consultando ranking...';
    this.rankingGastos = []; // Limpiamos
    this.rankingIngresos = []; // Limpiamos

    // Consultamos gastos
    this.rankingService.consultarRankingGastos(periodo).pipe(
      map(response => this.transformarRanking(response)) // Convertimos el objeto a array
    ).subscribe({
      next: (data) => {
        this.rankingGastos = data;
      },
      error: (err) => this.handleError(err)
    });

    // Consultamos ingresos
    this.rankingService.consultarRankingIngresos(periodo).pipe(
      map(response => this.transformarRanking(response)) // Convertimos el objeto a array
    ).subscribe({
      next: (data) => {
        this.rankingIngresos = data;
        this.isLoading = false;
        this.mensajeFeedback = data.length > 0 ? 'Consulta exitosa.' : 'No hay datos para este período.';
      },
      error: (err) => this.handleError(err)
    });
  }
  
  // --- Métodos Helper ---

  private handleError(err: any): void {
    this.isLoading = false;
    this.mensajeFeedback = 'Error al consultar: ' + (err.error?.message || 'Error de servidor');
  }

  // Convierte { "Ana": 100 } en [ { name: "Ana", value: 100 } ]
  private transformarRanking(response: RankingResponse): RankingEntry[] {
    if (!response.ranking) {
      return [];
    }
    return Object.keys(response.ranking)
      .map(key => ({
        name: key,
        value: response.ranking[key]
      }))
      .sort((a, b) => b.value - a.value); // Ordena de mayor a menor
  }

  // Helper para obtener el mes actual en formato "YYYY-MM"
  getPeriodoActual(): string {
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
  }
}