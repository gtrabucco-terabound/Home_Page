# Esquema de Base de Datos — Terabound Web OS

> Propuesta para aprobación (Bloque B4). **Multitenant desde el día 1** (`tenant_id`).
> Stack: Neon Postgres + Drizzle ORM + Neon Auth + Vercel Functions.
> Este documento es la fuente de verdad del diseño; nada se aplica a Neon hasta tu OK.

## Convenciones (todas las tablas)

- **`id`**: `uuid` (PK) con `defaultRandom()` — no adivinable, seguro, apto para multitenant.
- **`tenant_id`**: `uuid` (FK → `tenants`) — aislamiento por inquilino en cada fila.
- **`created_at` / `updated_at`**: `timestamptz` con `defaultNow()` — auditoría.
- **`deleted_at`**: `timestamptz` nullable — *soft delete* (no se borra físico).
- Nombres en `snake_case`, tablas en plural, FK como `<entidad>_id`.
- Estados como **enums** Postgres. Restricciones `NOT NULL`, `UNIQUE`, `CHECK`.
- Índices en `tenant_id` y en cada FK.
- **RLS (Row Level Security)** activable por tabla: la base misma bloquea acceso cruzado entre tenants.

## Esquema Drizzle (`src/db/schema.ts`)

```ts
import {
  pgTable, uuid, text, integer, date, timestamp, pgEnum, numeric, uniqueIndex,
} from 'drizzle-orm/pg-core';

/* ---------- Enums ---------- */
export const rolEnum = pgEnum('rol', ['admin', 'empleado', 'cliente']);
export const estadoProspectoEnum = pgEnum('estado_prospecto', ['Lead', 'Consulta', 'Reunión', 'Propuesta']);
export const estadoProyectoEnum = pgEnum('estado_proyecto', ['En curso', 'En riesgo', 'Pausado', 'Cerrado']);
export const estadoHitoEnum = pgEnum('estado_hito', ['Pendiente', 'En progreso', 'Completado', 'Atrasado']);
export const estadoTicketEnum = pgEnum('estado_ticket', ['Abierto', 'En proceso', 'Resuelto']);
export const prioridadEnum = pgEnum('prioridad', ['Alta', 'Media', 'Baja']);
export const categoriaGastoEnum = pgEnum('categoria_gasto', ['Infraestructura', 'Licencias', 'Personal', 'Servicios', 'Otros']);

/* ---------- Columnas estándar (helper conceptual) ---------- */
// id, tenantId, createdAt, updatedAt, deletedAt se repiten en cada tabla.

/* ---------- Raíz multitenant ---------- */
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/* ---------- Usuarios / perfiles (enlaza con Neon Auth) ---------- */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: text('user_id').notNull(),            // id del usuario en Neon Auth (Stack)
  nombre: text('nombre').notNull(),
  email: text('email').notNull(),
  rol: rolEnum('rol').notNull().default('empleado'),
  empresaId: uuid('empresa_id').references(() => clientes.id), // sólo para rol 'cliente'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({ userUniq: uniqueIndex('profiles_user_idx').on(t.userId) }));

/* ---------- Clientes ---------- */
export const clientes = pgTable('clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  empresa: text('empresa').notNull(),
  contacto: text('contacto'),
  email: text('email'),
  industria: text('industria'),
  desde: text('desde'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/* ---------- Prospectos ---------- */
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

/* ---------- Proyectos ---------- */
export const proyectos = pgTable('proyectos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  nombre: text('nombre').notNull(),
  estado: estadoProyectoEnum('estado').notNull().default('En curso'),
  avance: integer('avance').notNull().default(0),   // CHECK 0..100
  responsable: text('responsable'),
  inicio: date('inicio'),
  fin: date('fin'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/* ---------- Hitos ---------- */
export const hitos = pgTable('hitos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  proyectoId: uuid('proyecto_id').notNull().references(() => proyectos.id),
  titulo: text('titulo').notNull(),
  estado: estadoHitoEnum('estado').notNull().default('Pendiente'),
  fecha: date('fecha'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/* ---------- Documentos ---------- */
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

/* ---------- Tickets de soporte ---------- */
export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  proyectoId: uuid('proyecto_id').notNull().references(() => proyectos.id),
  asunto: text('asunto').notNull(),
  estado: estadoTicketEnum('estado').notNull().default('Abierto'),
  prioridad: prioridadEnum('prioridad').notNull().default('Media'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/* ---------- Gastos (visibilidad admin) ---------- */
export const gastos = pgTable('gastos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  proyectoId: uuid('proyecto_id').references(() => proyectos.id), // opcional
  concepto: text('concepto').notNull(),
  categoria: categoriaGastoEnum('categoria').notNull().default('Otros'),
  monto: numeric('monto', { precision: 12, scale: 2 }).notNull().default('0'),
  fecha: date('fecha'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

/* ---------- Configuración del sitio público (editable desde ERP) ---------- */
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
```

## Relaciones

- `tenants` 1—N → `profiles`, `clientes`, `prospectos`, `proyectos`, `gastos`; 1—1 → `site_config`.
- `clientes` 1—N → `proyectos`.
- `proyectos` 1—N → `hitos`, `documentos`, `tickets`, `gastos`.
- `profiles.empresa_id` N—1 → `clientes` (sólo usuarios con rol `cliente`).

## Orden de migración

1. enums → 2. `tenants` → 3. `clientes` → 4. `profiles` → 5. `prospectos`,
`proyectos` → 6. `hitos`, `documentos`, `tickets`, `gastos`, `site_config`.

## Seguridad / acceso

- Secretos (`DATABASE_URL`, claves de Neon Auth) sólo en env vars del servidor (Vercel Functions). Nunca en el bundle del cliente.
- Toda query del ERP/Portal filtra por `tenant_id` del usuario; el Portal además por `empresa_id`.
- RLS opcional como segunda barrera a nivel base de datos.

---

# Módulo Finanzas + Presupuestos

> Costos a nivel empresa, prorrateo por timesheet, presupuestos con template,
> contratos, facturación y flujo de caja. El cliente **nunca** ve costos ni margen.

## Enums adicionales

```ts
export const tipoGastoEnum = pgEnum('tipo_gasto', ['Directo', 'Indirecto']);
export const estadoPresupuestoEnum = pgEnum('estado_presupuesto', ['Borrador', 'Enviado', 'Aprobado', 'Rechazado', 'Vencido']);
export const tipoItemEnum = pgEnum('tipo_item', ['Único', 'PorHora', 'Mensual', 'Tramo', 'Hito', 'RevenueShare', 'CostoCliente']);
export const estadoContratoEnum = pgEnum('estado_contrato', ['Activo', 'Cerrado', 'Cancelado']);
export const estadoFacturaEnum = pgEnum('estado_factura', ['Pendiente', 'Cobrada', 'Vencida', 'Anulada']);
export const tipoMovimientoEnum = pgEnum('tipo_movimiento', ['Ingreso', 'Egreso']);
```

## Equipo y costeo

```ts
export const personas = pgTable('personas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  nombre: text('nombre').notNull(),
  rol: text('rol'),                                   // ej. Dev, PM, Domain Expert
  sueldoMensual: numeric('sueldo_mensual', { precision: 12, scale: 2 }).notNull().default('0'),
  horasMensuales: integer('horas_mensuales').notNull().default(160),
  // costo_hora se deriva = sueldo_mensual / horas_mensuales (promedio empresa configurable)
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

// Configuración de costeo por proyecto (default promedio empresa, overrideable)
export const proyectoCosteo = pgTable('proyecto_costeo', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  proyectoId: uuid('proyecto_id').notNull().references(() => proyectos.id),
  costoHoraAplicado: numeric('costo_hora_aplicado', { precision: 10, scale: 2 }), // null = usa promedio
  prorrateoIndirectoPct: numeric('prorrateo_indirecto_pct', { precision: 5, scale: 2 }).default('0'),
  notas: text('notas'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({ uniq: uniqueIndex('costeo_proyecto_idx').on(t.proyectoId) }));
```

> **gastos** se reformula: pasa a nivel empresa con `tipo` (Directo/Indirecto) y
> `proyecto_id` opcional (solo para costos directos). Los indirectos se prorratean
> por horas de `timesheets`. **Costo de proyecto = directos + (horas × costo_hora) + prorrateo indirectos.**

## Presupuestos (con template + biblioteca)

```ts
export const clausulas = pgTable('clausulas', {           // biblioteca reutilizable
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  titulo: text('titulo').notNull(),                       // ej. "Propiedad intelectual"
  cuerpo: text('cuerpo').notNull(),
  categoria: text('categoria'),                           // legal, comercial, garantía…
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const presupuestos = pgTable('presupuestos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  clienteId: uuid('cliente_id').references(() => clientes.id),
  prospectoId: uuid('prospecto_id').references(() => prospectos.id),
  titulo: text('titulo').notNull(),                       // "AegisWell — Estimación de Inversión"
  subtitulo: text('subtitulo'),
  preparadoPor: text('preparado_por'),                    // persona/Terabound
  version: text('version').notNull().default('1.0'),
  moneda: text('moneda').notNull().default('USD'),
  ivaIncluido: boolean('iva_incluido').notNull().default(false),
  estado: estadoPresupuestoEnum('estado').notNull().default('Borrador'),
  fechaEmision: date('fecha_emision'),
  vigenciaDias: integer('vigencia_dias').default(30),
  notas: text('notas'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const presupuestoSecciones = pgTable('presupuesto_secciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  presupuestoId: uuid('presupuesto_id').notNull().references(() => presupuestos.id),
  orden: integer('orden').notNull(),
  titulo: text('titulo').notNull(),
  cuerpo: text('cuerpo'),                                 // texto rico (editable, puede venir de clausulas)
});

export const presupuestoItems = pgTable('presupuesto_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  presupuestoId: uuid('presupuesto_id').notNull().references(() => presupuestos.id),
  seccionId: uuid('seccion_id').references(() => presupuestoSecciones.id),
  orden: integer('orden').notNull().default(0),
  tipo: tipoItemEnum('tipo').notNull(),                   // los 6 modelos de precio
  concepto: text('concepto').notNull(),
  descripcion: text('descripcion'),
  // campos flexibles según tipo:
  monto: numeric('monto', { precision: 14, scale: 2 }),         // Único / Hito
  descuentoPct: numeric('descuento_pct', { precision: 5, scale: 2 }),
  tarifaHora: numeric('tarifa_hora', { precision: 10, scale: 2 }), // PorHora
  importeMensual: numeric('importe_mensual', { precision: 12, scale: 2 }), // Mensual
  meses: integer('meses'),
  tramoDesde: integer('tramo_desde'),                     // Tramo (escalonado)
  tramoHasta: integer('tramo_hasta'),
  hitoCuando: text('hito_cuando'),                        // Hito
  porcentaje: numeric('porcentaje', { precision: 5, scale: 2 }), // Hito % / RevenueShare %
  umbral: text('umbral'),                                 // RevenueShare
  recurrente: boolean('recurrente').default(false),       // CostoCliente
});
```

## Contratos · Facturación · Flujo de caja

```ts
export const contratos = pgTable('contratos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  presupuestoId: uuid('presupuesto_id').references(() => presupuestos.id), // origen aprobado
  proyectoId: uuid('proyecto_id').references(() => proyectos.id),
  titulo: text('titulo').notNull(),
  montoTotal: numeric('monto_total', { precision: 14, scale: 2 }).notNull().default('0'),
  moneda: text('moneda').notNull().default('USD'),
  formaPago: text('forma_pago'),                          // hitos / mensual / mixto
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

// Libro de flujo de caja (ingresos vs egresos). Puede derivarse de facturas+gastos
// o registrarse explícito para movimientos no atados a factura/gasto.
export const movimientosCaja = pgTable('movimientos_caja', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  tipo: tipoMovimientoEnum('tipo').notNull(),             // Ingreso / Egreso
  concepto: text('concepto').notNull(),
  monto: numeric('monto', { precision: 14, scale: 2 }).notNull(),
  fecha: date('fecha').notNull(),
  facturaId: uuid('factura_id').references(() => facturas.id),
  gastoId: uuid('gasto_id').references(() => gastos.id),
  proyectoId: uuid('proyecto_id').references(() => proyectos.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

## Visibilidad por rol (Finanzas)

- **admin**: todo (costos, sueldos, margen, flujo de caja, presupuestos, contratos).
- **empleado**: timesheets (carga horas), proyectos, presupuestos (según permiso); **sin** sueldos/margen/flujo de caja.
- **cliente** (Portal): su **contrato/presupuesto aprobado** y estado de **facturación/cobranza**. Nunca costos, costo_hora, prorrateos ni margen.

## Margen por proyecto (cálculo, no columna)

```
costo_proyecto = Σ gastos_directos
               + Σ (timesheets.horas × costo_hora_aplicado)
               + prorrateo_indirectos (según horas del proyecto / horas totales)
margen = ingresos_facturados − costo_proyecto
```

---

# Roadmap de extensiones (aprobado, a construir tras Neon Auth)

Orden acordado: **B4.4 Neon Auth** → **B6 Operación del equipo** → **B7 Comunicación interna**.

## B6 — Horas del equipo + aprobación + control presupuestario
Extiende tablas existentes:
- `timesheets`: + `hitoId` (FK opcional), + `estado` enum (`Pendiente`/`Aprobada`/`Rechazada`), + `aprobadoPor`, + `aprobadoEl`.
- `proyecto_costeo`: + `horasPlanificadas`, + `montoPlanificado` (baseline tomado del presupuesto aprobado).

Flujo: el **desarrollador** carga horas por proyecto/hito (estado Pendiente) → el **gerente** aprueba/rechaza → solo las aprobadas cuentan para el consumo.

Control (solo gerente):
```
consumido = Σ horas aprobadas × costo_hora (+ gastos directos)
plan      = horasPlanificadas × costo_hora
semáforo  = consumido/plan → verde <80% · ámbar 80-100% · rojo >100%
```
Pantallas: Dev *Mis horas* · Gerente *Aprobación de horas* + *Control presupuestario*.

## B7 — Comunicación interna (consultas/aprobaciones con fotos)
Tablas nuevas:
- `solicitudes`: `id`, `tenant_id`, `proyecto_id`, `autor_id`, `tipo` (`Consulta`/`Aprobación`), `titulo`, `detalle`, `estado` (`Abierta`/`Aprobada`/`Rechazada`/`Resuelta`), `respuesta`, timestamps.
- `solicitud_adjuntos`: `id`, `solicitud_id`, `url`, `nombre`, `tipo` — las **fotos** (URL; archivo en **Vercel Blob**).
- `notificaciones` (opcional): `id`, `tenant_id`, `user_id`, `texto`, `leida`, `link` — campanita en la barra superior.

Infra: **Vercel Blob** para archivos; en la BD se guarda solo la URL.

## Pendientes ya identificados para B4.4 (Neon Auth)
- Alta de empleados desde Admin + asignación de rol y accesos.
- Relación persona↔proyecto para el filtrado "solo asignado" del desarrollador.
- Enforcement de permisos server-side (hoy gating de UI/rutas).
- Alinear el enum `profiles.rol` a `gerente`/`desarrollador`/`cliente`.

## B-Finanzas — Aprobación de gastos + rol financiero (diseñado, a construir con el financiero)
> Decidido: se diseña ahora, se construye junto con Finanzas (alinear reglas contables).

- **Rol nuevo `financiero`**: aprueba gastos (y a futuro, lo de plata: contratos, facturación, flujo de caja). Distinto del `gerente` general. Sumar a la lista de roles (`gerente` | `financiero` | `desarrollador` | `cliente`).
- **`gastos`**: agregar `estado` (`Pendiente` | `Aprobado` | `Rechazado`), `aprobado_por` (uuid → profiles), `aprobado_el`, `motivo_rechazo`.
- **Flujo**: integrante registra → `Pendiente` → el `financiero` aprueba/rechaza (con motivo). Gastos cargados por `financiero`/`gerente` pueden nacer `Aprobado`.
- **Regla**: **solo los `Aprobado` suman** en totales, dashboard y flujo de caja. Pendientes/rechazados no computan.
- **Notificaciones** (infra ya existente): al registrar → avisa al `financiero`; al resolver → avisa al autor.
- Mismo patrón que la **aprobación de horas (TimeSheet)** del módulo Finanzas — conviene construirlos juntos.
