'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '@/lib/api';

import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth.store';
import { formatPrice, getProxiedImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetTrigger,SheetDescription} from '@/components/ui/sheet';

export default function CartDrawer() {
  const router = useRouter();
  const { items, total, removeItem } = useCartStore();
  const { isAuth, logout } = useAuthStore();
  
  const [paying, setPaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const idempotencyKeyRef = useRef<string>('');

  // Hidratación y generación de llave única
  useEffect(() => {
    setIsMounted(true);
  },[]);

  useEffect(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
  }, [items]);

  const handleCheckout = async () => {
    if (!isAuth) {
      toast.warning('Debes iniciar sesión para procesar tu compra');
      router.push('/login');
      return;
    }

    // Validación extra lado cliente: Verificar si hay items en el carrito cuyo stock se superó 
    const itemsExcedidos = items.filter((item) => item.cantidad > (item.stock || 0));
    if (itemsExcedidos.length > 0) {
      toast.error(`Error: Algunos productos superan el stock actual. Por favor revisa el carrito.`);
      return;
    }

    setPaying(true);

    try {
      const payload = {
        items: items.map((item) => ({
          idProducto: item.idProducto,
          cantidad: item.cantidad,
        })),
        idempotencyKey: idempotencyKeyRef.current, // Escudo anti doble-click
      };

      const res = await fetch(`${API_URL}/ventas/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.status === 403 || res.status === 401) {
        toast.error('Tu sesión ha expirado. Ingresa nuevamente.');
        logout();
        router.push('/login');
        return;
      }

      // MANEJO MEJORADO DE ERRORES DEL BACKEND (Ej: Código 400)
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || errorData?.message || 'Error de validación al procesar la venta';
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      // Mostrará el error en la interfaz en lugar de dejarlo silenciado en la consola
      toast.error(error.message || 'Error de conexión con el servidor');
    } finally {
      setPaying(false);
    }
  };

  if (!isMounted) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#000E29] text-white rounded-lg hover:bg-[#001B4B] transition-colors relative shadow-sm active:scale-95 duration-150">
          <ShoppingCart className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Carrito</span>
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">
              {items.length}
            </span>
          )}
        </button>
      </SheetTrigger>
      
      {/* FONDO GRIS CLARO PARA EL PANEL */}
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-slate-100 p-6">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-[#000E29]">Tu Carrito</SheetTitle>
          {/* ACCESIBILIDAD: Elimina warning amarillo */}
          <SheetDescription className="sr-only">
            Revisa los productos agregados a tu carrito y procede al pago.
          </SheetDescription>
        </SheetHeader>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <ShoppingCart className="w-12 h-12 opacity-50" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.idProducto} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-md border border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                  {item.imagenUrl ? (
                    <img src={getProxiedImageUrl(item.imagenUrl)} alt={item.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingCart className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{item.nombre}</h4>
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    {item.cantidad} x {formatPrice(item.precioVenta)}
                  </p>
                  {/* Etiqueta visual si hay problemas de stock */}
                  {item.cantidad > (item.stock || 0) && (
                    <span className="text-xs text-red-500 font-bold block mt-1">
                      ¡Supera stock actual! ({item.stock})
                    </span>
                  )}
                </div>
                {/* BOTÓN ELIMINAR */}
                <button 
                  onClick={() => removeItem(item.idProducto)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer del Carrito */}
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Total:</span>
            <span className="text-2xl font-bold text-[#000E29]">{formatPrice(total())}</span>
          </div>
          <Button 
            className="w-full bg-[#000E29] hover:bg-[#001B4B] py-6 text-lg rounded-xl shadow-lg transition-all" 
            onClick={handleCheckout}
            disabled={items.length === 0 || paying}
          >
            {paying ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                <CreditCard className="w-5 h-5 mr-2" /> Pagar Orden
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}