'use client';

import { useEffect, useState } from 'react';

/**
 * Menú del panel de administración.
 * En pantallas grandes se ve la fila de siempre; en el celular se abre como panel lateral
 * con el botón ☰ (los links y las acciones llegan ya armados desde AdminHeader).
 */
export default function MenuAdmin({ pendientes = 0, children }) {
  const [abierto, setAbierto] = useState(false);

  // con el panel abierto no se desplaza la página de atrás; Esc lo cierra
  useEffect(() => {
    const tecla = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('keydown', tecla);
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', tecla);
      document.body.style.overflow = '';
    };
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        className="adm-menu-boton"
        aria-expanded={abierto}
        aria-controls="adm-panel"
        aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
        onClick={() => setAbierto((a) => !a)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {abierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
        {!abierto && pendientes > 0 ? <span className="adm-noti adm-noti--boton">{pendientes > 99 ? '99+' : pendientes}</span> : null}
      </button>

      <div className="adm-fondo" data-abierto={abierto} onClick={() => setAbierto(false)} aria-hidden="true" />
      <div id="adm-panel" className="adm-panel" data-abierto={abierto} onClick={() => setAbierto(false)}>
        {children}
      </div>
    </>
  );
}
