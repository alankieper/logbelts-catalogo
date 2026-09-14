'use client';

import { useEffect, useState } from 'react';
import { logEvento } from './Registrar';
import { guardarFavoritos, leerFavoritos } from './pedidoStore';

export default function BotonFavorito({ codigo, nombre, chico = false }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(leerFavoritos().some((x) => x.codigo === codigo));
    sync();
    window.addEventListener('lb-favoritos-cambio', sync);
    return () => window.removeEventListener('lb-favoritos-cambio', sync);
  }, [codigo]);

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    const lista = leerFavoritos();
    if (lista.some((x) => x.codigo === codigo)) {
      guardarFavoritos(lista.filter((x) => x.codigo !== codigo));
    } else {
      guardarFavoritos([{ codigo, nombre: nombre || codigo }, ...lista].slice(0, 500));
      logEvento({ tipo: 'favorito', codigo });
    }
  }

  const etiqueta = on ? 'Quitar de favoritos' : 'Guardar en favoritos';
  return (
    <button
      type="button"
      className={'fav-btn' + (on ? ' on' : '') + (chico ? ' chico' : '')}
      onClick={toggle}
      aria-pressed={on}
      aria-label={chico ? etiqueta : undefined}
      title={etiqueta}
    >
      <svg viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-9.3-9.3C1.4 7.8 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.3 4.3 6.7-1.8 4.7-9.3 9.3-9.3 9.3Z" />
      </svg>
      {chico ? null : on ? 'En favoritos' : 'Favorito'}
    </button>
  );
}
