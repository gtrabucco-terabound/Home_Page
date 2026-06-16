import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-[var(--muted)] mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ComponentType<{ size?: number }>;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)]"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-[var(--muted)]">{label}</span>
        {Icon && (
          <div
            className={cn(
              'p-2 rounded-lg',
              accent ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--primary)]/10 text-[var(--primary)]'
            )}
          >
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {hint && <div className="text-xs text-[var(--muted)] mt-1">{hint}</div>}
    </motion.div>
  );
}

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-[var(--border)] text-[var(--muted)]',
  success: 'bg-emerald-500/15 text-emerald-500',
  warning: 'bg-amber-500/15 text-amber-500',
  danger: 'bg-red-500/15 text-red-500',
  info: 'bg-blue-500/15 text-blue-500',
};

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={cn('inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full', toneClasses[tone])}>
      {children}
    </span>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)] overflow-hidden', className)}>
      {children}
    </div>
  );
}

export function DataTable({ columns, children }: { columns: string[]; children: React.ReactNode }) {
  return (
    <Panel>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              {columns.map((c) => (
                <th key={c} className="px-5 py-3.5 text-xs uppercase tracking-widest text-[var(--muted)] font-semibold whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Panel>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--primary)]/5 transition-colors">{children}</tr>;
}

export function Cell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-5 py-4 align-middle whitespace-nowrap', className)}>{children}</td>;
}

// Estado de carga/error para pantallas conectadas a la API
export function AsyncState({ loading, error, children }: { loading: boolean; error: string | null; children: React.ReactNode }) {
  if (loading) return <Panel className="p-8 text-center text-[var(--muted)]">Cargando…</Panel>;
  if (error) return <Panel className="p-8 text-center text-red-500">Error al cargar: {error}</Panel>;
  return <>{children}</>;
}

// Barra de progreso simple
export function Progress({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div className="h-full bg-[var(--primary)]" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-[var(--muted)] w-9 text-right">{value}%</span>
    </div>
  );
}
