import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)
}

// --- FUNCIÓN MODIFICADA: Ya no usa proxy, devuelve la original de S3 ---
export function getProxiedImageUrl(originalUrl?: string) {
  if (!originalUrl) return '';
  
  // Como ya no usamos proxy, devolvemos la URL segura directa de S3
  return originalUrl;
}