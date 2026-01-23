import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // STATUS 0: Significa que no se pudo contactar al servidor.
      // Causas: VPN apagada, Servidor caído, Sin Internet.
      if (error.status === 0) {
        messageService.add({
          severity: 'error',
          summary: 'Conexión Perdida',
          detail: 'No se puede contactar al servidor. Verifica tu VPN.',
          life: 5000
        });
      }

      // STATUS 401/403: Token vencido o inválido
      if (error.status === 401 || error.status === 403) {
        // Opcional: Forzar cierre de sesión automático
        authService.logout(); 
      }

      return throwError(() => error);
    })
  );
};