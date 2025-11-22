
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RankingService } from '../../service/ranking/ranking.service';
import { AuthService } from '../../services/auth.service';
import { RankingRow } from '../../model/ranking-row.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: []
})
export class RankingComponent implements OnInit {

  familyId: string | null = null;
  userId: string | null = null;

  rankingForm = new FormGroup({
    month: new FormControl(new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]),
    year: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(2020)])
  });

  rankingData: RankingRow[] = [];
  calculationMessage: string | null = null;
  consultMessage: string | null = null;

  constructor(
    private rankingService: RankingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.familyId = this.authService.getFamilyId();
    this.userId = this.authService.getUserId();

    if (!this.familyId) {
      this.consultMessage = "Error: No se pudo identificar su familia. Por favor inicie sesión nuevamente.";

    } else {
      console.log('Ranking inicializado para familia:', this.familyId);
    }
  }


  private getPeriod(): string {
    const month = this.rankingForm.value.month!.toString().padStart(2, '0');
    const year = this.rankingForm.value.year;
    return `${year}-${month}`;
  }

  onCalculate(): void {
    if (this.rankingForm.invalid) {
      this.calculationMessage = "Por favor, ingrese un mes y año válidos.";
      return;
    }
    if (!this.familyId) {
      this.calculationMessage = "Error: No se pudo identificar su familia. Por favor inicie sesión nuevamente.";
      return;
    }
    const period = this.getPeriod();
    this.calculationMessage = "Iniciando cálculo...";
    this.consultMessage = null;
    this.rankingData = [];


    this.rankingService.calculateRanking(this.familyId, period).subscribe({
      next: (response: any) => {
        console.log('Calculation triggered:', response);
        this.calculationMessage = response.message || "Cálculo iniciado. Consulta los resultados en unos momentos.";
      },
      error: (err: any) => {
        console.error('Error calculating ranking:', err);
        this.calculationMessage = `Error: ${err.error?.message || 'No se pudo iniciar el cálculo.'}`;
      }
    });
  }

  onConsult(): void {
    if (this.rankingForm.invalid) {
      this.consultMessage = "Por favor, ingrese un mes y año válidos.";
      return;
    }
    if (!this.familyId) {
      this.consultMessage = "Error: Sesión no válida.";
      return;
    }

    const period = this.getPeriod();
    this.consultMessage = "Consultando datos...";
    this.calculationMessage = null;
    this.rankingData = [];

    forkJoin({
      expenses: this.rankingService.getRankingExpenses(this.familyId, period),
      income: this.rankingService.getRankingIncome(this.familyId, period)
    }).subscribe({
      next: ({ expenses, income }) => {
        this.rankingData = this.mergeRankingData(expenses, income);
        this.consultMessage = this.rankingData.length > 0 ? "Datos cargados." : "No se encontraron datos para este período.";
      },
      error: (err: any) => {
        console.error('Error consulting ranking:', err);
        this.consultMessage = "Error al consultar los datos.";
      }
    });
  }
  downloadReport(): void {
    if (this.rankingForm.invalid || !this.familyId) {
      alert("Por favor verifique el período y su sesión.");
      return;
    }
    
    const period = this.getPeriod();
    this.rankingService.downloadRankingExcel(this.familyId, period).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `Ranking_Familia_${period}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error descargando Excel:', err);
        alert("Error al descargar el reporte. Verifique si existen datos calculados.");
      }
    });
  }

  private mergeRankingData(
    expenses: Record<string, number>,
    income: Record<string, number>
  ): RankingRow[] {

    const allUsers = new Set([...Object.keys(expenses), ...Object.keys(income)]);
    const mergedData: RankingRow[] = [];

    allUsers.forEach(user => {
      mergedData.push({
        user: user,
        totalExpenses: expenses[user] || 0,
        totalIncome: income[user] || 0
      });
    });

    return mergedData.sort((a, b) => b.totalExpenses - a.totalExpenses);
  }
}