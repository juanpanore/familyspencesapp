// src/app/components/budget/budget-list/budget-list.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BudgetService } from '../../../services/budget.service';

@Component({
  selector: 'app-budget-list',
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.css']
})
export class BudgetListComponent implements OnInit {
  loading = false;
  error: string | null = null;
  familyId: string = '';

  constructor(
    private budgetService: BudgetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener familyId del usuario logueado
    this.familyId = localStorage.getItem('familyId') || '';

    if (this.familyId) {
      this.loadBudgets();
    } else {
      this.error = 'No se encontró el ID de la familia. Por favor, inicie sesión nuevamente.';
    }
  }

  loadBudgets(): void {
    this.loading = true;
    this.error = null;

    this.budgetService.getAllBudgetsByFamily(this.familyId).subscribe({
      next: (data) => {
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los presupuestos. Por favor, intente nuevamente.';
        this.loading = false;
        console.error('Error al cargar presupuestos:', err);
      }
    });
  }

  createNewBudget(): void {
    this.router.navigate(['/budget/create']);
  }

  viewDetails(budgetId: string): void {
    this.router.navigate(['/budget/details', budgetId]);
  }


  refreshList(): void {
    this.loadBudgets();
  }
}
