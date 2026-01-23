import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.interface';

// --- PrimeNG Imports ---
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    TagModule, 
    TooltipModule,
    IconFieldModule, 
    InputIconModule, 
    InputTextModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.isLoading = false;
      }
    });
  }

  // Función para dar color al estado
  getSeverity(estado: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (estado) {
        case 'ACTIVO': return 'success';
        case 'INACTIVO': return 'danger';
        case 'AGOTADO': return 'warn';
        default: return 'info';
    }
  }
}