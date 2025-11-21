import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../services/task.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Task, Expense, Vacation, CreateTaskDTO } from '../models/task.model';

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
  taskForm: FormGroup;

  constructor(
    private taskService: TaskService,
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      status: [false],
      creationDate: [new Date().toISOString().split('T')[0], Validators.required],
      idExpenseve: [''],
      idVacation: ['']
    });
  }

  ngOnInit(): void {
    this.familyId = this.authService.getFamilyId() || '';
    this.idResponsible = this.authService.getUserId() || '';

    if (!this.familyId || !this.idResponsible) {
      console.error('❌ No se pudo obtener la información de autenticación (familyId o userId)');
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
        console.error('❌ Error cargando tareas:', err);
        this.tasks = [];
        this.isLoading = false;
      }
    });
  }

  loadExpenses(): void {
    this.http.get<Expense[]>(`http://localhost:8080/api/v1/rest/expenses/by-family/${this.familyId}`)
      .subscribe({
        next: (data) => this.expenses = data,
        error: (err) => {
          console.error('❌ Error cargando expenses:', err);
          this.expenses = [];
        }
      });
  }

  loadVacations(): void {
    this.http.get<Vacation[]>(`http://localhost:8080/api/vacations`)
      .subscribe({
        next: (data) => this.vacations = data,
        error: (err) => {
          console.error('❌ Error cargando vacations:', err);
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

    console.log('📤 Enviando taskData:', taskData);

    this.isLoading = true;
    this.taskService.createTask(taskData, this.familyId).subscribe({
      next: (createdTask) => {
        console.log('✅ Tarea creada:', createdTask);
        this.tasks.push(createdTask);
        this.closeModal();
        this.loadTasks();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error creando tarea:', err);
        alert(`Error: ${err.error?.message || 'No se pudo crear la tarea'}`);
        this.isLoading = false;
      }
    });
  }

  toggleStatus(task: Task): void {
    if (!task.id) return;
    const updatedTask = { ...task, status: !task.status };


    task.status = !task.status;

    this.taskService.updateTask(task.id, updatedTask, this.familyId).subscribe({
      next: () => console.log('✅ Estado actualizado'),
      error: (err) => {
        console.error('❌ Error actualizando tarea:', err);
        task.status = !task.status;
      }
    });
  }

  deleteTask(taskId: string | undefined): void {
    if (!taskId) return;
    if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return;

    this.taskService.deleteTask(taskId, this.familyId).subscribe({
      next: () => {
        console.log('✅ Tarea eliminada:', taskId);
        this.tasks = this.tasks.filter(t => t.id !== taskId);
      },
      error: (err) => console.error('❌ Error eliminando tarea:', err)
    });
  }

  toggleStatusInForm(): void {
    const currentStatus = this.taskForm.get('status')?.value;
    this.taskForm.get('status')?.setValue(!currentStatus);
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
  }
}