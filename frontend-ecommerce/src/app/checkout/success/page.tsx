'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/store';

// 1. Extraemos la lógica que usa useSearchParams a un sub-componente
function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);

  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    // Limpiamos el carrito apenas el usuario llega a esta página
    clearCart(); 
    console.log("Compra exitosa. Payment ID:", paymentId);
  }, [clearCart, paymentId]); 

  return (
    <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">¡Pago Exitoso!</h1>
        <p className="text-gray-500">
          Tu orden ha sido confirmada. Te hemos enviado los detalles a tu correo.
        </p>
        {paymentId && (
          <p className="text-sm text-gray-400">Ref. Pago: {paymentId}</p>
        )}
      </div>

      <Button 
        className="w-full bg-[#000E29] hover:bg-[#001B4B]"
        onClick={() => router.push('/')}
      >
        Volver a la Tienda
      </Button>
    </Card>
  );
}

// 2. El componente principal envuelve al sub-componente en un Suspense boundary
export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* 
        El Suspense le dice a Next.js: "No intentes pre-renderizar lo que está adentro durante el build. 
        Muestra el fallback (el loader girando) y carga el contenido real cuando el navegador esté listo". 
      */}
      <Suspense fallback={<Loader2 className="w-12 h-12 animate-spin text-[#000E29]" />}>
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  );
}