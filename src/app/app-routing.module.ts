// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseComponent } from './component/expense/expense.component';
import { RankingComponent } from './component/ranking/ranking.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { TaskComponent } from './task/task.component';
import { ProductComponent } from './product/product.component';
import { FamilymemberComponent } from './familymember/familymember';
import { GoalsComponent } from './goals/goals.component';
import { PetComponent } from './pet/pet.component';
import { VacationComponent } from './vacation/vacation.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { IncomeComponent } from './income/income.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: LoginComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'tasks',
    component: TaskComponent
  },
  {
    path: 'products',
    component: ProductComponent
  },
  {
    path: 'family-members',
    component: FamilymemberComponent
  },
  {
    path: 'goals',
    component: GoalsComponent
  },
  {
    path: 'expense',
    component: ExpenseComponent
  },
  {
    path: 'ranking',
    component: RankingComponent
  },
  {
    path: 'pet',
    component: PetComponent
  },
  {
    path: 'vacation',
    component: VacationComponent
  },
  {
    path: 'notifications',
    component: NotificationsComponent
  },
  {
    path: 'income',
    component: IncomeComponent
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
