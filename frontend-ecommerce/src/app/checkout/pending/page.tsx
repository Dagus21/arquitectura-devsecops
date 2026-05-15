'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/store';

function CheckoutPendingContent() {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Si queda pendiente, limpiamos el carrito igual porque la orden ya existe en BD
    clearCart(); 
  }, [clearCart]); 

  return (
    <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-gray-200">
      <div className="flex justify-center">
        <div className="rounded-full bg-yellow-100 p-3">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Pago Pendiente</h1>
        <p className="text-gray-500">
          Estamos esperando la confirmación del pago. Te notificaremos en tu dashboard cuando se acredite.
        </p>
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

export default function CheckoutPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<Loader2 className="w-12 h-12 animate-spin text-[#000E29]" />}>
        <CheckoutPendingContent />
      </Suspense>
    </div>
  );
}