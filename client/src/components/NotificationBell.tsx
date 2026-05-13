/**
 * Campanita de notificaciones (para navbar).
 *
 * Usa el hook compartido `useNotificationsPoll` (polling único cada 2 minutos).
 * Muestra el contador y un dropdown con las últimas 5 notificaciones.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationsPoll } from '../hooks/useNotificationsPoll';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { recent, unreadCount, loading, markRead } = useNotificationsPoll();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 hover:bg-accent rounded-full"
        aria-label="Notificaciones"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-popover border rounded-lg shadow-lg z-50" role="menu">
          <div className="p-3 border-b font-semibold">Notificaciones</div>
          <div className="max-h-80 overflow-auto">
            {loading && recent.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">Cargando...</div>
            )}
            {!loading && recent.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">Sin notificaciones nuevas</div>
            )}
            {recent.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => markRead(n.id)}
                className="w-full text-left p-3 border-b hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{n.asunto}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{n.cuerpo}</div>
                  </div>
                  {!n.visto && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" aria-label="No leída" />}
                </div>
                {n.url_accion && (
                  <span className="text-xs text-primary mt-1 inline-block">
                    Ver detalle →
                  </span>
                )}
              </button>
            ))}
          </div>
          <Link to="/notifications" className="block p-3 text-sm text-center text-primary hover:bg-accent/50">
            Ver todas
          </Link>
        </div>
      )}
    </div>
  );
}
