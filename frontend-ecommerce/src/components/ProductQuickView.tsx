'use client';

import { useState } from 'react';
import Image from 'next/image'; // <-- IMPORTACIÓN DE NEXT.JS
import { Product } from '@/features/products/types/product.interface';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, ImageIcon, Plus, Minus, X, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';

interface Props {
  product: Product;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ProductQuickView({ product, isOpen, setIsOpen }: Props) {
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false); 

  const itemEnCarrito = cartItems.find((i) => i.idProducto === product.idProducto);
  const cantidadYaEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
  
  const maxStock = product.stock || 0;
  const stockDisponibleParaAgregar = maxStock - cantidadYaEnCarrito;
  
  const isMaxReached = quantity >= stockDisponibleParaAgregar;
  const sinStockRestante = stockDisponibleParaAgregar <= 0;

  const handleAdd = () => {
    try {
      addItem(product, quantity);
      toast.success(`${quantity} x ${product.nombre} agregado al carrito`);
      setIsOpen(false);
      setQuantity(1); 
    } catch (error: any) {
      toast.error(error.message); 
    }
  };

  const increment = () => { if (!isMaxReached) setQuantity((prev) => prev + 1); };
  const decrement = () => setQuantity((prev) => Math.max(prev - 1, 1));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setIsZoomed(false); 
      }}>
        <DialogContent className="w-[95vw] sm:max-w-[700px] p-0 bg-white border-none shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto sm:overflow-hidden flex flex-col sm:block">
          
          <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-white/90 backdrop-blur-md p-2 shadow-md hover:bg-white transition-colors">
            <X className="w-5 h-5 text-gray-800" />
          </DialogClose>

          <div className="flex flex-col sm:flex-row h-full relative">
            
            <div 
              className={`w-full sm:w-2/5 bg-gray-50 flex items-center justify-center h-64 sm:h-auto sm:min-h-[400px] border-b sm:border-b-0 sm:border-r border-gray-100 relative shrink-0 group ${product.imagenUrl ? 'cursor-zoom-in' : ''}`}
              onClick={() => product.imagenUrl && setIsZoomed(true)}
            >
              {product.imagenUrl ? (
                <>
                  <Image 
                    src={product.imagenUrl} 
                    alt={product.nombre} 
                    width={500}
                    height={500}
                    className="object-cover w-full h-full absolute inset-0" 
                  />
                  
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/95 rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <ZoomIn className="w-6 h-6 text-[#000E29]" />
                    </div>
                  </div>
                </>
              ) : (
                <ImageIcon className="w-20 h-20 text-gray-200" />
              )}
            </div>

            <div className="w-full sm:w-3/5 p-6 sm:p-8 flex flex-col flex-grow">
              <DialogHeader className="mb-4 sm:mb-6 text-left space-y-1 mt-2 sm:mt-0">
                <DialogTitle className="text-2xl sm:text-3xl font-extrabold text-[#000E29] leading-tight pr-10">
                  {product.nombre}
                </DialogTitle>
                <DialogDescription className="sr-only">Detalles de {product.nombre}</DialogDescription>
                <div className="text-2xl sm:text-3xl font-black text-blue-600">
                  {formatPrice(product.precioVenta)}
                </div>
              </DialogHeader>

              <div className="flex-grow mb-6 sm:mb-8">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 sm:mb-3">Descripción del Producto</h4>
                <p className="text-gray-600 leading-relaxed overflow-y-auto max-h-32 pr-2 text-sm text-justify">
                  {product.descripcion || "Diseño minimalista y funcional. Producto cuidadosamente seleccionado con los más altos estándares de calidad."}
                </p>
              </div>

              <div className="mt-auto bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                {sinStockRestante ? (
                   <div className="text-center p-3 bg-orange-100 text-orange-800 rounded-lg font-medium border border-orange-200">
                     Ya tienes todas las unidades disponibles en tu carrito.
                   </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700">Cantidad:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
                        <button onClick={decrement} className="p-2 hover:bg-gray-100 text-gray-600 active:bg-gray-200"><Minus className="w-4 h-4" /></button>
                        <span className="w-12 text-center font-bold text-[#000E29]">{quantity}</span>
                        <button onClick={increment} disabled={isMaxReached} className={`p-2 ${isMaxReached ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600 active:bg-gray-200'}`}><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {cantidadYaEnCarrito > 0 && (
                      <p className="text-xs text-blue-600 font-medium text-right -mt-2">
                        Ya tienes {cantidadYaEnCarrito} en el carrito. Puedes agregar {stockDisponibleParaAgregar} más.
                      </p>
                    )}
                    <Button onClick={handleAdd} className="w-full bg-[#000E29] hover:bg-[#001B4B] py-6 text-base rounded-xl shadow-lg transition-all">
                      <ShoppingCart className="w-5 h-5 mr-2" /> Agregar {quantity > 1 ? `(${quantity})` : ''}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isZoomed && product.imagenUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-10 backdrop-blur-sm animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-6 right-6 sm:top-10 sm:right-10 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 sm:p-3 transition-all active:scale-95"
            onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          
          <img src={product.imagenUrl} alt={product.nombre} className="max-w-full max-h-full object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }} />
        </div>
      )}
    </>
  );
}