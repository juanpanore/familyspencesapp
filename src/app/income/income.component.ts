import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ResponsibleDto {
  id: string;
  fullName: string;
}

interface IncomeDto {
  id?: string;
  title: string;
  description: string;
  period: string;
  total: number;
  responsible: any;
  family: string;
}

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css']
})
export class IncomeComponent implements OnInit {

  incomes: IncomeDto[] = [];
  income: IncomeDto = this.createEmptyIncome();

  responsibles: ResponsibleDto[] = [];

  loading = false;

  currentUserName = '';
  familyName = '';

  // ENDPOINTS DEL BACKEND
  private incomeApiUrl   = 'http://localhost:8080/api/income';
  private profileApiUrl  = 'http://localhost:8080/api/users/profile';
  private membersApiUrl  = 'http://localhost:8080/api/v1/family/members';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }



  private createEmptyIncome(): IncomeDto {
    return {
      title: '',
      description: '',
      period: '',
      total: 0,
      responsible: { id: '' },
      family: ''
    };
  }



  loadCurrentUser(): void {

    const storedEmail = localStorage.getItem('currentUserEmail') || '';

    const email = storedEmail || 'elmune21@gmail.com';


    this.http
      .get<any>(`${this.profileApiUrl}?email=${encodeURIComponent(email)}`)
      .subscribe({
        next: user => {
          this.currentUserName =
            user.fullName ||
            `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

          const familyId = user.familyId || user.family?.id || '';
          this.familyName =
            user.family?.familyName ||
            (familyId ? `Familia ${familyId.substring(0, 8)}...` : '');

          if (familyId) {
            this.income.family = familyId;
            this.loadFamilyMembers(familyId);
          }

          this.loadIncomes();
        },
        error: error => {
          console.error('Error al cargar perfil de usuario', error);

          this.loadIncomes();
        }
      });
  }



  loadFamilyMembers(familyId: string): void {
    this.http
      .get<any[]>(`${this.membersApiUrl}?familyId=${familyId}`)
      .subscribe({
        next: members => {
          this.responsibles = members.map(m => ({
            id: m.id,
            fullName:
              m.fullName ||
              `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim()
          }));
        },
        error: error => {
          console.error('Error al cargar miembros de la familia', error);
        }
      });
  }



  loadIncomes(): void {
    this.loading = true;
    this.http.get<IncomeDto[]>(this.incomeApiUrl).subscribe({
      next: incomes => {
        this.incomes = incomes;
        this.loading = false;
      },
      error: error => {
        console.error('Error al cargar ingresos', error);
        this.loading = false;
      }
    });
  }

  saveIncome(): void {
    this.http.post<IncomeDto>(this.incomeApiUrl, this.income).subscribe({
      next: () => {
        this.resetForm(false); // mantenemos la familia
        this.loadIncomes();
      },
      error: error => {
        console.error('Error al crear ingreso', error);
      }
    });
  }

  deleteIncome(id?: string): void {
    if (!id) return;
    if (!confirm('¿Seguro que deseas eliminar este ingreso?')) return;

    this.http.delete<void>(`${this.incomeApiUrl}/${id}`).subscribe({
      next: () => this.loadIncomes(),
      error: error => {
        console.error('Error al eliminar ingreso', error);
      }
    });
  }

  resetForm(resetFamily: boolean = false): void {
    const currentFamily = this.income.family;
    this.income = this.createEmptyIncome();
    if (!resetFamily) {
      this.income.family = currentFamily;
    }
    this.income.responsible.id = '';

  }



  get latestFamilyIncomes(): IncomeDto[] {
    if (!this.incomes || this.incomes.length === 0) {
      return [];
    }

    const familyId = this.income.family;
    if (!familyId) {
      return [];
    }

    const source = this.incomes.filter(i => i.family === familyId);
    const last = source.slice(-5);
    return last.reverse();
  }
}
