import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- AGREGA ESTO ---
export function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)
}

// --- AGREGA ESTA NUEVA FUNCIÓN ---
export function getProxiedImageUrl(originalUrl?: string) {
  if (!originalUrl) return '';
  
  // Reemplazamos el origen real de MinIO por nuestra ruta proxy oculta
  return originalUrl.replace(
    'https://s3.miscelaneasdavid.shop/productos-imagenes',
    '/media-proxy'
  );
}