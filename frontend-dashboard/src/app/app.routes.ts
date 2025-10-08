// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AppComponent } from './app'; // O './app' si tu archivo se llama app.ts

export const routes: Routes = [
    // Esta es la línea clave. Le dice a Angular que cuando estés en la
    // ruta principal, cargue el AppComponent.
    // { path: '', component: AppComponent } 
    // Si ya tienes otras rutas, déjalas, pero asegúrate de que la ruta vacía esté configurada.
];