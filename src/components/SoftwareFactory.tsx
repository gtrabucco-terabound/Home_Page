import React from 'react';
import { motion } from 'motion/react';
import { Card } from './Card';
import { Code2, Users, Zap } from 'lucide-react';

export function SoftwareFactory() {
  const sections = [
    {
      title: 'Desarrollo Ágil',
      icon: Zap,
      desc: 'Sprints enfocados en resultados tangibles y despliegue continuo.',
    },
    {
      title: 'Expertos de Dominio',
      icon: Users,
      desc: 'Ingenieros que hablan el lenguaje del petróleo y la energía.',
    },
    {
      title: 'Integración Legacy',
      icon: Code2,
      desc: 'Conectamos sistemas antiguos con arquitecturas modernas cloud-native.',
    },
  ];

  return (
    <section id="factory" className="py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-20">
          <span className="text-[var(--primary)] font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Engineering Excellence</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Software Factory: <br />
            <span className="text-[var(--primary)]">Ingeniería para hacer crecer el bosque</span>
          </h2>
          <p className="text-xl text-[var(--muted)]">
            No desarrollamos piezas sueltas. Diseñamos sistemas vivos que crecen conectados desde el origen, asegurando que cada nueva rama fortalezca el ecosistema completo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {sections.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full group relative overflow-hidden p-0">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 p-8">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-8 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                    <item.icon size={32} />
                  </div>
                  <h4 className="font-bold text-2xl mb-4">{item.title}</h4>
                  <p className="text-[var(--muted)] text-lg leading-relaxed">{item.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
