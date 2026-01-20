export interface Product {
    idProducto: number;
    idReferencia: string;
    nombre: string;
    descripcion: string;
    precioVenta: number;
    precioCompra: number;
    stock: number;
    estado: string; // 'ACTIVO', 'INACTIVO'
    imagenUrl: string;
    proveedorId?: number;
}