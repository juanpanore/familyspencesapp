import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  producto: string;
  precio: number;
  negocio: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8080/api/product';

  private token = 'eyJhbGciOiJIUzI1NiJ9.eyJpZFVzZXIiOiJjZGM1NWE1Mi1jMGRkLTRlNzctOWQyNi05Nzg0Yjk3Mzg4MDEiLCJpZEZhbWlseSI6IjQ3ZTJhMTAzLTljNGYtNGNiNi1iOTZiLWI3MTAwOWMyYWQ1MyIsImlhdCI6MTc2MzQzNDk2OSwiZXhwIjoxNzYzNTIxMzY5fQ.nBF4s_94Y_Ww849sSbmIQVfIlXbRDkKEqL3g5ImLeT8';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  private baseUrl = 'http://localhost:8080/api/product';

  // Obtener productos filtrando por nombre
  getProducts(nombre?: string): Observable<Product[]> {
    const url = nombre && nombre.trim() !== ''
      ? `${this.baseUrl}?nombre=${nombre}`
      : this.baseUrl;
    return this.http.get<Product[]>(url, this.getHeaders());
  }

  // Agregar un nuevo producto
  addProduct(producto: Product): Observable<any> {
    return this.http.post(`${this.baseUrl}/product`, producto, this.getHeaders());
  }
}
