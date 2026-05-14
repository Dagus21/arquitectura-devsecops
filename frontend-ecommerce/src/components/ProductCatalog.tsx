// src/components/ProductCatalog.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/features/products/types/product.interface';
import { Search, Frown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils'; // Importamos tu formateador de moneda

export default function ProductCatalog({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Calcular los límites reales según la base de datos
  const minBound = products.length > 0 ? Math.min(...products.map(p => p.precioVenta)) : 0;
  const maxBound = products.length > 0 ? Math.max(...products.map(p => p.precioVenta)) : 100000;
  const range = maxBound - minBound;

  // 2. Estados para el slider
  const [minPrice, setMinPrice] = useState<number>(minBound);
  const [maxPrice, setMaxPrice] = useState<number>(maxBound);

  // Inicializar los valores cuando se carguen los productos
  useEffect(() => {
    setMinPrice(minBound);
    setMaxPrice(maxBound);
  }, [minBound, maxBound]);

  // 3. Filtrado Inteligente
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtro por Nombre
      const matchName = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      // Filtro por Rango de Precio
      const matchPrice = product.precioVenta >= minPrice && product.precioVenta <= maxPrice;

      return matchName && matchPrice;
    });
  }, [products, searchTerm, minPrice, maxPrice]);

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* --- BARRA DE BÚSQUEDA Y FILTROS --- */}
      <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        
        {/* Buscador de texto */}
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Buscar Producto</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Ej: Gorro de lana..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full bg-gray-50 border-gray-200 focus-visible:ring-[#000E29]"
            />
          </div>
        </div>
        
        {/* Rango de Precios (Dual Slider Mágico con Tailwind) */}
        <div className="w-full md:w-80 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-gray-700">Rango de Precio</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
              {formatPrice(minPrice)} - {formatPrice(maxPrice)}
            </span>
          </div>

          <div className="relative w-full h-6 flex items-center mt-1">
            {/* Fondo gris de la barra */}
            <div className="absolute w-full h-2 bg-gray-200 rounded-full"></div>

            {/* Rellenado Activo (Color azul oscuro) */}
            <div
              className="absolute h-2 bg-[#000E29] rounded-full"
              style={{
                left: `${range === 0 ? 0 : ((minPrice - minBound) / range) * 100}%`,
                right: `${range === 0 ? 0 : 100 - ((maxPrice - minBound) / range) * 100}%`,
              }}
            ></div>

            {/* Input Minimo (Transparente, solo se ve la bolita) */}
            <input
              type="range"
              min={minBound}
              max={maxBound}
              step={1000} // Saltos de a $1.000 COP
              value={minPrice}
              onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
              className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#000E29] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-10"
            />

            {/* Input Maximo (Transparente, solo se ve la bolita) */}
            <input
              type="range"
              min={minBound}
              max={maxBound}
              step={1000} // Saltos de a $1.000 COP
              value={maxPrice}
              onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
              className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#000E29] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-20"
            />
          </div>
        </div>
      </div>

      {/* --- REJILLA DE PRODUCTOS --- */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.idProducto} product={product} />
          ))}
        </div>
      ) : (
        /* Estado de "No hay resultados" */
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
          <Frown className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-xl text-gray-500 font-medium">No se encontraron productos en este rango.</p>
          <button 
            onClick={() => { setSearchTerm(''); setMinPrice(minBound); setMaxPrice(maxBound); }} 
            className="mt-4 text-blue-600 font-bold hover:underline"
          >
            Restablecer filtros
          </button>
        </div>
      )}
    </div>
  );
}