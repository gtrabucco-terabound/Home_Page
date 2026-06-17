import React from 'react';

// Auth real propia (JWT). El token se guarda en localStorage; el rol/empresa vienen de /api/auth/me.
export type Rol = 'gerente' | 'desarrollador' | 'cliente';

export interface Usuario {
  nombre: string;
  email: string;
  rol: Rol;
  empresa?: string | null;
}

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<Usuario>;
  logout: () => void;
}

const TOKEN_KEY = 'terabound.token';
const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function getToken(): string | null {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = React.useState<Usuario | null>(null);
  const [cargando, setCargando] = React.useState(true);

  // Al montar: si hay token, validar contra /api/auth/me.
  React.useEffect(() => {
    const token = getToken();
    if (!token) { setCargando(false); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setUsuario(d.user))
      .catch(() => { window.localStorage.removeItem(TOKEN_KEY); })
      .finally(() => setCargando(false));
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error ?? 'No se pudo iniciar sesión');
    window.localStorage.setItem(TOKEN_KEY, d.token);
    setUsuario(d.user);
    return d.user as Usuario;
  }, []);

  const logout = React.useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
