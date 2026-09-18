'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { aprobarUna, rechazarUna } from './actions';
import './bandeja-fotos.css';

const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/**
 * Bandeja de fotos pendientes con barra de progreso: aprueba de a una foto por vez,
 * muestra "Publicando 2 de 5…", al terminar dice "¡Listo!" y refresca la página sola
 * (con ?ok=1&n=N para que se vea el mensaje de cuántas se actualizaron).
 * fotos: [{ nombre, codigo, producto, actual, url, lado, fecha, pagina }]
 */
export default function BandejaFotos({ fotos }) {
  const router = useRouter();
  const [prog, setProg] = useState(null); // { total, hechas, errores: [], fin }
  const [ocultas, setOcultas] = useState(() => new Set()); // aprobadas en esta tanda (se ven con ✓)
  const [rechazadas, setRechazadas] = useState(() => new Set());
  const ocupado = prog && !prog.fin;

  async function aprobar(nombres) {
    const errores = [];
    let hechas = 0;
    setProg({ total: nombres.length, hechas: 0, errores, fin: false });
    for (const nombre of nombres) {
      const r = await aprobarUna(nombre);
      if (r?.ok) {
        hechas++;
        setOcultas((s) => new Set(s).add(nombre));
      } else {
        errores.push(r?.error || 'Error');
      }
      setProg({ total: nombres.length, hechas: hechas + errores.length, errores: [...errores], fin: false });
    }
    setProg({ total: nombres.length, hechas: hechas + errores.length, ok: hechas, errores, fin: true });
    // se deja ver el "¡Listo!" un momento y se refresca con el resultado
    setTimeout(() => {
      router.replace(`/admin/fotos-pendientes?ok=1&n=${hechas}${errores.length ? `&err=${encodeURIComponent(errores.slice(0, 2).join(' · '))}` : ''}`);
      router.refresh();
    }, 1400);
  }

  async function rechazar(nombre) {
    setRechazadas((s) => new Set(s).add(nombre));
    const r = await rechazarUna(nombre);
    if (!r?.ok) {
      setRechazadas((s) => { const n = new Set(s); n.delete(nombre); return n; });
      alert(r?.error || 'No se pudo rechazar.');
      return;
    }
    router.refresh();
  }

  const visibles = fotos.filter((f) => !rechazadas.has(f.nombre) && (!ocultas.has(f.nombre) || prog));
  const pendientes = fotos.filter((f) => !rechazadas.has(f.nombre) && !ocultas.has(f.nombre));
  const pct = prog ? Math.round((prog.hechas / prog.total) * 100) : 0;

  return (
    <>
      <div className="bdj-barra-sup">
        <strong>{pendientes.length} {pendientes.length === 1 ? 'foto esperando' : 'fotos esperando'} aprobación</strong>
        <button type="button" className="bdj-btn bdj-btn--auto" disabled={ocupado} onClick={() => aprobar(pendientes.map((f) => f.nombre))}>
          Aprobar todas
        </button>
      </div>

      {prog ? (
        <div className={prog.fin ? 'bdj-prog bdj-prog--fin' : 'bdj-prog'} role="status" aria-live="polite">
          <div className="bdj-prog__txt">
            {prog.fin ? (
              <strong>
                ¡Listo! {prog.ok === 1 ? 'Se actualizó 1 foto' : `Se actualizaron ${prog.ok} fotos`} 🎉
                {prog.errores.length ? ` · ${prog.errores.length} con error` : ''}
              </strong>
            ) : (
              <span>Publicando {Math.min(prog.hechas + 1, prog.total)} de {prog.total}…</span>
            )}
            <span className="bdj-prog__pct">{pct}%</span>
          </div>
          <div className="bdj-prog__pista" aria-hidden="true">
            <div className="bdj-prog__relleno" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : null}

      <div className="bdj-grilla">
        {visibles.map((f) => {
          const hecha = ocultas.has(f.nombre);
          return (
            <article key={f.nombre} className={hecha ? 'bdj-tarjeta bdj-tarjeta--hecha' : 'bdj-tarjeta'}>
              <div>
                <a href={`/admin/productos/${encodeURIComponent(f.codigo)}`}><code>{f.codigo}</code></a>
                <div className="bdj-nombre">{f.producto || 'Producto no encontrado'}</div>
              </div>
              <div className="bdj-fotos">
                <div className="bdj-caja">
                  <span>Actual</span>
                  {f.actual ? <img src={f.actual} alt="Foto actual" className="bdj-img" /> : <div className="bdj-vacia">Sin foto</div>}
                </div>
                <div className="bdj-caja">
                  <span>Nueva{f.lado ? ` · ${f.lado}px` : ''}</span>
                  <a href={f.url} target="_blank" rel="noopener"><img src={f.url} alt="Foto nueva" className="bdj-img" /></a>
                </div>
              </div>
              <div className="bdj-meta">
                {new Date(f.fecha).toLocaleString('es-AR')}
                {f.pagina ? <> · <a href={f.pagina} target="_blank" rel="noopener">de {host(f.pagina) || 'la página de origen'}</a></> : null}
              </div>
              {hecha ? (
                <div className="bdj-hecha">✓ Publicada</div>
              ) : (
                <div className="bdj-botones">
                  <button type="button" className="bdj-btn" disabled={ocupado} onClick={() => aprobar([f.nombre])}>Aprobar</button>
                  <button type="button" className="bdj-btn bdj-btn--borde" disabled={ocupado} onClick={() => rechazar(f.nombre)}>Rechazar</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
