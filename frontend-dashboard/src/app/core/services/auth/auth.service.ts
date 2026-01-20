import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest, AuthResponse } from '../../models/auth.interface';
import { tap } from 'rxjs';
// Importamos la configuración dinámica generada por tu script
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
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}