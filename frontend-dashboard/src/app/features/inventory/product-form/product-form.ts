// src/app/features/inventory/product-form/product-form.component.ts
import { Component, EventEmitter, Input, Output, OnInit, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MediaService } from '../../../core/services/media.service';
import { Product } from '../../../core/models/product.interface';
import { MessageService } from 'primeng/api';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { Image } from 'primeng/image'; // <-- IMPORTAMOS EL MÓDULO DE IMAGEN

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DialogModule, ButtonModule,
    InputTextModule, InputNumberModule, TextareaModule, FileUploadModule, 
    SelectModule, Image // <-- LO AGREGAMOS AQUÍ
  ],
  templateUrl: './product-form.html'
})
export class ProductFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private mediaService = inject(MediaService);
  private messageService = inject(MessageService);

  @Input() visible: boolean = false;
  @Input() productData: Product | null = null;
  @Input() isLoading: boolean = false;
  
  @Output() onSave = new EventEmitter<Product>();
  @Output() onCancel = new EventEmitter<void>();

  productForm!: FormGroup;
  submitted: boolean = false;
  isUploading: boolean = false;

  statuses = [
    { label: 'ACTIVO', value: 'ACTIVO' },
    { label: 'INACTIVO', value: 'INACTIVO' },
    { label: 'AGOTADO', value: 'AGOTADO' }
  ];

  ngOnInit() {
    this.productForm = this.fb.group({
      idProducto: [null],
      nombre: ['', Validators.required],
      idReferencia: ['', Validators.required],
      descripcion: [''],
      descripcionPrivada: [''],
      precioVenta: [null, [Validators.required, Validators.min(0)]],
      precioCompra: [null, [Validators.required, Validators.min(0)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      estado: ['ACTIVO', Validators.required],
      imagenUrl: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productData'] && this.productForm) {
      if (this.productData) {
        this.productForm.patchValue(this.productData);
      } else {
        this.productForm.reset({ estado: 'ACTIVO', precioVenta: 0, precioCompra: 0, stock: 0 });
      }
      this.submitted = false;
    }
  }

  onUpload(event: any) {
    const file = event.files[0];
    if (!file) return;

    this.isUploading = true;
    this.mediaService.uploadImage(file).subscribe({
      next: (response) => {
        this.productForm.patchValue({ imagenUrl: response.url });
        this.isUploading = false;
        this.messageService.add({ severity: 'success', summary: 'Imagen', detail: 'Subida correctamente' });
      },
      error: () => {
        this.isUploading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Fallo al subir imagen' });
      }
    });
  }

  save() {
    this.submitted = true;
    if (this.productForm.invalid) return;
    this.onSave.emit(this.productForm.value);
  }

  cancel() {
    this.onCancel.emit();
  }
}