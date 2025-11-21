// src/app/services/cookie.service.ts
// Implementación nativa sin dependencias externas

import { Injectable } from '@angular/core';

export interface CookieOptions {
  expires?: Date | number; // Date o días
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
}

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly TOKEN_KEY = 'auth_token';

  constructor() { }

  /**
   * Guarda una cookie con opciones de seguridad
   */
  set(name: string, value: string, options: CookieOptions = {}): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    // Expiración
    if (options.expires) {
      let expires: Date;

      if (typeof options.expires === 'number') {
        // Si es número, se interpreta como días
        expires = new Date();
        expires.setTime(expires.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      } else {
        expires = options.expires;
      }

      cookieString += `; expires=${expires.toUTCString()}`;
    }

    // Path
    cookieString += `; path=${options.path || '/'}`;

    // Domain
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    // Secure (solo HTTPS)
    if (options.secure) {
      cookieString += '; secure';
    }

    // SameSite
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Obtiene el valor de una cookie
   */
  get(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        const value = cookie.substring(nameEQ.length);
        return decodeURIComponent(value);
      }
    }

    return null;
  }

  /**
   * Verifica si existe una cookie
   */
  check(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * Elimina una cookie
   */
  delete(name: string, path: string = '/', domain?: string): void {
    if (this.check(name)) {
      this.set(name, '', {
        expires: new Date('1970-01-01'),
        path,
        domain
      });
    }
  }

  /**
   * Obtiene todas las cookies como objeto
   */
  getAll(): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    const cookieArray = document.cookie.split(';');

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      const [name, value] = cookie.split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }

  /**
   * Elimina todas las cookies
   */
  deleteAll(path: string = '/', domain?: string): void {
    const cookies = this.getAll();
    for (const name in cookies) {
      this.delete(name, path, domain);
    }
  }

  // ============================================
  // Métodos específicos para el token de auth
  // ============================================

  /**
   * Guarda el token con configuración de seguridad
   */
  setToken(token: string, rememberMe: boolean = false): void {
    const expirationDays = rememberMe ? 7 : 1;

    this.set(this.TOKEN_KEY, token, {
      expires: expirationDays,
      path: '/',
      secure: false, // Cambiar a true en producción con HTTPS
      sameSite: 'Strict'
    });

    console.log(`✅ Token guardado en cookie (expira en ${expirationDays} día(s))`);
  }

  /**
   * Obtiene el token
   */
  getToken(): string | null {
    return this.get(this.TOKEN_KEY);
  }

  /**
   * Elimina el token
   */
  deleteToken(): void {
    this.delete(this.TOKEN_KEY);
    console.log('🗑️ Token eliminado de la cookie');
  }

  /**
   * Verifica si existe el token
   */
  hasToken(): boolean {
    return this.check(this.TOKEN_KEY);
  }
}
