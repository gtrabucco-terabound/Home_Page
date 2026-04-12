import React from 'react';
import { motion } from 'motion/react';
import { Card } from './Card';
import { 
  Leaf, 
  Box, 
  FileText, 
  Bot, 
  Truck, 
  QrCode,
  ArrowUpRight
} from 'lucide-react';

export function Ecosystem() {
  const products = [
    { 
      id: 'POGAD', 
      name: 'Observaciones ambientales', 
      desc: 'Monitoreo y reporte de impacto ambiental en tiempo real.',
      icon: Leaf,
      tag: 'HSE'
    },
    { 
      id: 'ATLAS', 
      name: 'Gestión de activos', 
      desc: 'Control plane para el ciclo de vida de activos industriales.',
      icon: Box,
      tag: 'Asset Management'
    },
    { 
      id: 'AEGIS', 
      name: 'Permisos de trabajo (PTW)', 
      desc: 'Digitalización de permisos y seguridad operativa.',
      icon: FileText,
      tag: 'Safety'
    },
    { 
      id: 'Safety Bot', 
      name: 'Auditoría EPP con IA', 
      desc: 'Visión artificial para cumplimiento de equipo de protección.',
      icon: Bot,
      tag: 'AI / Vision'
    },
    { 
      id: 'Logistics Hub', 
      name: 'Rutas optimizadas', 
      desc: 'Gestión inteligente de flota y logística de campo.',
      icon: Truck,
      tag: 'Logistics'
    },
    { 
      id: 'Quick-Scan', 
      name: 'QR assets Mobile', 
      desc: 'Identificación instantánea de equipos mediante QR.',
      icon: QrCode,
      tag: 'Mobile'
    },
  ];

  return (
    <section id="ecosistema" className="py-32 bg-[var(--card)]/30">
      <div className="container mx-auto px-4">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ecosistema</h2>
          <p className="text-xl text-[var(--muted)]">
            Micro soluciones ágiles y de alto impacto diseñadas para resolver problemas críticos sin romper la coherencia del ecosistema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="h-full group relative overflow-hidden p-0">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                      <product.icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-[var(--border)] text-[var(--muted)]">
                      {product.tag}
                    </span>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                      {product.id} <span className="text-xs font-normal text-[var(--muted)]">— {product.name}</span>
                    </h3>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">
                      {product.desc}
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Explorar módulo <ArrowUpRight size={14} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
