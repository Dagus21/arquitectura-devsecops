import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest, AuthResponse } from '../../models/auth.interface';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Construye la URL usando la configuración inyectada
  private apiUrl = `${API_CONFIG.apiUrl}/auth`; 

  login(credentials: LoginRequest) {
    // IMPORTANTE: { withCredentials: true } permite que el navegador acepte la Cookie del backend
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(() => {
        // YA NO guardamos el token sensible en localStorage.
        // Guardamos una bandera simple solo para saber que estamos logueados (para la UI).
        localStorage.setItem('is_logged_in', 'true');
        console.log('🔒 Login exitoso. Token gestionado vía Cookie HttpOnly.');
        
        this.router.navigate(['/dashboard']); 
      })
    );
  }

  async logout() {
    // 1. Intentamos avisar al backend para que borre la cookie
    // Usamos subscribe para ejecutar la limpieza del cliente pase lo que pase
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      catchError(err => {
        console.warn('Backend logout falló o no existe endpoint, limpiando localmente.', err);
        return of(null);
      })
    ).subscribe(async () => {
        // 2. Limpieza Local (Cliente)
        localStorage.removeItem('is_logged_in'); // Borramos la bandera de UI
        localStorage.clear();
        sessionStorage.clear();

        // 3. Limpieza de Cachés (Service Workers residuales)
        if ('caches' in window) {
          const keys = await caches.keys();
          keys.forEach(key => caches.delete(key));
        }

        // 4. Redirección y Recarga
        this.router.navigate(['/login']).then(() => {
            window.location.reload();
        });
    });
  }

  // Ya no podemos leer el token real desde JS.
  // Usamos la bandera de UI o retornamos null.
  getToken(): string | null {
    return null; // El token ahora es invisible para el Frontend
  }
  
  // Verificamos la bandera de UI. 
  // La seguridad real la da el backend: si la cookie no es válida, devolverá 401/403.
  isAuthenticated(): boolean {
    return localStorage.getItem('is_logged_in') === 'true';
  }
}