import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Mail, Lock } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { useAuth } from '../lib/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const u = await login(email, password);
      navigate(u.rol === 'cliente' ? '/portal' : '/app');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
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
        <div className="lg:hidden mb-8"><Logo /></div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold mb-2">Acceder</h2>
          <p className="text-[var(--muted)] mb-8">Ingresá a tu cuenta de Terabound.</p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@terabound.com"
                  className="w-full rounded-xl bg-[var(--card)] border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors" />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[var(--card)] border border-[var(--border)] pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors" />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" size="lg" className="gap-2 mt-2 w-full" disabled={busy}>
              {busy ? 'Ingresando…' : <>Entrar <ArrowRight size={18} /></>}
            </Button>
          </form>

          <p className="text-xs text-[var(--muted)] mt-6 leading-relaxed">
            Acceso seguro a Terabound Web OS. Si no tenés cuenta, pedila a tu administrador.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
