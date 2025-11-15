// src/app/app.module.ts (Copia y pega este código COMPLETO)

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Módulos necesarios para la funcionalidad
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Módulos de la aplicación
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Importación del LoginComponent
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent, // ⬅️ Ahora declarado y sin errores
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    // ⬅️ Módulos que resuelven todos los errores de "not a known element"
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
