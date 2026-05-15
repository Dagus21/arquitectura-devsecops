'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { XCircle, Loader2 } from 'lucide-react';

function CheckoutFailureContent() {
  const router = useRouter();

  return (
    <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-gray-200">
      <div className="flex justify-center">
        <div className="rounded-full bg-red-100 p-3">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Pago Cancelado o Rechazado</h1>
        <p className="text-gray-500">
          Decidiste volver atrás o tu método de pago fue rechazado. No se te ha cobrado nada.
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

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<Loader2 className="w-12 h-12 animate-spin text-[#000E29]" />}>
        <CheckoutFailureContent />
      </Suspense>
    </div>
  );
}