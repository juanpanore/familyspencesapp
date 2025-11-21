// src/app/components/budget/budget-list/budget-list.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BudgetService } from 'src/app/service/budget/budget.service';

@Component({
  selector: 'app-budget-list',
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.css']
})
export class BudgetListComponent implements OnInit {
  loading = false;
  error: string | null = null;
  familyId: string = '123e4567-e89b-12d3-a456-426614174000';
  datos: any;

  constructor(
    private budgetService: BudgetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.budgetService.getAllBudgetsByFamily(this.familyId).subscribe(resp => {
      this.datos = resp;
    },
      error => {console.error(error)});

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
