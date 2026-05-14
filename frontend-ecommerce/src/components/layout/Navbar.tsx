'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/auth.store';
import CartDrawer from '@/features/cart/CartDrawer';
import { toast } from 'sonner';

export default function Navbar() {
  const router = useRouter();
  const { isAuth, user, logout } = useAuthStore();
  const[isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  },[]);

  return (
    <nav className="bg-white/80 backdrop-blur-md text-[#000E29] font-sans text-sm font-medium tracking-tight sticky top-0 z-50 border-b border-gray-100 shadow-sm w-full">
      <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">
        
       {/* Logo */}
        <div 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          {/* Asume que guardaste tu búho como logo.png en la carpeta public */}
          <img src="/logo.svg" alt="Misceláneas David Logo" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
          <div className="text-2xl font-extrabold text-[#000E29] tracking-tighter group-hover:text-blue-700 transition-colors duration-200">
            Misceláneas <span className="font-light">David</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          {isMounted && isAuth ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm text-gray-600 font-medium">
                Hola, {user?.nombre?.split(' ')[0]}
              </span>
              <button 
                onClick={() => { logout(); toast.info('Sesión cerrada'); router.push('/login'); }}
                className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-gray-700 active:scale-95 duration-150"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 active:scale-95 duration-150"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Ingresar</span>
            </button>
          )}

          {/* Nuestro nuevo componente de carrito */}
          <CartDrawer />
        </div>
      </div>
    </nav>
  );
}