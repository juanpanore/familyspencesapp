import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { Balance } from './balance/balance';
import { TaskComponent } from './task/task.component';
import { ProductComponent } from './product/product.component';
import { GoalsComponent } from './goals/goals.component';
import { RankingComponent } from './component/ranking/ranking.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { RegisterUserComponent } from './register-user/register-user.component';
import { FamilymemberComponent } from './familymember/familymember';
import { ExpenseComponent } from './component/expense/expense.component';
import { VacationComponent } from './vacation/vacation.component';
import { PetComponent } from './pet/pet.component';
import { IncomeComponent } from './income/income.component';
import { CategoryComponent } from './category/category.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BudgetListComponent } from './components/budget/budget-list/budget-list.component';
import { BudgetCreateComponent } from './components/budget/budget-create/budget-create.component';
import { BudgetDetailsComponent } from './components/budget/budget-details/budget-details.component';
import { MonthlyClosingComponent } from './monthlyclosing/monthlyclosing';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    Balance,
    TaskComponent,
    ProductComponent,
    GoalsComponent,
    RankingComponent,
    NotificationsComponent,
    RegisterUserComponent,
    ExpenseComponent,
    VacationComponent,
    PetComponent,
    FamilymemberComponent,
    IncomeComponent,
    CategoryComponent,
    BudgetListComponent,
    BudgetCreateComponent,
    BudgetDetailsComponent,
    MonthlyClosingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
