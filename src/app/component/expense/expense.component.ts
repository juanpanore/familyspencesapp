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
    valor: new FormControl('', [Validators.required, Validators.min(0)]),
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
    if (this.expenseForm.valid) {
      this.expenses.push(this.expenseForm.value);
      this.expenseForm.reset();
      this.showForm = false;
    } else {
      console.log('Formulario inválido');
    }
  }
}
