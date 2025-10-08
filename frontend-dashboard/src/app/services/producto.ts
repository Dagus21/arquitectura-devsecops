// src/app/services/producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  // Definimos la URL de nuestra API de backend
  private apiUrl = 'https://api.localhost/api/productos';

  // Inyectamos el HttpClient de Angular en el constructor
  constructor(private http: HttpClient) { }

  // Creamos un método para obtener todos los productos
  // Devuelve un "Observable", que es como Angular maneja las operaciones asíncronas
  obtenerProductos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}