import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDTO } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getTasks(familyId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}?familyId=${familyId}`, {
      headers: this.getHeaders()
    });
  }

  createTask(task: CreateTaskDTO, familyId: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}?familyId=${familyId}`, task, {
      headers: this.getHeaders()
    });
  }

  updateTask(taskId: string, task: Task, familyId: string): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${taskId}?familyId=${familyId}`, task, {
      headers: this.getHeaders()
    });
  }

  deleteTask(taskId: string, familyId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}?familyId=${familyId}`, {
      headers: this.getHeaders()
    });
  }
}
