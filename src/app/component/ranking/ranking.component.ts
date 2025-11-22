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
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
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

  months = [
    { val: 1, name: 'Enero' }, { val: 2, name: 'Febrero' }, { val: 3, name: 'Marzo' },
    { val: 4, name: 'Abril' }, { val: 5, name: 'Mayo' }, { val: 6, name: 'Junio' },
    { val: 7, name: 'Julio' }, { val: 8, name: 'Agosto' }, { val: 9, name: 'Septiembre' },
    { val: 10, name: 'Octubre' }, { val: 11, name: 'Noviembre' }, { val: 12, name: 'Diciembre' }
  ];

  years: number[] = [];

  rankingForm = new FormGroup({
    month: new FormControl(new Date().getMonth() + 1, [Validators.required]),
    year: new FormControl(new Date().getFullYear(), [Validators.required])
  });

  rankingData: RankingRow[] = [];
  topSpenders: RankingRow[] = [];

  constructor(
    private rankingService: RankingService,
    private authService: AuthService,
    private router: Router
  ) { 
    const currentYear = new Date().getFullYear();
    for (let i = 2023; i <= currentYear + 1; i++) {
      this.years.push(i);
    }
    this.years.sort((a, b) => b - a);

  }

  ngOnInit(): void {
    this.familyId = this.authService.getFamilyId();
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  getPeriod(): string {
    const monthVal = this.rankingForm.value.month;
    const yearVal = this.rankingForm.value.year;
    
    // Asegura que el mes tenga 2 dígitos (ej: 1 -> "01")
    const monthStr = monthVal!.toString().padStart(2, '0');
    return `${yearVal}-${monthStr}`;
  }

  onCalculate(): void {
    if (!this.familyId) return;
    
    this.isLoading = true;
    this.successMessage = false;
    this.noDataMessage = false;
    const period = this.getPeriod();

    this.rankingService.calculateRanking(this.familyId, period).subscribe({
      next: () => {
        setTimeout(() => {
          this.isLoading = false;
          this.successMessage = true;
          setTimeout(() => this.successMessage = false, 3000);
        }, 1000);
      },
      error: () => {
        this.isLoading = false;
        alert('Error de conexión.');
      }
    });
  }

  onConsult(): void {
    if (!this.familyId) return;

    this.isLoading = true;
    this.noDataMessage = false;
    this.successMessage = false; // Limpiamos mensajes previos
    
    const period = this.getPeriod();

    forkJoin({
      expenses: this.rankingService.getRankingExpenses(this.familyId, period),
      income: this.rankingService.getRankingIncome(this.familyId, period)
    }).subscribe({
      next: ({ expenses, income }) => {
        this.rankingData = this.mergeRankingData(expenses, income);
        
        // --- CORRECCIÓN: Validar ANTES de cambiar la vista ---
        if (this.rankingData.length === 0) {
          this.isLoading = false;
          this.noDataMessage = true; // Mostramos error
          setTimeout(() => this.noDataMessage = false, 3000);
          return; // ¡IMPORTANTE! Detenemos aquí. No cambiamos a Podio.
        }

        // Si llegamos aquí, es que SI hay datos
        this.topSpenders = this.rankingData.slice(0, 3);
        this.isLoading = false;
        this.showPodium = true; 
      },
      error: () => {
        this.isLoading = false;
        this.noDataMessage = true;
        setTimeout(() => this.noDataMessage = false, 3000);
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
    this.rankingData = [];
  }

  private mergeRankingData(exp: any, inc: any): RankingRow[] {
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

    return merged.sort((a, b) => b.totalExpenses - a.totalExpenses);
  }
}