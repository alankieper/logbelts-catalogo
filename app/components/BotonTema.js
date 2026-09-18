'use client';

import { useEffect, useState } from 'react';

/*
 * Botón de modo claro / oscuro. El tema vive en <html data-theme="claro|oscuro"> y se guarda en
 * localStorage ('lb_tema'). El script de app/layout.js lo aplica antes del primer pintado, así que
 * acá solo se lee y se cambia. Los dos íconos se dibujan siempre y el CSS muestra el que corresponde
 * según data-theme, para que el botón se vea bien aunque React todavía no haya hidratado.
 */
const CLAVE = 'lb_tema';

function aplicar(tema) {
  const html = document.documentElement;
  // Sin transiciones durante el cambio: todo pasa de un tema al otro en el mismo cuadro.
  html.classList.add('tema-cambiando');
  html.setAttribute('data-theme', tema);
  html.style.colorScheme = tema === 'oscuro' ? 'dark' : 'light';
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => html.classList.remove('tema-cambiando')));
}

export default function BotonTema({ className = '' }) {
  const [oscuro, setOscuro] = useState(false);

  useEffect(() => {
    setOscuro(document.documentElement.getAttribute('data-theme') === 'oscuro');
    // Si se cambia en otra pestaña, esta también se actualiza.
    const alGuardar = (e) => {
      if (e.key !== CLAVE) return;
      const tema = e.newValue === 'oscuro' ? 'oscuro' : 'claro';
      aplicar(tema);
      setOscuro(tema === 'oscuro');
    };
    window.addEventListener('storage', alGuardar);
    return () => window.removeEventListener('storage', alGuardar);
  }, []);

  function cambiar() {
    const tema = oscuro ? 'claro' : 'oscuro';
    aplicar(tema);
    setOscuro(!oscuro);
    try { window.localStorage.setItem(CLAVE, tema); } catch (e) { /* sin almacenamiento: vale solo para esta visita */ }
  }

  return (
    <button
      type="button"
      className={`tema-boton ${className}`.trim()}
      onClick={cambiar}
      aria-pressed={oscuro}
      aria-label="Modo oscuro"
      title={oscuro ? 'Pasar a modo claro' : 'Pasar a modo oscuro'}
    >
      {/* Luna: se ve en modo claro (invita a pasar a oscuro) */}
      <svg className="tema-boton__luna" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
      {/* Sol: se ve en modo oscuro (invita a volver a claro) */}
      <svg className="tema-boton__sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <span className="tema-boton__texto tema-boton__luna" aria-hidden="true">Modo oscuro</span>
      <span className="tema-boton__texto tema-boton__sol" aria-hidden="true">Modo claro</span>
    </button>
  );
}
