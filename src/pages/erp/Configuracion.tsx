import React from 'react';
import { Save, RotateCcw, CheckCircle2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, Panel } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { useSiteConfig, SiteConfig } from '../../lib/SiteConfigContext';

const campos: { key: keyof SiteConfig; label: string; hint?: string }[] = [
  { key: 'email', label: 'Email de contacto' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'ciudad', label: 'Ciudad / País' },
  { key: 'horario', label: 'Horario de atención' },
  { key: 'linkedin', label: 'URL de LinkedIn' },
];

export function Configuracion() {
  const { config, updateConfig, reset } = useSiteConfig();
  const [form, setForm] = React.useState<SiteConfig>(config);
  const [guardado, setGuardado] = React.useState(false);

  React.useEffect(() => setForm(config), [config]);

  const onChange = (key: keyof SiteConfig, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setGuardado(false);
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(form);
    setGuardado(true);
  };

  return (
    <div>
      <PageHeader
        title="Configuración"
        subtitle="Datos de contacto que se muestran en la web pública"
        action={
          <Link to="/" className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1.5">
            <Globe size={16} /> Ver en el sitio
          </Link>
        }
      />

      <div className="max-w-2xl">
        <Panel className="p-6 md:p-8">
          <form onSubmit={guardar} className="flex flex-col gap-5">
            {campos.map((c) => (
              <div key={c.key}>
                <label htmlFor={c.key} className="block text-sm font-medium mb-2">{c.label}</label>
                <input
                  id={c.key}
                  value={form[c.key]}
                  onChange={(e) => onChange(c.key, e.target.value)}
                  className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors"
                />
              </div>
            ))}

            {guardado && (
              <div className="flex items-center gap-2 text-sm text-[var(--accent)] font-medium">
                <CheckCircle2 size={18} /> Cambios guardados. Ya se reflejan en la sección de contacto.
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" className="gap-2"><Save size={18} /> Guardar cambios</Button>
              <Button type="button" variant="outline" className="gap-2" onClick={() => { reset(); setGuardado(false); }}>
                <RotateCcw size={18} /> Restablecer
              </Button>
            </div>
          </form>
        </Panel>

        <p className="text-xs text-[var(--muted)] mt-4 leading-relaxed">
          Mock local: los cambios se guardan en este navegador. Al conectar la base de datos,
          esta configuración pasará a ser la fuente de verdad compartida.
        </p>
      </div>
    </div>
  );
}
