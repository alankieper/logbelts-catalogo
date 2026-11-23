'use client';

import { useMemo, useState } from 'react';
import { elegirUna, sacarUna } from './actions';

/**
 * Versus de fotos: en cada producto, la foto de siempre contra la del PDF nuevo.
 * Tocando "Queda esta" se guarda al momento y la tarjeta se marca como resuelta.
 * aElegir: [{ codigo, nombre, actual, pdf }] · soloPdf: [{ codigo, nombre, pdf }]
 */
export default function ElegirFotos({ aElegir, soloPdf }) {
  const [pestana, setPestana] = useState('elegir');
  const [busca, setBusca] = useState('');
  const [hechas, setHechas] = useState(() => new Map()); // codigo -> texto del resultado
  const [enCurso, setEnCurso] = useState(() => new Set());
  const [error, setError] = useState('');

  const filtrar = (lista) => {
    const q = busca.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((p) => p.codigo.includes(q) || p.nombre.toLowerCase().includes(q));
  };
  const listaElegir = useMemo(() => filtrar(aElegir), [aElegir, busca]); // eslint-disable-line react-hooks/exhaustive-deps
  const listaSolo = useMemo(() => filtrar(soloPdf), [soloPdf, busca]); // eslint-disable-line react-hooks/exhaustive-deps
  const faltan = aElegir.filter((p) => !hechas.has(p.codigo)).length;

  async function hacer(codigo, accion, texto) {
    setError('');
    setEnCurso((s) => new Set(s).add(codigo));
    const r = await accion();
    setEnCurso((s) => { const n = new Set(s); n.delete(codigo); return n; });
    if (r?.ok) setHechas((m) => new Map(m).set(codigo, texto));
    else setError(`${codigo}: ${r?.error || 'No se pudo guardar.'}`);
  }

  return (
    <>
      <div className="cn-barra">
        <div className="cn-pestanas" role="tablist">
          <button type="button" role="tab" aria-selected={pestana === 'elegir'} className={pestana === 'elegir' ? 'on' : ''} onClick={() => setPestana('elegir')}>
            Para elegir <b>{faltan}</b>
          </button>
          <button type="button" role="tab" aria-selected={pestana === 'solo'} className={pestana === 'solo' ? 'on' : ''} onClick={() => setPestana('solo')}>
            No tenían foto <b>{soloPdf.length}</b>
          </button>
        </div>
        <input className="cn-busca" type="search" placeholder="Buscar por código o nombre" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      {error ? <div className="err-msg" style={{ marginTop: 12 }}>{error}</div> : null}

      {pestana === 'elegir' ? (
        <>
          <p className="cn-ayuda">Izquierda: la foto que se ve hoy en la web. Derecha: la del catálogo PDF nuevo. Tocá <b>Queda esta</b> abajo de la que va.</p>
          {listaElegir.length === 0 ? <p className="cn-vacio">No hay productos para mostrar.</p> : null}
          <div className="bdj-grilla">
            {listaElegir.map((p) => {
              const hecho = hechas.get(p.codigo);
              const ocupado = enCurso.has(p.codigo);
              return (
                <article key={p.codigo} className={hecho ? 'bdj-tarjeta bdj-tarjeta--hecha' : 'bdj-tarjeta'}>
                  <div>
                    <a href={`/admin/productos/${encodeURIComponent(p.codigo)}`}><code>{p.codigo}</code></a>
                    <div className="bdj-nombre">{p.nombre}</div>
                  </div>
                  <div className="bdj-fotos">
                    <div className="bdj-caja">
                      <span>Hoy en la web</span>
                      <a href={p.actual} target="_blank" rel="noopener"><img src={p.actual} alt="Foto actual" className="bdj-img" loading="lazy" /></a>
                    </div>
                    <div className="bdj-caja">
                      <span>Catálogo PDF nuevo</span>
                      <a href={p.pdf} target="_blank" rel="noopener"><img src={p.pdf} alt="Foto del PDF" className="bdj-img" loading="lazy" /></a>
                    </div>
                  </div>
                  {hecho ? (
                    <div className="bdj-hecha">✓ {hecho}</div>
                  ) : (
                    <div className="bdj-botones">
                      <button type="button" className="bdj-btn bdj-btn--borde" disabled={ocupado} onClick={() => hacer(p.codigo, () => elegirUna(p.codigo, 'actual'), 'Quedó la de siempre')}>Queda esta</button>
                      <button type="button" className="bdj-btn" disabled={ocupado} onClick={() => hacer(p.codigo, () => elegirUna(p.codigo, 'pdf'), 'Quedó la del PDF')}>Queda esta</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="cn-ayuda">Estos productos no tenían foto y ahora muestran la del PDF. Si alguna está mal, tocá <b>Sacar foto</b> y el producto vuelve a quedar sin foto.</p>
          <div className="bdj-grilla cn-grilla-chica">
            {listaSolo.map((p) => {
              const hecho = hechas.get(p.codigo);
              return (
                <article key={p.codigo} className={hecho ? 'bdj-tarjeta bdj-tarjeta--hecha' : 'bdj-tarjeta'}>
                  <div>
                    <a href={`/admin/productos/${encodeURIComponent(p.codigo)}`}><code>{p.codigo}</code></a>
                    <div className="bdj-nombre">{p.nombre}</div>
                  </div>
                  <a href={p.pdf} target="_blank" rel="noopener"><img src={p.pdf} alt="Foto del PDF" className="bdj-img" loading="lazy" /></a>
                  {hecho ? (
                    <div className="bdj-hecha">✓ {hecho}</div>
                  ) : (
                    <button type="button" className="bdj-btn bdj-btn--borde" disabled={enCurso.has(p.codigo)} onClick={() => hacer(p.codigo, () => sacarUna(p.codigo), 'Foto sacada')}>Sacar foto</button>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
