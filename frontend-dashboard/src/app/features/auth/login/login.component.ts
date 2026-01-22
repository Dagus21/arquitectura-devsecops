import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';

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

    const credentials = {
        username: this.loginForm.value.username!,
        password: this.loginForm.value.password!
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        // Solo entra aquí si el Backend respondió 200 OK
        this.isLoading = false;
        // El servicio redirige
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error login:', err);
        
        // Mensajes diferenciados
        if (err.status === 0) {
            this.errorMessage = 'No hay conexión. Verifica tu VPN/Internet.';
        } else if (err.status === 403 || err.status === 401) {
            this.errorMessage = 'Credenciales incorrectas.';
        } else {
            this.errorMessage = 'Error del servidor.';
        }
      }
    });
  }
}