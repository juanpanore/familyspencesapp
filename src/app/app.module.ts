import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';  
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ExpenseComponent } from './component/expense/expense.component';
import { HttpClientModule } from '@angular/common/http';
import { ProductComponent } from './product/product.component';
import {GoalsComponent} from "./goals/goals.component";
import { RankingComponent } from './component/ranking/ranking.component';

@NgModule({
  declarations: [
    AppComponent,
    ExpenseComponent,
    ProductComponent,
    GoalsComponent,
    RankingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
