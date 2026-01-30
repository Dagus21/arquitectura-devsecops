import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { VpnService } from '../../../core/services/vpn.service';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { IconFieldModule } from 'primeng/iconfield'; // Para iconos dentro del input
import { InputIconModule } from 'primeng/inputicon'; // Para iconos dentro del input
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    MessageModule,
    IconFieldModule,
    InputIconModule,
    RippleModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private vpnService = inject(VpnService);

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // 1. PRIMERO VERIFICAMOS LA VPN
    this.vpnService.checkConnection().subscribe((isConnected) => {
      if (!isConnected) {
        this.isLoading = false;
        this.errorMessage = '⛔ Acceso Denegado: No se detecta la VPN o Red Privada.';
        return; // Detenemos todo aquí
      }

      // 2. SI HAY VPN, PROCEDEMOS CON EL LOGIN NORMAL
      const credentials = {
          username: this.loginForm.value.username!,
          password: this.loginForm.value.password!
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          // ... tu manejo de errores existente ...
          if (err.status === 0) {
             this.errorMessage = '⚠️ Error de conexión con la API.';
             localStorage.clear();
          } else if (err.status === 403 || err.status === 401) {
              this.errorMessage = 'Credenciales incorrectas.';
          } else {
              this.errorMessage = 'Error del servidor.';
          }
        }
      });
    });
  }
}