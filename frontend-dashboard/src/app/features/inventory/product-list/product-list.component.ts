// src/app/features/inventory/product-list/product-list.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.interface';
import { MessageService } from 'primeng/api';
import { VpnService } from '../../../core/services/vpn.service';
import { ProductFormComponent } from '../product-form/product-form';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { Image } from 'primeng/image'; // <-- IMPORTAMOS EL MÓDULO DE IMAGEN

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, TagModule, TooltipModule,
    SelectModule, Image, ProductFormComponent // <-- LO AGREGAMOS AQUÍ
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private messageService = inject(MessageService);
  private vpnService = inject(VpnService);

  products: Product[] =[];
  isLoading = true;
  errorMessage = '';
  
  productDialogVisible: boolean = false;
  selectedProduct: Product | null = null;
  isSaving: boolean = false;

  statuses = [
    { label: 'ACTIVO', value: 'ACTIVO' },
    { label: 'INACTIVO', value: 'INACTIVO' },
    { label: 'AGOTADO', value: 'AGOTADO' }
  ];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.vpnService.checkConnection().subscribe((isConnected) => {
      if (!isConnected) {
        this.isLoading = false;
        this.errorMessage = '⛔ Modo Restringido: Conexión segura no detectada.';
        return;
      }
      this.productService.getProducts().subscribe({
        next: (data) => { this.products = data; this.isLoading = false; },
        error: () => { this.isLoading = false; this.errorMessage = 'Error de conexión con la BD.'; }
      });
    });
  }

  openNew() {
    this.selectedProduct = null;
    this.productDialogVisible = true;
  }

  editProduct(product: Product) {
    this.selectedProduct = { ...product }; 
    this.productDialogVisible = true;
  }

  closeDialog() {
    this.productDialogVisible = false;
    this.selectedProduct = null;
  }

  saveProduct(productData: Product) {
    this.isSaving = true;

    if (productData.idProducto) {
      this.productService.updateProduct(productData.idProducto, productData).subscribe({
        next: (updated) => {
          const index = this.products.findIndex(p => p.idProducto === updated.idProducto);
          if (index !== -1) this.products[index] = updated;
          this.successHandler('Actualizado correctamente');
        },
        error: () => this.errorHandler()
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: (created) => {
          this.products.unshift(created);
          this.successHandler('Creado correctamente');
        },
        error: () => this.errorHandler()
      });
    }
  }

  deleteProduct(product: Product) {
    if (confirm(`¿Eliminar ${product.nombre}?`)) {
      this.isLoading = true;
      this.productService.deleteProduct(product.idProducto).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.idProducto !== product.idProducto);
          this.messageService.add({ severity: 'success', summary: 'Borrado', detail: 'Eliminado' });
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se puede eliminar' });
        }
      });
    }
  }

  private successHandler(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: msg });
    this.isSaving = false;
    this.closeDialog();
  }

  private errorHandler() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operación fallida' });
    this.isSaving = false;
  }

  getSeverity(estado: string): any {
    switch (estado) {
        case 'ACTIVO': return 'success';
        case 'INACTIVO': return 'danger';
        case 'AGOTADO': return 'warn';
        default: return 'info';
    }
  }
}