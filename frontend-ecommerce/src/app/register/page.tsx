'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/features/auth/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [errors, setErrors] = useState({ nombre: '', email: '', password: '' });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { nombre: '', email: '', password: '' };

    // Validar Nombre: Solo letras, espacios, acentos y mínimo 3 caracteres
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
    if (!nameRegex.test(form.nombre)) {
      newErrors.nombre = 'El nombre solo debe contener letras (mín. 3 caracteres)';
      isValid = false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
      isValid = false;
    }

    // Validar Contraseña
    if (form.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return; // Frena el envío si hay errores de formato

    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Cuenta creada exitosamente. Por favor, inicia sesión.');
      router.push('/login'); 
    } catch (error: any) {
      const errorMessage = error.message || 'Error al registrarse';
      
      // NUEVO: Si el backend nos dice que el correo ya existe, pintamos el campo de rojo
      if (errorMessage.toLowerCase().includes('registrado') || errorMessage.toLowerCase().includes('correo')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else {
        // Para cualquier otro tipo de error (ej. se cayó el internet), usamos el Toast
        toast.error(errorMessage);
      }
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

      <Card className="w-full max-w-md shadow-xl border-gray-200 mt-10 sm:mt-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
          <p className="text-center text-gray-500 text-sm">Únete a Misceláneas David</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Nombre Completo</label>
              <Input 
                type="text" 
                placeholder="Ej. Nombre_sustentacion"
                value={form.nombre}
                onChange={(e) => {
                  setForm({...form, nombre: e.target.value});
                  if(errors.nombre) setErrors({...errors, nombre: ''});
                }}
                className={errors.nombre ? 'border-red-500 focus-visible:ring-red-200' : ''}
              />
              {errors.nombre && <p className="text-xs text-red-500 font-medium">{errors.nombre}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Correo Electrónico</label>
              <Input 
                type="email" 
                placeholder="tu@correo.com"
                value={form.email}
                onChange={(e) => {
                  setForm({...form, email: e.target.value});
                  if(errors.email) setErrors({...errors, email: ''});
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
                  placeholder="Mínimo 6 caracteres"
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
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Registrarme'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
             <p className="text-gray-500">
               ¿Ya tienes cuenta?{' '}
               <Link href="/login" className="text-blue-600 hover:underline font-bold">
                 Inicia sesión
               </Link>
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}