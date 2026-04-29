import { Component, OnInit } from '@angular/core';
import {
  AbstractControl, FormBuilder, FormGroup,
  ValidationErrors, ValidatorFn, Validators
} from '@angular/forms';
import { Category, CategorySummary, CategoryType, BudgetPeriod } from './category.model';
import { CategoryService } from './category.service';
import { AuthService } from '../services/auth.service';
import { GoalService } from '../service/goal/goal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  categories: Category[] = [];
  categoryList: CategorySummary[] = [];
  selectedFilterId: string = '';

  categoryForm: FormGroup;
  showModal = false;
  isEditing = false;
  isLoading = false;
  originalCategoryValues: any = null;

  familyId: string = '';
  userId: string = '';

  toastMessage: string = '';
  toastTitle: string = '';
  toastType: 'success' | 'error' = 'success';
  showToast: boolean = false;

  showDeleteDialog: boolean = false;
  categoryToDelete: Category | null = null;

  showDeleteBlockedDialog: boolean = false;
  blockedGoalNames: string[] = [];

  showNoChangesDialog: boolean = false;

  collapsedTypes: Set<string> = new Set();

  categoryTypes = Object.values(CategoryType);
  budgetPeriods = Object.values(BudgetPeriod);

  constructor(
    private categoryService: CategoryService,
    private goalService: GoalService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.categoryForm = this.fb.group({
      id: [null],
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZÀ-ÖØ-öø-ÿ0-9 ]+$/)
      ]],
      type: [CategoryType.OTROS, Validators.required],
      budgetLimit: [null, [Validators.required, Validators.min(0.01), Validators.max(100000000)]],
      budgetPeriod: [BudgetPeriod.MENSUAL, Validators.required],
      description: ['', Validators.maxLength(255)]
    });
  }

  ngOnInit(): void {
    this.familyId = this.authService.getFamilyId() || '';
    this.userId = this.authService.getUserId() || '';
    if (!this.familyId) console.error('No se pudo obtener el familyId');
    this.loadCategories();
    this.loadCategoryList();
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

  loadCategoryList(): void {
    this.categoryService.getCategoryList().subscribe({
      next: (data) => { this.categoryList = data; },
      error: (err: any) => console.error('Error loading category list', err)
    });
  }

  onFilterChange(event: Event): void {
    this.selectedFilterId = (event.target as HTMLSelectElement).value;
  }

  clearFilter(): void {
    this.selectedFilterId = '';
  }

  get filteredCategories(): Category[] {
    if (!this.selectedFilterId) return this.categories;
    return this.categories.filter(c => c.id === this.selectedFilterId);
  }


  get groupedCategories(): { type: string; categories: Category[] }[] {
    const map = new Map<string, Category[]>();
    for (const cat of this.filteredCategories) {
      const key = cat.categoryType as string;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(cat);
    }
    return Array.from(map.entries())
      .map(([type, categories]) => ({ type, categories }))
      .sort((a, b) => a.type.localeCompare(b.type));
  }

  toggleType(type: string): void {
    if (this.collapsedTypes.has(type)) {
      this.collapsedTypes.delete(type);
    } else {
      this.collapsedTypes.add(type);
    }
  }

  isTypeCollapsed(type: string): boolean {
    return this.collapsedTypes.has(type);
  }


  private buildUniqueNameValidator(excludeId?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const name = (control.value as string).trim().toLowerCase();
      const isDuplicate = this.categories.some(c =>
        c.name.toLowerCase() === name && (excludeId ? c.id !== excludeId : true)
      );
      return isDuplicate ? { duplicateName: true } : null;
    };
  }

  private setNameValidators(excludeId?: string): void {
    this.categoryForm.get('name')?.setValidators([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-ZÀ-ÖØ-öø-ÿ0-9 ]+$/),
      this.buildUniqueNameValidator(excludeId)
    ]);
    this.categoryForm.get('name')?.updateValueAndValidity();
  }

  getNameErrorMessage(): string {
    const ctrl = this.categoryForm.get('name');
    if (!ctrl?.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'El nombre es obligatorio';
    if (ctrl.hasError('minlength')) return 'El nombre debe tener al menos 3 caracteres';
    if (ctrl.hasError('maxlength')) return 'El nombre no puede superar los 50 caracteres';
    if (ctrl.hasError('pattern')) return 'El nombre solo puede contener letras, números y espacios';
    if (ctrl.hasError('duplicateName')) return 'Ya existe una categoría con ese nombre';
    return '';
  }

  getBudgetErrorMessage(): string {
    const ctrl = this.categoryForm.get('budgetLimit');
    if (!ctrl?.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'El presupuesto es obligatorio';
    if (ctrl.hasError('min')) return 'El presupuesto debe ser mayor que 0';
    if (ctrl.hasError('max')) return 'El presupuesto no puede exceder 100.000.000';
    return '';
  }

  openModal(): void {
    this.showModal = true;
    if (!this.isEditing) {
      this.setNameValidators();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.originalCategoryValues = null;
    this.categoryForm.reset({
      id: null,
      name: '',
      type: CategoryType.OTROS,
      budgetLimit: null,
      budgetPeriod: BudgetPeriod.MENSUAL,
      description: ''
    });
    this.categoryForm.get('name')?.setValidators([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-ZÀ-ÖØ-öø-ÿ0-9 ]+$/)
    ]);
    this.categoryForm.get('name')?.updateValueAndValidity();
  }

  selectCategory(category: Category): void {
    this.isEditing = true;
    this.originalCategoryValues = {
      name: category.name,
      type: category.categoryType,
      budgetLimit: category.allocatedBudget,
      budgetPeriod: category.budgetPeriod,
      description: category.description || ''
    };
    this.categoryForm.patchValue({
      id: category.id,
      name: category.name,
      type: category.categoryType,
      budgetLimit: category.allocatedBudget,
      budgetPeriod: category.budgetPeriod,
      description: category.description || ''
    });
    this.setNameValidators(category.id);
    this.openModal();
  }


  hasChanges(): boolean {
    if (!this.originalCategoryValues) return true;
    const f = this.categoryForm.value;
    const o = this.originalCategoryValues;
    return (
      (f.name || '').trim() !== (o.name || '').trim() ||
      f.type !== o.type ||
      parseFloat(f.budgetLimit) !== parseFloat(o.budgetLimit) ||
      f.budgetPeriod !== o.budgetPeriod ||
      (f.description || '').trim() !== (o.description || '').trim()
    );
  }


  saveCategory(): void {
    this.categoryForm.markAllAsTouched();

    if (this.categoryForm.invalid) return;

    if (this.isEditing && !this.hasChanges()) {
      this.showNoChangesDialog = true;
      return;
    }

    const formValue = this.categoryForm.value;
    const payload: any = {
      familyId: this.familyId,
      name: (formValue.name as string).trim(),
      categoryType: formValue.type,
      allocatedBudget: parseFloat(formValue.budgetLimit),
      budgetPeriod: formValue.budgetPeriod,
      description: formValue.description || ''
    };

    if (this.isEditing && formValue.id) payload.id = formValue.id;

    this.isLoading = true;

    if (this.isEditing && payload.id) {
      this.categoryService.updateCategory(payload.id, payload, this.familyId).subscribe({
        next: () => {
          this.isLoading = false;
          this.loadCategories();
          this.loadCategoryList();
          this.closeModal();
          this.showToastNotification('Éxito', 'Categoría editada', 'success');
        },
        error: (err: any) => {
          this.isLoading = false;
          const msg = err?.error?.mensaje || 'No se pudo actualizar la categoría';
          this.showToastNotification('Error', msg, 'error');
        }
      });
    } else {
      this.categoryService.createCategory(payload, this.familyId).subscribe({
        next: () => {
          this.isLoading = false;
          this.loadCategories();
          this.loadCategoryList();
          this.closeModal();
          this.showToastNotification('Éxito', 'Categoría creada exitosamente', 'success');
        },
        error: (err: any) => {
          this.isLoading = false;
          const msg = err?.error?.mensaje || 'No se pudo crear la categoría';
          this.showToastNotification('Error', msg, 'error');
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
    if (!this.categoryToDelete?.id) return;
    const categoryId = this.categoryToDelete.id;
    const categoryName = this.categoryToDelete.name;

    this.categoryService.deleteCategory(categoryId, this.familyId).subscribe({
      next: () => {
        if (this.selectedFilterId === categoryId) this.selectedFilterId = '';
        this.loadCategories();
        this.loadCategoryList();
        this.closeDeleteDialog();
        this.showToastNotification('Eliminado', `"${categoryName}" eliminada exitosamente`, 'success');
      },
      error: (err: any) => {
        this.closeDeleteDialog();
        if (err.status === 400) {
          this.goalService.getGoalsByFamilyId(this.familyId).subscribe({
            next: (goals) => {
              const linked = goals.filter(g => g.categoryId === categoryId);
              this.blockedGoalNames = linked.length > 0
                ? linked.map(g => g.name)
                : ['(Objetivo desconocido)'];
              this.showDeleteBlockedDialog = true;
            },
            error: () => {
              this.blockedGoalNames = ['(No se pudo obtener la información)'];
              this.showDeleteBlockedDialog = true;
            }
          });
        } else {
          this.showToastNotification('Error', 'No se pudo eliminar la categoría', 'error');
        }
      }
    });
  }

  closeDeleteBlockedDialog(): void {
    this.showDeleteBlockedDialog = false;
    this.blockedGoalNames = [];
  }

  closeNoChangesDialog(): void {
    this.showNoChangesDialog = false;
  }

  showToastNotification(title: string, message: string, type: 'success' | 'error'): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3500);
  }
}