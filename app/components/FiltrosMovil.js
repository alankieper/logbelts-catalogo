'use client';

import { useEffect, useRef, useState } from 'react';

const svg = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

/**
 * En celular reemplaza la columna de filtros por un botón fijo abajo que abre los
 * filtros en un panel a pantalla completa. En escritorio no se ve: se muestra el
 * panel de siempre (.fdesk) y el botón queda oculto por CSS.
 */
export default function FiltrosMovil({ children, activos = 0, resultados = 0 }) {
  const [abierto, setAbierto] = useState(false);
  const cerrarRef = useRef(null);
  const abrirRef = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cerrarRef.current?.focus();
    const esc = (e) => { if (e.key === 'Escape') setAbierto(false); };
    window.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener('keydown', esc);
      abrirRef.current?.focus();
    };
  }, [abierto]);

  const n = Number(resultados) || 0;

  return (
    <>
      <div className="fdesk">{children}</div>

      <button
        type="button"
        ref={abrirRef}
        className="fmov-fab"
        onClick={() => setAbierto(true)}
        aria-expanded={abierto}
        aria-haspopup="dialog"
      >
        <svg {...svg}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
        Filtros
        {activos > 0 ? <span className="fmov-n">{activos}</span> : null}
      </button>

      {abierto ? (
        <>
          <div className="fmov-back" onClick={() => setAbierto(false)} aria-hidden="true" />
          <div className="fmov-panel" role="dialog" aria-modal="true" aria-label="Filtros">
            <div className="fmov-cab">
              <h2>Filtros</h2>
              <button type="button" ref={cerrarRef} className="fmov-x" onClick={() => setAbierto(false)} aria-label="Cerrar filtros">
                <svg {...svg}><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <div className="fmov-body">{children}</div>
            <div className="fmov-pie">
              <button type="button" className="fmov-ver" onClick={() => setAbierto(false)}>
                Ver {n.toLocaleString('es-AR')} {n === 1 ? 'producto' : 'productos'}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
