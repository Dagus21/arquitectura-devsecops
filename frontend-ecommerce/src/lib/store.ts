import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  idProducto: number;
  nombre: string;
  precioVenta: number;
  cantidad: number;
  imagenUrl?: string;
  stock: number; // NUEVO: Guardamos el stock real
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any, quantity?: number) => void; 
  removeItem: (id: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:[],
      
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(i => i.idProducto === product.idProducto);
        
        // Extraer stock con fallback (por si acaso el backend manda null)
        const productStock = product.stock || 0;

        if (existingItem) {
          const nuevaCantidad = existingItem.cantidad + quantity;
          
          // Validar que no supere el stock al intentar agregar más
          if (nuevaCantidad > productStock) {
            throw new Error(`Solo quedan ${productStock} unidades disponibles en total.`);
          }

          set({
            items: currentItems.map(i => 
              i.idProducto === product.idProducto 
                ? { ...i, cantidad: nuevaCantidad } 
                : i
            )
          });
        } else {
          // Validar stock al agregar por primera vez
          if (quantity > productStock) {
            throw new Error(`Solo quedan ${productStock} unidades disponibles.`);
          }
          
          set({
            items:[...currentItems, { 
              idProducto: product.idProducto, 
              nombre: product.nombre, 
              precioVenta: product.precioVenta, 
              cantidad: quantity,
              imagenUrl: product.imagenUrl,
              stock: productStock // Lo guardamos en el carrito
            }]
          });
        }
      },

      removeItem: (id) => set({ items: get().items.filter(i => i.idProducto !== id) }),
      
      clearCart: () => set({ items:[] }),

      total: () => get().items.reduce((acc, item) => acc + (item.precioVenta * item.cantidad), 0)
    }),
    { name: 'shopping-cart' } // Guarda en localStorage para persistencia
  )
);