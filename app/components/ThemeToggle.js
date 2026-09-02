'use client';

import { useEffect, useState } from 'react';

// El data-theme inicial lo pone un script inline en <head> (sin parpadeo).
export default function ThemeToggle() {
  const [tema, setTema] = useState('claro');

  useEffect(() => {
    const t = document.documentElement.getAttribute('data-theme') || 'claro';
    setTema(t);
  }, []);

  function cambiar() {
    const nuevo = tema === 'oscuro' ? 'claro' : 'oscuro';
    document.documentElement.setAttribute('data-theme', nuevo);
    try { localStorage.setItem('tema', nuevo); } catch {}
    setTema(nuevo);
  }

  return (
    <button type="button" className="themetoggle" onClick={cambiar} title="Cambiar modo claro / oscuro" aria-label="Cambiar modo claro u oscuro">
      {tema === 'oscuro' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
      <span>{tema === 'oscuro' ? 'Claro' : 'Oscuro'}</span>
    </button>
  );
}
