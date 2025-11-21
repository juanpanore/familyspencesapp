// src/app/components/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();

    // Si ya está autenticado, redirigir a home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false] // Checkbox para "Recordarme"
    });
  }

  get emailControl(): AbstractControl | null {
    return this.loginForm.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.loginForm.get('password');
  }

  get rememberMeControl(): AbstractControl | null {
    return this.loginForm.get('rememberMe');
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.isLoading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password }, rememberMe).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Guardar el token en cookie con la opción rememberMe
        this.authService.saveToken(response.token, rememberMe);

        console.log('✅ Login exitoso');
        console.log('👤 Family ID:', this.authService.getFamilyId());
        console.log('👤 User ID:', this.authService.getUserId());

        // Navegar a home
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;

        if (err.error && err.error.error) {
          this.errorMessage = err.error.error;
        } else if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else if (err.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else {
          this.errorMessage = 'Error de autenticación. Por favor, intenta nuevamente.';
        }

        console.error('❌ Error en login:', err);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
