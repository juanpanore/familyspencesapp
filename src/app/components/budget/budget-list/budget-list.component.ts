import { Component, OnInit } from '@angular/core';
import { BudgetService } from 'src/app/service/budget/budget.service';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-budget-list',
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.css']
})
export class BudgetListComponent implements OnInit {

  budgets: any[] = [];
  filteredBudgets: any[] = [];
  loading = false;
  error: string | null = null;

  showCreateModal = false;
  showDetailModal = false;
  selectedBudgetId: string | null = null;

  // Filtro por período (HU6)
  filterPeriod = '';
  availablePeriods: string[] = [];

  // Confirmación de eliminación
  showDeleteConfirm = false;
  budgetToDelete: any = null;
  deleting = false;

  // Toast
  toast: Toast | null = null;
  private toastTimer: any;

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
        this.extractAvailablePeriods();
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'No pudimos cargar los presupuestos de la familia.';
        this.loading = false;
      }
    });
  }

  // --- Filtrado por período (HU6) ---
  extractAvailablePeriods(): void {
    const periods = this.budgets
      .map(b => b.periodo || b.period || '')
      .filter(p => !!p);
    this.availablePeriods = [...new Set(periods)].sort().reverse();
  }

  applyFilter(): void {
    if (!this.filterPeriod) {
      this.filteredBudgets = [...this.budgets];
    } else {
      this.filteredBudgets = this.budgets.filter(b => {
        const period = b.periodo || b.period || '';
        return period.startsWith(this.filterPeriod);
      });
    }
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  clearFilter(): void {
    this.filterPeriod = '';
    this.applyFilter();
  }

  // --- CRUD modals ---
  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  handleBudgetCreated(): void {
    this.showCreateModal = false;
    this.showToast('Presupuesto creado exitosamente', 'success');
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

  handleBudgetDeleted(): void {
    this.showDetailModal = false;
    this.selectedBudgetId = null;
    this.showToast('Presupuesto eliminado correctamente', 'success');
    this.loadBudgets();
  }

  // --- Eliminar presupuesto (REF08) ---
  confirmDelete(event: Event, budget: any): void {
    event.stopPropagation();
    this.budgetToDelete = budget;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.budgetToDelete = null;
  }

  executeDelete(): void {
    if (!this.budgetToDelete || this.deleting) return;

    this.deleting = true;
    const budgetId = this.budgetToDelete.budgetId || this.budgetToDelete.id;

    this.budgetService.deleteBudget(budgetId).subscribe({
      next: () => {
        this.showToast('Presupuesto eliminado correctamente', 'success');
        this.showDeleteConfirm = false;
        this.budgetToDelete = null;
        this.deleting = false;
        this.loadBudgets();
      },
      error: () => {
        this.showToast('No se pudo eliminar el presupuesto. Intenta de nuevo.', 'error');
        this.deleting = false;
      }
    });
  }

  // --- Toast ---
  showToast(message: string, type: 'success' | 'error'): void {
    clearTimeout(this.toastTimer);
    this.toast = { message, type };
    this.toastTimer = setTimeout(() => this.toast = null, 4000);
  }

  dismissToast(): void {
    clearTimeout(this.toastTimer);
    this.toast = null;
  }

  // --- Helpers de formateo ---
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

  getUsagePercent(budget: any): number {
    const amount = this.getBudgetAmount(budget);
    const expenses = this.getExpenses(budget);
    if (amount <= 0) return 0;
    return Math.min(Math.round((expenses / amount) * 100), 100);
  }
}
