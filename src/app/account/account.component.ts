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
      error: (err) => {
        this.error = 'No se pudo cargar el perfil. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.profile) return;

    this.savingProfile = true;
    this.profileSuccess = '';
    this.profileError = '';

    this.accountService.updateProfile(this.profile.email, this.profileForm.value).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.profileSuccess = 'Perfil actualizado correctamente.';
        this.savingProfile = false;
      },
      error: (err) => {
        this.profileError = err.error?.message || 'Error al actualizar el perfil.';
        this.savingProfile = false;
      }
    });
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
