import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryType, BudgetPeriod } from './category.model';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = 'http://localhost:8080/api/categories';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getAllCategories(familyId: string): Observable<Category[]> {
        const params = new HttpParams().set('familyId', familyId);
        return this.http.get<Category[]>(this.apiUrl, { params, headers: this.getHeaders() });
    }

    getCategory(categoryId: string, familyId: string): Observable<Category> {
        const params = new HttpParams().set('familyId', familyId);
        return this.http.get<Category>(`${this.apiUrl}/${categoryId}`, { params, headers: this.getHeaders() });
    }

    createCategory(category: Category, familyId: string): Observable<Category> {
        const params = new HttpParams().set('familyId', familyId);
        return this.http.post<Category>(this.apiUrl, category, { params, headers: this.getHeaders() });
    }

    updateCategory(categoryId: string, category: Category, familyId: string): Observable<Category> {
        const params = new HttpParams().set('familyId', familyId);
        return this.http.put<Category>(`${this.apiUrl}/${categoryId}`, category, { params, headers: this.getHeaders() });
    }

    deleteCategory(categoryId: string, familyId: string): Observable<any> {
        const params = new HttpParams().set('familyId', familyId);
        return this.http.delete(`${this.apiUrl}/${categoryId}`, { params, headers: this.getHeaders() });
    }

    filterForFamily(familyId: string, type?: CategoryType, period?: BudgetPeriod): Observable<Category[]> {
        let params = new HttpParams().set('familyId', familyId);
        if (type) {
            params = params.set('type', type);
        }
        if (period) {
            params = params.set('period', period);
        }
        return this.http.get<Category[]>(`${this.apiUrl}/filter`, { params, headers: this.getHeaders() });
    }
}