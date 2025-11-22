import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RankingService } from '../../service/ranking/ranking.service';
import { AuthService } from '../../services/auth.service';
import { RankingRow } from '../../model/ranking-row.model';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css'],
  // Animación de entrada suave (Slide Up)
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s cubic-bezier(0.2, 0.8, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class RankingComponent implements OnInit {

  familyId: string | null = null;
  isLoading: boolean = false;
  showPodium: boolean = false; 
  successMessage: boolean = false;
  noDataMessage: boolean = false;

  rankingForm = new FormGroup({
    month: new FormControl(new Date().getMonth() + 1, [Validators.required]),
    year: new FormControl(new Date().getFullYear(), [Validators.required])
  });

  rankingData: RankingRow[] = [];
  topSpenders: RankingRow[] = []; // Los 3 que más gastaron

  constructor(
    private rankingService: RankingService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.familyId = this.authService.getFamilyId();
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  getPeriod(): string {
    const month = this.rankingForm.value.month!.toString().padStart(2, '0');
    const year = this.rankingForm.value.year;
    return `${year}-${month}`;
  }

  // 1. CALCULAR
  onCalculate(): void {
    if (!this.familyId) return;
    
    this.isLoading = true;
    this.successMessage = false;
    const period = this.getPeriod();

    this.rankingService.calculateRanking(this.familyId, period).subscribe({
      next: () => {
        // Delay artificial pequeño para ver la animación de carga
        setTimeout(() => {
          this.isLoading = false;
          this.successMessage = true;
          setTimeout(() => this.successMessage = false, 3000);
        }, 1500);
      },
      error: () => {
        this.isLoading = false;
        alert('Error al iniciar el cálculo.');
      }
    });
  }

  // 2. CONSULTAR (Muestra el Podio)
  onConsult(): void {
    if (!this.familyId) return;

    this.isLoading = true;
    const period = this.getPeriod();
    this.noDataMessage = false; // Reiniciamos alertas
    this.successMessage = false;

    forkJoin({
      expenses: this.rankingService.getRankingExpenses(this.familyId, period),
      income: this.rankingService.getRankingIncome(this.familyId, period)
    }).subscribe({
      next: ({ expenses, income }) => {
        this.rankingData = this.mergeRankingData(expenses, income); // Nota: Si usaste el fix del servicio, aquí llega limpio
        
        // Tomamos los top 3 para el podio
        this.topSpenders = this.rankingData.slice(0, 3);
        this.isLoading = false;
        this.showPodium = true; // ¡Cambio de pantalla!

        if (this.rankingData.length === 0) {
          this.isLoading = false;
          this.noDataMessage = true; 
          
          
          setTimeout(() => this.noDataMessage = false, 3000);
          return; 
        }
      },
      error: () => {
        this.isLoading = false;
        alert('No se encontraron datos.');
      }
    });
  }

  exportExcel(): void {
    this.rankingService.downloadRankingExcel(this.familyId!, this.getPeriod()).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ranking_${this.getPeriod()}.xlsx`;
      a.click();
    });
  }

  backToSettings(): void {
    this.showPodium = false;
  }

  private mergeRankingData(exp: any, inc: any): RankingRow[] {
    // Aseguramos compatibilidad si el servicio devuelve {ranking: ...} o directo
    const expenses = exp.ranking ? exp.ranking : exp;
    const income = inc.ranking ? inc.ranking : inc;

    const users = new Set([...Object.keys(expenses || {}), ...Object.keys(income || {})]);
    const merged: RankingRow[] = [];

    users.forEach(u => {
      merged.push({ 
        user: u, 
        totalExpenses: expenses[u] || 0, 
        totalIncome: income[u] || 0 
      });
    });

    // Ordenar mayor gasto a menor
    return merged.sort((a, b) => b.totalExpenses - a.totalExpenses);
  }
}