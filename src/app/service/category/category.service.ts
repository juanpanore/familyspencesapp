import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/category.model';

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

    // Obtener todas las categorías
    getAllCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.apiUrl, { headers: this.getHeaders() });
    }

    // Obtener categorías globales
    getGlobalCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}/global`, { headers: this.getHeaders() });
    }

    // Obtener categorías de una familia
    getFamilyCategories(familyId: string): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}/family/${familyId}`, { headers: this.getHeaders() });
    }

    // Obtener categorías disponibles para una familia (globales + propias)
    getCategoriesForFamily(familyId: string): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}/for-family/${familyId}`, { headers: this.getHeaders() });
    }

    // Obtener categoría por ID
    getCategoryById(id: string): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
}
