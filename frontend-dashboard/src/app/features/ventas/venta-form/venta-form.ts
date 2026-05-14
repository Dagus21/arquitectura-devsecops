import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/models/product.interface';
import { ProductService } from '../../../core/services/product.service';
import { VentaService } from '../../../core/services/venta.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext'; // Requerido para pInputText

@Component({
  selector: 'app-venta-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, SelectModule, ButtonModule, TableModule, InputTextModule],
  templateUrl: './venta-form.html'
})
export class VentaFormComponent implements OnInit {
  @Input() visible = false;
  @Input() isLoading = false;
  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  private productService = inject(ProductService);
  private ventaService = inject(VentaService);
  private messageService = inject(MessageService);

  availableProducts: Product[] = [];
  selectedProduct: Product | null = null;
  quantity: number = 1;
  
  metodoPago: string = 'EFECTIVO';
  
  // Datos Cliente
  clientesRegistrados: any[] = [];
  selectedClienteObj: any = null;
  clienteEmail: string = '';
  clienteNombre: string = '';
  clienteTelefono: string = '';

  cart: { producto: Product, cantidad: number }[] = [];

  ngOnInit() {
    this.productService.getProducts().subscribe(res => {
      this.availableProducts = res.filter(p => p.estado !== 'INACTIVO');
    });

    this.ventaService.getClientes().subscribe(res => {
      this.clientesRegistrados = res;
    });
  }

  onClienteSelect() {
    if (this.selectedClienteObj) {
      this.clienteNombre = this.selectedClienteObj.nombre;
      this.clienteEmail = this.selectedClienteObj.email;
      this.clienteTelefono = this.selectedClienteObj.telefono;
    } else {
      this.clienteNombre = '';
      this.clienteEmail = '';
      this.clienteTelefono = '';
    }
  }

  inc() { this.quantity++; }
  dec() { if (this.quantity > 1) this.quantity--; }

  addToCart() {
    if (!this.selectedProduct) return;
    const stockDisponible = this.selectedProduct.stock || 0;
    const existing = this.cart.find(i => i.producto.idProducto === this.selectedProduct!.idProducto);
    const cantActual = existing ? existing.cantidad : 0;

    if (cantActual + this.quantity > stockDisponible) {
      this.messageService.add({ severity: 'error', summary: 'Sin Stock', detail: `Solo quedan ${stockDisponible} unidades.` });
      return;
    }

    if (existing) existing.cantidad += this.quantity;
    else this.cart.push({ producto: this.selectedProduct, cantidad: this.quantity });
    
    this.selectedProduct = null;
    this.quantity = 1;
  }

  removeFromCart(index: number) { this.cart.splice(index, 1); }
  calculateTotal() { return this.cart.reduce((acc, item) => acc + (item.producto.precioVenta * item.cantidad), 0); }

  save() {
    const payload = {
      items: this.cart.map(i => ({ idProducto: i.producto.idProducto, cantidad: i.cantidad })),
      idempotencyKey: crypto.randomUUID()
    };
    this.onSave.emit({ 
      request: payload, 
      metodoPago: this.metodoPago,
      emailCliente: this.clienteEmail,
      nombreCliente: this.clienteNombre,
      telefonoCliente: this.clienteTelefono
    });
  }

  cancel() {
    this.cart = [];
    this.selectedProduct = null;
    this.selectedClienteObj = null;
    this.clienteEmail = '';
    this.clienteNombre = '';
    this.clienteTelefono = '';
    this.quantity = 1;
    this.onCancel.emit();
  }
}