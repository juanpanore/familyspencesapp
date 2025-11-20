import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) {}

  getTasks(familyId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?familyId=${familyId}`);
  }

  createTask(task: any, familyId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?familyId=${familyId}`, task);
  }

  updateTask(taskId: string, task: any, familyId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${taskId}?familyId=${familyId}`, task);
  }

  deleteTask(taskId: string, familyId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${taskId}?familyId=${familyId}`);
  }
}
