// src/app/components/home/home.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <h1>¡Bienvenido a FamilySpences!</h1>
      <p>Has iniciado sesión correctamente.</p>
      <button (click)="logout()">Cerrar Sesión</button>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 800px;
      margin: 50px auto;
      padding: 30px;
      text-align: center;
    }

    h1 {
      color: #4CAF50;
      margin-bottom: 20px;
    }

    p {
      font-size: 18px;
      margin-bottom: 30px;
    }

    button {
      padding: 12px 30px;
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    button:hover {
      background-color: #d32f2f;
    }
  `]
})
export class HomeComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
