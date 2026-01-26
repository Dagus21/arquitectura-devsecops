import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { MediaService } from '../../../core/services/media.service'; // <--- NUEVO
import { Product } from '../../../core/models/product.interface';
import { MessageService } from 'primeng/api';

// --- PrimeNG Imports ---
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog'; // <--- NUEVO
import { InputNumberModule } from 'primeng/inputnumber'; // <--- NUEVO
import { TextareaModule } from 'primeng/textarea'; 
import { FileUploadModule } from 'primeng/fileupload'; // <--- NUEVO
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    TableModule, 
    ButtonModule, 
    TagModule, 
    TooltipModule,
    IconFieldModule, 
    InputIconModule, 
    InputTextModule,
    DialogModule,
    InputNumberModule,
    TextareaModule,
    FileUploadModule,
    SelectModule,
    ToastModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private mediaService = inject(MediaService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  products: Product[] = [];
  isLoading = true;
  
  // Variables del Modal
  productDialog: boolean = false;
  productForm!: FormGroup;
  submitted: boolean = false;
  isUploading: boolean = false; // Para mostrar spinner mientras sube foto

  statuses = [
    { label: 'ACTIVO', value: 'ACTIVO' },
    { label: 'INACTIVO', value: 'INACTIVO' },
    { label: 'AGOTADO', value: 'AGOTADO' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadProducts();
  }

  initForm() {
    this.productForm = this.fb.group({
      idProducto: [null], // Nulo al crear
      nombre: ['', Validators.required],
      idReferencia: ['', Validators.required], // SKU
      descripcion: [''],
      precioVenta: [null, [Validators.required, Validators.min(0)]],
      precioCompra: [null, [Validators.required, Validators.min(0)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      estado: ['ACTIVO', Validators.required],
      imagenUrl: [''] // Aquí guardamos la URL que nos da MinIO
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => { 
        this.isLoading = false; 
        console.error(err);
      }
    });
  }

  openNew() {
    this.productForm.reset();
    this.productForm.patchValue({ estado: 'ACTIVO' });
    this.submitted = false;
    this.productDialog = true;
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  // --- LÓGICA DE SUBIDA DE IMAGEN ---
  onUpload(event: any) {
    // PrimeNG devuelve el archivo en event.files[0]
    const file = event.files[0];
    if (!file) return;

    this.isUploading = true;
    
    // Llamamos a nuestro servicio (y este al backend)
    this.mediaService.uploadImage(file).subscribe({
        next: (response) => {
            // El backend nos devuelve { "url": "https://..." }
            this.productForm.patchValue({ imagenUrl: response.url });
            this.isUploading = false;
            this.messageService.add({ severity: 'success', summary: 'Imagen Cargada', detail: 'La imagen se subió correctamente.' });
        },
        error: (err) => {
            this.isUploading = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen.' });
            console.error(err);
        }
    });
  }

  saveProduct() {
    this.submitted = true;

    if (this.productForm.invalid) {
        return;
    }

    const productData = this.productForm.value;

    this.isLoading = true;

    // Aquí decidimos si es CREAR o ACTUALIZAR (por ahora CREAR)
    if (productData.idProducto) {
        // Lógica de actualizar (pendiente)
    } else {
        this.productService.createProduct(productData).subscribe({
            next: (newProduct) => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto creado correctamente' });
                this.products.push(newProduct); // Agregamos a la tabla sin recargar
                this.isLoading = false;
                this.hideDialog();
            },
            error: (err) => {
                this.isLoading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el producto' });
                console.error(err);
            }
        });
    }
  }

  getSeverity(estado: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (estado) {
        case 'ACTIVO': return 'success';
        case 'INACTIVO': return 'danger';
        case 'AGOTADO': return 'warn';
        default: return 'info';
    }
  }
}