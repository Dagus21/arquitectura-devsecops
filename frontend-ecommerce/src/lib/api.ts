// Lógica inteligente:
// Si esto se ejecuta en el navegador (window existe), usamos nuestro proxy oculto
// Si se ejecuta en el Servidor de Next.js, llamamos a la API real directamente.
export const API_URL = typeof window !== 'undefined'
  ? '/api'   // <--- ¡ELIMINAMOS EL -proxy!
  : process.env.NEXT_PUBLIC_API_URL;

export const formatPrice = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};