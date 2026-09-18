'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PORTAL_DISTRIBUIDORES } from '../../../lib/sitio';
import { MARCA, modulo } from '../../../lib/marca';
import './menu-distribuidores.css';

const Chevron = () => (
  <svg className="dist-boton__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
);
const Flecha = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

/** Las dos acciones de "Distribuidores": entrar al portal B2B o ir a registrarse. */
export function OpcionesDistribuidores({ onElegir }) {
  return (
    <>
      {modulo('distribuidores') ? (
        <a className="dist-opcion" href={PORTAL_DISTRIBUIDORES} target="_blank" rel="noopener noreferrer" onClick={onElegir}>
          <span><strong>¿Ya sos distribuidor?</strong><small>Accedé acá al portal de pedidos</small></span>
          <Flecha />
        </a>
      ) : null}
      <Link className="dist-opcion" href="/contacto" onClick={onElegir}>
        <span><strong>No soy distribuidor</strong><small>Quiero ser distribuidor de {MARCA.nombre}</small></span>
        <Flecha />
      </Link>
    </>
  );
}

/**
 * Botón "Distribuidores" del encabezado (mismo estilo que el de la lupa) con un menú
 * de dos opciones. Se cierra con Escape, al hacer clic afuera o al cambiar de página.
 */
export default function MenuDistribuidores({ onAbrir }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);

  useEffect(() => { setAbierto(false); }, [pathname]);

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => { if (caja.current && !caja.current.contains(e.target)) setAbierto(false); };
    const esc = (e) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', fuera); document.removeEventListener('keydown', esc); };
  }, [abierto]);

  return (
    <div className="dist" ref={caja}>
      <button
        type="button"
        className="buscar-boton dist-boton"
        aria-expanded={abierto}
        aria-controls="menu-distribuidores"
        onClick={() => { setAbierto((a) => !a); onAbrir?.(); }}
      >
        Distribuidores <Chevron />
      </button>
      <div id="menu-distribuidores" className="dist-menu" hidden={!abierto}>
        <OpcionesDistribuidores onElegir={() => setAbierto(false)} />
      </div>
    </div>
  );
}
