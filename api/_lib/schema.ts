// Esquema Drizzle — Terabound Web OS (multitenant). Fuente: docs/esquema-bd.md
import {
  pgTable, uuid, text, integer, date, timestamp, pgEnum, numeric, boolean, uniqueIndex, jsonb,
} from 'drizzle-orm/pg-core';

/* ============ Enums ============ */
// rol se modela como texto (gerente | desarrollador | cliente) — evita migraciones de enum.
export const estadoProspectoEnum = pgEnum('estado_prospecto', ['Lead', 'Consulta', 'Reunión', 'Propuesta']);
export const estadoProyectoEnum = pgEnum('estado_proyecto', ['En curso', 'En riesgo', 'Pausado', 'Cerrado']);
export const estadoHitoEnum = pgEnum('estado_hito', ['Pendiente', 'En progreso', 'Completado', 'Atrasado']);
export const estadoTicketEnum = pgEnum('estado_ticket', ['Abierto', 'En proceso', 'Resuelto']);
export const prioridadEnum = pgEnum('prioridad', ['Alta', 'Media', 'Baja']);
export const categoriaGastoEnum = pgEnum('categoria_gasto', ['Infraestructura', 'Licencias', 'Personal', 'Servicios', 'Otros']);
export const tipoGastoEnum = pgEnum('tipo_gasto', ['Directo', 'Indirecto']);
export const estadoPresupuestoEnum = pgEnum('estado_presupuesto', ['Borrador', 'Enviado', 'Aprobado', 'Rechazado', 'Vencido']);
export const tipoItemEnum = pgEnum('tipo_item', ['Único', 'PorHora', 'Mensual', 'Tramo', 'Hito', 'RevenueShare', 'CostoCliente']);
export const estadoContratoEnum = pgEnum('estado_contrato', ['Activo', 'Cerrado', 'Cancelado']);
export const estadoFacturaEnum = pgEnum('estado_factura', ['Pendiente', 'Cobrada', 'Vencida', 'Anulada']);
export const tipoMovimientoEnum = pgEnum('tipo_movimiento', ['Ingreso', 'Egreso']);
export const accionAuditEnum = pgEnum('accion_audit', ['INSERT', 'UPDATE', 'DELETE', 'APPROVE']);

/* ============ Núcleo ============ */
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const clientes = pgTable('clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  empresa: text('empresa').notNull(),
  contacto: text('contacto'),
  email: text('email'),
  industria: text('industria'),
  desde: text('desde'),
  cuitCifrado: text('cuit_cifrado'),   // dato fiscal — cifrado a nivel app (AES-256-GCM)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  nombre: text('nombre').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash'),                 // scrypt (ver api/_lib/auth.ts)
  rol: text('rol').notNull().default('desarrollador'), // gerente | desarrollador | cliente
  empresaId: uuid('empresa_id').references(() => clientes.id), // sólo rol 'cliente'
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({ emailUniq: uniqueIndex('profiles_email_idx').on(t.email) }));

export const prospectos = pgTable('prospectos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  empresa: text('empresa').notNull(),
  contacto: text('contacto'),
  email: text('email'),
  estado: estadoProspectoEnum('estado').notNull().default('Lead'),
  valorEstimado: numeric('valor_estimado', { precision: 12, scale: 2 }).default('0'),
  ultimoContacto: date('ultimo_contacto'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const proyectos = pgTable('proyectos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  nombre: text('nombre').notNull(),
  estado: estadoProyectoEnum('estado').notNull().default('En curso'),
  avance: integer('avance').notNull().default(0),
  responsable: text('responsable'),
  inicio: date('inicio'),
  fin: date('fin'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const hitos = pgTable('hitos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  proyectoId: uuid('proyecto_id').notNull().references(() => proyectos.id),
  titulo: text('titulo').notNull(),
  estado: estadoHitoEnum('estado').notNull().default('Pendiente'),
  fecha: date('fecha'),
  orden: integer('orden').notNull().default(0),   // secuencia en la timeline
  peso: integer('peso').notNull().default(1),     // ponderación del avance del proyecto
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const documentos = pgTable('documentos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  proyectoId: uuid('proyecto_id').notNull().references(() => proyectos.id),
  nombre: text('nombre').notNull(),
  tipo: text('tipo'),
  tamano: text('tamano'),
  url: text('url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  proyectoId: uuid('proyecto_id').notNull().references(() => proyectos.id),
  asunto: text('asunto').notNull(),
  estado: estadoTicketEnum('estado').notNull().default('Abierto'),
  prioridad: prioridadEnum('prioridad').notNull().default('Media'),
  fecha: date('fecha'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const gastos = pgTable('gastos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  proyectoId: uuid('proyecto_id').references(() => proyectos.id),
  personaId: uuid('persona_id').references(() => profiles.id),  // atribución: null = Empresa, set = integrante
  tipo: tipoGastoEnum('tipo').notNull().default('Indirecto'),
  concepto: text('concepto').notNull(),
  proveedor: text('proveedor'),  // empresa/proveedor del servicio (ej. Railway, AWS). Luego autocompletable por IA.
  categoria: categoriaGastoEnum('categoria').notNull().default('Otros'),
  monto: numeric('monto', { precision: 12, scale: 2 }).notNull().default('0'),  // CANÓNICO en USD
  moneda: text('moneda').notNull().default('USD'),        // moneda de carga (USD | ARS)
  montoOriginal: numeric('monto_original', { precision: 14, scale: 2 }),  // monto en la moneda de carga
  tco: numeric('tco', { precision: 14, scale: 4 }),        // tipo de cambio aplicado (ARS por USD); 1 si USD
  comprobantePath: text('comprobante_path'),               // objeto en Storage (bucket privado 'comprobantes')
  proveedorCuit: text('proveedor_cuit'),                    // CUIT del proveedor (extraíble por IA del comprobante)
  fecha: date('fecha'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Catálogo de conceptos de gasto: cada concepto pertenece a una categoría.
// Al elegir el concepto en el form, la categoría se autocompleta.
export const conceptoGasto = pgTable('concepto_gasto', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  nombre: text('nombre').notNull(),
  categoria: categoriaGastoEnum('categoria').notNull().default('Otros'),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const siteConfig = pgTable('site_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  email: text('email').notNull(),
  telefono: text('telefono'),
  direccion: text('direccion'),
  ciudad: text('ciudad'),
  horario: text('horario'),
  linkedin: text('linkedin'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({ tenantUniq: uniqueIndex('site_config_tenant_idx').on(t.tenantId) }));

/* ============ Equipo y costeo ============ */
export const personas = pgTable('personas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  nombre: text('nombre').notNull(),
  rol: text('rol'),
  sueldoMensual: numeric('sueldo_mensual', { precision: 12, scale: 2 }).notNull().default('0'),
  horasMensuales: integer('horas_mensuales').notNull().default(160),
  costoHora: numeric('costo_hora', { precision: 10, scale: 2 }),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const timesheets = pgTable('timesheets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  personaId: uuid('persona_id').notNull().references(() => personas.id),
  proyectoId: uuid('proyecto_id').notNull().references(() => proyectos.id),
  fecha: date('fecha').notNull(),
  horas: numeric('horas', { precision: 6, scale: 2 }).notNull(),
  notas: text('notas'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const proyectoCosteo = pgTable('proyecto_costeo', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  proyectoId: uuid('proyecto_id').notNull().references(() => proyectos.id),
  costoHoraAplicado: numeric('costo_hora_aplicado', { precision: 10, scale: 2 }),
  prorrateoIndirectoPct: numeric('prorrateo_indirecto_pct', { precision: 5, scale: 2 }).default('0'),
  notas: text('notas'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({ uniq: uniqueIndex('costeo_proyecto_idx').on(t.proyectoId) }));

/* ============ Presupuestos ============ */
export const clausulas = pgTable('clausulas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  titulo: text('titulo').notNull(),
  cuerpo: text('cuerpo').notNull(),
  categoria: text('categoria'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const presupuestos = pgTable('presupuestos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  clienteId: uuid('cliente_id').references(() => clientes.id),
  prospectoId: uuid('prospecto_id').references(() => prospectos.id),
  titulo: text('titulo').notNull(),
  subtitulo: text('subtitulo'),
  preparadoPor: text('preparado_por'),
  version: text('version').notNull().default('1.0'),
  moneda: text('moneda').notNull().default('USD'),
  ivaIncluido: boolean('iva_incluido').notNull().default(false),
  estado: estadoPresupuestoEnum('estado').notNull().default('Borrador'),
  fechaEmision: date('fecha_emision'),
  vigenciaDias: integer('vigencia_dias').default(30),
  notas: text('notas'),
  supersedesId: uuid('supersedes_id'),                 // versión anterior (inmutabilidad/versionado)
  bloqueado: boolean('bloqueado').notNull().default(false), // true al aprobar → no se edita
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const presupuestoSecciones = pgTable('presupuesto_secciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  presupuestoId: uuid('presupuesto_id').notNull().references(() => presupuestos.id),
  orden: integer('orden').notNull(),
  titulo: text('titulo').notNull(),
  cuerpo: text('cuerpo'),
});

export const presupuestoItems = pgTable('presupuesto_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  presupuestoId: uuid('presupuesto_id').notNull().references(() => presupuestos.id),
  seccionId: uuid('seccion_id').references(() => presupuestoSecciones.id),
  orden: integer('orden').notNull().default(0),
  tipo: tipoItemEnum('tipo').notNull(),
  concepto: text('concepto').notNull(),
  descripcion: text('descripcion'),
  monto: numeric('monto', { precision: 14, scale: 2 }),
  descuentoPct: numeric('descuento_pct', { precision: 5, scale: 2 }),
  tarifaHora: numeric('tarifa_hora', { precision: 10, scale: 2 }),
  importeMensual: numeric('importe_mensual', { precision: 12, scale: 2 }),
  meses: integer('meses'),
  tramoDesde: integer('tramo_desde'),
  tramoHasta: integer('tramo_hasta'),
  hitoCuando: text('hito_cuando'),
  porcentaje: numeric('porcentaje', { precision: 5, scale: 2 }),
  umbral: text('umbral'),
  recurrente: boolean('recurrente').default(false),
});

/* ============ Contratos · Facturación · Caja ============ */
export const contratos = pgTable('contratos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  presupuestoId: uuid('presupuesto_id').references(() => presupuestos.id),
  proyectoId: uuid('proyecto_id').references(() => proyectos.id),
  titulo: text('titulo').notNull(),
  montoTotal: numeric('monto_total', { precision: 14, scale: 2 }).notNull().default('0'),
  moneda: text('moneda').notNull().default('USD'),
  formaPago: text('forma_pago'),
  datosPagoCifrado: text('datos_pago_cifrado'),        // CBU / datos bancarios — cifrado a nivel app
  version: text('version').notNull().default('1.0'),
  supersedesId: uuid('supersedes_id'),                 // versión anterior (inmutabilidad/versionado)
  bloqueado: boolean('bloqueado').notNull().default(false), // true al firmar → no se edita
  estado: estadoContratoEnum('estado').notNull().default('Activo'),
  firmadoEl: date('firmado_el'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const facturas = pgTable('facturas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  contratoId: uuid('contrato_id').references(() => contratos.id),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  numero: text('numero'),
  concepto: text('concepto'),
  monto: numeric('monto', { precision: 14, scale: 2 }).notNull(),
  moneda: text('moneda').notNull().default('USD'),
  emitida: date('emitida'),
  vencimiento: date('vencimiento'),
  estado: estadoFacturaEnum('estado').notNull().default('Pendiente'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const movimientosCaja = pgTable('movimientos_caja', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  tipo: tipoMovimientoEnum('tipo').notNull(),
  concepto: text('concepto').notNull(),
  monto: numeric('monto', { precision: 14, scale: 2 }).notNull(),
  fecha: date('fecha').notNull(),
  facturaId: uuid('factura_id').references(() => facturas.id),
  gastoId: uuid('gasto_id').references(() => gastos.id),
  proyectoId: uuid('proyecto_id').references(() => proyectos.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

/* ============ Auditoría (quién cambió qué) ============ */
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: text('user_id'),                              // quién (id de Neon Auth)
  accion: accionAuditEnum('accion').notNull(),
  entidad: text('entidad').notNull(),                   // tabla afectada
  entidadId: uuid('entidad_id'),                        // fila afectada
  datos: jsonb('datos'),                                // snapshot del cambio
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

/* ============ Comunicación interna ============ */
export const solicitudes = pgTable('solicitudes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  proyectoId: uuid('proyecto_id').references(() => proyectos.id),
  autorId: uuid('autor_id').references(() => profiles.id),
  autorNombre: text('autor_nombre'),
  tipo: text('tipo').notNull().default('Consulta'),     // Consulta | Aprobación
  titulo: text('titulo').notNull(),
  detalle: text('detalle'),
  estado: text('estado').notNull().default('Abierta'),  // Abierta | Aprobada | Rechazada | Resuelta
  respuesta: text('respuesta'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const notificaciones = pgTable('notificaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  texto: text('texto').notNull(),
  link: text('link'),
  leida: boolean('leida').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

