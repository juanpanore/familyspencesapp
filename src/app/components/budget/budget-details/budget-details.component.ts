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
  @Output() budgetDeleted = new EventEmitter<void>();

  loading = false;
  error: string | null = null;
  budget: any = null;

  showDeleteConfirm = false;
  deleting = false;

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
      error: () => {
        this.error = 'No pudimos cargar el detalle del presupuesto.';
        this.loading = false;
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  executeDelete(): void {
    if (!this.budgetId || this.deleting) return;

    this.deleting = true;
    this.budgetService.deleteBudget(this.budgetId).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.budgetDeleted.emit();
        this.close();
      },
      error: () => {
        this.error = 'No se pudo eliminar el presupuesto. Intenta de nuevo.';
        this.deleting = false;
        this.showDeleteConfirm = false;
      }
    });
  }

  formatPeriod(period: string): string {
    if (!period) return '';
    const normalized = period.length === 7 ? `${period}-01` : period;
    const date = new Date(normalized);
    return isNaN(date.getTime())
      ? period
      : date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  getUsagePercent(): number {
    const amount = this.budget?.budgetAmount ?? 0;
    const expenses = this.budget?.summary?.totalExpenses ?? 0;
    if (amount <= 0) return 0;
    return Math.min(Math.round((expenses / amount) * 100), 100);
  }
}
