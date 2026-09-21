'use client';

import { useRef, useState } from 'react';

/** Copia el código del producto al portapapeles y lo confirma en el mismo botón. */
export default function BotonCopiarCodigo({ codigo }) {
  const [copiado, setCopiado] = useState(false);
  const timer = useRef(null);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(String(codigo));
    } catch {
      // navegadores sin permiso de portapapeles: se copia seleccionando un campo temporal
      const t = document.createElement('textarea');
      t.value = String(codigo);
      t.setAttribute('readonly', '');
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      try { document.execCommand('copy'); } catch {}
      t.remove();
    }
    setCopiado(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <button type="button" className={'copiar-cod' + (copiado ? ' on' : '')} onClick={copiar} title={`Copiar el código ${codigo}`}>
      {copiado ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></svg>
      )}
      <span aria-live="polite">{copiado ? '¡Copiado!' : 'Copiar código'}</span>
    </button>
  );
}
