import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VpnService {
  private http = inject(HttpClient);

  checkConnection(): Observable<boolean> {
    const privateUrl = `${window.location.origin}/favicon.ico?t=${Date.now()}`;

    return this.http.get(privateUrl, { 
      responseType: 'text',
      headers: new HttpHeaders({ 
        'ngsw-bypass': 'true',          // Ignorar Service Worker
        'X-Skip-Global-Error': 'true'   // <--- NUEVA BANDERA SILENCIOSA
      }) 
    }).pipe(
      timeout(3000), 
      map(() => true), 
      catchError((err) => {
        // console.warn('VPN Check falló (Silencioso):', err); 
        return of(false);
      }) 
    );
  }
}