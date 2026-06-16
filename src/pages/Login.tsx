import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Mail, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { useAuth, Rol } from '../lib/AuthContext';
import { cn } from '../lib/utils';

const rolesDemo: { rol: Rol; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { rol: 'gerente', label: 'Terabound', icon: ShieldCheck },
  { rol: 'cliente', label: 'Cliente', icon: UserRound },
];

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [rol, setRol] = React.useState<Rol>('gerente');

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    login(rol);
    navigate(rol === 'cliente' ? '/portal' : '/app');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel marca */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 bg-[var(--primary)] text-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[120px] rounded-full -translate-y-1/3 translate-x-1/3" />
        <Link to="/" className="relative z-10 flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100">
          <ArrowLeft size={16} /> Volver al sitio
        </Link>
        <div className="relative z-10">
          <h1 className="text-5xl font-black leading-tight mb-6">Terabound<br />Web OS</h1>
          <p className="text-lg opacity-90 max-w-md leading-relaxed">
            Una sola plataforma para operar la empresa y acompañar a cada cliente.
            Integridad, datos y operación en una sola fuente de verdad.
          </p>
        </div>
        <p className="relative z-10 text-sm opacity-70">© 2026 Terabound. Acceso seguro.</p>
      </div>

      {/* Panel acceso */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="lg:hidden mb-8">
          <Logo />
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold mb-2">Acceder</h2>
          <p className="text-[var(--muted)] mb-8">Ingresá a tu cuenta de Terabound.</p>

          <form onSubmit={entrar} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  id="email"
                  type="email"
                  placeholder="tu@terabound.com"
                  className="w-full rounded-xl bg-[var(--card)] border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[var(--card)] border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors"
                />
              </div>
            </div>

            {/* Modo demo — selector de rol (temporal hasta conectar la BD) */}
            <div className="mt-2 p-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/40">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] mb-3">
                Modo demo · ingresar como
              </div>
              <div className="grid grid-cols-2 gap-2">
                {rolesDemo.map((r) => (
                  <button
                    key={r.rol}
                    type="button"
                    onClick={() => setRol(r.rol)}
                    aria-pressed={rol === r.rol}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all',
                      rol === r.rol
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-[var(--background)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]/40'
                    )}
                  >
                    <r.icon size={18} />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" className="gap-2 mt-2 w-full">
              Entrar <ArrowRight size={18} />
            </Button>
          </form>

          <p className="text-xs text-[var(--muted)] mt-6 leading-relaxed">
            Acceso de demostración con datos de ejemplo. El selector de rol es temporal: al
            conectar la base de datos, el rol vendrá de tu cuenta y este bloque desaparece.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
