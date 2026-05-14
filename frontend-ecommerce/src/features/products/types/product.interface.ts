// src/features/products/types/product.interface.ts

export interface Product {
    idProducto: number;
    nombre: string;
    descripcion: string;
    precioVenta: number;
    stock?: number;        // Lo hacemos opcional (?)
    estado: string;
    imagenUrl: string;
    disponible?: boolean;  // NUEVO: Agregamos el campo que faltaba
}