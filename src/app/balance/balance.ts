import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { BalanceService, GeneralBalance } from '../service/balance/balance.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.html',
  styleUrls: ['./balance.css']
})
export class Balance implements OnChanges {
  @Input() familyId: string | null = null;

  balanceData: GeneralBalance | null = null;

  constructor(private balanceService: BalanceService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['familyId'] && this.familyId) {
      this.loadBalance();
    }
  }

  loadBalance(): void {
    if (!this.familyId) return;

    this.balanceService.getGeneralBalance(this.familyId).subscribe({
      next: (data) => {
        this.balanceData = data;
      },
      error: (err) => {
        console.error('Error loading balance:', err);
      }
    });
  }
}
