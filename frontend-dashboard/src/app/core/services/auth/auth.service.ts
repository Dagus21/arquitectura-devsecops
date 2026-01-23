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

  async logout() {
    // 1. Limpiar Almacenamiento Local (Tokens y datos)
    localStorage.clear();
    sessionStorage.clear();

    // 2. Limpieza Nuclear de Cachés (Borra TODO lo guardado por este dominio)
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => {
            console.log(`🗑️ Borrando caché: ${name}`);
            return caches.delete(name);
          })
        );
      } catch (err) {
        console.error('Error limpiando cachés:', err);
      }
    }

    // 3. Matar el Service Worker (Desregistrarlo)
    // Esto evita que siga interceptando peticiones o sirviendo el App Shell
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('💀 Service Worker desregistrado');
      }
    }

    // 4. Redirección Forzada (Hard Reload)
    // Usamos location.href en lugar de router para limpiar la memoria RAM de JS
    // y obligar al navegador a pedir todo de nuevo al servidor.
    window.location.href = '/login';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}