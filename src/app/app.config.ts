import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Soluciona el error NG0908 habilitando Zone.js
    provideZoneChangeDetection({ eventCoalescing: true }),

    // 2. Configura las rutas
    provideRouter(routes),

    // 3. Habilita el cliente HTTP (se coloca sin argumentos adentro)
    provideHttpClient()
  ]
};
