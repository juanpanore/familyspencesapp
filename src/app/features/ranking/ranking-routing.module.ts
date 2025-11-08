
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RankingDashboardComponent } from './pages/ranking-dashboard/ranking-dashboard.component';

const routes: Routes = [
  {
    path: '', // La ruta raíz de este módulo (que ya es /ranking)
    component: RankingDashboardComponent // Carga el componente del dashboard
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RankingRoutingModule { }