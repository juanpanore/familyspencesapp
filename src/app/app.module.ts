import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ExpenseComponent } from './component/expense/expense.component';
import { HttpClientModule } from '@angular/common/http';
import { ProductComponent } from './product/product.component';
import {GoalsComponent} from "./goals/goals.component";
import { BudgetComponent } from './budget/budget';
import { BudgetListComponent } from './components/budget/budget-list/budget-list.component';
import { BudgetCreateComponent } from './components/budget/budget-create/budget-create.component';
import { BudgetDetailsComponent } from './components/budget/budget-details/budget-details.component';



@NgModule({
  declarations: [
    AppComponent,
    ExpenseComponent,
    ProductComponent,
    GoalsComponent,
    BudgetComponent,
    BudgetListComponent,
    BudgetCreateComponent,
    BudgetDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
