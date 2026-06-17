# -*- coding: utf-8 -*-
"""Genera el PDF del módulo Finanzas para validación del financiero."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)

BLUE = colors.HexColor("#2563EB")
EMER = colors.HexColor("#10B981")
DARK = colors.HexColor("#0F172A")
MUT = colors.HexColor("#64748B")
LIGHT = colors.HexColor("#F1F5F9")
BORD = colors.HexColor("#E2E8F0")

styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Heading1"], textColor=BLUE, fontSize=18, spaceAfter=6, spaceBefore=10)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=DARK, fontSize=13, spaceAfter=4, spaceBefore=8)
BODY = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=10, leading=15, textColor=DARK)
MUTED = ParagraphStyle("Muted", parent=BODY, textColor=MUT, fontSize=9)
CELL = ParagraphStyle("Cell", parent=BODY, fontSize=9, leading=13)
CELLB = ParagraphStyle("CellB", parent=CELL, fontName="Helvetica-Bold")
WHITEB = ParagraphStyle("WhiteB", parent=CELL, textColor=colors.white, fontName="Helvetica-Bold", alignment=TA_CENTER)
BOXC = ParagraphStyle("BoxC", parent=CELL, alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=9)


def flow(items):
    """Fila de cajas con flechas '->' entre ellas."""
    cells, widths = [], []
    n = len(items)
    box_w = 150
    arr_w = 18
    for i, it in enumerate(items):
        cells.append(Paragraph(it, BOXC))
        widths.append(box_w)
        if i < n - 1:
            cells.append(Paragraph("&raquo;", ParagraphStyle("a", parent=BOXC, textColor=MUT, fontSize=12)))
            widths.append(arr_w)
    t = Table([cells], colWidths=widths)
    sty = [("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("ALIGN", (0, 0), (-1, -1), "CENTER"),
           ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]
    for i in range(0, len(cells), 2):
        sty += [("BACKGROUND", (i, 0), (i, 0), LIGHT), ("BOX", (i, 0), (i, 0), 0.8, BLUE),
                ("ROUNDEDCORNERS", [4, 4, 4, 4])]
    t.setStyle(TableStyle(sty))
    return t


def tbl(data, header=True, col_widths=None):
    t = Table(data, colWidths=col_widths, repeatRows=1 if header else 0)
    sty = [
        ("GRID", (0, 0), (-1, -1), 0.5, BORD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]
    if header:
        sty += [("BACKGROUND", (0, 0), (-1, 0), BLUE), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white)]
        sty += [("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT])]
    t.setStyle(TableStyle(sty))
    return t


def P(t, s=BODY):
    return Paragraph(t, s)


story = []

# ---------- Portada ----------
story.append(Spacer(1, 60))
story.append(Paragraph("TERABOUND WEB OS", ParagraphStyle("cover0", parent=BODY, textColor=EMER, fontName="Helvetica-Bold", fontSize=12, alignment=TA_CENTER, spaceAfter=10)))
story.append(Paragraph("Módulo Finanzas", ParagraphStyle("cover1", parent=H1, fontSize=34, alignment=TA_CENTER, textColor=DARK, spaceAfter=6)))
story.append(Paragraph("Flujos de costos, presupuestos y rentabilidad", ParagraphStyle("cover2", parent=BODY, fontSize=14, alignment=TA_CENTER, textColor=MUT, spaceAfter=30)))
story.append(HRFlowable(width="40%", thickness=2, color=BLUE, spaceBefore=6, spaceAfter=20, hAlign="CENTER"))
meta = [
    ["Documento", "Diseño funcional para validación"],
    ["Dirigido a", "Responsable financiero de Terabound"],
    ["Estado", "Propuesta — sujeto a validación"],
    ["Fecha", "Junio 2026"],
]
mt = Table(meta, colWidths=[120, 300], hAlign="CENTER")
mt.setStyle(TableStyle([("FONTSIZE", (0, 0), (-1, -1), 10), ("TEXTCOLOR", (0, 0), (0, -1), MUT),
                        ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"), ("TEXTCOLOR", (1, 0), (1, -1), DARK),
                        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
story.append(mt)
story.append(Spacer(1, 40))
story.append(Paragraph("Confidencial — Terabound", ParagraphStyle("cf", parent=MUTED, alignment=TA_CENTER)))
story.append(PageBreak())

# ---------- 1. Objetivo ----------
story.append(P("1. Objetivo del módulo", H1))
story.append(P("El módulo Finanzas conecta tres realidades del negocio en un solo circuito: <b>lo que planificamos</b> "
               "(presupuesto), <b>lo que consumimos</b> (horas del equipo y gastos) y <b>lo que facturamos y cobramos</b> "
               "(contratos y flujo de caja). Su propósito es responder, en cualquier momento y por proyecto:"))
story.append(P("&bull; ¿Cuánto nos está costando realmente este proyecto?<br/>"
               "&bull; ¿Estamos dentro del presupuesto o nos estamos excediendo?<br/>"
               "&bull; ¿Cuál es el margen real (ingresos - costos)?<br/>"
               "&bull; ¿Cómo se ve el flujo de caja de la empresa (ingresos vs egresos)?"))
story.append(Spacer(1, 6))
story.append(P("Regla de confidencialidad: el cliente <b>nunca</b> ve costos, costo/hora, prorrateos ni margen. "
               "Sólo ve su contrato/presupuesto aprobado y el estado de su facturación.", MUTED))

# ---------- 2. Conceptos ----------
story.append(P("2. Conceptos clave", H1))
story.append(P("2.1. Costo directo vs. indirecto", H2))
data = [
    [P("", WHITEB), P("Directo (al proyecto)", WHITEB), P("Indirecto (a la empresa)", WHITEB)],
    [P("Qué es", CELLB), P("Existe <b>por</b> ese proyecto", CELL), P("Es de la <b>operación general</b>", CELL)],
    [P("Lleva proyecto", CELLB), P("Sí", CELL), P("No (nivel Terabound)", CELL)],
    [P("Ejemplos", CELLB), P("Licencia dedicada, consultoría específica, infra del proyecto", CELL),
     P("Sueldos administrativos, alquiler, software general, servicios", CELL)],
]
story.append(tbl(data, col_widths=[80, 195, 195]))
story.append(Spacer(1, 6))
story.append(P("<b>Criterio práctico:</b> &ldquo;¿Este gasto existiría si el proyecto no existiera?&rdquo; "
               "Si no existiría &raquo; <b>Directo</b>. Si existiría igual &raquo; <b>Indirecto</b>.", MUTED))

story.append(P("2.2. Costo por hora", H2))
story.append(P("Cada persona del equipo se carga con su <b>sueldo</b>. El sistema deriva un <b>costo/hora promedio</b> "
               "(sueldo &divide; horas disponibles) que es el valor por defecto con el que nace todo proyecto. "
               "Cada proyecto puede <b>configurarlo libremente</b> (sobrescribir el costo/hora, ajustar el prorrateo)."))

story.append(P("2.3. Prorrateo de indirectos", H2))
story.append(P("Los costos indirectos no se cargan a un proyecto puntual: se <b>reparten entre todos los proyectos "
               "según las horas trabajadas</b> (TimeSheet). Un proyecto que consumió más horas absorbe más overhead."))

story.append(PageBreak())

# ---------- 3. Flujo de costos ----------
story.append(P("3. Flujo de costos (interno)", H1))
story.append(P("El desarrollador carga horas por proyecto/hito; el gerente las aprueba; sólo las horas aprobadas "
               "cuentan para el costo. Los gastos directos se imputan al proyecto; los indirectos se prorratean."))
story.append(Spacer(1, 8))
story.append(P("Carga y aprobación de horas", H2))
story.append(flow(["Desarrollador<br/>carga horas", "Gerente<br/>aprueba / rechaza", "Horas aprobadas<br/>al costo del proyecto"]))
story.append(Spacer(1, 12))
story.append(P("Imputación de gastos", H2))
story.append(flow(["Gasto DIRECTO<br/>(a un proyecto)", "Suma directa<br/>al proyecto"]))
story.append(Spacer(1, 6))
story.append(flow(["Gasto INDIRECTO<br/>(empresa)", "Prorrateo por horas<br/>(TimeSheet)", "Parte a cada<br/>proyecto"]))
story.append(Spacer(1, 12))
story.append(P("Fórmula del costo de un proyecto", H2))
cost = [[P("Costo de proyecto =", CELLB),
         P("gastos directos del proyecto<br/>+ (horas aprobadas &times; costo/hora)<br/>+ prorrateo de indirectos (según sus horas / horas totales)", CELL)]]
story.append(tbl(cost, header=False, col_widths=[120, 350]))

# ---------- 4. Flujo comercial ----------
story.append(P("4. Flujo comercial (del prospecto al cobro)", H1))
story.append(P("Lo que el cliente acuerda nace en un presupuesto, que al aprobarse se convierte en contrato, "
               "y de ahí salen las facturas y los movimientos de caja."))
story.append(Spacer(1, 8))
story.append(flow(["Prospecto", "Presupuesto", "Aprobación", "Contrato"]))
story.append(Spacer(1, 6))
story.append(flow(["Contrato", "Factura", "Cobro", "Flujo de caja"]))
story.append(Spacer(1, 10))
story.append(P("Los presupuestos y contratos aprobados quedan <b>inmutables y versionados</b> (no se editan; se crea una "
               "versión nueva) y toda acción queda en el registro de auditoría.", MUTED))

story.append(PageBreak())

# ---------- 5. Presupuestos ----------
story.append(P("5. Presupuestos (con plantilla Terabound)", H1))
story.append(P("El generador replica la estructura de los presupuestos actuales (portada, secciones numeradas, "
               "tablas, condiciones, cláusulas legales, footer confidencial). Soporta <b>seis modelos de precio</b>:"))
data = [
    [P("Modelo", WHITEB), P("Cuándo se usa", WHITEB), P("Campos", WHITEB)],
    [P("Pago único", CELLB), P("Implementación, desarrollo", CELL), P("Costo lista, descuento %, monto final", CELL)],
    [P("Por hora", CELLB), P("Integraciones post-assessment", CELL), P("Tarifa por hora", CELL)],
    [P("Mensual", CELLB), P("Licencia, mantenimiento", CELL), P("Importe mensual &times; meses", CELL)],
    [P("Escalonado", CELLB), P("Licenciamiento por volumen", CELL), P("Desde / hasta / importe / total", CELL)],
    [P("Por hitos", CELLB), P("Desarrollo facturado por etapas", CELL), P("Hito, cuándo, monto, % del total", CELL)],
    [P("Revenue Share", CELLB), P("Participación en ingresos", CELL), P("Porcentaje + umbral de activación", CELL)],
]
story.append(tbl(data, col_widths=[90, 200, 180]))
story.append(Spacer(1, 6))
story.append(P("Las cláusulas y textos legales se guardan en una <b>biblioteca reutilizable</b> y se insertan/editan en "
               "cada presupuesto. Todos los montos se expresan sin IVA (se adiciona en la factura).", MUTED))

# ---------- 6. Control presupuestario ----------
story.append(P("6. Control presupuestario y margen", H1))
story.append(P("Comparando lo planificado (del presupuesto) contra lo consumido (horas aprobadas + gastos), el gerente "
               "ve por proyecto un semáforo de avance presupuestario:"))
data = [
    [P("Estado", WHITEB), P("Consumido vs. plan", WHITEB), P("Significado", WHITEB)],
    [P("Verde", CELLB), P("&lt; 80%", CELL), P("Dentro de lo planificado", CELL)],
    [P("Ámbar", CELLB), P("80% &ndash; 100%", CELL), P("Atención: cerca del límite", CELL)],
    [P("Rojo", CELLB), P("&gt; 100%", CELL), P("Excedido: revisar con el equipo", CELL)],
]
story.append(tbl(data, col_widths=[90, 130, 250]))
story.append(Spacer(1, 8))
mg = [[P("Margen del proyecto =", CELLB), P("ingresos facturados - costo del proyecto", CELL)]]
story.append(tbl(mg, header=False, col_widths=[140, 330]))

# ---------- 7. Roles ----------
story.append(P("7. Roles y visibilidad", H1))
data = [
    [P("Rol", WHITEB), P("Qué ve / hace en Finanzas", WHITEB)],
    [P("Gerente", CELLB), P("Todo: costos, sueldos, márgenes, presupuestos, contratos, flujo de caja. Aprueba horas.", CELL)],
    [P("Desarrollador", CELLB), P("Carga sus horas por proyecto/hito. <b>No ve</b> dinero, costos ni márgenes.", CELL)],
    [P("Cliente", CELLB), P("Su contrato/presupuesto aprobado y el estado de su facturación. <b>Nunca</b> ve costos ni margen.", CELL)],
]
story.append(tbl(data, col_widths=[100, 370]))

story.append(PageBreak())

# ---------- 8. Puntos a validar ----------
story.append(P("8. Puntos a validar (financiero)", H1))
story.append(P("Antes de construir, necesitamos tu confirmación sobre estas definiciones contables:"))
data = [
    [P("Tema", WHITEB), P("A definir", WHITEB)],
    [P("Coherencia gasto", CELLB), P("¿Forzar que Directo =&gt; tenga proyecto e Indirecto =&gt; sin proyecto?", CELL)],
    [P("Costo/hora", CELLB), P("¿Promedio único de empresa, por persona, o por rol? ¿Cómo se calculan las horas disponibles?", CELL)],
    [P("Prorrateo", CELLB), P("¿El reparto de indirectos es por horas trabajadas? ¿Período (mensual)?", CELL)],
    [P("Sub-categorías", CELLB), P("¿Querés sub-categorías de indirecto (estructura, comercial, etc.) para informes?", CELL)],
    [P("Moneda / IVA", CELLB), P("¿USD con tipo de cambio? ¿IVA siempre adicional en factura?", CELL)],
    [P("Revenue Share", CELLB), P("¿Rangos típicos de % y umbral? ¿Liquidación trimestral?", CELL)],
    [P("Aprobación horas", CELLB), P("¿Quién aprueba? ¿Tope de horas por período?", CELL)],
]
story.append(tbl(data, col_widths=[110, 360]))
story.append(Spacer(1, 14))
story.append(P("Próximos pasos", H2))
story.append(P("1. El financiero revisa y confirma/ajusta los puntos de la sección 8.<br/>"
               "2. Terabound ajusta el modelo de datos según esas definiciones.<br/>"
               "3. Se construye el módulo (horas + aprobación + control), luego presupuestos y contratos."))
story.append(Spacer(1, 20))
story.append(HRFlowable(width="100%", thickness=0.5, color=BORD))
story.append(Paragraph("Terabound Web OS &mdash; Módulo Finanzas &mdash; Documento para validación &mdash; Confidencial", MUTED))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUT)
    canvas.drawString(20 * mm, 12 * mm, "Terabound — Confidencial")
    canvas.drawRightString(190 * mm, 12 * mm, "Pagina %d" % doc.page)
    canvas.restoreState()


doc = SimpleDocTemplate("docs/Terabound_Modulo_Finanzas.pdf", pagesize=A4,
                        leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
                        title="Terabound Web OS - Modulo Finanzas")
doc.build(story, onLaterPages=footer, onFirstPage=lambda c, d: None)
print("PDF generado: docs/Terabound_Modulo_Finanzas.pdf")
