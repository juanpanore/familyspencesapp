import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AccountService, AccountProfile } from 'src/app/service/account/account.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  profile: AccountProfile | null = null;
  loading = true;
  error = '';

  profileForm!: FormGroup;
  savingProfile = false;
  profileSuccess = '';
  profileError = '';

  showCreditCard = false;
  showConfirmSave = false;
  showConfirmDelete = false;
  deleting = false;
  deleteError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{3,100}$')]],
      lastName:  ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{3,100}$')]],
      phone:     ['', [Validators.required, Validators.pattern('^3\\d{9}$')]],
      address:   ['', [Validators.required, Validators.minLength(5)]]
    });

    this.loadProfile();
  }

  loadProfile(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'No se encontró sesión activa.';
      this.loading = false;
      return;
    }

    this.accountService.getProfileById(userId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName:  profile.lastName,
          phone:     profile.phone,
          address:   profile.address
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  requestSave(): void {
    if (this.profileForm.invalid || !this.profile) return;

    // Validate forbidden name "Cuenta Eliminada"
    const first = (this.profileForm.value.firstName || '').trim().toLowerCase();
    const last = (this.profileForm.value.lastName || '').trim().toLowerCase();
    if (first.includes('cuenta') || first.includes('eliminada') ||
        last.includes('cuenta') || last.includes('eliminada')) {
      this.profileError = 'El nombre del usuario no es válido.';
      return;
    }

    this.showConfirmSave = true;
  }

  confirmSave(): void {
    this.showConfirmSave = false;
    this.savingProfile = true;
    this.profileSuccess = '';
    this.profileError = '';

    this.accountService.updateProfile(this.profile!.email, this.profileForm.value).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.profileSuccess = 'Perfil actualizado correctamente.';
        this.savingProfile = false;
      },
      error: (err) => {
        this.profileError = err.error?.message || err.error?.error || 'Error al actualizar el perfil.';
        this.savingProfile = false;
      }
    });
  }

  cancelSave(): void {
    this.showConfirmSave = false;
  }

  requestDelete(): void {
    this.deleteError = '';
    this.showConfirmDelete = true;
  }

  confirmDelete(): void {
    if (!this.profile) return;
    this.deleting = true;
    this.deleteError = '';

    this.accountService.deleteAccount(this.profile.email).subscribe({
      next: () => {
        this.showConfirmDelete = false;
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.deleting = false;
        this.deleteError = err.error?.message || err.error?.error || 'Error al eliminar la cuenta.';
      }
    });
  }

  cancelDelete(): void {
    this.showConfirmDelete = false;
    this.deleteError = '';
  }

  get maskedCreditCard(): string {
    if (!this.profile?.creditCardLast4) return 'No disponible';
    return '**** **** **** ' + this.profile.creditCardLast4;
  }

  get visibleCreditCard(): string {
    if (!this.profile?.creditCardLast4) return 'No disponible';
    if (this.showCreditCard) {
      return '**** **** **** ' + this.profile.creditCardLast4;
    }
    return '**** **** **** ****';
  }

  formatBirthDate(date: string): string {
    if (!date) return 'No disponible';
    const parts = date.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return date;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  get f() { return this.profileForm.controls; }
}
