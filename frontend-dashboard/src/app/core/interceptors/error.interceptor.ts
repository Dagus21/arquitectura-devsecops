import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // NO inyectamos MessageService aquí. Cero pop-ups globales.
  const injector = inject(Injector); 

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Solo lógica de negocio crítica (Token vencido)
      if (error.status === 401 || error.status === 403) {
        const authService = injector.get(AuthService);
        authService.logout(); 
      }

      // Para errores de conexión (status 0) o servidor (500),
      // simplemente lanzamos el error para que el Componente lo capture
      // y muestre su propia caja roja (errorMessage).
      return throwError(() => error);
    })
  );
};