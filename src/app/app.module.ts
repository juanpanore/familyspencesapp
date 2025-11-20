import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

<<<<<<< HEAD
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductComponent } from './product/product.component';
import {GoalsComponent} from "./goals/goals.component";
import { IncomeComponent } from './income/income.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
=======
// Módulos necesarios para la funcionalidad
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { IncomeComponent } from './income/income.component';

// Módulos de la aplicación
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Importación del LoginComponent
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';

>>>>>>> 4f457781361994bd3db14ad97a717c4b6f84e99e

@NgModule({
  declarations: [
    AppComponent,
<<<<<<< HEAD
    ProductComponent,
    GoalsComponent,
=======
    LoginComponent,
    HomeComponent,
>>>>>>> 4f457781361994bd3db14ad97a717c4b6f84e99e
    IncomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
<<<<<<< HEAD
    HttpClientModule
=======

    // ⬅️ Módulos que resuelven todos los errores de "not a known element"
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
>>>>>>> 4f457781361994bd3db14ad97a717c4b6f84e99e
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
