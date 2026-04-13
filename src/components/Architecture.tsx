import React from 'react';
import { motion } from 'motion/react';
import { Card } from './Card';
import { Cpu, Network, Layers, Shield, Database, Lock } from 'lucide-react';

export function Architecture() {
  const components = [
    { 
      title: 'Hub Central', 
      icon: Network, 
      desc: 'Punto de entrada único con autenticación centralizada y enrutamiento inteligente.' 
    },
    { 
      title: 'Backen Admin', 
      icon: Cpu, 
      desc: 'El núcleo operativo del ecosistema. Desde aquí se gobierna la configuración, la seguridad, la auditoría y el funcionamiento integral del sistema.' 
    },
    { 
      title: 'Micro Apps', 
      icon: Layers, 
      desc: 'Aplicaciones desacopladas que consumen servicios del core de forma independiente.' 
    },
    { 
      title: 'Base de Datos Compartida', 
      icon: Database, 
      desc: 'El suelo fértil donde reside la verdad única del negocio.' 
    },
    { 
      title: 'Seguridad & Auditoría', 
      icon: Shield, 
      desc: 'Protección integral y trazabilidad absoluta de cada evento del sistema.' 
    },
    { 
      title: 'Gobernanza Modular', 
      icon: Lock, 
      desc: 'Escalabilidad controlada bajo estándares corporativos estrictos.' 
    },
  ];

  return (
    <section id="arquitectura" className="py-32 bg-[var(--background)]/40 backdrop-blur-sm relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Una arquitectura pensada para evolucionar</h2>
          <p className="text-xl text-[var(--muted)]">
            Terabound no es un monolito ni una suma de apps inconexas, sino un ecosistema modular gobernado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {components.map((comp, index) => (
            <motion.div
              key={comp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-10 h-full group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <comp.icon size={28} />
                  </div>
                  <h4 className="text-2xl font-bold mb-4">{comp.title}</h4>
                  <p className="text-[var(--muted)] leading-relaxed text-lg">
                    {comp.desc}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
