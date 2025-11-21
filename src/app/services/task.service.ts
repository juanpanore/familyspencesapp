import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDTO } from '../models/task.model';
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/v1/rest/tasks';
  constructor(private http: HttpClient) { }
  getTasks(familyId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}?familyId=${familyId}`);
  }
  createTask(task: CreateTaskDTO, familyId: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}?familyId=${familyId}`, task);
  }
  updateTask(taskId: string, task: Task, familyId: string): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${taskId}?familyId=${familyId}`, task);
  }
  deleteTask(taskId: string, familyId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}?familyId=${familyId}`);
  }
}

