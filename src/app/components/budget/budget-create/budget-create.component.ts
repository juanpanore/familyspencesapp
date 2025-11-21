// src/app/components/budget/budget-create/budget-create.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BudgetService } from '../../../services/budget.service';

@Component({
  selector: 'app-budget-create',
  templateUrl: './budget-create.component.html',
  styleUrls: ['./budget-create.component.css']
})
export class BudgetCreateComponent implements OnInit {
  budgetForm: FormGroup;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  familyId: string = '';
  familyMembers: any[] = []; // Se debe cargar desde un servicio de usuarios

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private router: Router
  ) {
    this.budgetForm = this.fb.group({
      period: ['', [Validators.required]],
      budgetAmount: ['', [Validators.required, Validators.min(0.01)]],
      responsibleId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.familyId = localStorage.getItem('familyId') || '';

    if (!this.familyId) {
      this.error = 'No se encontró el ID de la familia. Por favor, inicie sesión nuevamente.';
      return;
    }

    // TODO: Cargar miembros de la familia desde tu servicio
    // this.loadFamilyMembers();

    // Datos de ejemplo para pruebas
    this.familyMembers = [
      { id: 'user-1', fullName: 'Usuario de Prueba 1' },
      { id: 'user-2', fullName: 'Usuario de Prueba 2' }
    ];
  }

  onSubmit(): void {
    if (this.budgetForm.invalid) {

      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const formValue = this.budgetForm.value;

}
}

