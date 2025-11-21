import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryType, BudgetPeriod } from './category.model';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = 'http://localhost:8080/api/categories';

    constructor(private http: HttpClient) { }

    getAllCategories(familyId: string): Observable<Category[]> {
        const params = new HttpParams().set('familyId', familyId);
        return this.http.get<Category[]>(this.apiUrl, { params });
    }

    getCategory(categoryId: string, familyId: string): Observable<Category> {
        const params = new HttpParams().set('familyId', familyId);
        return this.http.get<Category>(`${this.apiUrl}/${categoryId}`, { params });
    }

    createCategory(category: Category, familyId: string): Observable<Category> {
        const params = new HttpParams().set('familyId', familyId);
        return this.http.post<Category>(this.apiUrl, category, { params });
    }

    updateCategory(categoryId: string, category: Category, familyId: string): Observable<Category> {
        const params = new HttpParams().set('familyId', familyId);
        return this.http.put<Category>(`${this.apiUrl}/${categoryId}`, category, { params });
    }

    deleteCategory(categoryId: string, familyId: string): Observable<any> {
        const params = new HttpParams().set('familyId', familyId);
        return this.http.delete(`${this.apiUrl}/${categoryId}`, { params });
    }

    filterForFamily(familyId: string, type?: CategoryType, period?: BudgetPeriod): Observable<Category[]> {
        let params = new HttpParams().set('familyId', familyId);
        if (type) {
            params = params.set('type', type);
        }
        if (period) {
            params = params.set('period', period);
        }
        return this.http.get<Category[]>(`${this.apiUrl}/filter`, { params });
    }
}
