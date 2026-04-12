import React from 'react';
import { motion } from 'motion/react';
import { Card } from './Card';
import { 
  Database, 
  Wrench, 
  ShieldCheck, 
  Calculator, 
  ShoppingCart, 
  Smartphone 
} from 'lucide-react';

export function UpstreamSection() {
  const modules = [
    { title: 'Producción', icon: Database, desc: 'Control total de volúmenes y eficiencia de extracción.' },
    { title: 'Servicio al Pozo', icon: Wrench, desc: 'Gestión de mantenimiento y operaciones en boca de pozo.' },
    { title: 'HSE & Cumplimiento', icon: ShieldCheck, desc: 'Gobernanza de seguridad y normativas ambientales.' },
    { title: 'Contabilidad', icon: Calculator, desc: 'Integración financiera nativa con la operación.' },
    { title: 'Compras / Almacén', icon: ShoppingCart, desc: 'Optimización de cadena de suministro industrial.' },
    { title: 'Mobile First', icon: Smartphone, desc: 'Acceso total desde campo sin pérdida de conectividad.' },
  ];

  return (
    <section id="upstream" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-20 items-center mb-20">
          <div className="lg:w-1/2">
            <span className="text-[var(--primary)] font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Core Platform</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Solución Upstream: <br /> 
              <span className="text-[var(--primary)]">El Hub Operativo</span>
            </h2>
            <p className="text-xl text-[var(--muted)] leading-relaxed">
              Una plataforma unificada que fusiona operación, campo, cumplimiento y finanzas en tiempo real. No más silos, solo una fuente de verdad conectada.
            </p>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            {modules.map((mod, index) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full group relative overflow-hidden p-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 p-6">
                    <div className="w-12 h-12 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-4 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                      <mod.icon size={24} />
                    </div>
                    <h4 className="font-bold text-xl mb-2">{mod.title}</h4>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{mod.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
