import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../services/task.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ExpenseService } from '../service/expense/expense.service';
import { Task, Expense, CreateTaskDTO } from '../models/task.model';

// Interfaz local para Vacations que coincide con la respuesta del backend
interface Vacation {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  presupuesto: number;
}

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  familyId: string = '';
  idResponsible: string = '';
  isLoading: boolean = false;

  tasks: Task[] = [];
  expenses: Expense[] = [];
  vacations: Vacation[] = [];

  showModal: boolean = false;
  showDeleteDialog: boolean = false;
  taskToDelete: Task | null = null;

  toastMessage: string = '';
  toastTitle: string = '';
  toastType: 'success' | 'error' = 'success';
  showToast: boolean = false;

  taskForm: FormGroup;

  constructor(
    private taskService: TaskService,
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder,
    private expenseService: ExpenseService
  ) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      status: [false],
      creationDate: [new Date().toISOString().split('T')[0], Validators.required],
      idExpenseve: [''],
      idVacation: ['']
    });

    this.taskForm.get('idExpenseve')?.valueChanges.subscribe(value => {
      const vacationControl = this.taskForm.get('idVacation');
      if (value) {
        vacationControl?.setValue('', { emitEvent: false });
        vacationControl?.disable({ emitEvent: false });
      } else {
        vacationControl?.enable({ emitEvent: false });
      }
    });

    this.taskForm.get('idVacation')?.valueChanges.subscribe(value => {
      const expenseControl = this.taskForm.get('idExpenseve');
      if (value) {
        expenseControl?.setValue('', { emitEvent: false });
        expenseControl?.disable({ emitEvent: false });
      } else {
        expenseControl?.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.familyId = this.authService.getFamilyId() || '';
    this.idResponsible = this.authService.getUserId() || '';

    if (!this.familyId || !this.idResponsible) {
      console.error(' No se pudo obtener la información de autenticación (familyId o userId)');
    }

    this.loadTasks();
    this.loadExpenses();
    this.loadVacations();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks(this.familyId).subscribe({
      next: (data) => {
        this.tasks = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(' Error cargando tareas:', err);
        this.tasks = [];
        this.isLoading = false;
      }
    });
  }

  loadExpenses(): void {
    this.expenseService.getExpenses(this.familyId)
      .subscribe({
        next: (data) => {
          this.expenses = data;
        },
        error: (err) => {
          console.error(' Error cargando expenses:', err);
          this.expenses = [];
        }
      });
  }

  loadVacations(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Usamos el endpoint correcto que devuelve todas las vacaciones
    this.http.get<Vacation[]>('http://localhost:8080/api/vacations', { headers })
      .subscribe({
        next: (data) => this.vacations = data,
        error: (err) => {
          console.error(' Error cargando vacations:', err);
          this.vacations = [];
        }
      });
  }

  createTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;

    const taskData: CreateTaskDTO = {
      name: formValue.name,
      description: formValue.description,
      status: formValue.status,
      creationDate: formValue.creationDate,
      idResponsible: this.idResponsible,
      idExpenseve: formValue.idExpenseve ? { id: formValue.idExpenseve } : null,
      idVacations: formValue.idVacation ? { id: formValue.idVacation } : null
    };

    this.isLoading = true;
    this.taskService.createTask(taskData, this.familyId).subscribe({
      next: (createdTask) => {
        console.log(`[v0] Tarea "${createdTask.name}" creada exitosamente`);
        this.tasks.push(createdTask);
        this.closeModal();
        this.loadTasks();
        this.isLoading = false;
        this.showToastNotification(
          'Tarea creada',
          `"${createdTask.name}" ha sido creada correctamente`,
          'success'
        );
      },
      error: (err) => {
        console.error(' Error creando tarea:', err);
        this.isLoading = false;
        this.showToastNotification(
          'Error',
          err.error?.message || 'No se pudo crear la tarea',
          'error'
        );
      }
    });
  }

  toggleStatus(task: Task): void {
    if (!task.id) return;
    const updatedTask = { ...task, status: !task.status };
    const nuevoEstado = !task.status;

    task.status = nuevoEstado;

    this.taskService.updateTask(task.id, updatedTask, this.familyId).subscribe({
      next: () => {
        console.log(`[v0] Tarea "${task.name}" cambiada a: ${nuevoEstado ? 'COMPLETADA' : 'PENDIENTE'}`);
        this.showToastNotification(
          nuevoEstado ? 'Tarea completada' : 'Tarea marcada como pendiente',
          `"${task.name}" ${nuevoEstado ? 'ha sido completada' : 'está ahora pendiente'}`,
          'success'
        );
      },
      error: (err) => {
        console.error(' Error actualizando tarea:', err);
        task.status = !task.status;
        this.showToastNotification(
          'Error',
          'No se pudo actualizar el estado de la tarea',
          'error'
        );
      }
    });
  }

  openDeleteDialog(task: Task): void {
    this.taskToDelete = task;
    this.showDeleteDialog = true;
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.taskToDelete = null;
  }

  confirmDelete(): void {
    if (!this.taskToDelete || !this.taskToDelete.id) return;

    const taskName = this.taskToDelete.name;
    const taskId = this.taskToDelete.id;

    this.taskService.deleteTask(taskId, this.familyId).subscribe({
      next: () => {
        console.log(` Tarea "${taskName}" eliminada exitosamente`);
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.closeDeleteDialog();
        this.showToastNotification(
          'Tarea eliminada',
          `"${taskName}" ha sido eliminada correctamente`,
          'success'
        );
      },
      error: (err) => {
        console.error(' Error eliminando tarea:', err);
        this.closeDeleteDialog();
        this.showToastNotification(
          'Error',
          'No se pudo eliminar la tarea',
          'error'
        );
      }
    });
  }

  showToastNotification(title: string, message: string, type: 'success' | 'error'): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.taskForm.reset({
      name: '',
      description: '',
      status: false,
      creationDate: new Date().toISOString().split('T')[0],
      idExpenseve: '',
      idVacation: ''
    });
    this.taskForm.get('idExpenseve')?.enable({ emitEvent: false });
    this.taskForm.get('idVacation')?.enable({ emitEvent: false });
  }

  get isExpenseSelected(): boolean {
    return !!this.taskForm.get('idExpenseve')?.value;
  }

  get isVacationSelected(): boolean {
    return !!this.taskForm.get('idVacation')?.value;
  }
}