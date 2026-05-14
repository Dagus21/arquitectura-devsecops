'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth.store';
import { authService } from '@/features/auth/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });

  // Función de validación del lado del cliente
  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
      isValid = false;
    }

    if (form.password.trim() === '') {
      newErrors.password = 'La contraseña es obligatoria';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return; // Si hay errores, no envía la petición

    setLoading(true);
    try {
      const data = await authService.login(form);
      
      loginStore({
        email: data.email,
        nombre: data.nombre,
        rol: data.rol
      });

      toast.success(`Bienvenido, ${data.nombre}`);
      router.push('/'); 
    } catch (error) {
      toast.error('Error: Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
      
      {/* Botón de Regreso */}
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10">
        <Link href="/" className="flex items-center text-gray-600 hover:text-[#000E29] transition-colors font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver al catálogo
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-xl border-gray-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <p className="text-center text-gray-500 text-sm">Ingresa a tu cuenta para comprar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Correo Electrónico</label>
              <Input 
                type="email" 
                placeholder="tu@correo.com"
                value={form.email}
                onChange={(e) => {
                  setForm({...form, email: e.target.value});
                  if(errors.email) setErrors({...errors, email: ''}); // Limpia error al escribir
                }}
                className={errors.email ? 'border-red-500 focus-visible:ring-red-200' : ''}
              />
              {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Contraseña</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Tu contraseña"
                  value={form.password}
                  onChange={(e) => {
                    setForm({...form, password: e.target.value});
                    if(errors.password) setErrors({...errors, password: ''});
                  }}
                  className={errors.password ? 'border-red-500 focus-visible:ring-red-200 pr-10' : 'pr-10'}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
            </div>

            <Button className="w-full bg-[#000E29] hover:bg-[#001B4B] py-6 mt-2" type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Ingresar'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
             <p className="text-gray-500">
               ¿Aún no tienes cuenta?{' '}
               <Link href="/register" className="text-blue-600 hover:underline font-bold">
                 Regístrate aquí
               </Link>
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}