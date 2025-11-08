import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// --- MÓDULOS NECESARIOS ---
import { HttpClientModule } from '@angular/common/http'; 
import { ReactiveFormsModule } from '@angular/forms'; 

@NgModule({
  declarations: [
    AppComponent
    // NO se declaran componentes de Ranking aquí
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    // --- AÑADE ESTOS DOS MÓDULOS ---
    HttpClientModule,     // Para que tu RankingService pueda llamar a la API
    ReactiveFormsModule   // Para que tu formulario de período funcione
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }