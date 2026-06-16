// Datos MOCK — sin información real de clientes (ver client-data-policy).
// Reemplazables por la BD en el bloque de persistencia (B4).

export type EstadoProspecto = 'Lead' | 'Consulta' | 'Reunión' | 'Propuesta';
export type EstadoProyecto = 'En curso' | 'En riesgo' | 'Pausado' | 'Cerrado';
export type EstadoHito = 'Pendiente' | 'En progreso' | 'Completado' | 'Atrasado';
export type EstadoTicket = 'Abierto' | 'En proceso' | 'Resuelto';
export type CategoriaGasto = 'Infraestructura' | 'Licencias' | 'Personal' | 'Servicios' | 'Otros';

export interface Prospecto {
  id: string;
  empresa: string;
  contacto: string;
  email: string;
  estado: EstadoProspecto;
  valorEstimado: number;
  ultimoContacto: string;
}

export interface Cliente {
  id: string;
  empresa: string;
  contacto: string;
  email: string;
  industria: string;
  desde: string;
  proyectosActivos: number;
}

export interface Proyecto {
  id: string;
  nombre: string;
  clienteId: string;
  cliente: string;
  estado: EstadoProyecto;
  avance: number; // 0-100
  responsable: string;
  inicio: string;
  fin: string;
}

export interface Hito {
  id: string;
  proyectoId: string;
  proyecto: string;
  titulo: string;
  estado: EstadoHito;
  fecha: string;
}

export interface Gasto {
  id: string;
  concepto: string;
  categoria: CategoriaGasto;
  monto: number;
  fecha: string;
  proyecto?: string;
}

export interface Documento {
  id: string;
  nombre: string;
  tipo: 'PDF' | 'XLSX' | 'DOCX' | 'IMG';
  proyecto: string;
  fecha: string;
  tamano: string;
}

export interface Ticket {
  id: string;
  asunto: string;
  proyecto: string;
  estado: EstadoTicket;
  prioridad: 'Alta' | 'Media' | 'Baja';
  fecha: string;
}

export const prospectos: Prospecto[] = [
  { id: 'P-001', empresa: 'Patagonia Energy', contacto: 'M. Fernández', email: 'compras@patagonia-energy.example', estado: 'Propuesta', valorEstimado: 48000, ultimoContacto: '2026-06-10' },
  { id: 'P-002', empresa: 'NorOil S.A.', contacto: 'J. Ramírez', email: 'jramirez@noroil.example', estado: 'Reunión', valorEstimado: 32000, ultimoContacto: '2026-06-08' },
  { id: 'P-003', empresa: 'Andes Midstream', contacto: 'L. Costa', email: 'lcosta@andesmid.example', estado: 'Consulta', valorEstimado: 21000, ultimoContacto: '2026-06-05' },
  { id: 'P-004', empresa: 'Delta Logística', contacto: 'R. Suárez', email: 'rsuarez@deltalog.example', estado: 'Lead', valorEstimado: 15000, ultimoContacto: '2026-06-02' },
  { id: 'P-005', empresa: 'Grupo Vega', contacto: 'C. Vega', email: 'cvega@grupovega.example', estado: 'Propuesta', valorEstimado: 60000, ultimoContacto: '2026-06-11' },
];

export const clientes: Cliente[] = [
  { id: 'C-001', empresa: 'Cuenca Sur Petróleo', contacto: 'A. Molina', email: 'amolina@cuencasur.example', industria: 'Oil & Gas', desde: '2023', proyectosActivos: 2 },
  { id: 'C-002', empresa: 'Banco Riohondo', contacto: 'S. Pérez', email: 'sperez@riohondo.example', industria: 'Banca', desde: '2022', proyectosActivos: 1 },
  { id: 'C-003', empresa: 'AseguraMax', contacto: 'P. Gómez', email: 'pgomez@aseguramax.example', industria: 'Seguros', desde: '2024', proyectosActivos: 1 },
  { id: 'C-004', empresa: 'LogiPort', contacto: 'N. Díaz', email: 'ndiaz@logiport.example', industria: 'Logística', desde: '2025', proyectosActivos: 1 },
];

export const proyectos: Proyecto[] = [
  { id: 'PR-001', nombre: 'AegisWell — Integridad de Pozos', clienteId: 'C-001', cliente: 'Cuenca Sur Petróleo', estado: 'En curso', avance: 72, responsable: 'Equipo Upstream', inicio: '2026-01-15', fin: '2026-09-30' },
  { id: 'PR-002', nombre: 'Portal Operaciones', clienteId: 'C-001', cliente: 'Cuenca Sur Petróleo', estado: 'En riesgo', avance: 40, responsable: 'Software Factory', inicio: '2026-03-01', fin: '2026-08-15' },
  { id: 'PR-003', nombre: 'Core Bancario — Módulo Riesgo', clienteId: 'C-002', cliente: 'Banco Riohondo', estado: 'En curso', avance: 55, responsable: 'Software Factory', inicio: '2026-02-10', fin: '2026-11-20' },
  { id: 'PR-004', nombre: 'Plataforma de Siniestros', clienteId: 'C-003', cliente: 'AseguraMax', estado: 'Pausado', avance: 25, responsable: 'Domain Experts', inicio: '2026-04-01', fin: '2026-12-01' },
  { id: 'PR-005', nombre: 'Trazabilidad de Flota', clienteId: 'C-004', cliente: 'LogiPort', estado: 'En curso', avance: 88, responsable: 'Equipo Ecosistemas', inicio: '2025-11-01', fin: '2026-07-15' },
];

export const hitos: Hito[] = [
  { id: 'H-001', proyectoId: 'PR-001', proyecto: 'AegisWell — Integridad de Pozos', titulo: 'Modelo dual-barrier en producción', estado: 'Completado', fecha: '2026-04-20' },
  { id: 'H-002', proyectoId: 'PR-001', proyecto: 'AegisWell — Integridad de Pozos', titulo: 'Integración SCADA', estado: 'En progreso', fecha: '2026-07-10' },
  { id: 'H-003', proyectoId: 'PR-002', proyecto: 'Portal Operaciones', titulo: 'Definición de roles y permisos', estado: 'Atrasado', fecha: '2026-06-01' },
  { id: 'H-004', proyectoId: 'PR-003', proyecto: 'Core Bancario — Módulo Riesgo', titulo: 'Motor de scoring v1', estado: 'En progreso', fecha: '2026-07-25' },
  { id: 'H-005', proyectoId: 'PR-005', proyecto: 'Trazabilidad de Flota', titulo: 'Tablero en tiempo real', estado: 'Pendiente', fecha: '2026-07-05' },
];

export const gastos: Gasto[] = [
  { id: 'G-001', concepto: 'Infraestructura cloud (Q2)', categoria: 'Infraestructura', monto: 3200, fecha: '2026-06-01', proyecto: 'AegisWell — Integridad de Pozos' },
  { id: 'G-002', concepto: 'Licencias de diseño', categoria: 'Licencias', monto: 840, fecha: '2026-06-03' },
  { id: 'G-003', concepto: 'Consultoría dominio O&G', categoria: 'Servicios', monto: 5400, fecha: '2026-05-28', proyecto: 'AegisWell — Integridad de Pozos' },
  { id: 'G-004', concepto: 'Equipo desarrollo (mes)', categoria: 'Personal', monto: 28000, fecha: '2026-06-05' },
  { id: 'G-005', concepto: 'Dominios y certificados', categoria: 'Servicios', monto: 260, fecha: '2026-06-09' },
];

export const documentos: Documento[] = [
  { id: 'D-001', nombre: 'Propuesta Técnica AegisWell.pdf', tipo: 'PDF', proyecto: 'AegisWell — Integridad de Pozos', fecha: '2026-01-10', tamano: '2.4 MB' },
  { id: 'D-002', nombre: 'Cronograma de Hitos.xlsx', tipo: 'XLSX', proyecto: 'AegisWell — Integridad de Pozos', fecha: '2026-02-02', tamano: '180 KB' },
  { id: 'D-003', nombre: 'Acta de Reunión — Kickoff.docx', tipo: 'DOCX', proyecto: 'Portal Operaciones', fecha: '2026-03-05', tamano: '64 KB' },
  { id: 'D-004', nombre: 'Reporte de Integridad Q2.pdf', tipo: 'PDF', proyecto: 'AegisWell — Integridad de Pozos', fecha: '2026-06-12', tamano: '1.1 MB' },
];

export const tickets: Ticket[] = [
  { id: 'T-001', asunto: 'Ajuste de umbral de alarma en pozo NQ-12', proyecto: 'AegisWell — Integridad de Pozos', estado: 'En proceso', prioridad: 'Alta', fecha: '2026-06-11' },
  { id: 'T-002', asunto: 'Exportar reporte a PDF con logo', proyecto: 'AegisWell — Integridad de Pozos', estado: 'Resuelto', prioridad: 'Media', fecha: '2026-06-07' },
  { id: 'T-003', asunto: 'Nuevo usuario para auditoría externa', proyecto: 'Portal Operaciones', estado: 'Abierto', prioridad: 'Baja', fecha: '2026-06-13' },
];

export const moneda = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
