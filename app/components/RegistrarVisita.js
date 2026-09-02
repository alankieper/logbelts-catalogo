'use client';

import { useEffect } from 'react';

// Registra UNA visita por sesión de navegador (para contar personas, no páginas).
export default function RegistrarVisita() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem('lb_visita')) return;
      sessionStorage.setItem('lb_visita', '1');
    } catch {
      return;
    }
    try {
      const body = JSON.stringify({ path: location.pathname, ref: document.referrer || '' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/visita', new Blob([body], { type: 'application/json' }));
      } else {
        fetch('/api/visita', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true });
      }
    } catch {}
  }, []);
  return null;
}
