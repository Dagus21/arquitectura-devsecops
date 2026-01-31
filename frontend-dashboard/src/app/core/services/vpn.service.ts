import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importar Headers
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VpnService {
  private http = inject(HttpClient);

  checkConnection(): Observable<boolean> {
    // 1. Agregamos un timestamp (?t=...) para evitar el caché del navegador clásico
    const privateUrl = `${window.location.origin}/favicon.ico?t=${Date.now()}`;

    return this.http.get(privateUrl, { 
      responseType: 'text',
      // 2. LA CLAVE: Este encabezado le dice al Service Worker de Angular:
      // "¡Ignórame! Deja pasar esta petición directo a la red".
      headers: new HttpHeaders({ 'ngsw-bypass': 'true' }) 
    }).pipe(
      timeout(3000), 
      map(() => true), 
      catchError((err) => {
        // Tip de depuración: Esto saldrá en la consola remota si usas el método de arriba
        console.warn('VPN Check falló:', err); 
        return of(false);
      }) 
    );
  }
}