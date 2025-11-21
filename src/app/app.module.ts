import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
=======
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
>>>>>>> e6187a1f24746dd4ad318ecbeaca0175a71c4832

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { Balance } from './balance/balance';
import { TaskComponent } from './task/task.component';
import { ProductComponent } from './product/product.component';
import { GoalsComponent } from './goals/goals.component';

import { PetComponent } from './pet/pet.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    Balance,
    TaskComponent,
    ProductComponent,
    GoalsComponent,
<<<<<<< HEAD
    PetComponent
=======
    TaskComponent
>>>>>>> e6187a1f24746dd4ad318ecbeaca0175a71c4832
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
<<<<<<< HEAD
    FormsModule,
    CommonModule,  
    RouterModule,
    HttpClientModule
=======
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule
>>>>>>> e6187a1f24746dd4ad318ecbeaca0175a71c4832
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
