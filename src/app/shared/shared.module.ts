import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingPodiumComponent } from './components/ranking-podium/ranking-podium.component';

@NgModule({
  declarations: [
    RankingPodiumComponent // 1. Declara tu componente de podio
  ],
  imports: [
    CommonModule // Necesario para *ngIf, *ngFor, | currency
  ],
  exports: [
    RankingPodiumComponent // 2. Expórtalo para que otros módulos lo vean
  ]
})
export class SharedModule { }