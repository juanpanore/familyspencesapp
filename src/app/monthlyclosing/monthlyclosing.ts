import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MonthlyClosingService, MonthlyClosing } from '../service/monthlyclosing/monthlyclosing.service';

@Component({
    selector: 'app-monthly-closing',
    templateUrl: './monthlyclosing.html',
    styleUrls: ['./monthlyclosing.css']
})
export class MonthlyClosingComponent implements OnInit, OnDestroy {
    familyId: string | null = null;
    closingHistory: MonthlyClosing[] = [];
    selectedMonth: string = '';
    isLoading: boolean = false;
    isPolling: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    private pollingTimeoutId: number | null = null;
    private readonly maxPollingAttempts = 10;
    private readonly pollingIntervalMs = 2000;

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

    ngOnDestroy(): void {
        this.clearPollingTimeout();
    }

    get selectedMonthAlreadyClosed(): boolean {
        return this.isMonthClosed(this.selectedMonth);
    }

    get isProcessing(): boolean {
        return this.isLoading || this.isPolling;
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
        if (!this.selectedMonth) {
            this.errorMessage = 'Selecciona el mes a cerrar.';
            return;
        }
        if (this.selectedMonthAlreadyClosed) {
            this.errorMessage = 'Ya existe un cierre mensual para el mes seleccionado.';
            return;
        }

        this.isLoading = true;
        this.isPolling = false;
        this.errorMessage = '';
        this.successMessage = '';
        this.clearPollingTimeout();

        const month = this.selectedMonth;

        this.monthlyClosingService.createMonthlyClosing(this.familyId, month).subscribe({
            next: () => {
                this.isLoading = false;
                this.isPolling = true;
                this.successMessage = 'Cierre solicitado, esperando confirmación.';
                this.pollClosingHistory(month, 1);
            },
            error: (err) => {
                console.error('Error creating monthly closing:', err);
                if (err.error && err.error.error) {
                    this.errorMessage = err.error.error;
                } else {
                    this.errorMessage = 'Error al crear el cierre mensual';
                }
                this.isLoading = false;
                this.isPolling = false;
                if (err.status === 409) {
                    this.loadClosingHistory();
                }
            }
        });
    }

    formatClosingMonth(closing: MonthlyClosing): string {
        const period = this.getClosingPeriod(closing);
        if (!period) return closing.month || '';

        const [year, month] = period.split('-').map(Number);
        const formatted = new Date(year, month - 1, 1).toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    goBack(): void {
        this.router.navigate(['/home']);
    }

    private pollClosingHistory(targetMonth: string, attempt: number): void {
        if (!this.familyId) return;

        this.monthlyClosingService.getClosingHistory(this.familyId).subscribe({
            next: (data) => {
                this.closingHistory = data;

                if (this.isMonthClosed(targetMonth)) {
                    this.successMessage = 'Cierre mensual confirmado.';
                    this.isPolling = false;
                    return;
                }

                if (attempt >= this.maxPollingAttempts) {
                    this.successMessage = '';
                    this.errorMessage = 'El cierre fue solicitado, pero aún no aparece en el historial. Actualiza nuevamente en unos segundos.';
                    this.isPolling = false;
                    return;
                }

                this.pollingTimeoutId = window.setTimeout(
                    () => this.pollClosingHistory(targetMonth, attempt + 1),
                    this.pollingIntervalMs
                );
            },
            error: (err) => {
                console.error('Error polling closing history:', err);
                this.errorMessage = 'No pudimos confirmar el cierre mensual. Actualiza el historial en unos segundos.';
                this.successMessage = '';
                this.isPolling = false;
            }
        });
    }

    private isMonthClosed(month: string): boolean {
        if (!month) return false;
        return this.closingHistory.some(closing => this.getClosingPeriod(closing) === month);
    }

    private getClosingPeriod(closing: MonthlyClosing): string {
        if (!closing.closingDate) return '';
        const [year, month] = closing.closingDate.split('-');
        if (!year || !month) return '';
        return `${year}-${month}`;
    }

    private clearPollingTimeout(): void {
        if (this.pollingTimeoutId !== null) {
            window.clearTimeout(this.pollingTimeoutId);
            this.pollingTimeoutId = null;
        }
    }
}
