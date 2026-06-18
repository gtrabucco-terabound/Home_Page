import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, Rol } from './lib/AuthContext';
import { PublicHome } from './pages/PublicHome';
import { Login } from './pages/Login';
import { PrivateLayout } from './layouts/PrivateLayout';
import { PortalLayout } from './layouts/PortalLayout';
import { ErpDashboard } from './pages/erp/ErpDashboard';
import { Prospectos } from './pages/erp/Prospectos';
import { Clientes } from './pages/erp/Clientes';
import { Proyectos } from './pages/erp/Proyectos';
import { Hitos } from './pages/erp/Hitos';
import { Gastos } from './pages/erp/Gastos';
import { Solicitudes } from './pages/erp/Solicitudes';
import { Configuracion } from './pages/erp/Configuracion';
import { PortalDashboard } from './pages/portal/PortalDashboard';
import { PortalProyectos } from './pages/portal/PortalProyectos';
import { PortalDocumentos } from './pages/portal/PortalDocumentos';
import { PortalSoporte } from './pages/portal/PortalSoporte';

function RequireRol({ roles, children }: { roles: Rol[]; children: React.ReactNode }) {
  const { usuario, cargando } = useAuth();
  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">Cargando…</div>;
  }
  if (!usuario) return <Navigate to="/login" replace />;
  if (!roles.includes(usuario.rol)) {
    // Redirige a cada quien a su espacio
    return <Navigate to={usuario.rol === 'cliente' ? '/portal' : '/app'} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route path="/login" element={<Login />} />

      {/* ERP interno — admin / empleado */}
      <Route
        path="/app"
        element={
          <RequireRol roles={['gerente', 'desarrollador']}>
            <PrivateLayout />
          </RequireRol>
        }
      >
        <Route index element={<ErpDashboard />} />
        <Route path="prospectos" element={<RequireRol roles={['gerente']}><Prospectos /></RequireRol>} />
        <Route path="clientes" element={<RequireRol roles={['gerente']}><Clientes /></RequireRol>} />
        <Route path="proyectos" element={<Proyectos />} />
        <Route path="hitos" element={<Hitos />} />
        <Route path="solicitudes" element={<Solicitudes />} />
        <Route path="gastos" element={<RequireRol roles={['gerente']}><Gastos /></RequireRol>} />
        <Route path="configuracion" element={<RequireRol roles={['gerente']}><Configuracion /></RequireRol>} />
      </Route>

      {/* Portal Cliente */}
      <Route
        path="/portal"
        element={
          <RequireRol roles={['cliente']}>
            <PortalLayout />
          </RequireRol>
        }
      >
        <Route index element={<PortalDashboard />} />
        <Route path="proyectos" element={<PortalProyectos />} />
        <Route path="documentos" element={<PortalDocumentos />} />
        <Route path="soporte" element={<PortalSoporte />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
