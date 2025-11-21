// src/app/components/budget/budget-create/budget-create.component.ts

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService } from '../../../service/budget/budget.service';

@Component({
  selector: 'app-budget-create',
  templateUrl: './budget-create.component.html',
  styleUrls: ['./budget-create.component.css']
})
export class BudgetCreateComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();
  @Output() budgetCreated = new EventEmitter<any>();

  private readonly responsibleId = '04ecbbc6-3df7-45b3-87ed-9822d7ed2f86';

  budgetForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService
  ) {
    this.budgetForm = this.fb.group({
      period: ['', [Validators.required]],
      budgetAmount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    const today = new Date();
    const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    this.budgetForm.patchValue({ period: defaultMonth });
  }

  onSubmit(): void {
    if (this.loading) return;

    if (this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.budgetForm.value;
    const payload = {
      period: this.formatPeriodForApi(formValue.period),
      budgetAmount: Number(formValue.budgetAmount),
      responsibleId: this.responsibleId
    };

    this.budgetService.saveBudget(payload).subscribe({
      next: resp => {
        this.loading = false;
        this.budgetCreated.emit(resp);
        this.close();
      },
      error: err => {
        console.error(err);
        this.error = 'No pudimos crear el budget, intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  private formatPeriodForApi(value: string): string {
    if (!value) return '';
    return value.length === 7 ? `${value}-01` : value;
  }
}

