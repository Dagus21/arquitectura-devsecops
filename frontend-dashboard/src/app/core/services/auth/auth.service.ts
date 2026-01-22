import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest, AuthResponse } from '../../models/auth.interface';
import { tap } from 'rxjs';
// Importamos la configuración dinámica generada por tu script
import { API_CONFIG } from '../../config/api.config';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private swUpdate = inject(SwUpdate); 
  
  // Construye la URL usando la configuración inyectada
  private apiUrl = `${API_CONFIG.apiUrl}/auth`; 

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Guardamos el token para usarlo en el Interceptor
        localStorage.setItem('token', response.token);
        console.log('🔐 Login exitoso, token guardado.');
        
        // Redirigir al dashboard (cuando lo creemos)
        this.router.navigate(['/dashboard']); 
        //alert('Login Exitoso! Token guardado.');
      })
    );
  }

  logout() {
    // 1. Borrar Token (Lo que ya tenías)
    localStorage.removeItem('token');
    localStorage.clear();

    // 2. NUEVO: Limpiar cachés del Service Worker si está activo
    if (this.swUpdate.isEnabled) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          // Borrar cachés de la App (pero no necesariamente todos los del navegador)
          if (cacheName.includes('ngsw')) { 
            caches.delete(cacheName);
          }
        });
      });
    }

    // 3. Forzar recarga completa (Hard Reload)
    // Esto obliga al navegador a re-evaluar si tiene conexión
    window.location.href = '/login';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}