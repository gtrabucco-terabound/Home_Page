// Mapeo de estados a tonos de Badge — compartido entre pantallas.
import type { EstadoProyecto, EstadoHito, EstadoProspecto, EstadoTicket } from '../../lib/mockData';

export function estadoProyectoTone(e: EstadoProyecto) {
  switch (e) {
    case 'En curso': return 'success' as const;
    case 'En riesgo': return 'danger' as const;
    case 'Pausado': return 'warning' as const;
    case 'Cerrado': return 'neutral' as const;
  }
}

export function estadoHitoTone(e: EstadoHito) {
  switch (e) {
    case 'Completado': return 'success' as const;
    case 'En progreso': return 'info' as const;
    case 'Atrasado': return 'danger' as const;
    case 'Pendiente': return 'neutral' as const;
  }
}

export function estadoProspectoTone(e: EstadoProspecto) {
  switch (e) {
    case 'Propuesta': return 'info' as const;
    case 'Reunión': return 'success' as const;
    case 'Consulta': return 'warning' as const;
    case 'Lead': return 'neutral' as const;
  }
}

export function estadoTicketTone(e: EstadoTicket) {
  switch (e) {
    case 'Abierto': return 'warning' as const;
    case 'En proceso': return 'info' as const;
    case 'Resuelto': return 'success' as const;
  }
}
