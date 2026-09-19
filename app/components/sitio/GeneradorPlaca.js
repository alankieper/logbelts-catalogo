'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { slugMarca } from '../../../lib/marca';
import { telefonoWhatsApp } from '../../../lib/telefono';
import { logEvento } from '../Registrar';
import { procesarLogo } from './logoSinFondo';
import { armarZip } from './zipSimple';
import {
  FORMATOS, TITULOS, TITULO_PROPIO, ETIQUETAS, FONDOS, FONDO_TEMPORADA,
  resolverFondo, dibujarPlaca,
} from './placaDibujo';
import './generador-placa.css';

const CLAVE = 'lb_placa';
const LIMITE = 0.45; // cuánto se puede correr el producto (fracción del ancho/alto)

const Clip = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const slug = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Genera el QR (canvas) de un link. La librería se carga sólo si se usa. */
async function crearQR(texto) {
  const QR = (await import('qrcode')).default;
  const c = document.createElement('canvas');
  await QR.toCanvas(c, texto, { margin: 1, width: 400, color: { dark: '#0a2149', light: '#ffffff' } });
  return c;
}

export default function GeneradorPlaca({ fotos, temporada = 'cesped' }) {
  const lienzo = useRef(null);
  const arrastre = useRef(null);
  const turno = useRef(0);

  // productos: los de la galería + los que se traen del catálogo (ya sin fondo)
  const [agregados, setAgregados] = useState([]); // [{ id, nombre, codigo, canvas, miniatura }]
  const [fotoId, setFotoId] = useState(fotos[0]?.src);
  const [varias, setVarias] = useState(false);
  const [elegidas, setElegidas] = useState(() => new Set());

  const [formato, setFormato] = useState('feed');
  const [fondo, setFondo] = useState('temporada');
  const [tituloSel, setTituloSel] = useState(TITULOS[0]);
  const [tituloPropio, setTituloPropio] = useState('');
  const [etiqueta, setEtiqueta] = useState('');
  const [comercio, setComercio] = useState('');
  const [contacto, setContacto] = useState('');
  const [conQR, setConQR] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const [qr, setQr] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const [logo, setLogo] = useState(null);
  const [modoLogo, setModoLogo] = useState('auto');
  const [logoMsg, setLogoMsg] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [trayendo, setTrayendo] = useState('');

  const [generando, setGenerando] = useState('');
  const [puedeCompartir, setPuedeCompartir] = useState(false);

  const titulo = tituloSel === TITULO_PROPIO ? tituloPropio : tituloSel;
  const fmt = FORMATOS.find((f) => f.id === formato) || FORMATOS[0];
  const productos = [
    ...agregados.map((a) => ({ id: a.id, nombre: a.nombre, miniatura: a.miniatura, foto: { canvas: a.canvas }, producto: a.nombre, codigo: a.codigo })),
    ...fotos.map((f) => ({ id: f.src, nombre: f.nombre, miniatura: f.src, foto: f.src, producto: '' })),
  ];
  const actual = productos.find((p) => p.id === fotoId) || productos[0];

  // ---- recordar datos del comercio en este navegador ----
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(CLAVE) || '{}');
      if (d.comercio) setComercio(d.comercio);
      if (d.contacto) setContacto(d.contacto);
      if (d.whatsapp) setWhatsapp(d.whatsapp);
      if (d.conQR) setConQR(true);
      if (d.fondo && (d.fondo === 'temporada' || FONDOS.some((f) => f.id === d.fondo))) setFondo(d.fondo);
      if (d.formato && FORMATOS.some((f) => f.id === d.formato)) setFormato(d.formato);
    } catch {}
    try {
      const prueba = new File([new Blob()], 'x.png', { type: 'image/png' });
      setPuedeCompartir(!!(navigator.canShare && navigator.canShare({ files: [prueba] })));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify({ comercio, contacto, whatsapp, conQR, fondo, formato })); } catch {}
  }, [comercio, contacto, whatsapp, conQR, fondo, formato]);

  // ---- QR a WhatsApp ----
  const numeroWA = telefonoWhatsApp(whatsapp);
  useEffect(() => {
    let vivo = true;
    if (!conQR || !numeroWA) { setQr(null); return undefined; }
    crearQR(`https://wa.me/${numeroWA}`).then((c) => { if (vivo) setQr(c); }).catch(() => setQr(null));
    return () => { vivo = false; };
  }, [conQR, numeroWA]);

  // ---- cambiar de producto o formato vuelve a centrarlo ----
  useEffect(() => { setPos({ x: 0, y: 0 }); }, [fotoId, formato]);

  const opciones = useCallback((p) => ({
    formato, fondo, temporada, foto: p?.foto, producto: p?.producto, posX: pos.x, posY: pos.y,
    titulo, etiqueta, comercio, contacto, logo, modoLogo, qr,
  }), [formato, fondo, temporada, pos, titulo, etiqueta, comercio, contacto, logo, modoLogo, qr]);

  // Se dibuja aparte y se copia al final, para no mezclar dos dibujos si algo cambia a mitad de camino
  const dibujar = useCallback(async () => {
    const mio = ++turno.current;
    const aparte = document.createElement('canvas');
    await dibujarPlaca(aparte, opciones(actual));
    const c = lienzo.current;
    if (!c || mio !== turno.current) return;
    if (c.width !== aparte.width) c.width = aparte.width;
    if (c.height !== aparte.height) c.height = aparte.height;
    c.getContext('2d').drawImage(aparte, 0, 0);
  }, [opciones, actual?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { dibujar(); }, [dibujar]);

  // ---- editor de posición: arrastrar el producto sobre la vista previa ----
  const limitar = (v) => Math.max(-LIMITE, Math.min(LIMITE, v));
  const bajar = (e) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    arrastre.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
  };
  const mover = (e) => {
    const d = arrastre.current;
    if (!d) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: limitar(d.x + (e.clientX - d.px) / r.width), y: limitar(d.y + (e.clientY - d.py) / r.height) });
  };
  const soltar = () => { arrastre.current = null; };

  // ---- logo del comercio ----
  async function subirLogo(e) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    if (!/^image\//.test(archivo.type)) { setLogoMsg('Elegí una imagen (JPG, PNG o WEBP).'); return; }
    setLogoMsg('Preparando tu logo…');
    try {
      const r = await procesarLogo(archivo);
      setLogo(r);
      setLogoMsg(r.sinFondo ? '✓ Le sacamos el fondo blanco a tu logo.' : '✓ Logo agregado.');
    } catch {
      setLogoMsg('No pudimos leer esa imagen. Probá con otra.');
    }
  }

  // ---- traer cualquier repuesto del catálogo ----
  useEffect(() => {
    const q = busqueda.trim();
    if (q.length < 2) { setResultados([]); return undefined; }
    const t = setTimeout(async () => {
      setBuscando(true);
      try {
        const r = await fetch(`/api/buscar?q=${encodeURIComponent(q)}&n=8`).then((x) => x.json());
        setResultados((r.resultados || []).filter((x) => x.foto).slice(0, 8));
      } catch { setResultados([]); }
      setBuscando(false);
    }, 280);
    return () => clearTimeout(t);
  }, [busqueda]);

  async function traerDelCatalogo(r) {
    const id = `cat:${r.codigo}`;
    if (agregados.some((a) => a.id === id)) { setFotoId(id); setBusqueda(''); return; }
    setTrayendo(r.codigo);
    try {
      const blob = await fetch(r.foto).then((x) => x.blob());
      // mismo quitado de fondo blanco que el logo; en productos además se descartan manchitas sueltas
      const sinFondo = await procesarLogo(blob, { soloPrincipal: true });
      setAgregados((a) => [{ id, nombre: r.nombre, codigo: r.codigo, canvas: sinFondo.canvas, miniatura: r.foto }, ...a]);
      setFotoId(id);
      setBusqueda('');
      setResultados([]);
    } catch {}
    setTrayendo('');
  }

  // ---- descargar / compartir ----
  const nombreArchivo = (p) => `placa-${slugMarca()}-${formato}-${slug(p?.codigo || p?.nombre || 'producto')}-${slug(comercio || 'comercio')}.png`;
  const aBlob = (c) => new Promise((ok) => c.toBlob((b) => ok(b), 'image/png'));
  const registrar = (n) => logEvento({ tipo: 'placa', q: comercio || null, n, meta: { formato, fondo: resolverFondo(fondo, temporada).id, qr: !!qr, logo: !!logo } });

  function bajarArchivo(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function descargar() {
    setGenerando('una');
    await dibujar();
    bajarArchivo(await aBlob(lienzo.current), nombreArchivo(actual));
    registrar(1);
    setGenerando('');
  }

  async function descargarVarias() {
    const lista = productos.filter((p) => elegidas.has(p.id));
    if (!lista.length) return;
    setGenerando('varias');
    const archivos = [];
    for (const p of lista) {
      const c = document.createElement('canvas');
      await dibujarPlaca(c, { ...opciones(p), posX: 0, posY: 0 });
      const blob = await aBlob(c);
      archivos.push({ nombre: nombreArchivo(p), datos: new Uint8Array(await blob.arrayBuffer()) });
    }
    bajarArchivo(armarZip(archivos), `placas-${slugMarca()}-${formato}-${slug(comercio || 'comercio')}.zip`);
    registrar(lista.length);
    setGenerando('');
  }

  async function compartir() {
    setGenerando('una');
    try {
      await dibujar();
      const blob = await aBlob(lienzo.current);
      await navigator.share({ files: [new File([blob], nombreArchivo(actual), { type: 'image/png' })] });
      registrar(1);
    } catch {}
    setGenerando('');
  }

  const alternar = (id) => setElegidas((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const fondoTemporada = resolverFondo('temporada', temporada);

  return (
    <div className="placa">
      <div className="placa__form">
        <fieldset>
          <legend>Formato</legend>
          <div className="placa__formatos">
            {FORMATOS.map((f) => (
              <label key={f.id} className={formato === f.id ? 'on' : ''}>
                <input type="radio" name="formato" value={f.id} checked={formato === f.id} onChange={() => setFormato(f.id)} />
                <span className={`placa__forma placa__forma--${f.id}`} aria-hidden="true" />
                <span><strong>{f.nombre}</strong><small>{f.detalle}</small></span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="placa__leyenda">
            Producto
            <label className="placa__varias">
              <input type="checkbox" checked={varias} onChange={(e) => { setVarias(e.target.checked); setElegidas(new Set()); }} />
              Hacer varias placas de una vez
            </label>
          </legend>
          <div className="placa__buscar">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscá cualquier repuesto del catálogo: código o nombre"
              aria-label="Buscar un repuesto del catálogo para la placa"
            />
            {busqueda.trim().length >= 2 ? (
              <ul className="placa__resultados" role="listbox" aria-label="Repuestos encontrados">
                {buscando && !resultados.length ? <li className="placa__res-vacio">Buscando…</li> : null}
                {!buscando && !resultados.length ? <li className="placa__res-vacio">No hay repuestos con foto para esa búsqueda.</li> : null}
                {resultados.map((r) => (
                  <li key={r.codigo}>
                    <button type="button" onClick={() => traerDelCatalogo(r)} disabled={!!trayendo}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.foto} alt="" />
                      <span><code>{r.codigo}</code> {r.nombre}</span>
                      <em>{trayendo === r.codigo ? 'Preparando…' : 'Usar'}</em>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="placa__fotos">
            {productos.map((p) => {
              const on = varias ? elegidas.has(p.id) : actual?.id === p.id;
              return (
                <label key={p.id} className={on ? 'on' : ''} title={p.nombre}>
                  {varias ? (
                    <input type="checkbox" checked={elegidas.has(p.id)} onChange={() => { alternar(p.id); setFotoId(p.id); }} />
                  ) : (
                    <input type="radio" name="foto" value={p.id} checked={actual?.id === p.id} onChange={() => setFotoId(p.id)} />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.miniatura} alt={p.nombre} />
                  {varias && on ? <span className="placa__check" aria-hidden="true">✓</span> : null}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="placa__pos">
          <legend>Posición del producto</legend>
          <p className="placa__ayuda">Arrastralo en la vista previa o usá las barras.</p>
          <label className="placa__rango">
            <span>Horizontal (eje X)</span>
            <input type="range" min={-LIMITE} max={LIMITE} step="0.005" value={pos.x} onChange={(e) => setPos((p) => ({ ...p, x: +e.target.value }))} />
          </label>
          <label className="placa__rango">
            <span>Vertical (eje Y)</span>
            <input type="range" min={-LIMITE} max={LIMITE} step="0.005" value={pos.y} onChange={(e) => setPos((p) => ({ ...p, y: +e.target.value }))} />
          </label>
          <button type="button" className="placa__quitar" onClick={() => setPos({ x: 0, y: 0 })} disabled={!pos.x && !pos.y}>Centrar</button>
        </fieldset>

        <fieldset>
          <legend>Fondo</legend>
          <div className="placa__fondos">
            {[FONDO_TEMPORADA, ...FONDOS].map((f) => {
              const muestra = f.id === 'temporada' ? fondoTemporada.muestra : f.muestra;
              return (
                <label key={f.id} className={fondo === f.id ? 'on' : ''} title={f.nombre}>
                  <input type="radio" name="fondo" value={f.id} checked={fondo === f.id} onChange={() => setFondo(f.id)} />
                  <span className="placa__fondo" style={{ background: muestra }} aria-hidden="true">
                    {f.id === 'temporada' ? <span className="placa__fondo-auto">AUTO</span> : null}
                  </span>
                  <span className="placa__fondo-n">{f.nombre}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="campo">
          <label htmlFor="placa-titulo">Título</label>
          <select id="placa-titulo" value={tituloSel} onChange={(e) => setTituloSel(e.target.value)}>
            {TITULOS.map((t) => <option key={t} value={t}>{t}</option>)}
            <option value={TITULO_PROPIO}>✏️ Escribir mi propio título…</option>
          </select>
          {tituloSel === TITULO_PROPIO ? (
            <input aria-label="Tu título" value={tituloPropio} onChange={(e) => setTituloPropio(e.target.value)} maxLength={40} placeholder="Escribí tu título" autoFocus />
          ) : null}
        </div>

        <div className="campo">
          <label htmlFor="placa-etiqueta">Etiqueta sobre el producto</label>
          <select id="placa-etiqueta" value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)}>
            {ETIQUETAS.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="placa-comercio">Nombre de tu comercio</label>
          <input id="placa-comercio" value={comercio} onChange={(e) => setComercio(e.target.value)} maxLength={40} placeholder="Ej: Agro Ferretería El Tala" />
        </div>
        <div className="campo">
          <label htmlFor="placa-contacto">Contacto</label>
          <input id="placa-contacto" value={contacto} onChange={(e) => setContacto(e.target.value)} maxLength={60} placeholder="Ej: WhatsApp 11 5555-5555 · Pilar" />
        </div>

        <div className="campo placa__qr">
          <label className="placa__check-fila">
            <input type="checkbox" checked={conQR} onChange={(e) => setConQR(e.target.checked)} />
            Agregar un código QR a mi WhatsApp
          </label>
          {conQR ? (
            <>
              <input aria-label="Tu WhatsApp para el QR" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" maxLength={25} placeholder="Tu WhatsApp, ej: 11 5555-5555" />
              <p className="placa__ayuda">
                {numeroWA ? `✓ El QR abre un chat con +${numeroWA}.` : 'Escribí tu número con código de área para que aparezca el QR.'}
              </p>
            </>
          ) : null}
        </div>

        <div className="campo placa__logo">
          <span className="placa__logo-k">Tu logo (opcional)</span>
          <label className="placa__clip">
            <input type="file" accept="image/*" onChange={subirLogo} />
            <Clip /> {logo ? 'Cambiar tu logo' : 'Agregá tu logo'}
          </label>
          {logoMsg ? <p className="placa__logo-msg" role="status">{logoMsg}</p> : null}
          {logo ? (
            <div className="placa__logo-opc">
              <label>
                Fondo del logo
                <select value={modoLogo} onChange={(e) => setModoLogo(e.target.value)}>
                  <option value="auto">Automático (recomendado)</option>
                  <option value="sinfondo">Sin fondo</option>
                  <option value="blanco">Con su fondo blanco</option>
                </select>
              </label>
              <button type="button" className="placa__quitar" onClick={() => { setLogo(null); setLogoMsg(''); }}>Quitar logo</button>
            </div>
          ) : (
            <p className="placa__ayuda">Subí la foto o imagen de tu logo como la tengas: si tiene fondo blanco, se lo sacamos solos.</p>
          )}
        </div>

        {varias ? (
          <button type="button" className="boton" onClick={descargarVarias} disabled={!!generando || !elegidas.size}>
            {generando === 'varias' ? 'Armando las placas…' : elegidas.size ? `Descargar ${elegidas.size} placas (ZIP)` : 'Elegí los productos arriba'}
          </button>
        ) : (
          <button type="button" className="boton" onClick={descargar} disabled={!!generando}>
            {generando ? 'Generando…' : `Descargar ${fmt.nombre.toLowerCase()} (PNG)`}
          </button>
        )}
        {puedeCompartir && !varias ? (
          <button type="button" className="boton boton--borde" onClick={compartir} disabled={!!generando}>Compartir</button>
        ) : null}
      </div>

      <div className={`placa__vista placa__vista--${formato}`}>
        <canvas
          ref={lienzo}
          width={fmt.w}
          height={fmt.h}
          role="img"
          aria-label={`Vista previa: ${fmt.nombre}. Arrastrá para mover el producto.`}
          onPointerDown={bajar}
          onPointerMove={mover}
          onPointerUp={soltar}
          onPointerCancel={soltar}
        />
        <p className="placa__vista-ayuda">Arrastrá el producto para acomodarlo</p>
      </div>
    </div>
  );
}
