// Archivo NUEVO: src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // <-- Necesario para llamar a tu API
import { ReactiveFormsModule } from '@angular/forms'; // <-- Necesario para el formulario de Ranking

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
    // Aquí NO declaramos los componentes de Ranking,
    // porque se cargarán perezosamente (Lazy Loading).
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,      // <-- Importamos el módulo HTTP
    ReactiveFormsModule    // <-- Importamos el módulo de Formularios
  ],
  providers: [],
  bootstrap: [AppComponent] // Le dice a Angular con qué componente empezar
})
export class AppModule { }