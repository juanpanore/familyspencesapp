import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category, CategoryType, BudgetPeriod } from './category.model';
import { CategoryService } from './category.service';
import { AuthService } from '../services/auth.service';

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
        private fb: FormBuilder
    ) {
        this.categoryForm = this.fb.group({
            id: [''],
            name: ['', Validators.required],
            type: [CategoryType.OTROS, Validators.required],
            budgetLimit: [0, [Validators.required, Validators.min(0)]],
            budgetPeriod: [BudgetPeriod.MENSUAL, Validators.required],
            icon: [''],
            color: ['#000000']
        });
    }

    ngOnInit(): void {
        this.familyId = this.authService.getFamilyId() || '';
        this.userId = this.authService.getUserId() || '';

        if (!this.familyId || !this.userId) {
            console.error('No se pudo obtener la información de autenticación (familyId o userId)');
        }

        this.loadCategories();
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
            name: '',
            type: CategoryType.OTROS,
            budgetLimit: 0,
            budgetPeriod: BudgetPeriod.MENSUAL,
            icon: '',
            color: '#000000'
        });
    }

    selectCategory(category: Category): void {
        this.isEditing = true;
        this.categoryForm.patchValue({
            id: category.id,
            name: category.name,
            type: category.type,
            budgetLimit: category.budgetLimit,
            budgetPeriod: category.budgetPeriod,
            icon: category.icon,
            color: category.color
        });
        this.openModal();
    }

    saveCategory(): void {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        const formValue = this.categoryForm.value;
        const categoryData: Category = {
            ...formValue,
        };

        this.isLoading = true;

        if (this.isEditing && categoryData.id) {
            this.categoryService.updateCategory(categoryData.id, categoryData, this.familyId)
                .subscribe({
                    next: () => {
                        this.loadCategories();
                        this.closeModal();
                        this.showToastNotification('Categoría actualizada', `"${categoryData.name}" ha sido actualizada`, 'success');
                    },
                    error: (err: any) => {
                        console.error('Error updating category', err);
                        this.isLoading = false;
                        this.showToastNotification('Error', 'No se pudo actualizar la categoría', 'error');
                    }
                });
        } else {
            delete categoryData.id;

            this.categoryService.createCategory(categoryData, this.familyId)
                .subscribe({
                    next: () => {
                        this.loadCategories();
                        this.closeModal();
                        this.showToastNotification('Categoría creada', `"${categoryData.name}" ha sido creada`, 'success');
                    },
                    error: (err: any) => {
                        console.error('Error creating category', err);
                        this.isLoading = false;
                        this.showToastNotification('Error', 'No se pudo crear la categoría', 'error');
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
                this.showToastNotification('Categoría eliminada', `"${categoryName}" ha sido eliminada`, 'success');
            },
            error: (err: any) => {
                console.error('Error deleting category', err);
                this.closeDeleteDialog();
                this.showToastNotification('Error', 'No se pudo eliminar la categoría', 'error');
            }
        });
    }

    showToastNotification(title: string, message: string, type: 'success' | 'error'): void {
        this.toastTitle = title;
        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;

        setTimeout(() => {
            this.showToast = false;
        }, 3000);
    }
}
