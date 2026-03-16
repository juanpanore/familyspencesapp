import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from './product.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  products: Product[] = [];
  searchTerm = '';
  searchSubject = new Subject<string>();

  // Campos para el nuevo producto
  newProduct: Product = {
    producto: '',
    precio: 0,
    negocio: ''
  };

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Búsqueda reactiva
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.loadProductos(term);
    });

    this.loadProductos();
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  loadProductos(nombre?: string): void {
    this.productService.getProducts(nombre).subscribe({
      next: data => this.products = data,
      error: err => console.error('Error al cargar productos', err)
    });
  }

  agregarProducto(): void {
    if (!this.newProduct.producto || !this.newProduct.negocio || this.newProduct.precio === null || this.newProduct.precio === undefined) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (isNaN(Number(this.newProduct.precio))) {
      alert('El precio debe ser un número válido');
      return;
    }

    if (Number(this.newProduct.precio) <= 0) {
      alert('El precio debe ser mayor que 0');
      return;
    }
    this.productService.addProduct(this.newProduct).subscribe({
      next: () => {
        this.loadProductos();
        alert('Producto agregado correctamente');

        this.newProduct = { producto: '', precio: 0, negocio: '' };
      },
      error: err => {
        console.error('Error al agregar producto', err);
        alert('No se pudo agregar el producto');
      }
    });
  }

}
