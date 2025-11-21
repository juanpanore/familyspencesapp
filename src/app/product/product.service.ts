import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { AuthService } from '../services/auth.service';

export interface Product {
  producto: string;
  precio: number;
  negocio: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = `${environment.apiUrl}/product`;

  constructor(
    private http: HttpClient,
    private authService: AuthService   // <-- IMPORTANTE
  ) {}

  // Obtener productos filtrando por nombre
  getProducts(nombre?: string): Observable<Product[]> {
    const token = this.authService.getToken();  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = nombre?.trim()
      ? `${this.baseUrl}?nombre=${nombre}`
      : this.baseUrl;

    return this.http.get<Product[]>(url, { headers });
  }

  // Agregar un nuevo producto
  addProduct(producto: Product): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/product`, producto, { headers });
  }
}

