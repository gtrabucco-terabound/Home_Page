import React from 'react';

// Auth MOCK — sin backend real todavía (ver vorii-authority / client-data-policy).
// Sólo simula sesión y rol en el cliente para validar las pantallas.

export type Rol = 'gerente' | 'desarrollador' | 'cliente';

export interface Usuario {
  nombre: string;
  email: string;
  rol: Rol;
  empresa?: string;
}

interface AuthContextValue {
  usuario: Usuario | null;
  login: (rol: Rol) => void;
  logout: () => void;
}

const PERFILES: Record<Rol, Usuario> = {
  gerente: { nombre: 'Germán A. Trabucco', email: 'german@terabound.com', rol: 'gerente' },
  desarrollador: { nombre: 'Equipo Terabound', email: 'dev@terabound.com', rol: 'desarrollador' },
  cliente: { nombre: 'A. Molina', email: 'amolina@cuencasur.example', rol: 'cliente', empresa: 'Cuenca Sur Petróleo' },
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'terabound.auth.rol';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = React.useState<Usuario | null>(() => {
    if (typeof window === 'undefined') return null;
    const rol = window.localStorage.getItem(STORAGE_KEY) as Rol | null;
    return rol && PERFILES[rol] ? PERFILES[rol] : null;
  });

  const login = React.useCallback((rol: Rol) => {
    setUsuario(PERFILES[rol]);
    window.localStorage.setItem(STORAGE_KEY, rol);
  }, []);

  const logout = React.useCallback(() => {
    setUsuario(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
