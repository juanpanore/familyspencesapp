import { Component, OnInit } from '@angular/core';
import { GoalService } from '../service/goal/goal.service';
import { AuthService } from '../services/auth.service';
import { Goal } from '../models/goal.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];
  familyId: string | null = null;
  selectedGoal: Goal | null = null;
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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.familyId = this.authService.getFamilyId();
    if (this.familyId) {
      this.loadGoals(this.familyId);
    }
  }

  loadGoals(familyId: string): void {
    this.goalService.getGoalsByFamilyId(familyId).subscribe(
      (goals) => {
        this.goals = goals;
      },
      (error) => {
        console.error('Error al cargar las metas:', error);
      }
    );
  }

  showCreateGoalForm(): void {
    this.selectedGoal = null;
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
      this.goalService.createGoal(this.familyId!, this.newGoal.categoryId, this.newGoal).subscribe(
        (goal) => {
          this.goals.push(goal);
          this.newGoal = { id: '', familyId: this.familyId!, name: '', description: '', categoryId: '', savingsCap: 0, deadline: '', dailyGoal: 0 };
          console.log('Meta creada exitosamente');
        },
        (error) => {
          console.error('Error al crear la meta:', error);
        }
      );
    }
  }

  showEditGoalForm(goal: Goal): void {
    this.selectedGoal = { ...goal };
  }

  updateGoal(): void {
    if (this.selectedGoal) {
      this.goalService.updateGoal(
        this.familyId!,
        this.selectedGoal.id,
        this.selectedGoal.categoryId,
        this.selectedGoal
      ).subscribe(
        (goal) => {
          const index = this.goals.findIndex(g => g.id === goal.id);
          if (index !== -1) {
            this.goals[index] = goal;
          }
          this.selectedGoal = null;
          console.log('Meta actualizada exitosamente');
        },
        (error) => {
          console.error('Error al actualizar la meta:', error);
        }
      );
    }
  }

  deleteGoal(goalId: string): void {
    if (this.familyId) {
      this.goalService.deleteGoal(this.familyId, goalId).subscribe(
        () => {
          this.goals = this.goals.filter(goal => goal.id !== goalId);
          console.log('Meta eliminada exitosamente');
        },
        (error) => {
          console.error('Error al eliminar la meta:', error);
        }
      );
    }
  }
}
