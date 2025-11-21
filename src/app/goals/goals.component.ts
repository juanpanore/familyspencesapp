import { Component, OnInit } from '@angular/core';
import { GoalService } from '../service/goal/goal.service';
import { AuthService } from '../services/auth.service';
import { CategoryService } from '../service/category/category.service';
import { Goal } from '../models/goal.model';
import { Category } from '../models/category.model';
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


  categories: Category[] = [];


  selectedFamilyFilter: string = '';
  selectedCategoryFilter: string = '';
  uuidSearch: string = '';

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
    this.categoryService.getCategoriesForFamily(familyId).subscribe(
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
      const matchesFamily = !this.selectedFamilyFilter || goal.familyId === this.selectedFamilyFilter;
      const matchesCategory = !this.selectedCategoryFilter || goal.categoryId === this.selectedCategoryFilter;
      return matchesFamily && matchesCategory;
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
          alert('No se encontró ninguna meta con ese UUID');
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
          alert('Meta creada exitosamente');
        },
        (error) => {
          console.error('❌ Error al crear la meta:', error);
          alert(`Error al crear la meta: ${error.error?.error || error.message}`);
        }
      );
    }
  }

  showEditGoalForm(goal: Goal): void {
    console.log('✏️ Abriendo formulario para editar meta:', goal);
    this.selectedGoal = { ...goal };
    this.showFormModal = true;
  }

  updateGoal(): void {
    if (this.selectedGoal) {
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
          alert('Meta actualizada exitosamente');
        },
        (error) => {
          console.error('❌ Error al actualizar la meta:', error);
          alert(`Error al actualizar la meta: ${error.error?.error || error.message}`);
        }
      );
    }
  }

  deleteGoal(goalId: string): void {
    if (this.familyId && confirm('¿Estás seguro de que deseas eliminar esta meta?')) {
      console.log('🗑️ Eliminando meta:', goalId);
      this.goalService.deleteGoal(this.familyId, goalId).subscribe(
        () => {
          console.log('✅ Meta eliminada exitosamente');
          this.goals = this.goals.filter(goal => goal.id !== goalId);
          this.applyFilters();
          alert('Meta eliminada exitosamente');
        },
        (error) => {
          console.error('❌ Error al eliminar la meta:', error);
          alert(`Error al eliminar la meta: ${error.error?.error || error.message}`);
        }
      );
    }
  }

  cancelForm(): void {
    this.selectedGoal = null;
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
}
