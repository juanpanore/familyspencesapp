// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseComponent } from './component/expense/expense.component';
import { RankingComponent } from './component/ranking/ranking.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { TaskComponent } from './task/task.component';
import { ProductComponent } from './product/product.component';
import { GoalsComponent } from './goals/goals.component';
import { RegisterUserComponent } from './register-user/register-user.component';

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
    path: '**',
    redirectTo: '/login'
  },
  {
    path: 'register-user',
    component: RegisterUserComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
