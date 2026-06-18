import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Sun, Moon, Monitor, LogOut, Globe } from 'lucide-react';
import { Logo } from '../components/Logo';
import { NotificationBell } from '../components/admin/NotificationBell';
import { useTheme } from '../lib/ThemeContext';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';

import type { Rol } from '../lib/AuthContext';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  end?: boolean;
  roles?: Rol[]; // si se define, sólo estos roles ven el ítem
}

export function AppShell({ title, items }: { title: string; items: NavItem[] }) {
  const [open, setOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const salir = () => {
    logout();
    navigate('/');
  };

  const visibles = items.filter((it) => !it.roles || (usuario && it.roles.includes(usuario.rol)));

  const nav = (
    <nav className="flex flex-col gap-1">
      {visibles.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isActive
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]'
            )
          }
        >
          <it.icon size={18} />
          {it.label}
        </NavLink>
      ))}
    </nav>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6">
        <Logo className="scale-90 origin-left" />
        <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--primary)]">{title}</div>
      </div>
      <div className="flex-1 px-3 overflow-y-auto">{nav}</div>
      <div className="p-3 border-t border-[var(--border)]">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition-colors"
        >
          <Globe size={18} /> Ver sitio público
        </Link>
        <button
          onClick={salir}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 border-r border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--border)] bg-[var(--background)] lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-8 h-16 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
          <button
            className="lg:hidden p-2 -ml-2 text-[var(--foreground)]"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-full p-1">
              <button onClick={() => setTheme('light')} aria-label="Tema claro" aria-pressed={theme === 'light'} className={cn('p-1.5 rounded-full transition-all', theme === 'light' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)]')}><Sun size={14} /></button>
              <button onClick={() => setTheme('dark')} aria-label="Tema oscuro" aria-pressed={theme === 'dark'} className={cn('p-1.5 rounded-full transition-all', theme === 'dark' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)]')}><Moon size={14} /></button>
              <button onClick={() => setTheme('system')} aria-label="Tema del sistema" aria-pressed={theme === 'system'} className={cn('p-1.5 rounded-full transition-all', theme === 'system' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)]')}><Monitor size={14} /></button>
            </div>
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold">{usuario?.nombre}</span>
              <span className="text-xs text-[var(--muted)]">{usuario?.empresa ?? usuario?.email}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-bold">
              {usuario?.nombre?.charAt(0) ?? 'T'}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
