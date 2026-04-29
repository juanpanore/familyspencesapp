import { Component, OnInit } from '@angular/core';
import { BudgetService } from 'src/app/service/budget/budget.service';

@Component({
  selector: 'app-budget-list',
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.css']
})
export class BudgetListComponent implements OnInit {

  budgets: any[] = [];
  loading = false;
  error: string | null = null;

  showCreateModal = false;
  showDetailModal = false;
  selectedBudgetId: string | null = null;

  constructor(private budgetService: BudgetService) {}

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.loading = true;
    this.error = null;

    this.budgetService.getAllBudgetsByFamily().subscribe({
      next: resp => {
        this.budgets = Array.isArray(resp) ? resp : [];
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'No pudimos cargar los budgets de la familia.';
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  handleBudgetCreated(): void {
    this.showCreateModal = false;
    this.loadBudgets();
  }

  openDetailModal(budgetId: string): void {
    this.selectedBudgetId = budgetId;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedBudgetId = null;
  }

  formatPeriod(period: string): string {
    if (!period) return '';
    const normalized = period.length === 7 ? `${period}-01` : period;
    const date = new Date(normalized);
    return isNaN(date.getTime())
      ? period
      : date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  getBudgetAmount(budget: any): number {
    return budget?.presupuesto ?? budget?.budgetAmount ?? 0;
  }

  getBalance(budget: any): number {
    return budget?.balance ?? budget?.summary?.balance ?? 0;
  }

  getIncome(budget: any): number {
    return budget?.income ?? budget?.summary?.familyTotalIncome ?? 0;
  }

  getExpenses(budget: any): number {
    return budget?.expenses ?? budget?.summary?.totalExpenses ?? 0;
  }

  getIncomeDifference(budget: any): number {
    return budget?.incomeDifference ?? 0;
  }

  getExpensesDifference(budget: any): number {
    if (budget?.expensesDifference !== undefined && budget?.expensesDifference !== null) {
      return budget.expensesDifference;
    }

    const amount = this.getBudgetAmount(budget);
    const expenses = this.getExpenses(budget);
    return amount - expenses;
  }

  getResponsibleName(budget: any): string {
    return budget?.responsable || budget?.responsible?.name || 'Responsable asignado';
  }
}
