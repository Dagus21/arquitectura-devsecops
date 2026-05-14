import { API_URL } from '@/lib/api'; // Asegúrate de tener exportada tu URL base

export const authService = {
  async login(credentials: { email: string; password: string }) {
    // Nota: El backend espera "username", mapeamos email a username
    const payload = { username: credentials.email, password: credentials.password };
    
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // <--- OBLIGATORIO PARA COOKIES
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Credenciales incorrectas');
    return res.json(); // Devuelve { email, nombre, rol ... }
  },

   // --- NUEVA FUNCIÓN ---
  async register(userData: { nombre: string; email: string; password: string }) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Error al registrar la cuenta');
    }
    return res.json();
  },

  async logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, { 
            method: 'POST', 
            credentials: 'include' 
        });
    } catch (e) {
        console.error("Error al cerrar sesión en servidor", e);
    }
  }
};