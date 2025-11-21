import { Component, OnInit } from '@angular/core';
import { Category, CategoryType, BudgetPeriod } from './category.model';
import { CategoryService } from './category.service';

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
    categories: Category[] = [];
    selectedCategory: Category = this.getEmptyCategory();
    isEditing = false;

    // TODO: Replace with actual family ID from auth/context
    familyId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    categoryTypes = Object.values(CategoryType);
    budgetPeriods = Object.values(BudgetPeriod);

    constructor(private categoryService: CategoryService) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.categoryService.getAllCategories(this.familyId).subscribe({
            next: (data) => this.categories = data,
            error: (err: any) => console.error('Error fetching categories', err)
        });
    }

    selectCategory(category: Category): void {
        this.selectedCategory = { ...category };
        this.isEditing = true;
    }

    cancelEdit(): void {
        this.selectedCategory = this.getEmptyCategory();
        this.isEditing = false;
    }

    saveCategory(): void {
        if (this.isEditing && this.selectedCategory.id) {
            this.categoryService.updateCategory(this.selectedCategory.id, this.selectedCategory, this.familyId)
                .subscribe({
                    next: () => {
                        this.loadCategories();
                        this.cancelEdit();
                    },
                    error: (err: any) => console.error('Error updating category', err)
                });
        } else {
            this.categoryService.createCategory(this.selectedCategory, this.familyId)
                .subscribe({
                    next: () => {
                        this.loadCategories();
                        this.cancelEdit();
                    },
                    error: (err: any) => console.error('Error creating category', err)
                });
        }
    }

    deleteCategory(id: string): void {
        if (confirm('Are you sure you want to delete this category?')) {
            this.categoryService.deleteCategory(id, this.familyId).subscribe({
                next: () => this.loadCategories(),
                error: (err: any) => console.error('Error deleting category', err)
            });
        }
    }

    getEmptyCategory(): Category {
        return {
            name: '',
            type: CategoryType.OTROS,
            budgetLimit: 0,
            budgetPeriod: BudgetPeriod.MENSUAL,
            icon: '',
            color: '#000000'
        };
    }
}
