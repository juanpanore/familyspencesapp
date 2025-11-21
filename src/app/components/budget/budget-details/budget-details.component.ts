// src/app/components/budget/budget-details/budget-details.component.ts

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BudgetService } from '../../../service/budget/budget.service';


@Component({
  selector: 'app-budget-details',
  templateUrl: './budget-details.component.html',
  styleUrls: ['./budget-details.component.css']
})
export class BudgetDetailsComponent implements OnChanges {

  @Input() budgetId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  loading = false;
  error: string | null = null;
  budget: any = null;

  constructor(private budgetService: BudgetService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['budgetId'] && this.budgetId) {
      this.loadBudgetDetails();
    }
  }

  loadBudgetDetails(): void {
    if (!this.budgetId) return;

    this.loading = true;
    this.error = null;

    this.budgetService.getBudgetDetail(this.budgetId).subscribe({
      next: resp => {
        this.budget = resp;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'No pudimos cargar el detalle del budget.';
        this.loading = false;
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  formatPeriod(period: string): string {
    if (!period) return '';
    const normalized = period.length === 7 ? `${period}-01` : period;
    const date = new Date(normalized);
    return isNaN(date.getTime())
      ? period
      : date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
}
