import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MonthlyClosingService, MonthlyClosing } from '../service/monthlyclosing/monthlyclosing.service';

@Component({
    selector: 'app-monthly-closing',
    templateUrl: './monthlyclosing.html',
    styleUrls: ['./monthlyclosing.css']
})
export class MonthlyClosingComponent implements OnInit {
    familyId: string | null = null;
    closingHistory: MonthlyClosing[] = [];
    selectedMonth: string = '';
    isLoading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';

    constructor(
        private authService: AuthService,
        private monthlyClosingService: MonthlyClosingService,
        private router: Router
    ) { }

    ngOnInit(): void {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login']);
            return;
        }

        this.familyId = this.authService.getFamilyId();
        if (this.familyId) {
            this.loadClosingHistory();
        }

        // Set default month to current month
        const now = new Date();
        this.selectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    loadClosingHistory(): void {
        if (!this.familyId) return;

        this.isLoading = true;
        this.monthlyClosingService.getClosingHistory(this.familyId).subscribe({
            next: (data) => {
                this.closingHistory = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading closing history:', err);
                this.errorMessage = 'Error al cargar el historial de cierres';
                this.isLoading = false;
            }
        });
    }

    createClosing(): void {
        if (!this.familyId) return;

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const month = this.selectedMonth || undefined;

        this.monthlyClosingService.createMonthlyClosing(this.familyId, month).subscribe({
            next: (response) => {
                this.successMessage = 'Cierre mensual creado exitosamente';
                this.isLoading = false;
                // Reload history after creating a new closing
                setTimeout(() => {
                    this.loadClosingHistory();
                    this.successMessage = '';
                }, 2000);
            },
            error: (err) => {
                console.error('Error creating monthly closing:', err);
                if (err.error && err.error.error) {
                    this.errorMessage = err.error.error;
                } else {
                    this.errorMessage = 'Error al crear el cierre mensual';
                }
                this.isLoading = false;
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/home']);
    }
}
