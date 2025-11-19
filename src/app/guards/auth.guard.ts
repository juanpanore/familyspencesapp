// src/app/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Verificar si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      // Verificar si el token está por expirar
      if (this.authService.isTokenExpiringSoon()) {
        console.warn('⚠️ El token expirará pronto. Considera renovarlo.');
      }
      return true;
    }

    // Si no está autenticado, redirigir al login
    console.warn('⚠️ Usuario no autenticado. Redirigiendo al login...');
    return this.router.createUrlTree(['/login']);
  }
}
