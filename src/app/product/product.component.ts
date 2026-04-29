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

  // Para edición
  editingProduct: Product | null = null;

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

  scrollToAddProduct(): void {
    const element = document.getElementById('add-product-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  loadProductos(nombre?: string): void {
    const filter = nombre !== undefined ? nombre : this.searchTerm;
    this.productService.getProducts(filter).subscribe({
      next: data => this.products = data,
      error: err => console.error('Error al cargar productos', err)
    });
  }

  trackByProduct(index: number, product: Product): string | number {
    return product.id ?? index;
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

    const newProductPayload: Product = {
      producto: this.newProduct.producto.trim(),
      precio: Number(this.newProduct.precio),
      negocio: this.newProduct.negocio.trim()
    };

    this.productService.addProduct(newProductPayload).subscribe({
      next: response => {
        const addedProduct = response as Product;

        if (addedProduct?.id) {
          this.products = [...this.products, addedProduct];
        } else {
          this.loadProductos();
        }

        alert('Producto agregado correctamente');
        this.newProduct = { producto: '', precio: 0, negocio: '' };
      },
      error: err => {
        console.error('Error al agregar producto', err);
        alert('No se pudo agregar el producto');
      }
    });
  }

  // Iniciar edición de un producto
  editProduct(product: Product): void {
    this.editingProduct = { ...product }; // Copia para no modificar el original directamente
  }

  // Cancelar edición
  cancelEdit(): void {
    this.editingProduct = null;
  }

  // Actualizar producto
  updateProduct(): void {
    if (!this.editingProduct || this.editingProduct.id == null) return;

    if (!this.editingProduct.producto || !this.editingProduct.negocio || this.editingProduct.precio === null || this.editingProduct.precio === undefined) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (isNaN(Number(this.editingProduct.precio))) {
      alert('El precio debe ser un número válido');
      return;
    }

    if (Number(this.editingProduct.precio) <= 0) {
      alert('El precio debe ser mayor que 0');
      return;
    }

    const productToUpdate = {
      producto: this.editingProduct.producto,
      precio: this.editingProduct.precio,
      negocio: this.editingProduct.negocio
    };

    this.productService.updateProduct(this.editingProduct.id, productToUpdate as Product).subscribe({
      next: () => {
        const updatedProduct: Product = {
          ...this.editingProduct,
          producto: productToUpdate.producto,
          precio: productToUpdate.precio,
          negocio: productToUpdate.negocio
        };

        this.products = this.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        alert('Producto actualizado correctamente');
        this.editingProduct = null;
      },
      error: err => {
        console.error('Error al actualizar producto', err);
        alert('No se pudo actualizar el producto');
      }
    });
  }

  // Eliminar producto
  deleteProduct(product: Product): void {
    if (!product.id) return;

    if (confirm(`¿Estás seguro de que quieres eliminar el producto "${product.producto}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
          alert('Producto eliminado correctamente');
        },
        error: err => {
          console.error('Error al eliminar producto', err);
          alert('No se pudo eliminar el producto');
        }
      });
    }
  }
}
