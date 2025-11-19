import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface BudgetItem {
  budgetId: string;
  periodo: string;
  presupuesto: number;
  income: number;
  expenses: number;
  balance: number;
  responsable: string;
}

@Component({
  selector: 'app-budget',
  templateUrl: './budget.html',
  styleUrls: ['./budget.css']
})
export class BudgetComponent implements OnInit {
  API_BASE_URL = '/api';

  families = [
    { id: 'c85fdb06-0e21-4e95-9c20-a368aa541e78', name: 'Familia García' },
    { id: '123e4567-e89b-12d3-a456-426614174001', name: 'Familia Rodríguez' }
  ];
  selectedFamily = '';
  budgets: BudgetItem[] = [];
  loading = false;
  error = '';

  formData = {
    period: '',
    budgetAmount: '',
    responsibleId: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  selectFamily(familyId: string) {
    this.selectedFamily = familyId;
    if (familyId) this.loadBudgets(familyId);
  }

  loadBudgets(familyId: string) {
    this.loading = true;
    this.error = '';
    this.http.get<BudgetItem[]>(`${this.API_BASE_URL}/families/${familyId}/budgets`, { withCredentials: true })
      .subscribe({
        next: (data) => this.budgets = data,
        error: (err) => {
          console.error(err);
          this.error = 'Error al cargar los presupuestos. Revisa que el backend esté corriendo.';
        },
        complete: () => this.loading = false
      });
  }

  createBudget() {
    if (!this.formData.period || !this.formData.budgetAmount || !this.formData.responsibleId) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';
    const body = {
      period: this.formData.period + '-01',
      budgetAmount: parseFloat(this.formData.budgetAmount),
      responsibleId: this.formData.responsibleId
    };

    this.http.post(`${this.API_BASE_URL}/families/${this.selectedFamily}/budgets`, body, { withCredentials: true })
      .subscribe({
        next: () => {
          this.loadBudgets(this.selectedFamily);
          this.formData = { period: '', budgetAmount: '', responsibleId: '' };
        },
        error: (err) => {
          console.error(err);
          this.error = 'Error al crear el presupuesto';
        },
        complete: () => this.loading = false
      });
  }
}
