import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { apiGet, apiSend } from '../../lib/api';

interface Noti { id: string; texto: string; link: string | null; leida: boolean; createdAt: string }

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Noti[]>([]);
  const [unread, setUnread] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  const load = React.useCallback(() => {
    apiGet<{ items: Noti[]; unread: number }>('notificaciones')
      .then((d) => { setItems(d.items); setUnread(d.unread); })
      .catch(() => { /* sin sesión / sin red: ignorar */ });
  }, []);

  React.useEffect(() => {
    load();
    const t = window.setInterval(load, 60000); // refresco cada minuto
    return () => window.clearInterval(t);
  }, [load]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const abrirItem = async (n: Noti) => {
    if (!n.leida) { await apiSend(`notificaciones?id=${n.id}`, 'PUT'); load(); }
    if (n.link) { setOpen(false); navigate(n.link); }
  };

  const marcarTodas = async () => { await apiSend('notificaciones?all=1', 'PUT'); load(); };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-label="Notificaciones"
        className="relative p-2 rounded-full hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[420px] overflow-y-auto rounded-2xl bg-[var(--background)] border border-[var(--border)] shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--border)]">
            <span className="font-bold text-sm">Notificaciones</span>
            {unread > 0 && (
              <button onClick={marcarTodas} className="text-xs text-[var(--primary)] hover:underline inline-flex items-center gap-1">
                <Check size={13} /> Marcar todas
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-[var(--muted)]">Sin notificaciones</p>
          ) : (
            <ul>
              {items.map((n) => (
                <li key={n.id}>
                  <button onClick={() => abrirItem(n)}
                    className={`w-full text-left px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--card)] flex gap-3 ${n.leida ? '' : 'bg-[var(--primary)]/5'}`}>
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.leida ? 'bg-transparent' : 'bg-[var(--primary)]'}`} />
                    <span>
                      <span className="block text-sm">{n.texto}</span>
                      <span className="block text-xs text-[var(--muted)] mt-0.5">{new Date(n.createdAt).toLocaleString('es-AR')}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
