/**
 * Hook único de polling de notificaciones.
 *
 * Antes existían dos intervalos paralelos (uno en `NotificationBell` y otro en `Navbar`),
 * ambos consultando el mismo endpoint cada 60s. Esto consolida los datos en un único
 * polling cada 120s y los expone vía un contexto ligero (módulo singleton + listeners).
 */
import { useEffect, useState } from 'react';
import { notificationsService } from '../services/notifications.service';
import type { Notificacion } from '../types/notifications.types';

const POLL_MS = 120_000; // 2 minutos
const MAX_RECENT = 5;

type State = {
  recent: Notificacion[];
  unreadCount: number;
  loading: boolean;
};

const listeners = new Set<(s: State) => void>();
let state: State = { recent: [], unreadCount: 0, loading: false };
let intervalId: ReturnType<typeof setInterval> | null = null;
let refCount = 0;

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l(state));
}

async function fetchOnce() {
  if (!localStorage.getItem('access_token')) return;
  setState({ loading: true });
  try {
    const [stats, unread] = await Promise.all([
      notificationsService.getStats(),
      notificationsService.getUnread(),
    ]);
    setState({
      unreadCount: stats?.sin_leer ?? 0,
      recent: (unread ?? []).slice(0, MAX_RECENT),
    });
  } catch {
    // silencioso (puede no estar logueado o el endpoint caído)
  } finally {
    setState({ loading: false });
  }
}

function start() {
  if (intervalId) return;
  void fetchOnce();
  intervalId = setInterval(() => void fetchOnce(), POLL_MS);
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/**
 * Suscribe el componente al estado compartido del polling.
 * El intervalo se inicia con el primer subscriber y se detiene al irse el último.
 */
export function useNotificationsPoll() {
  const [snapshot, setSnapshot] = useState<State>(state);

  useEffect(() => {
    listeners.add(setSnapshot);
    refCount += 1;
    start();
    return () => {
      listeners.delete(setSnapshot);
      refCount -= 1;
      if (refCount <= 0) stop();
    };
  }, []);

  return {
    ...snapshot,
    refresh: fetchOnce,
    markRead: async (id: number) => {
      try {
        await notificationsService.markAsRead(id);
        setState({
          recent: state.recent.map((n) => (n.id === id ? { ...n, visto: true } : n)),
          unreadCount: Math.max(0, state.unreadCount - 1),
        });
      } catch {
        // noop
      }
    },
  };
}
