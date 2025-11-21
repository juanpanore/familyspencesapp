import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private apiUrl = `http://localhost:8080/api`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  public getAllBudgetsByFamily(): Observable<any>{
    const token = this.authService.getToken();
    const idFamily = this.authService.getFamilyId();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
    return this.http.get(this.apiUrl + "/families/" + idFamily + "/budgets", {headers: headers});
  }

    public getAllFamilies(): Observable<any>{
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    return this.http.get(this.apiUrl + "/v1"+ "/family", {headers: headers});
  }

    public saveBudget(budget: any): Observable<any>{
      const token = this.authService.getToken();
      const idFamily = this.authService.getFamilyId();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
      if (!idFamily) {
        return throwError(() => new Error('No se encontró el id de la familia'));
      }
    return this.http.post(this.apiUrl + "/families/" + idFamily + "/budgets", budget , {headers: headers});
  }

    public getBudgetDetail(idBuget: any): Observable<any>{
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
    return this.http.get(this.apiUrl + "/budgets/" + idBuget , {headers: headers});
  }

}
