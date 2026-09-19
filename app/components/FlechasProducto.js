'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './flechas-producto.css';

const Flecha = ({ izq }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={izq ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'} />
  </svg>
);

/**
 * Flechas a los costados de la ficha para pasar al producto anterior / siguiente de la
 * misma categoría, como quien hojea un catálogo. También con las teclas ← y →.
 * prev / next: { codigo, nombre } o null.
 * catAnterior / catSiguiente: cuando se llega al principio o al final de la categoría, la flecha
 * ofrece pasar a la categoría anterior / siguiente ({ href, nombre, familia }).
 */
export default function FlechasProducto({ prev, next, catAnterior = null, catSiguiente = null }) {
  const router = useRouter();
  const url = (p) => `/p/${encodeURIComponent(p.codigo)}`;
  const destinoIzq = prev ? url(prev) : catAnterior?.href;
  const destinoDer = next ? url(next) : catSiguiente?.href;

  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target;
      // no molestar si está escribiendo o dentro de un menú / ventana
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.closest?.('[role="dialog"], [role="listbox"], [role="menu"]'))) return;
      if (e.key === 'ArrowLeft' && destinoIzq) { e.preventDefault(); router.push(destinoIzq); }
      if (e.key === 'ArrowRight' && destinoDer) { e.preventDefault(); router.push(destinoDer); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [destinoIzq, destinoDer, router]);

  const detalle = (c) => (c.familia && c.familia !== c.nombre ? ` · ${c.familia}` : '');

  return (
    <>
      {prev ? (
        <Link className="flecha-prod flecha-prod--izq" href={url(prev)} aria-label={`Producto anterior: ${prev.codigo} ${prev.nombre || ''}`} title="Anterior (tecla ←)">
          <Flecha izq />
          <span className="flecha-prod__info"><small>Anterior · ←</small>{prev.codigo} · {prev.nombre || ''}</span>
        </Link>
      ) : catAnterior ? (
        <Link className="flecha-prod flecha-prod--izq flecha-prod--cat" href={catAnterior.href} aria-label={`Categoría anterior: ${catAnterior.nombre}`} title="Categoría anterior (tecla ←)">
          <Flecha izq />
          <span className="flecha-prod__info"><small>Categoría anterior · ←</small>{catAnterior.nombre}{detalle(catAnterior)}</span>
        </Link>
      ) : null}
      {next ? (
        <Link className="flecha-prod flecha-prod--der" href={url(next)} aria-label={`Producto siguiente: ${next.codigo} ${next.nombre || ''}`} title="Siguiente (tecla →)">
          <Flecha />
          <span className="flecha-prod__info"><small>Siguiente · →</small>{next.codigo} · {next.nombre || ''}</span>
        </Link>
      ) : catSiguiente ? (
        <Link className="flecha-prod flecha-prod--der flecha-prod--cat" href={catSiguiente.href} aria-label={`Fin de la categoría. Ir a la siguiente: ${catSiguiente.nombre}`} title="Siguiente categoría (tecla →)">
          <Flecha />
          <span className="flecha-prod__info"><small>Fin de la categoría · Siguiente →</small>{catSiguiente.nombre}{detalle(catSiguiente)}</span>
        </Link>
      ) : null}
    </>
  );
}
