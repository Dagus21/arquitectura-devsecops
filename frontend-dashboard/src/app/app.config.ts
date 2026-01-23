import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';

// PrimeNG
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MessageService } from 'primeng/api'; // <--- 1. IMPORTAR ESTO

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    provideAnimationsAsync(),

    // 2. AGREGAR EL PROVIDER AQUÍ
    MessageService, 

    providePrimeNG({
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: false || 'none'
            }
        },
        ripple: true
    }),

    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    }),

    provideHttpClient(withInterceptors([
        authInterceptor, 
        errorInterceptor 
    ]))
  ]
};