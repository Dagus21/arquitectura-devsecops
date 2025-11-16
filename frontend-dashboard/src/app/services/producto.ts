import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api-config'; // <-- 1. Importa desde el nuevo archivo

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  // 2. Construye la URL base a partir de nuestra nueva constante
  private apiUrl = `${API_CONFIG.apiUrl}/productos`;

  constructor(private http: HttpClient) { }

  // 3. Usa la URL construida para obtener los productos
  getProductos(): Observable<any[]> {
    // console.log(`Pidiendo productos a la URL: ${this.apiUrl}`);
    return this.http.get<any[]>(this.apiUrl);
  }
}
