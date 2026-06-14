import React from 'react';
import { motion } from 'motion/react';
import { Card } from './Card';
import { Button } from './Button';
import { ModuleModal, ModuleData } from './ModuleModal';
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  Gauge,
  ClipboardCheck,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Play,
} from 'lucide-react';

const modules: (ModuleData & { icon: any })[] = [
  {
    id: 'barreras',
    title: 'Barreras de Integridad',
    tag: 'Core',
    icon: ShieldCheck,
    screenshot: '/screenshots/Pozos-In-Esquema.png',
    shortDesc: 'Modelo dual-barrier visual e interactivo, API 14B y NORSOK D-010.',
    longDesc:
      'AegisWell representa cada pozo con su esquemático real y un modelo de barreras dual (primaria y secundaria) por elemento físico. El estado de integridad se calcula en vivo a partir de pruebas, anomalías y datos de campo, eliminando los Excel paralelos y dando a Operaciones, HSE e Integridad una única fuente de verdad sobre qué está conteniendo el pozo en este momento.',
    bullets: [
      'Esquemático editable por pozo con tubulares, anulares y elementos sellantes',
      'Estado de barrera primaria/secundaria calculado a partir de evidencia',
      'Trazabilidad por elemento: quién, cuándo y por qué cambió de estado',
      'Cumple API 14B, NORSOK D-010 e ISO/TS 16530-2',
    ],
    walkthrough: [
      {
        duration: 2400,
        cursor: { x: 6, y: 28 },
        callout: { x: 24, y: 22, text: 'Cada pozo se modela con su esquemático real' },
      },
      {
        duration: 3200,
        cursor: { x: 40, y: 16 },
        zoom: { x: 42, y: 18, scale: 1.4 },
        callout: { x: 65, y: 30, text: 'Barrera secundaria: Wellhead / Xmas tree' },
      },
      {
        duration: 3200,
        cursor: { x: 52, y: 82 },
        zoom: { x: 52, y: 80, scale: 1.4 },
        callout: { x: 28, y: 64, text: 'Barrera primaria: Plug / Tapón' },
      },
      {
        duration: 3200,
        cursor: { x: 88, y: 24 },
        zoom: { x: 86, y: 28, scale: 1.4 },
        callout: { x: 60, y: 22, text: 'Cada elemento sellante con su estado de integridad' },
      },
      {
        duration: 2800,
        cursor: { x: 95, y: 6 },
        click: true,
        zoom: { x: 80, y: 10, scale: 1.3 },
        callout: { x: 45, y: 22, text: 'Esquema validado y publicado, sin Excel paralelos' },
      },
      {
        duration: 2000,
        callout: { x: 50, y: 50, text: 'Una sola fuente de verdad sobre qué contiene el pozo' },
      },
    ],
  },
  {
    id: 'scada',
    title: 'SCADA en Tiempo Real',
    tag: 'Real-Time',
    icon: Activity,
    screenshot: '/screenshots/Dashboard.png',
    shortDesc: 'Ingesta continua de sensores de campo, alarmas automáticas, latencia sub-segundo.',
    longDesc:
      'El módulo SCADA conecta directamente con el PLC/VPS de campo e ingesta presiones anulares, temperatura, caudal y nivel en streaming. Los umbrales se autocalculan desde la norma y el MAASP del pozo —solo se admiten overrides manuales si endurecen el límite— y el motor de alarmas escala automáticamente cualquier evento crítico a anomalía con notificación al responsable.',
    bullets: [
      'Ingesta batch + streaming desde simulador VPS y PLC reales',
      'Umbrales derivados de MAASP y norma; override sólo para endurecer',
      'Motor de alarmas con escalamiento automático a anomalía',
      'Latencia menor a 1 segundo entre evento de campo y notificación',
    ],
    walkthrough: [
      {
        duration: 2400,
        cursor: { x: 10, y: 12 },
        callout: { x: 30, y: 24, text: 'Estado global de integridad, monitoreado en vivo' },
      },
      {
        duration: 3200,
        cursor: { x: 14, y: 12 },
        zoom: { x: 18, y: 14, scale: 1.4 },
        callout: { x: 50, y: 26, text: 'KPIs de integridad y pruebas al día' },
      },
      {
        duration: 3200,
        cursor: { x: 32, y: 30 },
        zoom: { x: 34, y: 30, scale: 1.4 },
        callout: { x: 62, y: 20, text: 'Anomalías priorizadas automáticamente' },
      },
      {
        duration: 3200,
        cursor: { x: 86, y: 30 },
        click: true,
        zoom: { x: 82, y: 30, scale: 1.4 },
        callout: { x: 50, y: 18, text: 'Eventos críticos escalados a acción inmediata' },
      },
      {
        duration: 3200,
        cursor: { x: 45, y: 72 },
        zoom: { x: 48, y: 74, scale: 1.3 },
        callout: { x: 70, y: 58, text: 'Ranking de pozos por riesgo y estado' },
      },
      {
        duration: 3000,
        cursor: { x: 52, y: 78 },
        zoom: { x: 52, y: 78, scale: 1.5 },
        callout: { x: 28, y: 64, text: 'Pozos sin barrera resaltados al instante' },
      },
      {
        duration: 2000,
        callout: { x: 50, y: 50, text: 'Monitoreo y alarmas en una sola vista' },
      },
    ],
  },
  {
    id: 'anomalias',
    title: 'Gestión de Anomalías',
    tag: 'Workflow',
    icon: AlertTriangle,
    screenshot: '/screenshots/Anomalias-In-Seguimiento.png',
    shortDesc: 'Workflow completo de detección, mitigación y cierre con firma digital.',
    longDesc:
      'Cada anomalía sigue un flujo trazable: detección automática o manual, clasificación por severidad, asignación de responsable, plan de mitigación, evidencia documental y cierre con firma digital. Todo queda registrado para auditoría externa, sin posibilidad de borrar o re-escribir el histórico, y enlazado al pozo y a la barrera afectada.',
    bullets: [
      'Estados auditables: Identificada → En análisis → Mitigando → Cerrada',
      'Asignación de tareas, notificaciones y SLA por severidad',
      'Evidencia documental adjunta a cada cambio de estado',
      'Firma digital y trazabilidad inmutable',
    ],
    walkthrough: [
      // 1. Entra desde abajo, va al sidebar
      {
        duration: 2200,
        cursor: { x: 5, y: 30 },
        callout: { x: 22, y: 30, text: 'Entrás al módulo de Anomalías' },
      },
      // 2. Cabezal: criticidad
      {
        duration: 3200,
        cursor: { x: 38, y: 16 },
        zoom: { x: 50, y: 18, scale: 1.3 },
        callout: { x: 55, y: 28, text: 'Anomalía crítica en barrera primaria con vencimiento de SLA' },
      },
      // 3. Norma citada
      {
        duration: 3000,
        cursor: { x: 42, y: 26 },
        zoom: { x: 45, y: 28, scale: 1.4 },
        callout: { x: 60, y: 22, text: 'Cada anomalía cita la norma aplicable: ISO 16530-1 §8' },
      },
      // 4. Responsable + Cambiar
      {
        duration: 3400,
        cursor: { x: 73, y: 34 },
        click: true,
        zoom: { x: 55, y: 33, scale: 1.4 },
        callout: { x: 35, y: 26, text: 'Asignación trazable: quién, cuándo y por qué cambió' },
      },
      // 5. Historial inmutable
      {
        duration: 3400,
        cursor: { x: 42, y: 47 },
        zoom: { x: 50, y: 49, scale: 1.3 },
        callout: { x: 65, y: 38, text: 'Historial inmutable de toda acción registrada' },
      },
      // 6. Nueva acción correctiva
      {
        duration: 3000,
        cursor: { x: 50, y: 57 },
        click: true,
        zoom: { x: 50, y: 58, scale: 1.4 },
        callout: { x: 25, y: 48, text: 'Registrá una nueva acción correctiva' },
      },
      // 7. Botón registrar
      {
        duration: 2800,
        cursor: { x: 38, y: 62 },
        click: true,
        zoom: { x: 50, y: 60, scale: 1.4 },
        callout: { x: 65, y: 55, text: 'Cada acción queda firmada digitalmente' },
      },
      // 8. Cambio de estado a Resuelta
      {
        duration: 3000,
        cursor: { x: 70, y: 16 },
        click: true,
        zoom: { x: 70, y: 18, scale: 1.4 },
        callout: { x: 40, y: 30, text: 'Cambio de estado auditable: Resuelta / Cerrada' },
      },
      // 9. Fade out, vuelta a vista completa
      {
        duration: 2000,
        callout: { x: 50, y: 50, text: 'Trazabilidad completa para auditoría externa' },
      },
    ],
  },
  {
    id: 'fmeca',
    title: 'FMECA Dinámico',
    tag: 'Risk',
    icon: Gauge,
    screenshot: '/screenshots/Pozos-In-Reporte-Integridad.png',
    shortDesc: 'Matriz de riesgo viva alimentada por estado real de barreras y eventos.',
    longDesc:
      'A diferencia del FMECA tradicional —que se hace una vez y se archiva— AegisWell mantiene una matriz viva por componente, donde la severidad, ocurrencia y detección se reevalúan automáticamente al recibir nuevos eventos del SCADA o nuevas anomalías. El RPN se recalcula y dispara acciones cuando supera umbrales definidos por el operador.',
    bullets: [
      'Matriz FMECA por componente con RPN auto-calculado',
      'Re-evaluación automática ante eventos SCADA o anomalías',
      'Interpretación legible sobre la matriz para el lector no técnico',
      'Acciones disparadas cuando RPN supera umbral',
    ],
    walkthrough: [
      {
        duration: 2400,
        cursor: { x: 8, y: 14 },
        callout: { x: 30, y: 26, text: 'Reporte de integridad vivo por pozo' },
      },
      {
        duration: 3200,
        cursor: { x: 12, y: 18 },
        zoom: { x: 16, y: 20, scale: 1.4 },
        callout: { x: 50, y: 30, text: 'Estado operativo calculado, no declarado a mano' },
      },
      {
        duration: 3200,
        cursor: { x: 42, y: 18 },
        zoom: { x: 44, y: 20, scale: 1.4 },
        callout: { x: 70, y: 30, text: 'Barrera primaria en falla, con su evidencia' },
      },
      {
        duration: 3200,
        cursor: { x: 12, y: 48 },
        zoom: { x: 30, y: 50, scale: 1.3 },
        callout: { x: 55, y: 38, text: 'FMECA vivo: top componentes por RPN' },
      },
      {
        duration: 3200,
        cursor: { x: 80, y: 64 },
        click: true,
        zoom: { x: 80, y: 64, scale: 1.5 },
        callout: { x: 45, y: 50, text: 'RPN recalculado ante cada evento o anomalía' },
      },
      {
        duration: 3000,
        cursor: { x: 26, y: 72 },
        zoom: { x: 28, y: 72, scale: 1.4 },
        callout: { x: 60, y: 58, text: 'Cruzado contra el esquemático real del pozo' },
      },
      {
        duration: 2000,
        callout: { x: 50, y: 50, text: 'Riesgo siempre actualizado, nunca archivado' },
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance API / NORSOK',
    tag: 'Regulatory',
    icon: ClipboardCheck,
    screenshot: '/screenshots/Pozos-In-Cumplimiento_Normativo.png',
    shortDesc: 'Checklists automáticos y reportes regulatorios listos para auditoría externa.',
    longDesc:
      'AegisWell aplica los checklists de API 14B y NORSOK D-010 al estado real del pozo y genera reportes listos para presentar al regulador. El sistema indica qué requisitos están cubiertos con evidencia, cuáles tienen brechas y qué acciones están pendientes, todo con trazabilidad y firma digital.',
    bullets: [
      'Checklists API 14B y NORSOK D-010 aplicados al pozo real',
      'Identificación automática de brechas y evidencias faltantes',
      'Generación de reportes regulatorios en PDF',
      'Histórico inmutable para auditoría externa',
    ],
    walkthrough: [
      {
        duration: 2400,
        cursor: { x: 8, y: 14 },
        callout: { x: 32, y: 26, text: 'Checklist API 14B / NORSOK aplicado al pozo real' },
      },
      {
        duration: 3200,
        cursor: { x: 55, y: 30 },
        zoom: { x: 55, y: 30, scale: 1.4 },
        callout: { x: 30, y: 18, text: 'Reglas OK, advertencias y críticas separadas' },
      },
      {
        duration: 3400,
        cursor: { x: 50, y: 42 },
        zoom: { x: 48, y: 44, scale: 1.4 },
        callout: { x: 72, y: 32, text: 'Brechas críticas con la norma citada' },
      },
      {
        duration: 3200,
        cursor: { x: 50, y: 72 },
        zoom: { x: 48, y: 72, scale: 1.3 },
        callout: { x: 72, y: 60, text: 'Cada regla con su estado y evidencia' },
      },
      {
        duration: 2800,
        cursor: { x: 62, y: 12 },
        click: true,
        zoom: { x: 62, y: 14, scale: 1.4 },
        callout: { x: 38, y: 26, text: 'Reporte regulatorio listo para auditoría externa' },
      },
      {
        duration: 2000,
        callout: { x: 50, y: 50, text: 'Cumplimiento trazable, sin Excel paralelos' },
      },
    ],
  },
  {
    id: 'ai-audit',
    title: 'IA Audit Assistant',
    tag: 'AI',
    icon: Sparkles,
    screenshot: '/screenshots/Pozos-In-Auditoria.png',
    shortDesc: 'Asistente IA que revisa, detecta inconsistencias y propone correcciones.',
    longDesc:
      'Un asistente con IA recorre la configuración del pozo, el esquemático, el FMECA y el histórico de anomalías para detectar inconsistencias —por ejemplo, barreras declaradas sin evidencia, presiones fuera de envelope, FMECA con componentes huérfanos— y propone acciones correctivas justificadas con la norma aplicable, sin reemplazar el criterio del ingeniero.',
    bullets: [
      'Análisis cruzado de esquemático, barreras, FMECA y anomalías',
      'Detecta inconsistencias y barreras sin evidencia',
      'Propone acciones justificadas con cita normativa',
      'Modo asistente: nunca ejecuta cambios, sólo recomienda',
    ],
    walkthrough: [
      {
        duration: 2400,
        cursor: { x: 8, y: 14 },
        callout: { x: 34, y: 26, text: 'Asistente IA que audita el diseño del pozo' },
      },
      {
        duration: 3200,
        cursor: { x: 32, y: 18 },
        zoom: { x: 40, y: 20, scale: 1.4 },
        callout: { x: 65, y: 30, text: 'Recomendaciones pendientes de revisión' },
      },
      {
        duration: 3400,
        cursor: { x: 40, y: 40 },
        zoom: { x: 42, y: 40, scale: 1.4 },
        callout: { x: 70, y: 28, text: 'Detecta componente fallado sin evidencia' },
      },
      {
        duration: 3200,
        cursor: { x: 30, y: 44 },
        zoom: { x: 35, y: 44, scale: 1.4 },
        callout: { x: 65, y: 56, text: 'Cada propuesta justificada con la norma aplicable' },
      },
      {
        duration: 3200,
        cursor: { x: 24, y: 47 },
        click: true,
        zoom: { x: 30, y: 47, scale: 1.4 },
        callout: { x: 60, y: 36, text: 'El ingeniero decide: la IA sólo recomienda' },
      },
      {
        duration: 2800,
        cursor: { x: 92, y: 8 },
        click: true,
        zoom: { x: 80, y: 12, scale: 1.3 },
        callout: { x: 45, y: 26, text: 'Re-analiza ante cualquier cambio del pozo' },
      },
      {
        duration: 2000,
        callout: { x: 50, y: 50, text: 'IA que asiste, nunca reemplaza el criterio' },
      },
    ],
  },
];

const kpis = [
  { value: '100%', label: 'Trazabilidad de barreras' },
  { value: 'API 14B', label: 'Cumplimiento normativo' },
  { value: '24/7', label: 'Monitoreo SCADA' },
  { value: '<1s', label: 'Latencia de alarma' },
];

const highlights = [
  'Esquemático visual editable por pozo',
  'Multi-tenant con roles y auditoría inmutable',
  'API REST + Webhooks para integración',
  'i18n EN/ES nativo',
];

export function AegisWell() {
  const [selected, setSelected] = React.useState<ModuleData | null>(null);

  return (
    <section id="aegiswell" className="py-32 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20 text-center max-w-3xl mx-auto"
        >
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-6">
            Plataforma exclusiva · Punta de lanza
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">AegisWell</h2>
          <p className="text-xl text-[var(--muted)] mb-4">
            Integridad de pozos, sin zonas grises.
          </p>
          <p className="text-base text-[var(--muted)] max-w-2xl mx-auto">
            Una sola plataforma para gestionar barreras, anomalías, SCADA y cumplimiento normativo
            con la rigurosidad de API 14B y NORSOK D-010, y la agilidad del software moderno.
            Tocá cada tarjeta para escuchar cómo funciona.
          </p>
        </motion.div>

        {/* KPI band */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 p-8 rounded-2xl bg-[var(--card)]/60 backdrop-blur-md border border-[var(--border)]"
        >
          {kpis.map((kpi) => (
            <div key={kpi.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-2">
                {kpi.value}
              </div>
              <div className="text-xs uppercase tracking-widest text-[var(--muted)]">
                {kpi.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Modules grid - clickable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {modules.map((m, index) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => setSelected(m)}
              className="text-left focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-2xl"
            >
              <Card className="h-full group relative overflow-hidden p-0 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Screenshot preview */}
                <div className="relative aspect-video bg-[var(--card)] overflow-hidden border-b border-[var(--border)]">
                  <img
                    src={m.screenshot}
                    alt={m.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--background)]/80 backdrop-blur-md border border-[var(--border)] text-[10px] font-bold uppercase tracking-widest">
                    <Play size={10} className="text-[var(--primary)]" /> Audio
                  </div>
                </div>
                <div className="relative z-10 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                      <m.icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-[var(--border)] text-[var(--muted)]">
                      {m.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{m.title}</h3>
                  <p className="text-[var(--muted)] text-sm leading-relaxed">{m.shortDesc}</p>
                  <div className="pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver módulo y escuchar <ArrowUpRight size={14} />
                  </div>
                </div>
              </Card>
            </motion.button>
          ))}
        </div>

        {/* Highlights + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-10 rounded-3xl bg-[var(--card)]/60 backdrop-blur-md border border-[var(--border)]"
        >
          <div>
            <h3 className="text-3xl font-bold mb-6">Lo que la diferencia</h3>
            <ul className="space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-[var(--foreground)]">
                  <CheckCircle2 size={20} className="text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-4">
            <p className="text-[var(--muted)] lg:text-right max-w-md">
              Vendible como producto autónomo, e integrable como parte del ecosistema Terabound
              para operadores, contratistas de well-services y reguladores.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="lg">Solicitar Demo</Button>
              <Button variant="outline" size="lg">Ver Documentación</Button>
            </div>
          </div>
        </motion.div>
      </div>

      <ModuleModal module={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
