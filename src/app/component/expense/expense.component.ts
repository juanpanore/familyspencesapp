import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';

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

  categorias = ['Alimentación', 'Transporte', 'Educación', 'Entretenimiento'];
  responsables = ['Juan', 'María', 'Pedro', 'Ana'];
  showForm = false;
  expenses: any[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  onSubmit() {
    console.log('Form submission triggered');
    console.log('Form valid status:', this.expenseForm.valid);
    console.log('Form values:', this.expenseForm.value);

    // Log the state of each form control
    Object.keys(this.expenseForm.controls).forEach(controlName => {
      const control = this.expenseForm.get(controlName);
      console.log(`Control: ${controlName}, Value: ${control?.value}, Valid: ${control?.valid}, Errors: ${control?.errors}`);
    });

    if (this.expenseForm.valid) {
      this.expenses.push(this.expenseForm.value);
      console.log('Expense added:', this.expenseForm.value);
      this.expenseForm.reset();
      this.showForm = false; // Return to the view screen after saving
    } else {
      console.log('Formulario inválido');
    }
  }

  onValorInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const numericValue = inputElement.value.replace(/[^0-9]/g, '');
    this.expenseForm.get('valor')?.setValue(numericValue);
  }
}
