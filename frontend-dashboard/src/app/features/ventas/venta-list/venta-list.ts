import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { VentaService } from '../../../core/services/venta.service';
import { VentaResumen } from '../../../core/models/venta.interface';
import { MessageService } from 'primeng/api';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select'; 
import { DatePickerModule } from 'primeng/datepicker'; 
import { DialogModule } from 'primeng/dialog'; // Modal Mini-Factura
import { TooltipModule } from 'primeng/tooltip'; // Tooltips de botones
import { VentaFormComponent } from '../venta-form/venta-form'; 

@Component({
  selector: 'app-venta-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, TagModule, 
    InputTextModule, SelectModule, DatePickerModule, DialogModule, 
    TooltipModule, VentaFormComponent
  ],
  templateUrl: './venta-list.html'
})
export class VentaListComponent implements OnInit {
  ventas: VentaResumen[] = [];
  isLoading = true;
  dialogVisible = false;
  isSaving = false;

  // Variables para la mini-factura
  detalleVisible = false;
  ventaDetalle: any = null;

  private ventaService = inject(VentaService);
  private messageService = inject(MessageService);

  estadosOptions = [
    { label: 'Pagado', value: 'PAGADO' },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Reembolsado', value: 'REEMBOLSADO' },
    { label: 'Cancelado', value: 'CANCELADO' }
  ];

  metodosOptions = [
    { label: 'Mercado Pago', value: 'MERCADO_PAGO' },
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Tarjeta', value: 'TARJETA' },
    { label: 'Transferencia', value: 'TRANSFERENCIA' },
    { label: 'No Definido', value: 'NO_DEFINIDO' }
  ];

  ngOnInit() { this.loadVentas(); }

  loadVentas() {
    this.ventaService.getVentas().subscribe({
      next: (data) => { this.ventas = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  saveVenta(event: any) {
    this.isSaving = true;
    this.ventaService.crearVentaFisica(
      event.request, 
      event.metodoPago, 
      event.emailCliente, 
      event.nombreCliente,
      event.telefonoCliente
    ).subscribe({
      next: (nuevaVenta) => {
        this.ventas.unshift(nuevaVenta);
        this.messageService.add({severity: 'success', summary: 'Éxito', detail: 'Venta registrada.'});
        this.dialogVisible = false;
        this.isSaving = false;
      },
      error: (err) => {
        this.messageService.add({severity: 'error', summary: 'Error', detail: err.error?.error || 'Falló'});
        this.isSaving = false;
      }
    });
  }

  // --- LÓGICA DE DETALLES Y ANULACIÓN ---
  verDetalle(idVenta: number) {
    this.ventaService.getVentaDetalle(idVenta).subscribe({
      next: (res) => {
        this.ventaDetalle = res;
        this.detalleVisible = true;
      },
      error: () => this.messageService.add({severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los detalles'})
    });
  }

  confirmarAnulacion(venta: VentaResumen) {
    if (venta.metodoPago === 'MERCADO_PAGO') {
      this.messageService.add({severity: 'warn', summary: 'Atención', detail: 'Pagos online se anulan desde Mercado Pago.'});
      return;
    }

    if (confirm(`¿Estás seguro de anular la venta #${venta.idVenta}? El stock volverá al inventario.`)) {
      this.ventaService.anularVenta(venta.idVenta).subscribe({
        next: () => {
          this.messageService.add({severity: 'success', summary: 'Anulada', detail: 'Venta cancelada y stock devuelto'});
          venta.estado = 'CANCELADO'; // Actualizamos la vista
        },
        error: (err) => this.messageService.add({severity: 'error', summary: 'Error', detail: err.error?.error || 'Error al anular'})
      });
    }
  }

  filterByDate(date: Date, dt: any) {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      dt.filter(formattedDate, 'fecha', 'contains');
    }
  }

  getEstadoSeverity(estado: string): any { return estado === 'PAGADO' ? 'success' : estado === 'PENDIENTE' ? 'warn' : 'danger'; }
  getMetodoSeverity(metodo: string): any { return metodo === 'MERCADO_PAGO' ? 'info' : 'secondary'; }
}