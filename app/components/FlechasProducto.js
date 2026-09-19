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
 */
export default function FlechasProducto({ prev, next }) {
  const router = useRouter();
  const url = (p) => `/p/${encodeURIComponent(p.codigo)}`;

  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target;
      // no molestar si está escribiendo o dentro de un menú / ventana
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.closest?.('[role="dialog"], [role="listbox"], [role="menu"]'))) return;
      if (e.key === 'ArrowLeft' && prev) { e.preventDefault(); router.push(url(prev)); }
      if (e.key === 'ArrowRight' && next) { e.preventDefault(); router.push(url(next)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, router]);

  return (
    <>
      {prev ? (
        <Link className="flecha-prod flecha-prod--izq" href={url(prev)} aria-label={`Producto anterior: ${prev.codigo} ${prev.nombre || ''}`} title="Anterior (tecla ←)">
          <Flecha izq />
          <span className="flecha-prod__info"><small>Anterior · ←</small>{prev.codigo} · {prev.nombre || ''}</span>
        </Link>
      ) : null}
      {next ? (
        <Link className="flecha-prod flecha-prod--der" href={url(next)} aria-label={`Producto siguiente: ${next.codigo} ${next.nombre || ''}`} title="Siguiente (tecla →)">
          <Flecha />
          <span className="flecha-prod__info"><small>Siguiente · →</small>{next.codigo} · {next.nombre || ''}</span>
        </Link>
      ) : null}
    </>
  );
}
