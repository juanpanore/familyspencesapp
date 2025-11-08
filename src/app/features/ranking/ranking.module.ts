import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RankingRoutingModule } from './ranking-routing.module';
import { RankingDashboardComponent } from './pages/ranking-dashboard/ranking-dashboard.component';

// --- MÓDULOS QUE NECESITA ESTA FUNCIONALIDAD ---
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module'; // Importa el podio

@NgModule({
  declarations: [
    RankingDashboardComponent // Declara el componente de esta página
  ],
  imports: [
    CommonModule,
    RankingRoutingModule,
    ReactiveFormsModule, // <-- Necesario para el formulario de período
    SharedModule         // <-- Necesario para usar <app-ranking-podium>
  ]
})
export class RankingModule { }