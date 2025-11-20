import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(familyId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}?familyId=${familyId}`);
  }
  createTask(task: Partial<Task>, familyId: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}?familyId=${familyId}`, task);
  }

  updateTask(taskId: string, task: Partial<Task>, familyId: string): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${taskId}?familyId=${familyId}`, task);
  }

  deleteTask(taskId: string, familyId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${taskId}?familyId=${familyId}`);
  }
}
