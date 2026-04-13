import React from 'react';
import { Button } from './Button';
import { motion } from 'motion/react';
import { ChevronRight, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.05]">
  No construimos{" "}
  <span className="text-[var(--primary)]">software</span>. <br />
  Construimos{" "}
  <span className="text-[var(--accent)] font-extrabold">
    ecosistemas
  </span>{" "}
  vivos.
</h1>
            
            <p className="text-xl md:text-2xl text-[var(--muted)] mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Terabound rediseña cómo operan las empresas industriales creando ecosistemas donde datos, procesos y micro sistemas nacen conectados desde el origen.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 opacity-0">
              <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg shadow-2xl shadow-[var(--primary)]/20">
                Explorar soluciones
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg gap-2 group">
                Ver arquitectura <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
