import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Linkedin, Send, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Button } from './Button';
import { useSiteConfig } from '../lib/SiteConfigContext';

export function Contact() {
  const { config } = useSiteConfig();
  const [enviado, setEnviado] = React.useState(false);
  const [form, setForm] = React.useState({ nombre: '', empresa: '', email: '', mensaje: '' });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sin backend todavía: se conectará a la BD en B4. Por ahora confirmación local.
    setEnviado(true);
  };

  const datos = [
    { icon: Mail, label: 'Email', value: config.email, href: `mailto:${config.email}` },
    { icon: Phone, label: 'Teléfono', value: config.telefono, href: `tel:${config.telefono.replace(/\s/g, '')}` },
    { icon: MapPin, label: 'Oficina', value: `${config.direccion} · ${config.ciudad}` },
    { icon: Clock, label: 'Horario', value: config.horario },
  ];

  return (
    <section id="contacto" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-60" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-6">
            Hablemos
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Construyamos tu <span className="text-[var(--primary)]">ecosistema</span>.
          </h2>
          <p className="text-xl text-[var(--muted)] leading-relaxed">
            Contanos qué necesitás operar mejor. Te respondemos con una conversación, no con un
            formulario automático.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Datos de contacto */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            {datos.map((d) => (
              <div
                key={d.label}
                className="flex items-start gap-4 p-5 rounded-2xl bg-[var(--card)]/70 backdrop-blur-md border border-[var(--border)]"
              >
                <div className="p-3 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex-shrink-0">
                  <d.icon size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">{d.label}</div>
                  {d.href ? (
                    <a href={d.href} className="font-medium hover:text-[var(--primary)] transition-colors break-words">
                      {d.value}
                    </a>
                  ) : (
                    <div className="font-medium break-words">{d.value}</div>
                  )}
                </div>
              </div>
            ))}
            <a
              href={config.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <span className="flex items-center gap-3">
                <Linkedin size={20} /> Seguinos en LinkedIn
              </span>
              <ArrowUpRight size={18} />
            </a>
          </motion.div>

          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 p-8 md:p-10 rounded-3xl bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)] shadow-sm"
          >
            {enviado ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="p-4 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold mb-3">¡Gracias, {form.nombre || 'recibido'}!</h3>
                <p className="text-[var(--muted)] max-w-sm">
                  Tu mensaje quedó registrado. Te contactamos a la brevedad por {form.email || 'email'}.
                </p>
                <button
                  onClick={() => {
                    setEnviado(false);
                    setForm({ nombre: '', empresa: '', email: '', mensaje: '' });
                  }}
                  className="mt-8 text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Nombre" name="nombre" value={form.nombre} onChange={onChange} required placeholder="Tu nombre" />
                  <Field label="Empresa" name="empresa" value={form.empresa} onChange={onChange} placeholder="Tu empresa" />
                </div>
                <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} required placeholder="tu@empresa.com" />
                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium mb-2">Mensaje</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={form.mensaje}
                    onChange={onChange}
                    required
                    rows={5}
                    placeholder="Contanos qué querés resolver…"
                    className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors resize-none"
                  />
                </div>
                <Button type="submit" size="lg" className="gap-2 w-full sm:w-auto self-start px-8">
                  Enviar mensaje <Send size={18} />
                </Button>
                <p className="text-xs text-[var(--muted)]">
                  Tus datos se usan sólo para responderte. No compartimos información con terceros.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

function Field({ label, name, ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-2">{label}</label>
      <input
        id={name}
        name={name}
        {...props}
        className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors"
      />
    </div>
  );
}
