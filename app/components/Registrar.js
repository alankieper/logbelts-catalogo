'use client';

import { useEffect } from 'react';

export function logEvento(ev) {
  try {
    const body = JSON.stringify(ev);
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/evento', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/evento', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true });
    }
  } catch {}
}

/** Registra un evento una sola vez al montar (para búsquedas y vistas de ficha). */
export default function Registrar({ tipo, q, codigo, n }) {
  useEffect(() => {
    const key = `ev:${tipo}:${q || ''}:${codigo || ''}`;
    try {
      if (sessionStorage.getItem(key)) return; // no duplicar en la misma sesión / recarga
      sessionStorage.setItem(key, '1');
    } catch {}
    logEvento({ tipo, q, codigo, n });
  }, [tipo, q, codigo, n]);
  return null;
}
