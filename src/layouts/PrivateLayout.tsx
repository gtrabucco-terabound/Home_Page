import { LayoutDashboard, UserPlus, Building2, FolderKanban, Flag, Wallet, Settings, MessageSquare } from 'lucide-react';
import { AppShell, NavItem } from './AppShell';

const items: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/prospectos', label: 'Prospectos', icon: UserPlus, roles: ['gerente'] },
  { to: '/app/clientes', label: 'Clientes', icon: Building2, roles: ['gerente'] },
  { to: '/app/proyectos', label: 'Proyectos', icon: FolderKanban },
  { to: '/app/hitos', label: 'Hitos', icon: Flag },
  { to: '/app/solicitudes', label: 'Solicitudes', icon: MessageSquare },
  { to: '/app/gastos', label: 'Gastos', icon: Wallet, roles: ['gerente'] },
  { to: '/app/configuracion', label: 'Configuración', icon: Settings, roles: ['gerente'] },
];

export function PrivateLayout() {
  return <AppShell title="ERP Interno" items={items} />;
}
