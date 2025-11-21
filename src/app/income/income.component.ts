// src/app/income/income.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Income, Responsible } from './income.model';
import { IncomeService } from './income.service';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css']
})
export class IncomeComponent implements OnInit {

  @ViewChild('incomeForm') form!: NgForm;

  // --- Datos de Componente ---
  incomes: Income[] = [];
  income: Income = this.createEmptyIncome();
  responsibles: Responsible[] = [];

  // --- Estados de la Interfaz ---
  loading = false;
  isSaving = false;
  showEditModal = false;

  // --- Datos de Sesión ---
  currentUserName = '';
  familyName = '';

  constructor(private incomeService: IncomeService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private createEmptyIncome(): Income {
    const currentPeriod = this.getCurrentPeriod();

    return {
      title: '',
      description: '',
      period: currentPeriod,
      total: 0,
      responsible: { id: '' },
      family: ''
    };
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  // --- Lógica de Carga Asíncrona Controlada ---

  loadCurrentUser(): void {
    const storedEmail = localStorage.getItem('currentUserEmail') || '';
    const email = storedEmail || 'teito@gmail.com';

    this.loading = true;
    console.log('1. Intentando cargar perfil para:', email);

    this.incomeService.getProfile(email).subscribe({
      next: user => {
        this.currentUserName = user.fullName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

        const familyId = user.familyId || user.family?.id || '';
        this.familyName = user.family?.familyName || (familyId ? `Familia ${familyId.substring(0, 8)}...` : '');
        console.log('2. Perfil cargado. Family ID:', familyId);

        if (familyId) {
          this.income.family = familyId;
          this.loadFamilyMembers(familyId);
        } else {
          this.loading = false;
          console.warn('Advertencia: Usuario sin Family ID asignado.');
        }
      },
      error: error => {
        console.error('Error al cargar perfil de usuario', error);
        this.loading = false;
      }
    });
  }

  loadFamilyMembers(familyId: string): void {
    console.log('3. Llamando a loadFamilyMembers para ID:', familyId);

    this.incomeService.getResponsiblesByFamily(familyId).subscribe({
      next: members => {
        this.responsibles = members;
        console.log('4. Responsables cargados. Cantidad:', members.length);

        if (this.responsibles.length > 0) {
          if (!this.income.id && this.income.responsible.id === '') {
            this.income.responsible.id = this.responsibles[0].id;
            console.log('5. Responsable preseleccionado:', this.responsibles[0].fullName);
          }
        } else {
          console.warn('Advertencia: La API devolvió una lista de responsables vacía (200 OK, pero []).');
        }

        this.loadIncomes();
      },
      error: error => {
        console.error('ERROR CRÍTICO: Fallo en la llamada a getResponsiblesByFamily.', error);
        this.loadIncomes();
      }
    });
  }

  loadIncomes(): void {
    if (!this.income.family) {
      this.incomes = [];
      this.loading = false;
      return;
    }

    this.incomeService.getAllIncomesByFamily(this.income.family).subscribe({
      next: incomes => {
        this.incomes = incomes;
        console.log('6. Ingresos cargados. Proceso de carga finalizado.');
        this.loading = false;
      },
      error: error => {
        console.error('Error al cargar ingresos', error);
        this.loading = false;
      }
    });
  }

  // --- Lógica de CRUD ---

  saveIncome(): void {
    if (!this.income.id && this.form?.invalid) {
      alert('Por favor, complete todos los campos requeridos correctamente en el formulario principal.');
      return;
    }

    if (!this.income.responsible.id) {
      alert('Debe seleccionar un responsable.');
      return;
    }

    this.isSaving = true;

    const action = this.income.id
      ? this.incomeService.updateIncome(this.income)
      : this.incomeService.createIncome(this.income);

    const successMsg = this.income.id ? 'Ingreso actualizado con éxito.' : 'Ingreso creado con éxito.';

    action.subscribe({
      next: () => {
        alert(successMsg);
        this.resetForm(false);
        this.loadIncomes();
        this.closeModal();
      },
      error: (error: HttpErrorResponse) => {
        console.error(`Error al ${this.income.id ? 'actualizar' : 'crear'} ingreso`, error);
        alert(`Fallo en la operación: ${error.error?.message || error.message}`);
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  deleteIncome(id?: string): void {
    if (!id) return;
    if (!confirm('¿Seguro que deseas eliminar este ingreso? Esta acción es permanente.')) return;

    this.loading = true;

    this.incomeService.deleteIncome(id).subscribe({
      next: () => {
        alert('Ingreso eliminado. Se envió el mensaje DELETE a RabbitMQ.');
        this.incomes = this.incomes.filter(inc => inc.id !== id);
        this.loading = false;
      },
      error: error => {
        console.error('Error al eliminar ingreso', error);
        alert(`Fallo al eliminar: ${error.error?.message || error.message}`);
        this.loading = false;
      }
    });
  }

  // --- Lógica de Formulario y Modal ---

  resetForm(resetFamily: boolean = false): void {
    const currentFamily = this.income.family;
    this.income = this.createEmptyIncome();

    if (!resetFamily) {
      this.income.family = currentFamily;
    }

    if (this.form && !this.showEditModal) {
      this.form.resetForm(this.income);
    }

    if (this.responsibles.length > 0) {
      this.income.responsible.id = this.responsibles[0].id;
    }

    this.closeModal();
  }

  editIncome(income: Income): void {
    this.income = {
      ...income,
      responsible: { id: income.responsible.id }
    };
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showEditModal = false;
    if (this.income.id) {
      this.income = this.createEmptyIncome();
    }
    if (this.form) {
      this.form.resetForm(this.income);
    }
  }

  // --- Getters y Funciones de Ayuda ---

  getResponsibleFullName(responsibleId: string): string {
    if (!responsibleId) {
      return 'N/A';
    }

    const member = this.responsibles.find(r => r.id === responsibleId);

    return member ? member.fullName : 'ID no encontrado';
  }

  get latestFamilyIncomes(): Income[] {
    if (!this.incomes || this.incomes.length === 0) {
      return [];
    }

    const sorted = [...this.incomes].sort((a, b) => (a.id && b.id) ? a.id.localeCompare(b.id) : 0);
    const last = sorted.slice(-5);
    return last.reverse();
  }
}
