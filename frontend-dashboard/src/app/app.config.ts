import { ApplicationConfig } from '@angular/core'; // Ya lo tenías
import { provideRouter } from '@angular/router'; // Ya lo tenías

import { routes } from './app.routes'; // Ya lo tenías

// 1. AÑADE ESTE IMPORT
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // 2. AÑADE ESTA LÍNEA
    provideHttpClient()
  ]
};