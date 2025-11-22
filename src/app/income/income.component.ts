import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Income, Responsible } from './income.model';
import { IncomeService } from '../service/income/income.service';
import { FamilymemberService } from 'src/app/service/familymember/familymember';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css']
})
export class IncomeComponent implements OnInit {

  @ViewChild('incomeForm') form!: NgForm;

 
  incomes: Income[] = [];
  income: Income = this.createEmptyIncome();
  responsibles: Responsible[] = [];
  loading = false;
  isSaving = false;
  showEditModal = false;
  currentUserId = '';
  currentUserName = '';
  familyName = '';

  constructor(
    private incomeService: IncomeService,
    private familymemberService: FamilymemberService,
    private authService: AuthService,
    private router: Router          
  ) {}

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

 

  loadCurrentUser(): void {
    this.loading = true;

    const token = this.authService.getToken();
    if (!token) {
      console.error('No se encontró token JWT. No se puede cargar información de usuario.');
      this.loading = false;
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      this.currentUserId = payload.userId || payload.id || payload.sub || '';
      this.currentUserName =
        payload.fullName ||
        `${payload.firstName ?? ''} ${payload.lastName ?? ''}`.trim();

      const familyIdFromService = this.authService.getFamilyId();
      const familyIdFromToken =
        payload.familyId || (payload.family && payload.family.id) || '';

      const familyId = familyIdFromService || familyIdFromToken;

      if (familyId) {
        
        this.income.family = familyId;
        this.familyName =
          payload.familyName ||
          (payload.family && payload.family.familyName) ||
          '';
        console.log('Family ID obtenido del token/servicio:', familyId);
        this.loadFamilyMembers(familyId);
      } else {
        
        console.warn('Usuario sin Family ID (no pertenece a una familia).');

        this.familyName = '';

        this.responsibles = [
          {
            id: this.currentUserId,
            fullName: this.currentUserName || 'Usuario actual'
          }
        ];

        if (!this.income.id) {
          this.income.responsible.id = this.currentUserId;
        }

        this.income.family = '';
        this.incomes = [];
        this.loading = false;
      }
    } catch (e) {
      console.error('Error al decodificar el token JWT', e);
      this.loading = false;
    }
  }

  loadFamilyMembers(familyId: string): void {
    console.log('3. Llamando a loadFamilyMembers para ID:', familyId);

    this.familymemberService.getFamilyMembers().subscribe({
      next: (members: any[]) => {
        this.responsibles = members.map((m: any) => ({
          id: m.id,
          fullName: m.fullName ?? `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim()
        }));

        console.log('4. Responsables cargados. Cantidad:', this.responsibles.length);

        if (this.responsibles.length > 0) {
          if (!this.income.id && this.income.responsible.id === '') {
            this.income.responsible.id = this.responsibles[0].id;
            console.log('5. Responsable preseleccionado:', this.responsibles[0].fullName);
          }
        } else {
          console.warn(
            'Advertencia: La API devolvió una lista de responsables vacía (200 OK, pero []).'
          );
        }

        this.loadIncomes();
      },
      error: (error: any) => {
        console.error('ERROR CRÍTICO: Fallo en la llamada a getFamilyMembers.', error);
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
  goDashboard(): void {
    this.router.navigate(['/dashboard']);   
  }

 

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

    const sorted = [...this.incomes].sort((a, b) =>
      a.id && b.id ? a.id.localeCompare(b.id) : 0
    );
    const last = sorted.slice(-5);
    return last.reverse();
  }
}
