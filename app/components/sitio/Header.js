'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HERRAMIENTAS, NAV, esCatalogo } from '../../../lib/sitio';

/** Encabezado único de todo el sitio: menú principal arriba y, abajo, buscador y herramientas del catálogo. */
export default function Header({ q = '' }) {
  const pathname = usePathname() || '/';
  const [abierto, setAbierto] = useState(false);

  useEffect(() => setAbierto(false), [pathname]);

  const actual = (href) => {
    if (href === '/#catalogo') return esCatalogo(pathname);
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sitio-header">
      <div className="contenedor sitio-header__fila">
        <Link href="/" className="sitio-header__logo" aria-label="Logbelts, ir al inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-blanco.png" alt="Logbelts" width="89" height="44" />
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
          className="menu-boton"
          aria-expanded={abierto}
          aria-controls="menu-sitio"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setAbierto(a => !a)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {abierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      <div className="sitio-herramientas">
        <div className="contenedor sitio-herramientas__fila">
          <form className="sitio-buscar" action="/buscar" method="get" role="search">
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Buscar por código, código original, marca o modelo…"
              aria-label="Buscar repuestos en el catálogo"
              autoComplete="off"
            />
            <button type="submit" aria-label="Buscar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </form>
          <nav className="sitio-herramientas__links" aria-label="Herramientas del catálogo">
            {HERRAMIENTAS.map(({ href, label }) => (
              <a key={href} href={href} aria-current={actual(href) ? 'page' : undefined}>{label}</a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
