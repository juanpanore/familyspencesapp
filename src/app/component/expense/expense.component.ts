import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ExpenseService } from '../../service/expense/expense.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent implements OnInit {

  expenseForm = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(3)]),
    descripcion: new FormControl('', [Validators.required, Validators.minLength(5)]),
    periodo: new FormControl('', [Validators.required]),
    valor: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0)]),
    categoria: new FormControl('', [Validators.required]),
    responsable: new FormControl('', [Validators.required])
  });
  
  categorias = ['ALIMENTACIÓN', 'TRANSPORTE', 'EDUCACIÓN', 'ENTRETENIMIENTO', 'SALUD', 'VIVIENDA', 'OTROS'];
  responsables: any[]= [];
  showForm = false;
  expenses: any[] = [];
  familyId: string | null = null;
  isEditing: boolean = false;
  editingIndex: number | null = null;

  constructor(private expenseService: ExpenseService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadExpenses();
    this.loadMembers();
  }

  loadExpenses(): void {
    this.familyId = this.authService.getFamilyId();
    if (!this.familyId) {
      console.error("familyId es null");
    return;
      }
    this.expenseService.getExpenses(this.familyId).subscribe(
      (data) => {
        this.expenses = data.map(expense => ({
          id: expense.id,
          titulo: expense.title,
          descripcion: expense.description,
          periodo: expense.period,
          valor: expense.value,
          categoria: expense.category,
          responsable: expense.responsible
        }));
        console.log('Expenses loaded and adapted:', this.expenses);
      },
      (error) => {
        console.error('Error loading expenses:', error);
      }
    );
  }

    loadMembers(): void {
    this.familyId = this.authService.getFamilyId();
    if (!this.familyId) {
      console.error("familyId es null");
    return;
      }
    this.expenseService.getMembers(this.familyId).subscribe(
      (data) => {
        this.responsables = data.map(responsable => ({
          id: responsable.id,
          titulo: responsable.email,
        }));
        console.log('Expenses loaded and adapted:', this.expenses);
      },
      (error) => {
        console.error('Error loading expenses:', error);
      }
    );
  }
  

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  onSubmit() {
    if (this.expenseForm.valid) {

      if(this.isEditing && this.editingIndex !== null) {
        const updatedExpense = this.expenseForm.value;
        const original = this.expenses[this.editingIndex!];

        const expense = {
          title: this.expenseForm.value.titulo.trim(),
          description: this.expenseForm.value.descripcion.trim(),
          period: this.expenseForm.value.periodo,
          value: parseFloat(this.expenseForm.value.valor), 
          category: this.expenseForm.value.categoria.trim(),
          responsible: this.expenseForm.value.responsable
        };

        console.log(JSON.stringify(expense));

        this.expenseService.updateExpense(original.id,expense.responsible, expense).subscribe(
        (response: any) => {
          console.log('Expense updated:', response);
          this.expenseForm.reset();
          this.showForm = false;
          this.isEditing = false;
          this.editingIndex = null;
        },
        (error: any) => {
          console.error('Error updating expense:', error);
        }
      );
      }
      
      
      else {
      const newExpense = {
        title: this.expenseForm.value.titulo.trim(),
        description: this.expenseForm.value.descripcion.trim(),
        period: this.expenseForm.value.periodo,
        value: parseFloat(this.expenseForm.value.valor), 
        category: this.expenseForm.value.categoria.trim(),
        responsible: this.expenseForm.value.responsable
      };
      this.familyId = this.authService.getFamilyId();
      
      if (!this.familyId) {
      console.error("familyId es null");
        return;
      }
      console.log('Payload being sent:', newExpense);
      console.log(JSON.stringify(newExpense));
      this.expenseService.addExpense(newExpense, this.familyId, newExpense.responsible).subscribe(
        (response: any) => {
          console.log('Expense added:', response);
          this.expenses.push({
            titulo: response.title,
            descripcion: response.description,
            periodo: response.period,
            valor: response.formattedValue || response.value,
            categoria: response.category,
            responsable: response.responsible
          });
          this.expenseForm.reset();
          this.showForm = false;
        },
        (error: any) => {
          console.error('Error adding expense:', error);
        }
      );
    }


    } else {
      console.log('Formulario inválido');
    }
  }

  onValorInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const numericValue = inputElement.value.replace(/[^0-9]/g, '');
    this.expenseForm.get('valor')?.setValue(numericValue);
  }

  onCancel(): void {
    this.expenseForm.reset();
    this.showForm = false;
    this.isEditing = false;
    this.editingIndex = null;
  }

  onEditExpense(index: number): void {
    const expenseToEdit = this.expenses[index];
    this.isEditing = true;
    this.editingIndex = index;
    this.expenseForm.setValue({
      titulo: expenseToEdit.titulo,
      descripcion: expenseToEdit.descripcion,
      periodo: expenseToEdit.periodo,
      valor: expenseToEdit.valor,
      categoria: expenseToEdit.categoria,
      responsable: expenseToEdit.responsable
    });

    this.showForm = true;
  }

  onDeleteExpense(index: number): void {
    const confirmDelete = confirm('¿Está seguro de que desea eliminar este gasto?');
    if (confirmDelete) {
      const expenseToDelete = this.expenses[index];
      this.expenseService.deleteExpense(expenseToDelete.id).subscribe(
        () => {
          console.log('Expense deleted:', expenseToDelete);
          this.expenses.splice(index, 1);
        },
        (error) => {
          console.error('Error deleting expense:', error);
          console.log('Payload being sent:', expenseToDelete.id);
        }
      );
    }
  }
}
