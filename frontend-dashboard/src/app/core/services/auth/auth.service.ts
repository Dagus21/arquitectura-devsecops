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
    // 1. Limpiar Storage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Limpieza de Cachés (Redundancia de seguridad)
    if ('caches' in window) {
      const keys = await caches.keys();
      keys.forEach(key => caches.delete(key));
    }

    // 3. CAMBIO CLAVE: Usar el Router de Angular en lugar de recarga forzada
    // Esto evita la pantalla blanca porque no re-pide el index.html al servidor inmediatamente
    this.router.navigate(['/login']).then(() => {
        // Opcional: Recargar la página SOLO si ya estamos en la ruta login
        // para asegurar que la memoria se limpie, pero ya estando en una ruta segura.
        window.location.reload();
    });
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}