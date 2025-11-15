// src/app/components/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Asegúrate de que los imports de formularios sean correctos
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // ✅ Declaración de propiedades (importante para que TypeScript no arroje errores TS2339)
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
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, introduce credenciales válidas.';
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      // ✅ response ahora infiere el tipo { token: string } correctamente del servicio
      next: (response) => {
        this.isLoading = false;
        // response.token ya está disponible sin errores
        localStorage.setItem('auth_token', response.token);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error.message || 'Error de autenticación. Verifica tus credenciales.';
      }
    });
  }
}
