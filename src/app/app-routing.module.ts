import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'ranking', // Cuando la URL sea /ranking
    loadChildren: () => import('./features/ranking/ranking.module') // Carga perezosamente el módulo
      .then(m => m.RankingModule)
  },
  {
    path: '', // Ruta por defecto
    redirectTo: '/ranking', // Redirige a /ranking
    pathMatch: 'full'
  }
  // Aquí puedes añadir más rutas lazy loading para /gastos, /metas, etc.
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }