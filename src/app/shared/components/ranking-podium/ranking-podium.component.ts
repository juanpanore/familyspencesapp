import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ranking-podium',
  templateUrl: './ranking-podium.component.html',
  styleUrls: ['./ranking-podium.component.scss']
})
export class RankingPodiumComponent {
  // Con @Input() hacemos el componente reutilizable
  @Input() titulo: string = 'Ranking';
  @Input() data: any = null;
  @Input() color: 'green' | 'red' = 'green'; // Para cambiar el color

  // Convertimos el objeto { "Ana": 100 } a un array [ { name: "Ana", value: 100 } ]
  get rankingArray(): { name: string, value: number }[] {
    if (!this.data) return [];
    return Object.keys(this.data)
                 .map(key => ({ name: key, value: this.data[key] }))
                 .sort((a, b) => b.value - a.value); // Ordenamos de mayor a menor
  }
}