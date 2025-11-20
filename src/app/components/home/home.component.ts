import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ExpenseService } from '../../service/expense/expense.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  familyId: string | null = null;
  expensesList: any[] = [];

  constructor(
    private authService: AuthService,
    private expenseService: ExpenseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.familyId = this.authService.getFamilyId();
    if (this.familyId) {
      this.loadExpenses();
    }
  }

  loadExpenses(): void {
    if (!this.familyId) return;

    this.expenseService.getExpenses(this.familyId).subscribe({
      next: (data) => {
        this.expensesList = data;
      },
      error: (err) => {
        console.error('Error loading expenses:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
