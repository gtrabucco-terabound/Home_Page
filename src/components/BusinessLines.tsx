import React from 'react';
import { motion } from 'motion/react';
import { Card } from './Card';
import { Button } from './Button';
import { ArrowRight, Drill, Layers, Code } from 'lucide-react';

export function BusinessLines() {
  const lines = [
    {
      title: 'Upstream',
      desc: 'El Hub Operativo que fusiona campo, finanzas y cumplimiento en una sola fuente de verdad.',
      icon: Drill,
      color: 'from-emerald-500/20 to-emerald-600/5',
    },
    {
      title: 'Ecosistema',
      desc: 'Micro-soluciones ágiles diseñadas para resolver problemas críticos sin romper la coherencia.',
      icon: Layers,
      color: 'from-emerald-500/20 to-emerald-600/5',
    },
    {
      title: 'Software Factory',
      desc: 'Ingeniería de élite para hacer crecer el bosque digital con soluciones a medida.',
      icon: Code,
      color: 'from-emerald-500/20 to-emerald-600/5',
    },
  ];

  return (
    <section className="py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Tres formas de hacer crecer el ecosistema</h2>
          <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
            Estructuras modulares diseñadas para evolucionar con su negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {lines.map((line, index) => (
            <motion.div
              key={line.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col p-10 group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${line.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] mb-8 w-fit group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                    <line.icon size={32} />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{line.title}</h3>
                  <p className="text-lg text-[var(--muted)] mb-10 group-hover:text-[var(--foreground)] transition-colors">
                    {line.desc}
                  </p>
                  <Button variant="ghost" className="mt-auto p-0 hover:bg-transparent group-hover:text-[var(--primary)] gap-2 font-bold uppercase tracking-widest text-xs">
                    Saber más <ArrowRight size={16} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
