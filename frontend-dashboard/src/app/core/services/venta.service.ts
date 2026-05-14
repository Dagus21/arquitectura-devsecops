import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { VentaResumen, CheckoutRequest } from '../models/venta.interface';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.apiUrl}/ventas`;

  getVentas(): Observable<VentaResumen[]> {
    return this.http.get<VentaResumen[]>(this.apiUrl, { withCredentials: true });
  }

  // AÑADIDO: Método para obtener clientes
  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${API_CONFIG.apiUrl}/usuarios/clientes`, { withCredentials: true });
  }

  // ACTUALIZADO: Añadido telefonoCliente
  crearVentaFisica(request: CheckoutRequest, metodoPago: string, emailCliente?: string, nombreCliente?: string, telefonoCliente?: string): Observable<VentaResumen> {
    let url = `${this.apiUrl}/fisica?metodoPago=${metodoPago}`;
    if (emailCliente) url += `&emailCliente=${encodeURIComponent(emailCliente)}`;
    if (nombreCliente) url += `&nombreCliente=${encodeURIComponent(nombreCliente)}`;
    if (telefonoCliente) url += `&telefonoCliente=${encodeURIComponent(telefonoCliente)}`;
    
    return this.http.post<VentaResumen>(url, request, { withCredentials: true });
  }

  getVentaDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  anularVenta(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/anular`, {}, { withCredentials: true });
  }
}