'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Despieces de una máquina: una pestaña por variante (FS 55, FS 55 R…), la imagen del diagrama
 * (se amplía a pantalla completa) y la lista de piezas con su número y el repuesto correspondiente.
 *
 * diagramas: [{ id, variante, imagen, numeradas: [{ ref, nombre, codigo?, foto? }], otros: [{ codigo, nombre, foto? }] }]
 */
export default function VisorDespiece({ maquina, diagramas, inicial = 0 }) {
  const [activo, setActivo] = useState(Math.min(inicial, diagramas.length - 1));
  const [ampliado, setAmpliado] = useState(false);
  const [verOtros, setVerOtros] = useState(false);
  const dialogo = useRef(null);
  const d = diagramas[activo];

  // la variante elegida queda en la dirección, para compartir el link
  function elegir(i) {
    setActivo(i);
    setVerOtros(false);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('variante', diagramas[i].id);
      u.hash = 'despiece';
      window.history.replaceState(null, '', u);
    } catch {}
  }

  // ← → entre pestañas cuando el foco está en ellas
  function teclaPestana(e, i) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + diagramas.length) % diagramas.length;
    elegir(n);
    document.getElementById(`dsp-tab-${diagramas[n].id}`)?.focus();
  }

  useEffect(() => {
    const dlg = dialogo.current;
    if (!dlg) return;
    if (ampliado && !dlg.open) dlg.showModal?.();
    if (!ampliado && dlg.open) dlg.close();
  }, [ampliado]);

  if (!d) return null;
  const OTROS_VISIBLES = 8;
  const otros = verOtros ? d.otros : d.otros.slice(0, OTROS_VISIBLES);

  return (
    <div className="vdsp">
      {diagramas.length > 1 ? (
        <div className="vdsp-tabs" role="tablist" aria-label={`Variantes de la ${maquina}`}>
          {diagramas.map((x, i) => (
            <button
              key={x.id}
              id={`dsp-tab-${x.id}`}
              role="tab"
              type="button"
              aria-selected={i === activo}
              aria-controls="vdsp-panel"
              tabIndex={i === activo ? 0 : -1}
              className="vdsp-tab"
              onClick={() => elegir(i)}
              onKeyDown={(e) => teclaPestana(e, i)}
            >
              {x.variante}
            </button>
          ))}
        </div>
      ) : null}

      <div id="vdsp-panel" role={diagramas.length > 1 ? 'tabpanel' : undefined} aria-labelledby={diagramas.length > 1 ? `dsp-tab-${d.id}` : undefined} className="vdsp-panel">
        <figure className="vdsp-fig">
          {d.imagen ? (
            <button type="button" className="vdsp-img" onClick={() => setAmpliado(true)} aria-label={`Ampliar el despiece de la ${d.variante}`}>
              <img src={d.imagen} alt={`Despiece (diagrama de partes) de la ${d.variante}`} />
              <span className="vdsp-lupa" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.3 4.3-1.4 1.4-4.3-4.3A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm1 2.5v2h2v2h-2v2h-2v-2h-2v-2h2v-2h2Z" fill="currentColor" /></svg>
                Ampliar
              </span>
            </button>
          ) : null}
          <figcaption>
            {d.variante} · {d.numeradas.length ? `${d.numeradas.length} ${d.numeradas.length === 1 ? 'pieza numerada' : 'piezas numeradas'}` : 'Diagrama de partes'}
          </figcaption>
        </figure>

        <div className="vdsp-lista">
          {d.numeradas.length ? (
            <>
              <h3 className="vdsp-h3">Piezas del dibujo</h3>
              <ol className="vdsp-piezas">
                {d.numeradas.map((x, i) => {
                  const contenido = (
                    <>
                      <span className="vdsp-ref" aria-label={`Número ${x.ref}`}>{x.ref}</span>
                      {x.codigo ? (
                        x.foto ? <img src={x.foto} alt="" loading="lazy" className="vdsp-mini" /> : <span className="vdsp-mini vdsp-mini--vacia" />
                      ) : null}
                      <span className="vdsp-txt">
                        <span className="vdsp-nom">{x.nombre}</span>
                        <span className="vdsp-cod">{x.codigo ? `Repuesto ${x.codigo}` : 'No disponible como repuesto'}</span>
                      </span>
                      {x.codigo ? <span className="vdsp-ir" aria-hidden="true">›</span> : null}
                    </>
                  );
                  return (
                    <li key={`${x.ref}-${x.codigo || x.nombre}-${i}`} className={x.codigo ? '' : 'vdsp-sin'}>
                      {x.codigo ? <a href={`/p/${encodeURIComponent(x.codigo)}`}>{contenido}</a> : <div>{contenido}</div>}
                    </li>
                  );
                })}
              </ol>
            </>
          ) : null}

          {d.otros.length ? (
            <>
              <h3 className="vdsp-h3">{d.numeradas.length ? 'Otros repuestos compatibles' : `Repuestos compatibles con la ${maquina}`}</h3>
              <ul className="vdsp-piezas vdsp-piezas--otros">
                {otros.map((x) => (
                  <li key={x.codigo}>
                    <a href={`/p/${encodeURIComponent(x.codigo)}`}>
                      {x.foto ? <img src={x.foto} alt="" loading="lazy" className="vdsp-mini" /> : <span className="vdsp-mini vdsp-mini--vacia" />}
                      <span className="vdsp-txt">
                        <span className="vdsp-nom">{x.nombre}</span>
                        <span className="vdsp-cod">Repuesto {x.codigo}</span>
                      </span>
                      <span className="vdsp-ir" aria-hidden="true">›</span>
                    </a>
                  </li>
                ))}
              </ul>
              {d.otros.length > OTROS_VISIBLES ? (
                <button type="button" className="vdsp-mas" onClick={() => setVerOtros((v) => !v)} aria-expanded={verOtros}>
                  {verOtros ? 'Ver menos' : `Ver los ${d.otros.length} repuestos`}
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <dialog ref={dialogo} className="vdsp-dialogo" onClose={() => setAmpliado(false)} onClick={(e) => e.target === dialogo.current && setAmpliado(false)}>
        <div className="vdsp-dialogo-barra">
          <strong>{d.variante}</strong>
          <button type="button" onClick={() => setAmpliado(false)} aria-label="Cerrar">✕</button>
        </div>
        <div className="vdsp-dialogo-img">
          {d.imagen ? <img src={d.imagen} alt={`Despiece de la ${d.variante} en tamaño completo`} /> : null}
        </div>
      </dialog>
    </div>
  );
}
