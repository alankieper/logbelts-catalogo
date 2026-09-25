'use client';

import { useEffect, useState } from 'react';

/**
 * Cómo se ven los productos en el celular: 1, 2 o 3 por fila.
 * La elección se guarda en el navegador (lb_vista) y se aplica en <html data-vista="...">,
 * así vale para todas las páginas del catálogo. En pantallas grandes no se muestra.
 */
const OPCIONES = [
  { v: '1', etiqueta: 'Uno por fila', filas: [1] },
  { v: '2', etiqueta: 'Dos por fila', filas: [1, 1] },
  { v: '3', etiqueta: 'Tres por fila', filas: [1, 1, 1] },
];

export default function VistaCatalogo() {
  const [vista, setVista] = useState('2');

  useEffect(() => {
    try {
      setVista(document.documentElement.dataset.vista || localStorage.getItem('lb_vista') || '2');
    } catch {}
  }, []);

  function elegir(v) {
    setVista(v);
    document.documentElement.dataset.vista = v;
    try { localStorage.setItem('lb_vista', v); } catch {}
  }

  return (
    <div className="vista-cat" role="group" aria-label="Cómo ver los productos">
      <span className="vista-cat__t">Ver</span>
      {OPCIONES.map((o) => (
        <button
          key={o.v}
          type="button"
          className="vista-cat__b"
          aria-pressed={vista === o.v}
          aria-label={o.etiqueta}
          title={o.etiqueta}
          onClick={() => elegir(o.v)}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            {o.filas.map((_, i) => (
              <rect
                key={i}
                x={3 + i * (18 / o.filas.length)}
                y="4"
                width={18 / o.filas.length - 2}
                height="16"
                rx="2"
                fill="currentColor"
              />
            ))}
          </svg>
        </button>
      ))}
    </div>
  );
}
