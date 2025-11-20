import { Component, OnInit } from '@angular/core';
import { TaskService } from '../services/task.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  familyId: string = 'b2efb720-8296-495e-a86e-b2d2955cfb1f';
  idResponsible: string = 'f7c1acfa-62bb-4b7f-aaea-9cce2224c5f1'; 

  tasks: any[] = [];
  expenses: any[] = [];
  vacations: any[] = [];

  showModal: boolean = false; 

  newTask: any = {
    name: '',
    description: '',
    status: false,
    creationDate: '',
    idExpenseve: '',  // ✅ Nombre correcto del backend
    idVacation: ''    // ✅ Cambiado de vacationId a idVacation
  };

  constructor(private taskService: TaskService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadExpenses();
    this.loadVacations();
  }

  loadTasks(): void {
    this.taskService.getTasks(this.familyId).subscribe({
      next: (data) => {
        this.tasks = data;
        console.log('✅ Tareas cargadas:', this.tasks);
      },
      error: (err) => {
        console.error('❌ Error cargando tareas:', err);
      }
    });
  }

  loadExpenses(): void {
    this.http.get<any[]>(`http://localhost:8080/api/v1/rest/expenses/by-family/${this.familyId}`)
      .subscribe({
        next: (data) => {
          this.expenses = data;
          console.log('✅ Expenses cargados:', this.expenses);
        },
        error: (err) => console.error('❌ Error cargando expenses:', err)
      });
  }

  loadVacations(): void {
    this.http.get<any[]>(`http://localhost:8080/api/vacations`)
      .subscribe({
        next: (data) => {
          this.vacations = data;
          console.log('✅ Vacations cargadas:', this.vacations);
        },
        error: (err) => console.error('❌ Error cargando vacations:', err)
      });
  }

  createTask(): void {
    if (!this.newTask.name || !this.newTask.description || !this.newTask.idExpenseve) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    let formattedDate = '';
    try {
      // Si el usuario seleccionó una fecha, usarla; si no, usar la fecha actual
      formattedDate = this.newTask.creationDate || new Date().toISOString().split('T')[0];
    } catch (e) {
      console.error('❌ Error formateando fecha:', e);
      alert('Error al procesar la fecha de creación.');
      return;
    }

    // ✅ Estructura correcta: el backend espera objetos con { id: "uuid" }
    const taskData: any = {
      name: this.newTask.name,
      description: this.newTask.description,
      status: this.newTask.status,
      creationDate: formattedDate,
      idResponsible: this.idResponsible,
      idExpenseve: {
        id: this.newTask.idExpenseve  // Backend hace: task.getIdExpenseve().getId()
      }
    };

    // Solo agregar idVacations si tiene valor (como objeto)
    if (this.newTask.idVacation) {
      taskData.idVacations = {
        id: this.newTask.idVacation  // Backend hace: task.getIdVacations().getId()
      };
    }

    // familyId se pasa por query param, no en el body

    console.log('📤 Enviando taskData:', taskData);

    this.taskService.createTask(taskData, this.familyId).subscribe({
      next: (createdTask) => {
        console.log('✅ Tarea creada:', createdTask);
        this.tasks.push(createdTask);
        this.closeModal(); 
        this.loadTasks();
      },
      error: (err) => {
        console.error('❌ Error creando tarea:', err);
        console.error('❌ Detalle del error:', err.error);
        alert(`Error: ${err.error?.message || err.error?.error || 'No se pudo crear la tarea'}`);
      }
    });
  }

  toggleStatus(task: any): void {
    const updatedTask = { ...task, status: !task.status };
    this.taskService.updateTask(task.id, updatedTask, this.familyId).subscribe({
      next: () => {
        task.status = !task.status;
        console.log('✅ Estado actualizado:', task);
      },
      error: (err) => console.error('❌ Error actualizando tarea:', err)
    });
  }

  deleteTask(taskId: string): void {
    if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return;
    this.taskService.deleteTask(taskId, this.familyId).subscribe({
      next: () => {
        console.log('✅ Tarea eliminada:', taskId);
        this.tasks = this.tasks.filter(t => t.id !== taskId);
      },
      error: (err) => console.error('❌ Error eliminando tarea:', err)
    });
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.newTask = { 
      name: '', 
      description: '', 
      status: false, 
      creationDate: '', 
      idExpenseve: '',
      idVacation: ''
    };
  }
}