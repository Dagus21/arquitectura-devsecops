import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core'; // <--- Importar Injector
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  // 1. Inyectamos el inyector genérico para romper el ciclo
  const injector = inject(Injector); 

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // STATUS 0: Conexión Perdida (VPN caída / Sin Internet)
      if (error.status === 0) {
        messageService.add({
          severity: 'error',
          summary: 'Conexión Perdida',
          detail: 'Cerrando sesión por seguridad...',
          life: 5000
        });

        // Opcional: Si quieres ser estricto y borrar todo cuando cae la VPN,
        // descomenta las siguientes líneas. Si solo quieres avisar, déjalo así.
        
        // const authService = injector.get(AuthService);
        // authService.logout();
        
      }

      // STATUS 401/403: Token vencido o inválido
      if (error.status === 401 || error.status === 403) {
        // 2. Pedimos el AuthService SOLO cuando lo necesitamos
        const authService = injector.get(AuthService);
        authService.logout(); 
      }

      return throwError(() => error);
    })
  );
};