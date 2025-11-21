// src/app/component/ranking/ranking.component.ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RankingService } from '../../service/ranking/ranking.service';
import { RankingRow } from '../../model/ranking-row.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: [] 
})
export class RankingComponent {

  private familyId = '47e2a103-9c4f-4cb6-b96b-b71009c2ad53'; // ¡Reemplaza con un ID de familia válido!

  rankingForm = new FormGroup({
    month: new FormControl(new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]),
    year: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(2020)])
  });
  
  rankingData: RankingRow[] = [];
  calculationMessage: string | null = null;
  consultMessage: string | null = null;

  constructor(private rankingService: RankingService) { }

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
    
    const period = this.getPeriod();
    this.calculationMessage = "Iniciando cálculo...";
    this.consultMessage = null; 
    this.rankingData = []; 

    // CORRECCIÓN: Se añade 'any' a la respuesta y al error
    this.rankingService.calculateRanking(this.familyId, period).subscribe({
      next: (response: any) => { // <-- TIPO AÑADIDO
        console.log('Calculation triggered:', response);
        this.calculationMessage = response.message || "Cálculo iniciado. Consulta los resultados en unos momentos.";
      },
      error: (err: any) => { // <-- TIPO AÑADIDO
        console.error('Error calculating ranking:', err);
        this.calculationMessage = `Error: ${err.error?.error || 'No se pudo iniciar el cálculo.'}`;
      }
    });
  }

  onConsult(): void {
    if (this.rankingForm.invalid) {
      this.consultMessage = "Por favor, ingrese un mes y año válidos.";
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
      // CORRECCIÓN: Los tipos se infieren de forkJoin. El error 'unknown'
      // se debía a que el servicio no se importaba correctamente.
      next: ({ expenses, income }) => {
        // Al arreglar el 'npm install' y la importación del servicio,
        // 'expenses' y 'income' ya no serán 'unknown', sino 'Record<string, number>'
        this.rankingData = this.mergeRankingData(expenses, income);
        this.consultMessage = this.rankingData.length > 0 ? "Datos cargados." : "No se encontraron datos para este período.";
        console.log('Consulted data merged:', this.rankingData);
      },
      error: (err: any) => { // <-- TIPO AÑADIDO
        console.error('Error consulting ranking:', err);
        this.consultMessage = "Error al consultar los datos.";
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