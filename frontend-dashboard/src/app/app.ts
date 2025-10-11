import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ProductoService } from './services/producto'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html', // Corregido de app.component.html a app.html
  styleUrls: ['./app.scss'] // Corregido de app.component.scss a app.scss
})
export class AppComponent implements OnInit {
  title = 'frontend-dashboard';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    console.log('Dashboard de Angular intentando obtener productos...');
    // Usamos 'getProductos' en lugar de 'obtenerProductos'
    this.productoService.getProductos().subscribe({
      // Añadimos el tipo 'any' a 'data' y 'err'
      next: (data: any) => {
        console.log('Productos recibidos:', data);
      },
      error: (err: any) => {
        console.error('Error al obtener productos en Angular:', err);
      }
    });
  }
}
