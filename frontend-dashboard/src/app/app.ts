// src/app/app.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductoService } from './services/producto';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',  // Usando el nombre de tu archivo
  styleUrls: ['./app.scss']    // Usando el nombre de tu archivo
})
export class AppComponent implements OnInit {
  title = 'frontend-dashboard';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    console.log("Dashboard de Angular intentando obtener productos...");

    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        console.log("¡Productos recibidos desde Angular!", data);
      },
      error: (err) => {
        console.error("Error al obtener productos en Angular:", err);
      }
    });
    
  }
}