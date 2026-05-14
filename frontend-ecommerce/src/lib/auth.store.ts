import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  email: string;
  nombre: string;
  rol: string;
}

interface AuthStore {
  user: User | null;
  isAuth: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuth: false,
      login: (user) => set({ user, isAuth: true }),
      logout: () => set({ user: null, isAuth: false }),
    }),
    { name: 'auth-storage' } // Se guarda en localStorage para persistir al F5
  )
);