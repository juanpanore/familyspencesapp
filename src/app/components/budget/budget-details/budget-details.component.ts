// src/app/components/budget/budget-details/budget-details.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetService } from '../../../service/budget/budget.service';


@Component({
  selector: 'app-budget-details',
  templateUrl: './budget-details.component.html',
  styleUrls: ['./budget-details.component.css']
})
export class BudgetDetailsComponent implements OnInit {

  loading = false;
  error: string | null = null;
  budgetId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private budgetService: BudgetService
  ) {}

  ngOnInit(): void {
    this.budgetId = this.route.snapshot.paramMap.get('id') || '';

    if (this.budgetId) {
      this.loadBudgetDetails();
    } else {
      this.error = 'ID de presupuesto no válido';
    }
  }

  loadBudgetDetails(): void {
    this.loading = true;
    this.error = null;

}
}
