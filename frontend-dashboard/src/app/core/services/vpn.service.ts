import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VpnService {
  private http = inject(HttpClient);

  /**
   * Verifica si tenemos acceso al Servidor Privado (Origin).
   * Retorna true si la VPN/Red está activa.
   * Retorna false si no se puede conectar al origen.
   */
  checkConnection(): Observable<boolean> {
    // Intentamos obtener el favicon o la raíz del sitio ACTUAL (el privado)
    // Usamos window.location.origin para que funcione tanto en localhost como en la VPN
    const privateUrl = window.location.origin + '/favicon.ico';

    return this.http.get(privateUrl, { responseType: 'text' }).pipe(
      timeout(3000), // Si en 3 segundos no responde, asumimos desconexión
      map(() => true), // Si responde (lo que sea), hay conexión
      catchError(() => of(false)) // Si falla (DNS, Timeout), no hay conexión
    );
  }
}