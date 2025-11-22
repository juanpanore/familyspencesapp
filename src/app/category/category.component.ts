import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category, CategoryType, BudgetPeriod } from './category.model';
import { CategoryService } from './category.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router'; // <--- 1. IMPORTAR ROUTER

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
    categories: Category[] = [];
    categoryForm: FormGroup;

    showModal = false;
    isEditing = false;
    isLoading = false;

    familyId: string = '';
    userId: string = '';

    toastMessage: string = '';
    toastTitle: string = '';
    toastType: 'success' | 'error' = 'success';
    showToast: boolean = false;

    showDeleteDialog: boolean = false;
    categoryToDelete: Category | null = null;

    categoryTypes = Object.values(CategoryType);
    budgetPeriods = Object.values(BudgetPeriod);

    constructor(
        private categoryService: CategoryService,
        private authService: AuthService,
        private fb: FormBuilder,
        private router: Router // <--- 2. INYECTAR ROUTER AQUÍ
    ) {
        this.categoryForm = this.fb.group({
            id: [null],
            name: ['', Validators.required],
            type: [CategoryType.OTROS, Validators.required],
            budgetLimit: [0, [Validators.required, Validators.min(0)]],
            budgetPeriod: [BudgetPeriod.MENSUAL, Validators.required],
            description: ['', Validators.maxLength(255)]
        });
    }

    ngOnInit(): void {
        this.familyId = this.authService.getFamilyId() || '';
        this.userId = this.authService.getUserId() || '';

        if (!this.familyId) {
            console.error('No se pudo obtener el familyId');
        }

        this.loadCategories();
    }

    goHome(): void {
        this.router.navigate(['/home']);
    }

    loadCategories(): void {
        this.isLoading = true;
        this.categoryService.getAllCategories(this.familyId).subscribe({
            next: (data) => {
                this.categories = data;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error fetching categories', err);
                this.isLoading = false;
                this.showToastNotification('Error', 'No se pudieron cargar las categorías', 'error');
            }
        });
    }

    openModal(): void {
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.isEditing = false;
        this.categoryForm.reset({
            id: null,
            name: '',
            type: CategoryType.OTROS,
            budgetLimit: 0,
            budgetPeriod: BudgetPeriod.MENSUAL,
            description: ''
        });
    }

    selectCategory(category: any): void {
        this.isEditing = true;
        this.categoryForm.patchValue({
            id: category.id,
            name: category.name,
            type: category.categoryType,
            budgetLimit: category.allocatedBudget,
            budgetPeriod: category.budgetPeriod,
            description: category.description
        });
        this.openModal();
    }

    saveCategory(): void {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        const formValue = this.categoryForm.value;

        const payload: any = {
            familyId: this.familyId,
            name: formValue.name,
            categoryType: formValue.type,
            allocatedBudget: parseFloat(formValue.budgetLimit),
            budgetPeriod: formValue.budgetPeriod,
            description: formValue.description || ''
        };

        if (this.isEditing && formValue.id) {
            payload.id = formValue.id;
        }

        console.log('Enviando payload correcto:', payload);

        this.isLoading = true;

        if (this.isEditing && payload.id) {
            this.categoryService.updateCategory(payload.id, payload, this.familyId)
                .subscribe({
                    next: () => {
                        this.loadCategories();
                        this.closeModal();
                        this.showToastNotification('Éxito', 'Categoría actualizada', 'success');
                    },
                    error: (err: any) => {
                        console.error(err);
                        this.isLoading = false;
                        this.showToastNotification('Error', 'No se pudo actualizar', 'error');
                    }
                });
        } else {
            this.categoryService.createCategory(payload, this.familyId)
                .subscribe({
                    next: () => {
                        this.loadCategories();
                        this.closeModal();
                        this.showToastNotification('Éxito', 'Categoría creada', 'success');
                    },
                    error: (err: any) => {
                        console.error(err);
                        this.isLoading = false;
                        this.showToastNotification('Error', 'No se pudo crear', 'error');
                    }
                });
        }
    }

    openDeleteDialog(category: Category): void {
        this.categoryToDelete = category;
        this.showDeleteDialog = true;
    }

    closeDeleteDialog(): void {
        this.showDeleteDialog = false;
        this.categoryToDelete = null;
    }

    confirmDelete(): void {
        if (!this.categoryToDelete || !this.categoryToDelete.id) return;

        const categoryName = this.categoryToDelete.name;
        const categoryId = this.categoryToDelete.id;

        this.categoryService.deleteCategory(categoryId, this.familyId).subscribe({
            next: () => {
                this.loadCategories();
                this.closeDeleteDialog();
                this.showToastNotification('Eliminado', `${categoryName} eliminado`, 'success');
            },
            error: (err: any) => {
                console.error(err);
                this.closeDeleteDialog();
                this.showToastNotification('Error', 'No se pudo eliminar', 'error');
            }
        });
    }

    showToastNotification(title: string, message: string, type: 'success' | 'error'): void {
        this.toastTitle = title;
        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;
        setTimeout(() => this.showToast = false, 3000);
    }
}