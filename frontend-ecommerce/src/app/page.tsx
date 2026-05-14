// src/app/page.tsx
import Navbar from '@/components/layout/Navbar';
import { ShieldCheck, Truck, Store } from 'lucide-react';
import { getProducts } from '@/features/products/services/product.service';
import ProductCatalog from '@/components/ProductCatalog'; // <-- IMPORTAMOS EL NUEVO COMPONENTE

export default async function Home() {
  // Obtenemos los productos en el servidor
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-[#fbf8fb] flex flex-col">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-gray-100 py-20 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#000E29] tracking-tight">
            Abrígate con Estilo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Descubre nuestra colección de gorros, guantes, bufandas y artículos de abrigo. La mejor calidad para protegerte del frío, directo en Misceláneas David.
          </p>
        </div>
      </section>

      {/* PRODUCT GRID SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full flex-grow">
        <div className="flex flex-col mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Productos</h2>
          <p className="text-gray-500 mt-1">Encuentra los artículos ideales filtrando por nombre o rango de precio.</p>
        </div>

        {/* --- AQUÍ USAMOS NUESTRO CATÁLOGO FILTRABLE --- */}
        <ProductCatalog products={products} />

      </section>

      {/* FEATURES BANNER */}
      <section className="bg-white border-y border-gray-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Store className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-gray-900">Recogida en Tienda</h4>
            <p className="text-sm text-gray-500 px-4">Paga online y recoge tu pedido en nuestro establecimiento sin filas.</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Truck className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-gray-900">Envíos Nacionales</h4>
            <p className="text-sm text-gray-500 px-4">Envíos a todo el país bajo coordinación directa con nosotros tras tu compra.</p>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-gray-900">Pagos Protegidos</h4>
            <p className="text-sm text-gray-500 px-4">Transacciones 100% encriptadas y seguras procesadas por Mercado Pago.</p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#000E29] text-gray-400 py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} Misceláneas David. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}