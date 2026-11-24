'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import BotonAgregar from './BotonAgregar';

/**
 * Despiece dibujado por Logbelts: la máquina de fondo y cada repuesto en contorno, numerado.
 * Pasar el mouse (o el foco del teclado) por una pieza la resalta y muestra sus repuestos al costado;
 * un clic o un toque la deja fija. La lista numerada del costado hace lo mismo y sirve en el celular.
 *
 * src: JSON del dibujo (public/dibujos-despiece). productos: { [codigo]: { codigo, nombre, foto, marca } }.
 */
export default function DespiecePropio({ src, proporcion = '1800 / 1000', maquina, productos }) {
  const [dibujo, setDibujo] = useState(null);
  const [error, setError] = useState(false);
  const [sobre, setSobre] = useState(null); // pieza bajo el mouse o con el foco
  const [fija, setFija] = useState(null); // pieza elegida con clic / toque / Enter
  const panelRef = useRef(null);

  useEffect(() => {
    let vivo = true;
    fetch(src)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => vivo && setDibujo(j))
      .catch(() => vivo && setError(true));
    return () => {
      vivo = false;
    };
  }, [src]);

  const piezas = dibujo?.piezas || [];
  const porN = useMemo(() => new Map(piezas.map((p) => [p.n, p])), [piezas]);
  const activa = sobre ?? fija;
  const pieza = activa != null ? porN.get(activa) : null;

  function elegir(n, desdeLista = false) {
    const nueva = fija === n ? null : n;
    setFija(nueva);
    // en pantallas angostas el panel queda debajo del dibujo: llevarlo a la vista
    if (nueva != null && !desdeLista && window.matchMedia('(max-width: 899px)').matches) {
      requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    }
  }

  function tecla(e, n) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      elegir(n);
    } else if (e.key === 'Escape') {
      setFija(null);
    }
  }

  const repuestos = (p) => p.codigos.map((c) => productos[c]).filter(Boolean);
  const total = useMemo(() => new Set(piezas.flatMap((p) => p.codigos)).size, [piezas]);

  // rótulo del plano: en el dibujo, o abajo a la derecha como en el de la FS 120
  const [rx, ry, rw, rh] = dibujo?.rotulo || [1318, 768, 452, 200];

  if (error) return null;

  return (
    <div className="dsp" onKeyDown={(e) => e.key === 'Escape' && setFija(null)}>
      <div className="dsp-lienzo" style={{ aspectRatio: dibujo ? `${dibujo.ancho} / ${dibujo.alto}` : proporcion }}>
        {dibujo ? (
          <svg
            viewBox={`0 0 ${dibujo.ancho} ${dibujo.alto}`}
            className={`dsp-svg${activa != null ? ' dsp-svg--activa' : ''}${dibujo.guias === 'activa' ? ' dsp-svg--guia-sola' : ''}`}
            role="group"
            aria-label={`Despiece de la ${maquina}: ${piezas.length} piezas numeradas`}
          >
            <g className="dsp-base" transform={dibujo.base.transform} aria-hidden="true">
              {dibujo.base.d.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>

            <g aria-hidden="true">
              {piezas.map((p) => (
                <g key={p.n} className={`dsp-guia${activa === p.n ? ' es-activa' : ''}`}>
                  <line x1={p.linea[0]} y1={p.linea[1]} x2={p.linea[2]} y2={p.linea[3]} />
                  <circle cx={p.linea[0]} cy={p.linea[1]} r="4" />
                </g>
              ))}
            </g>

            {/* rótulo, como en un plano */}
            <g className="dsp-rotulo" aria-hidden="true">
              <rect x={rx} y={ry} width={rw} height={rh} rx="10" />
              <text x={rx + 24} y={ry + 44} className="dsp-rotulo-marca">LOGBELTS</text>
              <text x={rx + 24} y={ry + 88} className="dsp-rotulo-t">Despiece {maquina}</text>
              <text x={rx + 24} y={ry + 122} className="dsp-rotulo-s">{piezas.length} piezas · {total} repuestos</text>
              <text x={rx + 24} y={ry + 170} className="dsp-rotulo-s">Tocá una pieza para ver su repuesto</text>
            </g>

            {piezas.map((p) => {
              const [x, y, w, h] = p.caja;
              const es = activa === p.n;
              return (
                <g
                  key={p.n}
                  className={`dsp-pieza${es ? ' es-activa' : ''}${fija === p.n ? ' es-fija' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={fija === p.n}
                  aria-label={`${p.n}. ${p.nombre}: ${p.codigos.length} ${p.codigos.length === 1 ? 'repuesto' : 'repuestos'}`}
                  onMouseEnter={() => setSobre(p.n)}
                  onMouseLeave={() => setSobre(null)}
                  onFocus={() => setSobre(p.n)}
                  onBlur={() => setSobre(null)}
                  onClick={() => elegir(p.n)}
                  onKeyDown={(e) => tecla(e, p.n)}
                >
                  <rect className="dsp-halo" x={x - 14} y={y - 26} width={w + 28} height={h + 36} rx="14" />
                  <g className="dsp-trazo" transform={p.transform}>
                    <path d={p.d} />
                  </g>
                  <g className="dsp-num">
                    <circle cx={p.numero[0] + 12} cy={p.numero[1] + 12} r="13" />
                    <text x={p.numero[0] + 12} y={p.numero[1] + 17}>
                      {p.n}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="dsp-cargando" aria-hidden="true" />
        )}
      </div>

      <aside className="dsp-panel" ref={panelRef} aria-live="polite">
        {pieza ? (
          <div className="dsp-detalle">
            <div className="dsp-detalle-cab">
              <span className="dsp-badge">{pieza.n}</span>
              <h3>{pieza.nombre}</h3>
            </div>
            <ul className="dsp-reps">
              {repuestos(pieza).map((r) => (
                <li key={r.codigo} className="dsp-rep">
                  <a className="dsp-rep-foto" href={`/p/${encodeURIComponent(r.codigo)}`} tabIndex={-1} aria-hidden="true">
                    {r.foto ? <img src={r.foto} alt="" loading="lazy" decoding="async" /> : null}
                  </a>
                  <div className="dsp-rep-txt">
                    <span className="dsp-rep-cod">{r.codigo}</span>
                    <a className="dsp-rep-nom" href={`/p/${encodeURIComponent(r.codigo)}`}>
                      {r.nombre}
                    </a>
                    {r.marca ? <span className="dsp-rep-marca">{r.marca}</span> : null}
                  </div>
                  <BotonAgregar codigo={r.codigo} nombre={r.nombre} chico />
                </li>
              ))}
            </ul>
            {fija != null ? (
              <button type="button" className="dsp-volver" onClick={() => setFija(null)}>
                ← Ver todas las piezas
              </button>
            ) : (
              <p className="dsp-pista">Hacé clic en la pieza para dejarla fija.</p>
            )}
          </div>
        ) : (
          <div className="dsp-lista">
            <h3>Piezas</h3>
            <ol>
              {piezas.map((p) => (
                <li key={p.n}>
                  <button
                    type="button"
                    onMouseEnter={() => setSobre(p.n)}
                    onMouseLeave={() => setSobre(null)}
                    onClick={() => {
                      setSobre(null);
                      elegir(p.n, true);
                    }}
                  >
                    <span className="dsp-badge">{p.n}</span>
                    <span className="dsp-lista-nom">{p.nombre}</span>
                    {p.codigos.length > 1 ? <span className="dsp-lista-cant">{p.codigos.length}</span> : null}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>
    </div>
  );
}
