'use client';

import { useEffect, useState } from 'react';
import { logEvento } from './Registrar';

const KEY = 'lb_pedido';

function leer() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function guardar(lista) {
  try { localStorage.setItem(KEY, JSON.stringify(lista)); } catch {}
  window.dispatchEvent(new Event('lb-pedido-cambio'));
}

export default function BotonAgregar({ codigo, nombre, chico = false }) {
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    const sync = () => setDentro(leer().some((x) => x.codigo === codigo));
    sync();
    window.addEventListener('lb-pedido-cambio', sync);
    return () => window.removeEventListener('lb-pedido-cambio', sync);
  }, [codigo]);

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    const lista = leer();
    if (lista.some((x) => x.codigo === codigo)) {
      guardar(lista.filter((x) => x.codigo !== codigo));
    } else {
      guardar([...lista, { codigo, nombre: nombre || codigo }]);
      logEvento({ tipo: 'lista_add', codigo });
    }
  }

  return (
    <button
      type="button"
      className={'add-pedido' + (dentro ? ' on' : '') + (chico ? ' chico' : '')}
      onClick={toggle}
      aria-pressed={dentro}
    >
      {dentro ? '✓ En el pedido' : '+ Agregar al pedido'}
    </button>
  );
}
