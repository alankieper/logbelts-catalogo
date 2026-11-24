'use client';

import { useState } from 'react';

const MAX_CHIPS = 3;

/**
 * Despiece de una máquina publicado en internet: una pestaña por variante (FS 38, FS 38 Z…),
 * el botón al despiece completo y cada dibujo (cilindro, carburador…) con los repuestos del
 * catálogo que corresponden a esa parte.
 *
 * despiece: { fuente, productos: [[codigo, nombre]], variantes: [{ nombre, url, dibujos: [[nombre, url, [posiciones], original]] }] }
 * Los repuestos vienen una sola vez en `productos` y cada dibujo guarda sus posiciones en esa lista.
 */
export default function VisorDespiece({ maquina, despiece, inicial = 0 }) {
  const variantes = despiece.variantes;
  const [activo, setActivo] = useState(Math.min(inicial, variantes.length - 1));
  const [abiertos, setAbiertos] = useState({});
  const v = variantes[activo];

  function elegir(i) {
    setActivo(i);
    setAbiertos({});
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('variante', String(i + 1));
      u.hash = 'despiece';
      window.history.replaceState(null, '', u);
    } catch {}
  }

  function teclaPestana(e, i) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + variantes.length) % variantes.length;
    elegir(n);
    document.getElementById(`vdsp-tab-${n}`)?.focus();
  }

  return (
    <div className="vdsp">
      {variantes.length > 1 ? (
        <div className="vdsp-tabs" role="tablist" aria-label={`Versiones de la ${maquina}`}>
          {variantes.map((x, i) => (
            <button
              key={x.url}
              id={`vdsp-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={i === activo}
              aria-controls="vdsp-panel"
              tabIndex={i === activo ? 0 : -1}
              className="vdsp-tab"
              onClick={() => elegir(i)}
              onKeyDown={(e) => teclaPestana(e, i)}
            >
              {x.nombre}
            </button>
          ))}
        </div>
      ) : null}

      <div
        id="vdsp-panel"
        className="vdsp-panel"
        role={variantes.length > 1 ? 'tabpanel' : undefined}
        aria-labelledby={variantes.length > 1 ? `vdsp-tab-${activo}` : undefined}
      >
        {v.dibujos.length ? (
          <ul className="vdsp-dibujos">
            {v.dibujos.map(([nombre, url, posiciones, original], i) => {
              const abierto = abiertos[i];
              const repuestos = posiciones.map((n) => despiece.productos[n]).filter(Boolean);
              const chips = abierto ? repuestos : repuestos.slice(0, MAX_CHIPS);
              return (
                <li key={url} className="vdsp-dibujo">
                  <div className="vdsp-dibujo-link">
                    <span className="vdsp-dibujo-n" aria-hidden="true">{i + 1}</span>
                    <span className="vdsp-dibujo-nom">{nombre}</span>
                  </div>
                  {repuestos.length ? (
                    <div className="vdsp-chips">
                      <span className="vdsp-chips-t">Repuestos Logbelts:</span>
                      {chips.map(([codigo, nombre]) => (
                        <a key={codigo} href={`/p/${encodeURIComponent(codigo)}`} className="vdsp-chip" title={`${nombre} · ${codigo}`}>
                          {nombre}
                        </a>
                      ))}
                      {repuestos.length > MAX_CHIPS ? (
                        <button type="button" className="vdsp-chip vdsp-chip--mas" onClick={() => setAbiertos((a) => ({ ...a, [i]: !abierto }))} aria-expanded={!!abierto}>
                          {abierto ? 'Ver menos' : `+${repuestos.length - MAX_CHIPS} más`}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        <p className="vdsp-nota">
          Abajo tenés todos los repuestos {maquina ? `para la ${maquina}` : ''} del catálogo.
        </p>
      </div>
    </div>
  );
}
