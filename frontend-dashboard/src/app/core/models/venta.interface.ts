export interface VentaResumen {
    idVenta: number;
    fecha: string;
    totalVenta: number;
    estado: string;
    metodoPago: string;
    idTransaccion?: string;
    emailUsuario: string;
    nombreUsuario: string;
    cantidadItems: number;
    canal?: string;
}

export interface CheckoutItem {
    idProducto: number;
    cantidad: number;
}

export interface CheckoutRequest {
    items: CheckoutItem[];
    idempotencyKey: string;
}