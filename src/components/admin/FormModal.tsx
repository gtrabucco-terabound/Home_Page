import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from '../Button';

export interface Field {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'email' | 'password' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  full?: boolean;
  // Al cambiar este campo, devuelve parches para autocompletar otros campos (ej. concepto → categoría).
  derive?: (value: string, values: Record<string, any>) => Record<string, any>;
  // Oculta el campo según el estado actual del formulario (ej. "Nuevo concepto" solo si eligió "Otro").
  hidden?: (values: Record<string, any>) => boolean;
}

interface Props {
  title: string;
  fields: Field[];
  initial?: Record<string, any>;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => Promise<void>;
}

const inputCls =
  'w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors';

export function FormModal({ title, fields, initial, open, onClose, onSubmit }: Props) {
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) { setValues(initial ?? {}); setError(null); }
  }, [open, initial]);

  const set = (n: string, v: any, derive?: Field['derive']) =>
    setValues((s) => ({ ...s, [n]: v, ...(derive ? derive(v, { ...s, [n]: v }) : {}) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex justify-end"
        >
          <motion.div
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: 'tween', duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full bg-[var(--background)] border-l border-[var(--border)] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--border)]">
              <h3 className="font-bold text-lg">{title}</h3>
              <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-full hover:bg-[var(--card)]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {fields.filter((f) => !(f.hidden && f.hidden(values))).map((f) => (
                <div key={f.name} className={f.full ? 'col-span-2' : ''}>
                  <label htmlFor={f.name} className="block text-sm font-medium mb-1.5">
                    {f.label}{f.required && <span className="text-red-500"> *</span>}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea id={f.name} rows={3} required={f.required} placeholder={f.placeholder}
                      value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value, f.derive)}
                      className={`${inputCls} resize-none`} />
                  ) : f.type === 'select' ? (
                    <select id={f.name} required={f.required}
                      value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value, f.derive)} className={inputCls}>
                      <option value="">Seleccionar…</option>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input id={f.name} type={f.type ?? 'text'} required={f.required} placeholder={f.placeholder}
                      value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value, f.derive)} className={inputCls} />
                  )}
                </div>
              ))}

              {error && <p className="text-sm text-red-500">Error: {error}</p>}

              <div className="flex gap-3 pt-2 mt-auto">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
