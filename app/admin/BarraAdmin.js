'use client';

import { useEffect, useState } from 'react';
import BotonTema from '../components/BotonTema';
import { GRUPOS, ICONOS } from './menuDatos';

function Icono({ nombre, tam = 22 }) {
  return (
    <svg className="adm-ic" viewBox="0 0 24 24" width={tam} height={tam} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONOS[nombre]} />
    </svg>
  );
}

/**
 * Barra lateral del panel de administración.
 * · Computadora: una columna angosta con íconos que se abre sola al pasar el mouse (o al entrar con Tab).
 * · Celular / tablet: arriba queda una franja con el botón ☰ y la barra se abre como cajón desde la izquierda.
 * Los botones salen de menuDatos.js, agrupados por tema.
 */
export default function BarraAdmin({ activo, pendientes = 0, logo, nombre }) {
  const [abierto, setAbierto] = useState(false);
  const [plegados, setPlegados] = useState(() =>
    Object.fromEntries(GRUPOS.map((g) => [g.id, !!g.plegado && !g.items.some((i) => i.clave === activo)]))
  );

  // Esc cierra el cajón; con el cajón abierto no se desplaza la página de atrás
  useEffect(() => {
    const tecla = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('keydown', tecla);
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', tecla);
      document.body.style.overflow = '';
    };
  }, [abierto]);

  const alternar = (id) => setPlegados((p) => ({ ...p, [id]: !p[id] }));

  return (
    <>
      <header className="adm-movil">
        <a className="adm-movil__marca" href="/admin" aria-label={`${nombre}: ir al inicio del panel`}>
          <img src={logo} alt={nombre} />
        </a>
        <button
          type="button"
          className="adm-movil__boton"
          aria-expanded={abierto}
          aria-controls="adm-side"
          aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
          onClick={() => setAbierto((a) => !a)}
        >
          <Icono nombre={abierto ? 'cerrar' : 'menu'} />
          {!abierto && pendientes > 0 ? <span className="adm-noti adm-noti--boton">{pendientes > 99 ? '99+' : pendientes}</span> : null}
        </button>
      </header>

      <div className="adm-fondo" data-abierto={abierto} onClick={() => setAbierto(false)} aria-hidden="true" />

      <aside id="adm-side" className="adm-side" data-abierto={abierto} aria-label="Menú del panel">
        <a className="adm-side__marca" href="/admin" title="Ir al inicio del panel">
          <img src="/icons/admin-192.png" alt="" width="40" height="40" />
          <span className="adm-lbl">
            <b>Panel</b>
            <small>{nombre}</small>
          </span>
        </a>

        <nav className="adm-side__nav">
          {GRUPOS.map((g) => {
            const cerrado = plegados[g.id];
            return (
              <div className="adm-grupo" key={g.id} data-cerrado={cerrado ? 'true' : undefined}>
                {g.titulo ? (
                  <button
                    type="button"
                    className="adm-grupo__titulo"
                    aria-expanded={!cerrado}
                    onClick={() => alternar(g.id)}
                  >
                    <span className="adm-lbl">
                      {g.titulo}
                      {g.nota ? <em>{g.nota}</em> : null}
                    </span>
                    <svg className="adm-grupo__flecha" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={ICONOS.flecha} />
                    </svg>
                  </button>
                ) : null}
                <ul className="adm-grupo__lista" hidden={cerrado ? true : undefined}>
                  {g.items.map((it) => {
                    const aviso = it.aviso ? pendientes : 0;
                    return (
                      <li key={it.clave}>
                        <a
                          href={it.href}
                          className="adm-item"
                          data-on={activo === it.clave ? 'true' : undefined}
                          aria-current={activo === it.clave ? 'page' : undefined}
                          title={it.ayuda}
                        >
                          <span className="adm-item__ic">
                            <Icono nombre={it.icono} />
                            {aviso > 0 ? <span className="adm-punto" aria-hidden="true" /> : null}
                          </span>
                          <span className="adm-lbl">{it.nombre}</span>
                          {aviso > 0 ? (
                            <span className="adm-noti adm-lbl" aria-label={`${aviso} ${aviso === 1 ? 'foto pendiente' : 'fotos pendientes'}`}>
                              {aviso > 99 ? '99+' : aviso}
                            </span>
                          ) : null}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="adm-side__pie">
          <a className="adm-item" href="/" title="Abrir la web pública">
            <span className="adm-item__ic"><Icono nombre="externo" /></span>
            <span className="adm-lbl">Ver el sitio</span>
          </a>
          <a className="adm-item" href="/#catalogo" title="Abrir el catálogo como lo ve un cliente">
            <span className="adm-item__ic"><Icono nombre="externo" /></span>
            <span className="adm-lbl">Ver el catálogo</span>
          </a>
          <div className="adm-side__tema">
            <BotonTema className="tema-boton--admin" />
            <span className="adm-lbl">Modo claro / oscuro</span>
          </div>
          <a className="adm-item adm-item--salir" href="/logout">
            <span className="adm-item__ic"><Icono nombre="salir" /></span>
            <span className="adm-lbl">Salir</span>
          </a>
        </div>
      </aside>
    </>
  );
}
