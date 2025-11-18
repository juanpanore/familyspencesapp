import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface Product {
  producto: string;
  precio: number;
  negocio: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) {}

  private baseUrl = `${environment.apiUrl}/product`;

  // Obtener productos filtrando por nombre
  getProducts(nombre?: string): Observable<Product[]> {
    const url = nombre && nombre.trim() !== ''
      ? `${this.baseUrl}?nombre=${nombre}`
      : this.baseUrl;
    return this.http.get<Product[]>(url);
  }

  // Agregar un nuevo producto
  addProduct(producto: Product): Observable<any> {
    return this.http.post(`${this.baseUrl}/product`, producto);
  }
}
