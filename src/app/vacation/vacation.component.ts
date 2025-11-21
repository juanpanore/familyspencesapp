// src/app/vacation/vacation.component.ts

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Vacation {
  id?: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  presupuesto: number;
}

@Component({
  selector: 'app-vacation',
  templateUrl: './vacation.component.html',
  styleUrls: ['./vacation.component.css']
})
export class VacationComponent implements OnInit {
  vacations: Vacation[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showForm: boolean = false;
  editingId: string | null = null;
  formData: Vacation = this.getEmptyVacation();
  submitted: boolean = false;

  private apiUrl = 'http://localhost:8080/api/vacations';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadVacations();
  }

  getEmptyVacation(): Vacation {
    return {
      titulo: '',
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
      lugar: '',
      presupuesto: 0
    };
  }

  loadVacations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<Vacation[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.vacations = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las vacaciones: ' + error.message;
        this.loading = false;
      }
    });
  }

  createNewVacation(): void {
    this.editingId = null;
    this.formData = this.getEmptyVacation();
    this.showForm = true;
    this.submitted = false;
  }

  editVacation(vacation: Vacation): void {
    this.editingId = vacation.id || null;
    this.formData = { ...vacation };
    this.showForm = true;
    this.submitted = false;
  }

  saveVacation(): void {
    this.submitted = true;

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    if (this.editingId) {
      this.http.put<Vacation>(`${this.apiUrl}/${this.editingId}`, this.formData).subscribe({
        next: () => {
          this.successMessage = 'Vacación actualizada exitosamente';
          this.showForm = false;
          this.loading = false;
          this.loadVacations();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al actualizar: ' + error.message;
          this.loading = false;
        }
      });
    } else {
      this.http.post<Vacation>(this.apiUrl, this.formData).subscribe({
        next: () => {
          this.successMessage = 'Vacación creada exitosamente';
          this.showForm = false;
          this.loading = false;
          this.loadVacations();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al crear: ' + error.message;
          this.loading = false;
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.formData = this.getEmptyVacation();
    this.submitted = false;
    this.errorMessage = '';
  }

  deleteVacation(id: string, titulo: string): void {
    if (confirm(`¿Está seguro de eliminar la vacación "${titulo}"?`)) {
      this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.successMessage = 'Vacación eliminada exitosamente';
          this.loadVacations();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar: ' + error.message;
        }
      });
    }
  }

  validateForm(): boolean {
    return !!(
      this.formData.titulo &&
      this.formData.titulo.length >= 3 &&
      this.formData.descripcion &&
      this.formData.descripcion.length >= 10 &&
      this.formData.fechaInicio &&
      this.formData.fechaFin &&
      this.formData.fechaInicio <= this.formData.fechaFin &&
      this.formData.lugar &&
      this.formData.lugar.length >= 3 &&
      this.formData.presupuesto > 0
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatBudget(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  getDuration(fechaInicio: string, fechaFin: string): number {
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getDaysUntil(fechaInicio: string): number {
    const today = new Date();
    const start = new Date(fechaInicio);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getFormTitle(): string {
    return this.editingId ? '✏️ Editar Vacación' : '➕ Nueva Vacación';
  }
}
