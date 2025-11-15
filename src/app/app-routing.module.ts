import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseComponent } from './component/expense/expense.component';
import { RankingComponent } from './component/ranking/ranking.component';

const routes: Routes = [
  { path: 'expense', component: ExpenseComponent },
  { path: 'ranking', component: RankingComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
