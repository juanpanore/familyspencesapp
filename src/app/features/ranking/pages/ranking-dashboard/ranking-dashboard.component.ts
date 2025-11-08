import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RankingService } from '../../services/ranking.service';

@Component({
  selector: 'app-ranking-dashboard',
  templateUrl: './ranking-dashboard.component.html',
  styleUrls: ['./ranking-dashboard.component.scss']
})
export class RankingDashboardComponent implements OnInit {

  periodoForm: FormGroup;
  rankingGastos: any = null; 
  rankingIngresos: any = null; 
  isLoading = false;
  mensaje = ''; 

  // ID de familia (debe venir del auth.service, por ahora lo hardcodeamos)
  familyId = '47e2a103-9c4f-4cb6-b96b-b71009c2ad53'; 

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
    // Opcional: Cargar el ranking del mes actual al iniciar
    this.onConsultar();
  }

  /**
   * Acción para el botón "Generar Ranking"
   */
  onGenerar(): void {
    if (this.periodoForm.invalid) return;
    
    const periodo = this.periodoForm.value.periodo;
    this.isLoading = true;
    this.mensaje = 'Iniciando cálculo...';
    
    this.rankingService.generarRanking(this.familyId, periodo).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.mensaje = '¡Cálculo enviado! Consulta en unos segundos.';
      },
      error: (err) => {
        this.isLoading = false;
        this.mensaje = 'Error al generar: ' + err.message;
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
    this.mensaje = 'Consultando ranking...';
    this.rankingGastos = null; // Limpiamos
    this.rankingIngresos = null; // Limpiamos

    // Consultamos gastos
    this.rankingService.consultarRankingGastos(this.familyId, periodo).subscribe({
      next: (res) => {
        this.rankingGastos = res.ranking; // { "ranking": { "Ana": 150, ... } }
      },
      error: (err) => {
        this.mensaje = 'Error al consultar gastos.';
        console.error(err);
      }
    });

    // Consultamos ingresos
    this.rankingService.consultarRankingIngresos(this.familyId, periodo).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.mensaje = 'Consulta exitosa.';
        this.rankingIngresos = res.ranking;
      },
      error: (err) => {
        this.isLoading = false;
        this.mensaje = 'Error al consultar ingresos.';
        console.error(err);
      }
    });
  }

  // Helper para obtener el mes actual en formato "YYYY-MM"
  getPeriodoActual(): string {
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
  }
}