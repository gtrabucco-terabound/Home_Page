import React from 'react';
import { apiGet, apiSend } from './api';

// Configuración del sitio público, respaldada por la BD (tabla site_config) vía /api.
// El ERP la edita y la web pública la lee.

export interface SiteConfig {
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  horario: string;
  linkedin: string;
}

const DEFAULTS: SiteConfig = {
  email: 'info@terabound.com',
  telefono: '+54 11 0000-0000',
  direccion: 'Av. del Libertador 1000',
  ciudad: 'CABA, Buenos Aires, Argentina',
  horario: 'Lun a Vie · 9:00 a 18:00 (GMT-3)',
  linkedin: 'https://www.linkedin.com/company/terabound',
};

interface SiteConfigValue {
  config: SiteConfig;
  updateConfig: (patch: Partial<SiteConfig>) => Promise<void>;
  reset: () => Promise<void>;
}

const SiteConfigContext = React.createContext<SiteConfigValue | undefined>(undefined);

function normalize(raw: Partial<SiteConfig> | null): SiteConfig {
  return {
    email: raw?.email ?? DEFAULTS.email,
    telefono: raw?.telefono ?? DEFAULTS.telefono,
    direccion: raw?.direccion ?? DEFAULTS.direccion,
    ciudad: raw?.ciudad ?? DEFAULTS.ciudad,
    horario: raw?.horario ?? DEFAULTS.horario,
    linkedin: raw?.linkedin ?? DEFAULTS.linkedin,
  };
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<SiteConfig>(DEFAULTS);

  React.useEffect(() => {
    apiGet<Partial<SiteConfig> | null>('site-config')
      .then((raw) => setConfig(normalize(raw)))
      .catch(() => { /* sin API/DB: quedan los defaults */ });
  }, []);

  const updateConfig = React.useCallback(async (patch: Partial<SiteConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next); // optimista
    const saved = await apiSend<Partial<SiteConfig>>('site-config', 'PUT', next);
    setConfig(normalize(saved));
  }, [config]);

  const reset = React.useCallback(async () => {
    setConfig(DEFAULTS);
    await apiSend<Partial<SiteConfig>>('site-config', 'PUT', DEFAULTS);
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, reset }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = React.useContext(SiteConfigContext);
  if (!ctx) throw new Error('useSiteConfig debe usarse dentro de SiteConfigProvider');
  return ctx;
}
