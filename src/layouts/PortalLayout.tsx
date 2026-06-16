import { LayoutDashboard, FolderKanban, FileText, LifeBuoy } from 'lucide-react';
import { AppShell, NavItem } from './AppShell';

const items: NavItem[] = [
  { to: '/portal', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/portal/proyectos', label: 'Mis Proyectos', icon: FolderKanban },
  { to: '/portal/documentos', label: 'Documentos', icon: FileText },
  { to: '/portal/soporte', label: 'Soporte', icon: LifeBuoy },
];

export function PortalLayout() {
  return <AppShell title="Portal Cliente" items={items} />;
}
