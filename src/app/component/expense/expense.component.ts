import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ExpenseService } from '../../service/expense/expense.service';

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
  responsables = ['Juan', 'María', 'Pedro', 'Ana'];
  showForm = false;
  expenses: any[] = [];

  constructor(private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.loadExpenses();
  }

  // Updated the loadExpenses method to adapt the API response for the table
  loadExpenses(): void {
    const familyId = 'b2efb720-8296-495e-a86e-b2d2955cfb1f';
    this.expenseService.getExpenses(familyId).subscribe(
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
  

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  // Updated the onSubmit method to match the required payload structure
  onSubmit() {
    if (this.expenseForm.valid) {
      const newExpense = {
        title: this.expenseForm.value.titulo.trim(),
        description: this.expenseForm.value.descripcion.trim(),
        period: this.expenseForm.value.periodo,
        value: parseFloat(this.expenseForm.value.valor), // Ensure value is a number
        category: this.expenseForm.value.categoria.trim(),
        responsible: this.expenseForm.value.responsable // Added responsible field
      };
      const familyId = 'b2efb720-8296-495e-a86e-b2d2955cfb1f';
      const mail = 'ana.gomez@email.com';

      console.log('Payload being sent:', newExpense);
      console.log(JSON.stringify(newExpense));

      this.expenseService.addExpense(newExpense, familyId, mail).subscribe(
        (response: any) => {
          console.log('Expense added:', response);
          this.expenses.push({
            titulo: response.title,
            descripcion: response.description,
            periodo: response.period,
            valor: response.formattedValue || response.value, // Use formattedValue if available
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
    } else {
      console.log('Formulario inválido');
    }
  }

  onValorInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const numericValue = inputElement.value.replace(/[^0-9]/g, '');
    this.expenseForm.get('valor')?.setValue(numericValue);
  }

  // Added the onCancel method to reset the form and return to the table view
  onCancel(): void {
    this.expenseForm.reset();
    this.showForm = false; // Return to the table view
  }

  // Added the onEditExpense method to handle editing an expense
  onEditExpense(index: number): void {
    const expenseToEdit = this.expenses[index];
    this.expenseForm.setValue({
      titulo: expenseToEdit.titulo,
      descripcion: expenseToEdit.descripcion,
      periodo: expenseToEdit.periodo,
      valor: expenseToEdit.valor,
      categoria: expenseToEdit.categoria,
      responsable: expenseToEdit.responsable
    });
    this.showForm = true; // Show the form for editing
  }

  // Added the onDeleteExpense method to handle deleting an expense
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
