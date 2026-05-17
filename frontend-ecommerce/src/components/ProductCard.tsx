'use client';

import { useState } from 'react';
import { Product } from '@/features/products/types/product.interface';
import { formatPrice } from '@/lib/utils';
import { ImageIcon, Info, Eye, X } from 'lucide-react';
import ProductQuickView from './ProductQuickView'; 

export default function ProductCard({ product }: { product: Product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const isAgotado = product.disponible === false || product.estado === 'AGOTADO';

  return (
    <>
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        
        {/* Imagen */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
          {product.imagenUrl ? (
            <img 
              src={product.imagenUrl} 
              alt={product.nombre} 
              onClick={() => setIsModalOpen(true)}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            />
          ) : (
            <ImageIcon className="w-12 h-12 text-gray-300" />
          )}
          
          <div className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-md text-white shadow-sm ${isAgotado ? 'bg-red-500' : 'bg-blue-600'}`}>
            {isAgotado ? 'AGOTADO' : 'EN STOCK'}
          </div>

          {product.imagenUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                setIsZoomed(true);   
              }}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-gray-700 hover:text-[#000E29] transition-all duration-200 opacity-100 md:opacity-0 group-hover:opacity-100 z-10 active:scale-95"
              title="Inspeccionar foto"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Detalles en la Tarjeta */}
        <div className="p-5 flex flex-col flex-grow gap-2">
          <h3 className="text-gray-900 font-semibold text-base flex-grow line-clamp-2 leading-tight">
            {product.nombre}
          </h3>
          <div className="text-2xl font-bold text-[#000E29] mt-2">
            {formatPrice(product.precioVenta)}
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={isAgotado}
            className={`w-full mt-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95
              ${isAgotado 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#000E29] text-white hover:bg-[#001B4B] shadow-md hover:shadow-lg'
              }`}
          >
            {isAgotado ? 'Sin disponibilidad' : (
              <>
                <Info className="w-5 h-5" /> Ver detalle
              </>
            )}
          </button>
        </div>
      </article>

      <ProductQuickView 
        product={product} 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
      />

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
          
          <img 
            src={product.imagenUrl} 
            alt={product.nombre} 
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
          />
        </div>
      )}
    </>
  );
}