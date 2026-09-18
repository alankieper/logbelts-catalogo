'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { guardarFotoEditada } from '../admin/productoActions';

const SALIDA = 1000;   // las fotos del catálogo son cuadradas de 1000 px
const VISTA = 440;     // tamaño del lienzo en pantalla
const MARGEN = 0.84;   // al "Ajustar", la pieza ocupa el 84% del cuadro (mismo margen que el resto del catálogo)
const INICIAL = { giro: 0, fino: 0, espejoH: false, espejoV: false, zoom: 1, x: 0, y: 0 };

/** Dibuja la foto con los ajustes en un cuadro de `lado` px, siempre sobre fondo blanco. */
function dibujar(ctx, img, a, lado) {
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, lado, lado);
  ctx.translate(lado / 2 + a.x * lado, lado / 2 + a.y * lado);
  ctx.rotate(((a.giro + a.fino) * Math.PI) / 180);
  ctx.scale(a.espejoH ? -1 : 1, a.espejoV ? -1 : 1);
  const base = (lado * MARGEN) / Math.max(img.naturalWidth, img.naturalHeight);
  const s = base * a.zoom;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (-img.naturalWidth * s) / 2, (-img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
  ctx.restore();
}

/**
 * Editor de la foto de un producto: recortar (encuadre cuadrado con zoom y arrastre),
 * rotar (90° y ajuste fino) y espejar. Guarda una foto cuadrada de 1000 px con fondo blanco
 * en el lugar de la original.
 */
export default function EditorFoto({ codigo, src, original, etiqueta = 'Editar foto' }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [a, setA] = useState(INICIAL);
  const [img, setImg] = useState(null);
  const [estado, setEstado] = useState('');   // '' | cargando | guardando | error
  const [msg, setMsg] = useState('');
  const [guias, setGuias] = useState(true);
  const [descarga, setDescarga] = useState(null); // foto lista para bajar cuando la web no puede guardar
  const lienzo = useRef(null);
  const arrastre = useRef(null);
  const dialogo = useRef(null);

  const cambiar = useCallback((c) => setA((v) => ({ ...v, ...(typeof c === 'function' ? c(v) : c) })), []);

  // Cargar la foto al abrir
  useEffect(() => {
    if (!abierto) return;
    setEstado('cargando'); setMsg(''); setA(INICIAL); setImg(null); setDescarga(null);
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => { setImg(i); setEstado(''); };
    i.onerror = () => { setEstado('error'); setMsg('No se pudo abrir la foto.'); };
    i.src = src + (src.includes('?') ? '&' : '?') + 'e=' + Date.now();
  }, [abierto, src]);

  // Redibujar
  useEffect(() => {
    const c = lienzo.current;
    if (!c || !img) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = VISTA * dpr; c.height = VISTA * dpr;
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dibujar(ctx, img, a, VISTA);
  }, [a, img]);

  // Teclado: Esc cierra, flechas mueven, +/- zoom
  useEffect(() => {
    if (!abierto) return undefined;
    dialogo.current?.focus();
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      const paso = e.shiftKey ? 0.02 : 0.005;
      if (e.key === 'Escape') setAbierto(false);
      else if (e.key === 'ArrowLeft') cambiar((v) => ({ x: v.x - paso }));
      else if (e.key === 'ArrowRight') cambiar((v) => ({ x: v.x + paso }));
      else if (e.key === 'ArrowUp') cambiar((v) => ({ y: v.y - paso }));
      else if (e.key === 'ArrowDown') cambiar((v) => ({ y: v.y + paso }));
      else if (e.key === '+' || e.key === '=') cambiar((v) => ({ zoom: Math.min(6, v.zoom * 1.05) }));
      else if (e.key === '-') cambiar((v) => ({ zoom: Math.max(0.2, v.zoom / 1.05) }));
      else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [abierto, cambiar]);

  // Rueda del mouse = zoom (listener no pasivo para poder frenar el scroll de la página)
  useEffect(() => {
    const c = lienzo.current;
    if (!c) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const f = Math.exp(-e.deltaY * 0.0015);
      cambiar((v) => ({ zoom: Math.min(6, Math.max(0.2, v.zoom * f)) }));
    };
    c.addEventListener('wheel', onWheel, { passive: false });
    return () => c.removeEventListener('wheel', onWheel);
  }, [img, cambiar]);

  const bajar = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = { px: e.clientX, py: e.clientY, x: a.x, y: a.y };
  };
  const mover = (e) => {
    const d = arrastre.current;
    if (!d) return;
    const r = e.currentTarget.getBoundingClientRect();
    cambiar({ x: d.x + (e.clientX - d.px) / r.width, y: d.y + (e.clientY - d.py) / r.height });
  };
  const soltar = () => { arrastre.current = null; };

  async function guardar() {
    if (!img) return;
    setEstado('guardando'); setMsg('Guardando…');
    try {
      const c = document.createElement('canvas');
      c.width = SALIDA; c.height = SALIDA;
      dibujar(c.getContext('2d'), img, a, SALIDA);
      let datos;
      try { datos = c.toDataURL('image/jpeg', 0.9); } catch {
        throw new Error('El navegador no deja exportar esta foto (está en otro servidor). Subila de nuevo y editala.');
      }
      const fd = new FormData();
      fd.set('codigo', codigo);
      fd.set('original', original);
      fd.set('imagen', datos);
      const r = await guardarFotoEditada(fd);
      if (r?.sinGuardado) {
        // Web sin base de datos: se ofrece bajar la foto para subirla con las demás
        setDescarga(datos);
        setEstado('error');
        setMsg(`${r.error} Descargala y dejala en Descargas › fotos-catalogo: se sube junto con las fotos de la extensión.`);
        return;
      }
      if (!r?.ok) throw new Error(r?.error || 'No se pudo guardar.');
      setEstado(''); setMsg('');
      setAbierto(false);
      router.refresh();
    } catch (err) {
      setEstado('error'); setMsg(err.message);
    }
  }

  const girar = (g) => cambiar((v) => ({ giro: (v.giro + g + 360) % 360 }));
  const ocupado = estado === 'guardando' || estado === 'cargando';

  return (
    <>
      <button type="button" className="edf-abrir" onClick={() => setAbierto(true)}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2v14a2 2 0 0 0 2 2h14" /><path d="M18 22V8a2 2 0 0 0-2-2H2" /></svg>
        {etiqueta}
      </button>

      {abierto ? (
        <div className="edf-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget && !ocupado) setAbierto(false); }}>
          <div className="edf" role="dialog" aria-modal="true" aria-labelledby="edf-titulo" tabIndex={-1} ref={dialogo}>
            <header className="edf-cab">
              <h2 id="edf-titulo">Editar foto · {codigo}</h2>
              <button type="button" className="edf-x" onClick={() => setAbierto(false)} aria-label="Cerrar sin guardar" disabled={ocupado}>✕</button>
            </header>

            <div className="edf-cuerpo">
              <div className="edf-escena">
                <canvas
                  ref={lienzo}
                  className="edf-lienzo"
                  style={{ width: VISTA, height: VISTA }}
                  onPointerDown={bajar}
                  onPointerMove={mover}
                  onPointerUp={soltar}
                  onPointerCancel={soltar}
                  aria-label="Vista previa. Arrastrá para mover, rueda del mouse para acercar o alejar."
                />
                {guias ? <div className="edf-guias" aria-hidden="true"><i /><i /><b /></div> : null}
                {estado === 'cargando' ? <p className="edf-cargando">Abriendo foto…</p> : null}
              </div>

              <div className="edf-panel">
                <fieldset>
                  <legend>Recortar</legend>
                  <label className="edf-rango">
                    <span>Tamaño <output>{Math.round(a.zoom * 100)}%</output></span>
                    <input type="range" min="0.2" max="6" step="0.01" value={a.zoom} onChange={(e) => cambiar({ zoom: +e.target.value })} />
                  </label>
                  <p className="edf-ayuda">Arrastrá la foto para encuadrarla. Rueda del mouse o +/− para acercar.</p>
                  <div className="edf-botones">
                    <button type="button" onClick={() => cambiar({ zoom: 1, x: 0, y: 0 })}>Ajustar al cuadro</button>
                    <button type="button" onClick={() => cambiar({ x: 0, y: 0 })}>Centrar</button>
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Rotar</legend>
                  <div className="edf-botones">
                    <button type="button" onClick={() => girar(-90)}>↺ 90° izq.</button>
                    <button type="button" onClick={() => girar(90)}>↻ 90° der.</button>
                  </div>
                  <label className="edf-rango">
                    <span>Enderezar <output>{a.fino > 0 ? '+' : ''}{a.fino.toFixed(1)}°</output></span>
                    <input type="range" min="-45" max="45" step="0.5" value={a.fino} onChange={(e) => cambiar({ fino: +e.target.value })} onDoubleClick={() => cambiar({ fino: 0 })} />
                  </label>
                </fieldset>

                <fieldset>
                  <legend>Espejar</legend>
                  <div className="edf-botones">
                    <button type="button" aria-pressed={a.espejoH} onClick={() => cambiar((v) => ({ espejoH: !v.espejoH }))}>⇆ Horizontal</button>
                    <button type="button" aria-pressed={a.espejoV} onClick={() => cambiar((v) => ({ espejoV: !v.espejoV }))}>⇅ Vertical</button>
                  </div>
                </fieldset>

                <label className="edf-check">
                  <input type="checkbox" checked={guias} onChange={(e) => setGuias(e.target.checked)} />
                  Mostrar guías (centro y margen del catálogo)
                </label>

                <p className="edf-ayuda">Se guarda cuadrada de {SALIDA}×{SALIDA} px con fondo blanco, en lugar de la actual. La anterior queda de respaldo.</p>
                {msg ? <p className={estado === 'error' ? 'edf-msg edf-msg--error' : 'edf-msg'} role="status">{msg}</p> : null}

                {descarga ? (
                  <a className="edf-descargar" href={descarga} download={`${codigo}.jpg`}>Descargar foto editada ({codigo}.jpg)</a>
                ) : null}

                <div className="edf-acciones">
                  <button type="button" className="edf-secundario" onClick={() => setA(INICIAL)} disabled={ocupado}>Deshacer cambios</button>
                  <button type="button" className="edf-guardar" onClick={guardar} disabled={ocupado || !img}>
                    {estado === 'guardando' ? 'Guardando…' : 'Guardar foto'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
