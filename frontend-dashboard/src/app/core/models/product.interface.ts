export interface Product {
    idProducto: number;
    idReferencia: string;
    nombre: string;
    descripcion: string;
    descripcionPrivada?: string; // <--- AÑADIR ESTA LÍNEA (opcional con '?')
    precioVenta: number;
    precioCompra: number;
    stock: number;
    estado: string; // 'ACTIVO', 'INACTIVO'
    imagenUrl: string;
    proveedorId?: number;
}