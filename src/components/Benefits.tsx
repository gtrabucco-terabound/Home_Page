import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Layers, 
  Search, 
  Link, 
  BarChart3, 
  Minimize2,
  Quote,
  History,
  Target,
  Eye,
  Heart,
  Handshake,
  Leaf
} from 'lucide-react';
import { Card } from './Card';

export function Benefits() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      type: 'hero',
      title: 'Terabound',
      subtitle: 'No nacimos para desarrollar software. Evolucionamos para diseñar ecosistemas.',
      icon: null
    },
    {
      type: 'text',
      tag: 'Quiénes Somos',
      title: '25 años de evolución',
      content: 'Somos Terabound, un equipo con más de 25 años de experiencia desarrollando tecnología para industrias complejas: petróleo, banca, seguros, logística, gastronomía y muchas más.',
      highlight: 'El problema nunca fue solo el software. El problema era cómo se construían los sistemas.',
      footer: 'Hoy no desarrollamos sistemas independientes. Diseñamos ecosistemas digitales vivos.',
      icon: Quote
    },
    {
      type: 'list',
      tag: 'Nuestra Evolución',
      title: 'Llegamos a los ecosistemas',
      content: 'Después de décadas resolviendo problemas reales, entendimos que el verdadero valor no estaba en cada solución individual, sino en la relación entre ellas.',
      items: [
        'Una base de datos como suelo común',
        'Micro sistemas como unidades especializadas',
        'Conexiones nativas en lugar de integraciones tardías',
        'Evolución continua en lugar de reemplazos constantes'
      ],
      icon: History
    },
    {
      type: 'split',
      tag: 'Misión',
      title: 'Diseñar para la realidad',
      content: 'Diseñar ecosistemas digitales que respondan a las necesidades reales de las empresas. No solo a lo que pueden expresar, sino a lo que verdaderamente necesitan para operar mejor.',
      footer: 'No entregamos software. Construimos sistemas que funcionan en el mundo real.',
      icon: Target
    },
    {
      type: 'split',
      tag: 'Visión',
      title: 'Referencia en Latinoamérica',
      content: 'Ser la empresa de referencia en el diseño de ecosistemas digitales para industrias complejas. Reconocidos por nuestra comprensión profunda del negocio.',
      footer: 'Construir relaciones donde la confianza no se promete… se demuestra.',
      icon: Eye
    },
    {
      type: 'grid',
      tag: 'Nuestros Valores',
      title: 'Decisiones diarias',
      items: [
        { name: 'Honestidad', desc: 'Decimos lo que pensamos. Si algo no va a funcionar, lo decimos antes de empezar.' },
        { name: 'Compromiso', desc: 'No somos proveedores. Somos parte del problema hasta que deja de serlo.' },
        { name: 'Humildad', desc: 'Seguimos aprendiendo. Cada cliente y cada industria nos obliga a mejorar.' }
      ],
      icon: Heart
    },
    {
      type: 'text',
      tag: 'Nuestro Compromiso',
      title: 'Buscamos relaciones',
      content: 'Nos tomamos el tiempo de entender lo que realmente necesita cada empresa, más allá de lo que puede expresar en un primer encuentro.',
      highlight: 'El verdadero trabajo no empieza cuando se escribe código. Empieza cuando se hace la pregunta correcta.',
      icon: Handshake
    },
    {
      type: 'text',
      tag: 'Nuestro Aporte',
      title: 'Sustentabilidad Digital',
      content: 'Diseñamos soluciones que reducen la dependencia del papel, eliminan procesos innecesarios y ayudan a que las empresas operen de forma más eficiente.',
      highlight: 'Construimos ecosistemas digitales para proteger los reales.',
      icon: Leaf
    },
    {
      type: 'benefits',
      tag: 'Beneficios',
      title: 'Menos fricción. Más velocidad.',
      items: [
        { title: 'Menor tiempo de implementación', icon: Zap, desc: 'Sistemas que nacen conectados reducen meses de integración.' },
        { title: 'Crecimiento modular', icon: Layers, desc: 'Evolucione a su ritmo sin comprometer la estructura central.' },
        { title: 'Trazabilidad total', icon: Search, desc: 'Auditoría y gobierno de datos en cada punto del ecosistema.' },
        { title: 'Datos conectados', icon: Link, desc: 'Una sola fuente de verdad para toda la organización.' },
        { title: 'Decisiones en tiempo real', icon: BarChart3, desc: 'Inteligencia operativa basada en datos frescos de campo.' },
        { title: 'Menor complejidad estructural', icon: Minimize2, desc: 'Elimine la fricción de los sistemas aislados y legacy.' },
      ]
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="py-32 bg-[var(--primary)]/90 text-white overflow-hidden relative min-h-[700px] flex items-center">
      <div className="container mx-auto px-4 relative z-10">
        <div className="relative max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-[450px] flex flex-col justify-center"
            >
              {(() => {
                const slide = slides[currentSlide];
                const Icon = slide.icon as any;

                if (slide.type === 'hero') {
                  return (
                    <div className="text-center">
                      <span className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-sm mb-6 block">Manifiesto</span>
                      <h2 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter">{slide.title}</h2>
                      <p className="text-2xl md:text-4xl font-light opacity-90 max-w-4xl mx-auto leading-tight">
                        {slide.subtitle}
                      </p>
                    </div>
                  );
                }

                if (slide.type === 'text') {
                  return (
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <div>
                        <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4 block">{slide.tag}</span>
                        <h3 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{slide.title}</h3>
                        <p className="text-xl opacity-80 leading-relaxed mb-8">{slide.content}</p>
                      </div>
                      <Card className="bg-white/10 border-white/20 p-10 backdrop-blur-xl opacity-100">
                        <div className="mb-6 text-emerald-400">
                          {Icon && <Icon size={48} />}
                        </div>
                        <p className="text-2xl font-medium mb-6 leading-snug italic">"{slide.highlight}"</p>
                        {slide.footer && <p className="text-emerald-400 font-bold">{slide.footer}</p>}
                      </Card>
                    </div>
                  );
                }

                if (slide.type === 'list') {
                  return (
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <div>
                        <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4 block">{slide.tag}</span>
                        <h3 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{slide.title}</h3>
                        <p className="text-xl opacity-80 leading-relaxed mb-8">{slide.content}</p>
                      </div>
                      <div className="space-y-4">
                        {slide.items?.map((item, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                          >
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-lg font-medium">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (slide.type === 'split') {
                  return (
                    <div className="text-center max-w-4xl mx-auto">
                      <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4 block">{slide.tag}</span>
                      <h3 className="text-5xl md:text-7xl font-bold mb-10 leading-tight">{slide.title}</h3>
                      <p className="text-2xl opacity-80 leading-relaxed mb-12">{slide.content}</p>
                      <div className="text-3xl font-bold text-emerald-400 italic">
                        "{slide.footer}"
                      </div>
                    </div>
                  );
                }

                if (slide.type === 'grid') {
                  return (
                    <div>
                      <div className="text-center mb-16">
                        <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4 block">{slide.tag}</span>
                        <h3 className="text-5xl font-bold">{slide.title}</h3>
                      </div>
                      <div className="grid md:grid-cols-3 gap-8">
                        {slide.items?.map((item: any, i) => (
                          <div key={i}>
                            <Card className="bg-white/10 border-white/20 p-8 opacity-100 h-full">
                              <h4 className="text-2xl font-bold mb-4 text-emerald-400">{item.name}</h4>
                              <p className="opacity-80 leading-relaxed">{item.desc}</p>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (slide.type === 'benefits') {
                  return (
                    <div>
                      <div className="text-center mb-16">
                        <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4 block">{slide.tag}</span>
                        <h3 className="text-5xl font-bold">{slide.title}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {slide.items?.map((benefit: any, index) => {
                          const BenefitIcon = benefit.icon;
                          return (
                            <div key={index} className="flex gap-4">
                              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <BenefitIcon size={20} />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold mb-1">{benefit.title}</h4>
                                <p className="text-sm opacity-70 leading-relaxed">{benefit.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return null;
              })()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-20">
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${currentSlide === i ? 'w-8 bg-emerald-400' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={prevSlide}
                className="p-4 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextSlide}
                className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white transition-colors shadow-lg shadow-emerald-500/20"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
    </section>
  );
}
