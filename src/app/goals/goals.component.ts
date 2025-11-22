import { Component, OnInit } from '@angular/core';
import { GoalService } from '../service/goal/goal.service';
import { AuthService } from '../services/auth.service';
import { CategoryService } from '../category/category.service';
import { Goal } from '../models/goal.model';
import { Category } from '../category/category.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];
  filteredGoals: Goal[] = [];
  familyId: string | null = null;
  selectedGoal: Goal | null = null;

  showFormModal: boolean = false;

  showNotification: boolean = false;
  notificationTitle: string = '';
  notificationMessage: string = '';
  notificationType: string = 'success';

  showConfirmation: boolean = false;
  confirmationTitle: string = '';
  confirmationMessage: string = '';
  confirmCallback: (() => void) | null = null;

  categories: Category[] = [];
  selectedCategoryFilter: string = '';
  uuidSearch: string = '';

  originalGoal: Goal | null = null;

  newGoal: Goal = {
    id: '',
    familyId: '',
    name: '',
    description: '',
    categoryId: '',
    savingsCap: 0,
    deadline: '',
    dailyGoal: 0
  };

  constructor(
    private goalService: GoalService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router
  ) { }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    console.log('🔍 GoalsComponent: Inicializando...');

    const token = this.authService.getToken();
    console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');

    if (!token) {
      console.error('❌ No hay token. Redirigiendo al login...');
      alert('Debes iniciar sesión primero');
      this.router.navigate(['/login']);
      return;
    }

    this.familyId = this.authService.getFamilyId();
    console.log('👨‍👩‍👧‍👦 Family ID:', this.familyId);

    if (this.familyId) {
      this.loadGoals(this.familyId);
      this.loadCategories(this.familyId);
    } else {
      console.error('❌ No se pudo obtener el familyId del token');
      alert('No se pudo obtener la información de tu familia. Por favor, inicia sesión nuevamente.');
    }
  }

  loadGoals(familyId: string): void {
    console.log('📥 Cargando goals para familia:', familyId);
    this.goalService.getGoalsByFamilyId(familyId).subscribe(
      (goals) => {
        console.log('✅ Goals cargados exitosamente:', goals);
        console.log('📊 Cantidad de goals:', goals.length);
        this.goals = goals;
        this.filteredGoals = goals;
      },
      (error) => {
        console.error('❌ Error al cargar las metas:', error);
        console.error('Estado:', error.status);
        console.error('Mensaje:', error.message);
        console.error('Detalles:', error.error);

        if (error.status === 401) {
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          this.router.navigate(['/login']);
        } else if (error.status === 0) {
          alert('No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8080');
        } else {
          alert(`Error al cargar metas: ${error.message}`);
        }
      }
    );
  }

  loadCategories(familyId: string): void {
    console.log('📥 Cargando categorías para familia:', familyId);
    this.categoryService.getAllCategories(familyId).subscribe(
      (categories) => {
        console.log('✅ Categorías cargadas:', categories);
        this.categories = categories;
      },
      (error) => {
        console.error('❌ Error al cargar categorías:', error);
      }
    );
  }

  applyFilters(): void {
    this.filteredGoals = this.goals.filter(goal => {
      const matchesCategory = !this.selectedCategoryFilter || goal.categoryId === this.selectedCategoryFilter;
      return matchesCategory;
    });
  }

  searchByUuid(): void {
    if (this.uuidSearch && this.familyId) {
      console.log('🔍 Buscando meta por UUID:', this.uuidSearch);
      this.goalService.getGoal(this.familyId, this.uuidSearch).subscribe(
        (goal) => {
          console.log('✅ Meta encontrada:', goal);
          this.showEditGoalForm(goal);
        },
        (error) => {
          console.error('❌ Error al buscar la meta por UUID:', error);
          this.showNotificationModal('Error', 'No se encontró ninguna meta con ese UUID', 'error');
        }
      );
    }
  }

  showCreateGoalForm(): void {
    console.log('📝 Abriendo formulario para crear meta');
    this.selectedGoal = null;
    this.showFormModal = true;
    this.newGoal = {
      id: '',
      familyId: this.familyId!,
      name: '',
      description: '',
      categoryId: '',
      savingsCap: 0,
      deadline: '',
      dailyGoal: 0
    };
  }

  createGoal(): void {
    if (this.newGoal.name && this.newGoal.description) {
      console.log('➕ Creando nueva meta:', this.newGoal);
      this.goalService.createGoal(this.familyId!, this.newGoal.categoryId, this.newGoal).subscribe(
        (goal) => {
          console.log('✅ Meta creada exitosamente:', goal);
          this.goals.push(goal);
          this.applyFilters();
          this.cancelForm();
          this.showNotificationModal('Éxito', 'Meta creada exitosamente', 'success');
        },
        (error) => {
          console.error('❌ Error al crear la meta:', error);
          this.showNotificationModal('Error', `Error al crear la meta: ${error.error?.error || error.message}`, 'error');
        }
      );
    }
  }

  showEditGoalForm(goal: Goal): void {
    console.log('✏️ Abriendo formulario para editar meta:', goal);
    this.selectedGoal = { ...goal };
    this.originalGoal = { ...goal };
    this.showFormModal = true;
  }

  updateGoal(): void {
    if (this.selectedGoal) {
      if (this.originalGoal && this.hasNoChanges(this.selectedGoal, this.originalGoal)) {
        this.showNotificationModal('Información', 'No se ha realizado ningún cambio en la meta', 'warning');
        return;
      }

      console.log('✏️ Actualizando meta:', this.selectedGoal);
      this.goalService.updateGoal(
        this.familyId!,
        this.selectedGoal.id,
        this.selectedGoal.categoryId,
        this.selectedGoal
      ).subscribe(
        (goal) => {
          console.log('✅ Meta actualizada exitosamente:', goal);
          const index = this.goals.findIndex(g => g.id === goal.id);
          if (index !== -1) {
            this.goals[index] = goal;
          }
          this.applyFilters();
          this.cancelForm();
          this.showNotificationModal('Éxito', 'Meta actualizada exitosamente', 'success');
        },
        (error) => {
          console.error('❌ Error al actualizar la meta:', error);
          this.showNotificationModal('Error', `Error al actualizar la meta: ${error.error?.error || error.message}`, 'error');
        }
      );
    }
  }

  confirmDelete(goalId: string): void {
    this.showConfirmationModal(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta meta?',
      () => this.deleteGoal(goalId)
    );
  }

  deleteGoal(goalId: string): void {
    if (this.familyId) {
      console.log('🗑️ Eliminando meta:', goalId);
      this.goalService.deleteGoal(this.familyId, goalId).subscribe(
        () => {
          console.log('✅ Meta eliminada exitosamente');
          this.goals = this.goals.filter(goal => goal.id !== goalId);
          this.applyFilters();
          this.showNotificationModal('Éxito', 'Meta eliminada exitosamente', 'success');
        },
        (error) => {
          console.error('❌ Error al eliminar la meta:', error);
          this.showNotificationModal('Error', `Error al eliminar la meta: ${error.error?.error || error.message}`, 'error');
        }
      );
    }
  }

  cancelForm(): void {
    this.selectedGoal = null;
    this.originalGoal = null;
    this.showFormModal = false;
    this.newGoal = {
      id: '',
      familyId: this.familyId!,
      name: '',
      description: '',
      categoryId: '',
      savingsCap: 0,
      deadline: '',
      dailyGoal: 0
    };
  }

  showNotificationModal(title: string, message: string, type: string = 'success'): void {
    this.notificationTitle = title;
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
  }

  closeNotification(): void {
    this.showNotification = false;
  }

  showConfirmationModal(title: string, message: string, callback: () => void): void {
    this.confirmationTitle = title;
    this.confirmationMessage = message;
    this.confirmCallback = callback;
    this.showConfirmation = true;
  }

  onConfirm(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.showConfirmation = false;
    this.confirmCallback = null;
  }

  onCancelConfirm(): void {
    this.showConfirmation = false;
    this.confirmCallback = null;
  }

  hasNoChanges(current: Goal, original: Goal): boolean {
    return (
      current.name === original.name &&
      current.description === original.description &&
      current.categoryId === original.categoryId &&
      current.savingsCap === original.savingsCap &&
      current.dailyGoal === original.dailyGoal &&
      current.deadline === original.deadline
    );
  }
}
