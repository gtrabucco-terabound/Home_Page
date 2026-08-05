CREATE TYPE "public"."accion_audit" AS ENUM('INSERT', 'UPDATE', 'DELETE', 'APPROVE');--> statement-breakpoint
CREATE TYPE "public"."categoria_gasto" AS ENUM('Infraestructura', 'Licencias', 'Personal', 'Servicios', 'Otros');--> statement-breakpoint
CREATE TYPE "public"."estado_contrato" AS ENUM('Activo', 'Cerrado', 'Cancelado');--> statement-breakpoint
CREATE TYPE "public"."estado_factura" AS ENUM('Pendiente', 'Cobrada', 'Vencida', 'Anulada');--> statement-breakpoint
CREATE TYPE "public"."estado_hito" AS ENUM('Pendiente', 'En progreso', 'Completado', 'Atrasado');--> statement-breakpoint
CREATE TYPE "public"."estado_presupuesto" AS ENUM('Borrador', 'Enviado', 'Aprobado', 'Rechazado', 'Vencido');--> statement-breakpoint
CREATE TYPE "public"."estado_prospecto" AS ENUM('Lead', 'Consulta', 'Reunión', 'Propuesta');--> statement-breakpoint
CREATE TYPE "public"."estado_proyecto" AS ENUM('En curso', 'En riesgo', 'Pausado', 'Cerrado');--> statement-breakpoint
CREATE TYPE "public"."estado_ticket" AS ENUM('Abierto', 'En proceso', 'Resuelto');--> statement-breakpoint
CREATE TYPE "public"."prioridad" AS ENUM('Alta', 'Media', 'Baja');--> statement-breakpoint
CREATE TYPE "public"."tipo_gasto" AS ENUM('Directo', 'Indirecto');--> statement-breakpoint
CREATE TYPE "public"."tipo_item" AS ENUM('Único', 'PorHora', 'Mensual', 'Tramo', 'Hito', 'RevenueShare', 'CostoCliente');--> statement-breakpoint
CREATE TYPE "public"."tipo_movimiento" AS ENUM('Ingreso', 'Egreso');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" text,
	"accion" "accion_audit" NOT NULL,
	"entidad" text NOT NULL,
	"entidad_id" uuid,
	"datos" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clausulas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"cuerpo" text NOT NULL,
	"categoria" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"empresa" text NOT NULL,
	"contacto" text,
	"email" text,
	"industria" text,
	"desde" text,
	"cuit_cifrado" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "contratos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cliente_id" uuid NOT NULL,
	"presupuesto_id" uuid,
	"proyecto_id" uuid,
	"titulo" text NOT NULL,
	"monto_total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"moneda" text DEFAULT 'USD' NOT NULL,
	"forma_pago" text,
	"datos_pago_cifrado" text,
	"version" text DEFAULT '1.0' NOT NULL,
	"supersedes_id" uuid,
	"bloqueado" boolean DEFAULT false NOT NULL,
	"estado" "estado_contrato" DEFAULT 'Activo' NOT NULL,
	"firmado_el" date,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "documentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"proyecto_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"tipo" text,
	"tamano" text,
	"url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "facturas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contrato_id" uuid,
	"cliente_id" uuid NOT NULL,
	"numero" text,
	"concepto" text,
	"monto" numeric(14, 2) NOT NULL,
	"moneda" text DEFAULT 'USD' NOT NULL,
	"emitida" date,
	"vencimiento" date,
	"estado" "estado_factura" DEFAULT 'Pendiente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gastos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"proyecto_id" uuid,
	"persona_id" uuid,
	"tipo" "tipo_gasto" DEFAULT 'Indirecto' NOT NULL,
	"concepto" text NOT NULL,
	"categoria" "categoria_gasto" DEFAULT 'Otros' NOT NULL,
	"monto" numeric(12, 2) DEFAULT '0' NOT NULL,
	"fecha" date,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hitos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"proyecto_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"estado" "estado_hito" DEFAULT 'Pendiente' NOT NULL,
	"fecha" date,
	"orden" integer DEFAULT 0 NOT NULL,
	"peso" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "movimientos_caja" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tipo" "tipo_movimiento" NOT NULL,
	"concepto" text NOT NULL,
	"monto" numeric(14, 2) NOT NULL,
	"fecha" date NOT NULL,
	"factura_id" uuid,
	"gasto_id" uuid,
	"proyecto_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notificaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"texto" text NOT NULL,
	"link" text,
	"leida" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"rol" text,
	"sueldo_mensual" numeric(12, 2) DEFAULT '0' NOT NULL,
	"horas_mensuales" integer DEFAULT 160 NOT NULL,
	"costo_hora" numeric(10, 2),
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "presupuesto_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"presupuesto_id" uuid NOT NULL,
	"seccion_id" uuid,
	"orden" integer DEFAULT 0 NOT NULL,
	"tipo" "tipo_item" NOT NULL,
	"concepto" text NOT NULL,
	"descripcion" text,
	"monto" numeric(14, 2),
	"descuento_pct" numeric(5, 2),
	"tarifa_hora" numeric(10, 2),
	"importe_mensual" numeric(12, 2),
	"meses" integer,
	"tramo_desde" integer,
	"tramo_hasta" integer,
	"hito_cuando" text,
	"porcentaje" numeric(5, 2),
	"umbral" text,
	"recurrente" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "presupuesto_secciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"presupuesto_id" uuid NOT NULL,
	"orden" integer NOT NULL,
	"titulo" text NOT NULL,
	"cuerpo" text
);
--> statement-breakpoint
CREATE TABLE "presupuestos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cliente_id" uuid,
	"prospecto_id" uuid,
	"titulo" text NOT NULL,
	"subtitulo" text,
	"preparado_por" text,
	"version" text DEFAULT '1.0' NOT NULL,
	"moneda" text DEFAULT 'USD' NOT NULL,
	"iva_incluido" boolean DEFAULT false NOT NULL,
	"estado" "estado_presupuesto" DEFAULT 'Borrador' NOT NULL,
	"fecha_emision" date,
	"vigencia_dias" integer DEFAULT 30,
	"notas" text,
	"supersedes_id" uuid,
	"bloqueado" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"rol" text DEFAULT 'desarrollador' NOT NULL,
	"empresa_id" uuid,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "prospectos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"empresa" text NOT NULL,
	"contacto" text,
	"email" text,
	"estado" "estado_prospecto" DEFAULT 'Lead' NOT NULL,
	"valor_estimado" numeric(12, 2) DEFAULT '0',
	"ultimo_contacto" date,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "proyecto_costeo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"proyecto_id" uuid NOT NULL,
	"costo_hora_aplicado" numeric(10, 2),
	"prorrateo_indirecto_pct" numeric(5, 2) DEFAULT '0',
	"notas" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "proyectos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cliente_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"estado" "estado_proyecto" DEFAULT 'En curso' NOT NULL,
	"avance" integer DEFAULT 0 NOT NULL,
	"responsable" text,
	"inicio" date,
	"fin" date,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" text NOT NULL,
	"telefono" text,
	"direccion" text,
	"ciudad" text,
	"horario" text,
	"linkedin" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "solicitudes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"proyecto_id" uuid,
	"autor_id" uuid,
	"autor_nombre" text,
	"tipo" text DEFAULT 'Consulta' NOT NULL,
	"titulo" text NOT NULL,
	"detalle" text,
	"estado" text DEFAULT 'Abierta' NOT NULL,
	"respuesta" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"proyecto_id" uuid NOT NULL,
	"asunto" text NOT NULL,
	"estado" "estado_ticket" DEFAULT 'Abierto' NOT NULL,
	"prioridad" "prioridad" DEFAULT 'Media' NOT NULL,
	"fecha" date,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "timesheets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"persona_id" uuid NOT NULL,
	"proyecto_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"horas" numeric(6, 2) NOT NULL,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clausulas" ADD CONSTRAINT "clausulas_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_contrato_id_contratos_id_fk" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_persona_id_profiles_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hitos" ADD CONSTRAINT "hitos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hitos" ADD CONSTRAINT "hitos_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_caja" ADD CONSTRAINT "movimientos_caja_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_caja" ADD CONSTRAINT "movimientos_caja_factura_id_facturas_id_fk" FOREIGN KEY ("factura_id") REFERENCES "public"."facturas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_caja" ADD CONSTRAINT "movimientos_caja_gasto_id_gastos_id_fk" FOREIGN KEY ("gasto_id") REFERENCES "public"."gastos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_caja" ADD CONSTRAINT "movimientos_caja_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personas" ADD CONSTRAINT "personas_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presupuesto_items" ADD CONSTRAINT "presupuesto_items_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presupuesto_items" ADD CONSTRAINT "presupuesto_items_seccion_id_presupuesto_secciones_id_fk" FOREIGN KEY ("seccion_id") REFERENCES "public"."presupuesto_secciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presupuesto_secciones" ADD CONSTRAINT "presupuesto_secciones_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_prospecto_id_prospectos_id_fk" FOREIGN KEY ("prospecto_id") REFERENCES "public"."prospectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_empresa_id_clientes_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospectos" ADD CONSTRAINT "prospectos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proyecto_costeo" ADD CONSTRAINT "proyecto_costeo_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proyecto_costeo" ADD CONSTRAINT "proyecto_costeo_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_config" ADD CONSTRAINT "site_config_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_autor_id_profiles_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "costeo_proyecto_idx" ON "proyecto_costeo" USING btree ("proyecto_id");--> statement-breakpoint
CREATE UNIQUE INDEX "site_config_tenant_idx" ON "site_config" USING btree ("tenant_id");