import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Goal } from '../../models/goal.model';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private apiUrl = 'http://localhost:8080/api/goals';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getGoalsByFamilyId(familyId: string): Observable<Goal[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Goal[]>(`${this.apiUrl}?familyId=${familyId}`, { headers });
  }

  getGoal(familyId: string, goalId: string): Observable<Goal> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Goal>(`${this.apiUrl}/${goalId}?familyId=${familyId}`, { headers });
  }

  createGoal(familyId: string, categoryId: string, goal: Goal): Observable<Goal> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Goal>(`${this.apiUrl}?familyId=${familyId}&categoryId=${categoryId}`, goal, { headers });
  }

  updateGoal(familyId: string, goalId: string, categoryId: string, goal: Goal): Observable<Goal> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Goal>(`${this.apiUrl}/${goalId}?familyId=${familyId}&categoryId=${categoryId}`, goal, { headers });
  }

  deleteGoal(familyId: string, goalId: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/${goalId}?familyId=${familyId}`, { headers });
  }
}
