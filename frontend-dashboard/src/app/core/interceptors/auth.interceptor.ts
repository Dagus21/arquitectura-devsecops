import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  // ESTRATEGIA: COOKIES HTTP-ONLY
  // ---------------------------------------------------------------------------
  // 1. Ya no necesitamos leer localStorage.getItem('token') ni inyectar el
  //    header "Authorization: Bearer ...". El navegador lo hace solo con la cookie.
  
  // 2. Lo que SÍ es obligatorio es decirle a Angular que active la opción
  //    'withCredentials'. Esto autoriza al navegador a enviar las cookies
  //    hacia el Backend (Spring Boot).

  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq);
};