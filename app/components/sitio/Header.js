'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HERRAMIENTAS, NAV, esCatalogo } from '../../../lib/sitio';
import { MARCA } from '../../../lib/marca';
import { Buscar } from './Iconos';
import BuscadorSugerencias from './BuscadorSugerencias';

/** Encabezado único de todo el sitio. La lupa abre un panel de búsqueda con accesos rápidos del catálogo. */
export default function Header({ q = '' }) {
  const pathname = usePathname() || '/';
  const [abierto, setAbierto] = useState(false);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    setAbierto(false);
    setBuscando(false);
  }, [pathname]);

  useEffect(() => {
    if (!buscando) return undefined;
    const cerrarConEsc = (e) => { if (e.key === 'Escape') setBuscando(false); };
    window.addEventListener('keydown', cerrarConEsc);
    return () => window.removeEventListener('keydown', cerrarConEsc);
  }, [buscando]);

  const actual = (href) => {
    if (href === '/#catalogo') return esCatalogo(pathname);
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sitio-header">
      <div className="contenedor sitio-header__fila">
        <Link href="/" className="sitio-header__logo" aria-label={`${MARCA.nombre}, ir al inicio`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MARCA.logoClaro} alt={MARCA.nombre} width="89" height="44" />
        </Link>

        <nav id="menu-sitio" className="sitio-nav" data-abierto={abierto} aria-label="Principal">
          {NAV.map(({ href, label, destacado }) => (
            <Link
              key={href}
              href={href}
              className={destacado ? 'destacado' : undefined}
              aria-current={actual(href) ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
          <div className="sitio-nav__cta">
            <Link className="boton boton--claro" href="/contacto">Quiero ser distribuidor</Link>
          </div>
        </nav>

        <div className="sitio-header__acciones">
          <Link className="boton boton--chico boton--claro" href="/contacto">Quiero ser distribuidor</Link>
        </div>

        <button
          type="button"
          className="buscar-boton"
          aria-expanded={buscando}
          aria-controls="buscador-sitio"
          aria-label={buscando ? 'Cerrar buscador' : 'Buscar repuestos'}
          onClick={() => { setBuscando(b => !b); setAbierto(false); }}
        >
          {buscando ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          ) : <Buscar />}
          <span className="buscar-boton__texto" aria-hidden="true">{buscando ? 'Cerrar' : 'Buscá tu repuesto'}</span>
        </button>

        <button
          type="button"
          className="menu-boton"
          aria-expanded={abierto}
          aria-controls="menu-sitio"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => { setAbierto(a => !a); setBuscando(false); }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {abierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      <div id="buscador-sitio" className="buscador" hidden={!buscando}>
        <div className="buscador__fondo" aria-hidden="true" onClick={() => setBuscando(false)} />
        <div className="contenedor buscador__caja">
          <BuscadorSugerencias
            id="buscador-q"
            filaClase="buscador__fila"
            etiqueta="Buscar en el catálogo"
            etiquetaClase="buscador__label"
            placeholder={`${MARCA.codigo.etiqueta}, código original o marca y modelo`}
            defaultValue={q}
            ancho={760}
            enfocar={buscando}
            onCerrar={() => setBuscando(false)}
          />
          <p className="buscador__ayuda">Ej: {MARCA.codigo.ejemplos}</p>
          <nav className="buscador__accesos" aria-label="Accesos rápidos del catálogo">
            {HERRAMIENTAS.map(({ href, label }) => (
              <a key={href} href={href} aria-current={actual(href) ? 'page' : undefined}>{label}</a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
