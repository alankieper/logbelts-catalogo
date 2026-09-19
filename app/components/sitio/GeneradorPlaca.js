'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MARCA, slugMarca } from '../../../lib/marca';
import { procesarLogo } from './logoSinFondo';
import './generador-placa.css';

/* ---------- Opciones ---------- */

export const FORMATOS = [
  { id: 'feed', nombre: 'Placa para feed', detalle: 'Cuadrada 1:1', w: 1080, h: 1080 },
  { id: 'historia', nombre: 'Historia de Instagram', detalle: 'Vertical 9:16', w: 1080, h: 1920 },
  { id: 'horizontal', nombre: 'Horizontal', detalle: '16:9 · Facebook, WhatsApp, web', w: 1920, h: 1080 },
];

const TITULOS = [
  `Repuestos ${MARCA.nombre}`,
  'Conseguí tu repuesto',
  'Preparate para la temporada',
  'Calidad premium',
  'Todo para tu máquina',
  'Repuestos para bosque y jardín',
];
const TITULO_PROPIO = '__propio__';

// Cada fondo define cómo se pinta y los colores de los textos encima.
const FONDOS = [
  {
    id: 'azul', nombre: 'Azul Logbelts', muestra: 'radial-gradient(circle at 30% 0%, #123b78, #0a2149 55%, #071531)',
    oscuro: true, titulo: '#ffffff', acento: '#8fb0ff', circulo: 'rgba(143,176,255,.18)', banda: '#ffffff', bandaTitulo: '#0a2149', bandaTexto: '#4a505b',
    pintar(ctx, W, H) {
      const g = ctx.createRadialGradient(W * 0.3, -H * 0.1, 50, W * 0.5, H * 0.5, Math.max(W, H));
      g.addColorStop(0, '#123b78'); g.addColorStop(0.5, '#0a2149'); g.addColorStop(1, '#071531');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    },
  },
  {
    id: 'noche', nombre: 'Noche técnica', muestra: 'linear-gradient(160deg, #0b1630, #03060f)',
    oscuro: true, titulo: '#ffffff', acento: '#6ee7ff', circulo: 'rgba(110,231,255,.12)', banda: '#0b1630', bandaTitulo: '#ffffff', bandaTexto: '#9fb3d9',
    pintar(ctx, W, H) {
      const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
      g.addColorStop(0, '#0b1630'); g.addColorStop(1, '#03060f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // trama técnica: líneas finas en diagonal
      ctx.save(); ctx.strokeStyle = 'rgba(110,231,255,.07)'; ctx.lineWidth = 2;
      for (let x = -H; x < W; x += 46) { ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + H * 0.6, 0); ctx.stroke(); }
      ctx.restore();
      const glow = ctx.createRadialGradient(W / 2, H, 10, W / 2, H, Math.max(W, H) * 0.7);
      glow.addColorStop(0, 'rgba(47,82,168,.55)'); glow.addColorStop(1, 'rgba(47,82,168,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    },
  },
  {
    id: 'cesped', nombre: 'Temporada de césped', muestra: 'linear-gradient(160deg, #1f7a44, #0b2e1f)',
    oscuro: true, titulo: '#ffffff', acento: '#b9f28c', circulo: 'rgba(185,242,140,.16)', banda: '#ffffff', bandaTitulo: '#0b2e1f', bandaTexto: '#3d5245',
    pintar(ctx, W, H) {
      const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
      g.addColorStop(0, '#1f7a44'); g.addColorStop(1, '#0b2e1f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const luz = ctx.createRadialGradient(W * 0.85, 0, 10, W * 0.85, 0, Math.max(W, H) * 0.7);
      luz.addColorStop(0, 'rgba(255,255,200,.22)'); luz.addColorStop(1, 'rgba(255,255,200,0)');
      ctx.fillStyle = luz; ctx.fillRect(0, 0, W, H);
    },
  },
  {
    id: 'poda', nombre: 'Temporada de poda', muestra: 'linear-gradient(160deg, #9a3f12, #2b1206)',
    oscuro: true, titulo: '#ffffff', acento: '#ffc27a', circulo: 'rgba(255,194,122,.16)', banda: '#ffffff', bandaTitulo: '#3a1807', bandaTexto: '#5b4636',
    pintar(ctx, W, H) {
      const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
      g.addColorStop(0, '#9a3f12'); g.addColorStop(1, '#2b1206');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const luz = ctx.createRadialGradient(W * 0.2, H * 0.1, 10, W * 0.2, H * 0.1, Math.max(W, H) * 0.6);
      luz.addColorStop(0, 'rgba(255,180,90,.28)'); luz.addColorStop(1, 'rgba(255,180,90,0)');
      ctx.fillStyle = luz; ctx.fillRect(0, 0, W, H);
    },
  },
  {
    id: 'claro', nombre: 'Claro', muestra: 'linear-gradient(160deg, #f5f7fb, #dbe3f1)',
    oscuro: false, titulo: '#0a2149', acento: '#2f52a8', circulo: 'rgba(47,82,168,.10)', banda: '#0a2149', bandaTitulo: '#ffffff', bandaTexto: '#c9d6f2',
    pintar(ctx, W, H) {
      const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
      g.addColorStop(0, '#f5f7fb'); g.addColorStop(1, '#dbe3f1');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    },
  },
];

// Posiciones de cada elemento según el formato
function disposicion(id, W, H) {
  if (id === 'historia') {
    return {
      logo: { x: 80, y: 230, w: 300 }, etiqueta: { x: W - 80, y: 290 }, cliente: { derecha: W - 80, y: 215, maxW: 300, maxH: 150 },
      circulo: { x: W / 2, y: 880, r: 430 }, foto: { x: W / 2, y: 880, maxW: 940, maxH: 700 },
      titulo: { x: W / 2, y: 1410, maxW: W - 140, tam: 118, lineas: 2, interlinea: 1.02 },
      banda: { y: 1560, h: H - 1560 }, nombre: { y: 1680, tam: 62 }, contacto: { y: 1750, tam: 38 },
    };
  }
  if (id === 'horizontal') {
    return {
      logo: { x: 80, y: 70, w: 260 }, etiqueta: { x: W - 80, y: 125 }, cliente: { derecha: W - 80, y: 60, maxW: 300, maxH: 130 },
      circulo: { x: 560, y: 490, r: 350 }, foto: { x: 560, y: 490, maxW: 860, maxH: 540 },
      titulo: { x: 1420, y: 430, maxW: 820, tam: 104, lineas: 2, interlinea: 1.02 },
      banda: { y: 880, h: 200 }, nombre: { y: 965, tam: 56 }, contacto: { y: 1025, tam: 34 },
    };
  }
  return {
    logo: { x: 70, y: 60, w: 250 }, etiqueta: { x: W - 70, y: 110 }, cliente: { derecha: W - 70, y: 50, maxW: 280, maxH: 130 },
    circulo: { x: W / 2, y: 520, r: 330 }, foto: { x: W / 2, y: 520, maxW: 780, maxH: 470 },
    titulo: { x: W / 2, y: 850, maxW: W - 140, tam: 92, lineas: 1, interlinea: 1 },
    banda: { y: 900, h: 180 }, nombre: { y: 980, tam: 54 }, contacto: { y: 1035, tam: 34 },
  };
}

/* ---------- Dibujo ---------- */

const cache = new Map();
function cargarImagen(src) {
  if (cache.has(src)) return cache.get(src);
  const p = new Promise((ok, mal) => {
    const img = new Image();
    if (/^https?:\/\//.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => ok(img);
    img.onerror = mal;
    img.src = src;
  });
  cache.set(src, p);
  p.catch(() => cache.delete(src));
  return p;
}

const fuenteTitulo = (t) => `italic 700 ${t}px Dunk95, Impact, sans-serif`;
const fuenteTexto = (t, peso = 700) => `${peso} ${t}px "Aktiv Grotesk", sans-serif`;

/** Achica el tamaño hasta que el texto entre en `lineas` renglones de `maxW`. */
function repartir(ctx, texto, maxW, tamInicial, lineas, fuente) {
  const palabras = texto.split(/\s+/).filter(Boolean);
  for (let tam = tamInicial; tam >= 28; tam -= 4) {
    ctx.font = fuente(tam);
    const renglones = [];
    let actual = '';
    for (const p of palabras) {
      const prueba = actual ? `${actual} ${p}` : p;
      if (ctx.measureText(prueba).width <= maxW || !actual) actual = prueba;
      else { renglones.push(actual); actual = p; }
    }
    if (actual) renglones.push(actual);
    if (renglones.length <= lineas && renglones.every((r) => ctx.measureText(r).width <= maxW)) return { tam, renglones };
  }
  ctx.font = fuente(28);
  return { tam: 28, renglones: [texto] };
}

function rectRedondo(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function dibujarPlaca(canvas, o) {
  const formato = FORMATOS.find((f) => f.id === o.formato) || FORMATOS[0];
  const fondo = FONDOS.find((f) => f.id === o.fondo) || FONDOS[0];
  const W = formato.w, H = formato.h;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext('2d');
  const L = disposicion(formato.id, W, H);
  try { await Promise.all([document.fonts.load('italic 700 80px Dunk95'), document.fonts.load('700 40px "Aktiv Grotesk"')]); } catch {}

  fondo.pintar(ctx, W, H);

  ctx.fillStyle = fondo.circulo;
  ctx.beginPath();
  ctx.arc(L.circulo.x, L.circulo.y, L.circulo.r, 0, Math.PI * 2);
  ctx.fill();

  try {
    const logo = await cargarImagen(fondo.oscuro ? MARCA.logoClaro : MARCA.logoOscuro);
    ctx.drawImage(logo, L.logo.x, L.logo.y, L.logo.w, (logo.height / logo.width) * L.logo.w);
  } catch {}

  // Logo del comercio arriba a la derecha (si no hay, va "VENTA DE REPUESTOS")
  if (o.logo) {
    const lg = o.logo;
    const esc = Math.min(L.cliente.maxW / lg.canvas.width, L.cliente.maxH / lg.canvas.height);
    const w = lg.canvas.width * esc, h = lg.canvas.height * esc;
    const x = L.cliente.derecha - w, y = L.cliente.y;
    const usarPlaca = o.modoLogo === 'blanco' || (o.modoLogo === 'auto' && necesitaPlaca(lg, fondo));
    if (usarPlaca) {
      const pad = 18;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      ctx.fillStyle = fondo.oscuro ? '#ffffff' : '#0a2149';
      rectRedondo(ctx, x - pad, y - pad, w + pad * 2, h + pad * 2, 18);
      ctx.fill();
      ctx.restore();
    }
    ctx.drawImage(o.modoLogo === 'blanco' && lg.original ? lg.original : lg.canvas, x, y, w, h);
  } else {
    ctx.textAlign = 'right';
    ctx.fillStyle = fondo.acento;
    ctx.font = fuenteTexto(formato.id === 'historia' ? 34 : 30);
    ctx.fillText('VENTA DE REPUESTOS', L.etiqueta.x, L.etiqueta.y);
  }

  if (o.foto) {
    try {
      const img = await cargarImagen(o.foto);
      const e = Math.min(L.foto.maxW / img.width, L.foto.maxH / img.height);
      const w = img.width * e, h = img.height * e;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 24;
      ctx.drawImage(img, L.foto.x - w / 2, L.foto.y - h / 2, w, h);
      ctx.restore();
    } catch {}
  }

  // Título (1 o 2 renglones según el formato)
  ctx.textAlign = 'center';
  ctx.fillStyle = fondo.titulo;
  const t = repartir(ctx, (o.titulo || '').toUpperCase(), L.titulo.maxW, L.titulo.tam, L.titulo.lineas, fuenteTitulo);
  const alto = t.tam * L.titulo.interlinea;
  const y0 = L.titulo.y - ((t.renglones.length - 1) * alto) / 2;
  t.renglones.forEach((r, i) => ctx.fillText(r, L.titulo.x, y0 + i * alto));

  // Banda inferior con el comercio
  ctx.fillStyle = fondo.banda;
  ctx.fillRect(0, L.banda.y, W, L.banda.h);
  ctx.fillStyle = fondo.bandaTitulo;
  const nombre = o.comercio || 'Nombre de tu comercio';
  const n = repartir(ctx, nombre, W - 140, L.nombre.tam, 1, (s) => fuenteTexto(s));
  ctx.font = fuenteTexto(n.tam);
  ctx.fillText(n.renglones[0], W / 2, L.nombre.y);
  ctx.fillStyle = fondo.bandaTexto;
  ctx.font = fuenteTexto(L.contacto.tam, 400);
  ctx.fillText(o.contacto || 'WhatsApp · dirección · localidad', W / 2, L.contacto.y);
  return formato;
}

/** Un logo oscuro sobre fondo oscuro (o claro sobre claro) no se ve: va sobre una placa. */
function necesitaPlaca(lg, fondo) {
  return fondo.oscuro ? lg.luminancia < 0.45 : lg.luminancia > 0.75;
}

/* ---------- Componente ---------- */

const CLAVE = 'lb_placa';
const Clip = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

export default function GeneradorPlaca({ fotos }) {
  const lienzo = useRef(null);
  const [foto, setFoto] = useState(fotos[0]?.src);
  const [formato, setFormato] = useState('feed');
  const [fondo, setFondo] = useState('azul');
  const [tituloSel, setTituloSel] = useState(TITULOS[0]);
  const [tituloPropio, setTituloPropio] = useState('');
  const [comercio, setComercio] = useState('');
  const [contacto, setContacto] = useState('');
  const [logo, setLogo] = useState(null); // { canvas, original, luminancia, sinFondo }
  const [modoLogo, setModoLogo] = useState('auto'); // auto | sinfondo | blanco
  const [logoMsg, setLogoMsg] = useState('');
  const [generando, setGenerando] = useState(false);
  const [puedeCompartir, setPuedeCompartir] = useState(false);
  const titulo = tituloSel === TITULO_PROPIO ? tituloPropio : tituloSel;

  // Recordar los datos del comercio en este navegador (no hace falta escribirlos cada vez)
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(CLAVE) || '{}');
      if (d.comercio) setComercio(d.comercio);
      if (d.contacto) setContacto(d.contacto);
      if (d.fondo && FONDOS.some((f) => f.id === d.fondo)) setFondo(d.fondo);
      if (d.formato && FORMATOS.some((f) => f.id === d.formato)) setFormato(d.formato);
    } catch {}
    try {
      const prueba = new File([new Blob()], 'x.png', { type: 'image/png' });
      setPuedeCompartir(!!(navigator.canShare && navigator.canShare({ files: [prueba] })));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify({ comercio, contacto, fondo, formato })); } catch {}
  }, [comercio, contacto, fondo, formato]);

  // Se dibuja en un lienzo aparte y se copia al final: si el usuario cambia algo mientras
  // carga una imagen, no se mezclan dos dibujos a medias.
  const turno = useRef(0);
  const dibujar = useCallback(async () => {
    const mio = ++turno.current;
    const aparte = document.createElement('canvas');
    await dibujarPlaca(aparte, { formato, fondo, foto, titulo, comercio, contacto, logo, modoLogo });
    const c = lienzo.current;
    if (!c || mio !== turno.current) return;
    if (c.width !== aparte.width) c.width = aparte.width;
    if (c.height !== aparte.height) c.height = aparte.height;
    c.getContext('2d').drawImage(aparte, 0, 0);
  }, [formato, fondo, foto, titulo, comercio, contacto, logo, modoLogo]);
  useEffect(() => { dibujar(); }, [dibujar]);

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

  const nombreArchivo = () =>
    `placa-${slugMarca()}-${formato}-${(comercio || 'comercio').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}.png`;

  const generarArchivo = () => new Promise((ok) => lienzo.current.toBlob((b) => ok(b), 'image/png'));

  async function descargar() {
    setGenerando(true);
    await dibujar();
    const blob = await generarArchivo();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setGenerando(false);
  }

  async function compartir() {
    setGenerando(true);
    try {
      await dibujar();
      const blob = await generarArchivo();
      await navigator.share({ files: [new File([blob], nombreArchivo(), { type: 'image/png' })] });
    } catch {}
    setGenerando(false);
  }

  const fmt = FORMATOS.find((f) => f.id === formato) || FORMATOS[0];

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
          <legend>Producto</legend>
          <div className="placa__fotos">
            {fotos.map((f) => (
              <label key={f.src} className={foto === f.src ? 'on' : ''} title={f.nombre}>
                <input type="radio" name="foto" value={f.src} checked={foto === f.src} onChange={() => setFoto(f.src)} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.src} alt={f.nombre} />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Fondo</legend>
          <div className="placa__fondos">
            {FONDOS.map((f) => (
              <label key={f.id} className={fondo === f.id ? 'on' : ''} title={f.nombre}>
                <input type="radio" name="fondo" value={f.id} checked={fondo === f.id} onChange={() => setFondo(f.id)} />
                <span className="placa__fondo" style={{ background: f.muestra }} aria-hidden="true" />
                <span className="placa__fondo-n">{f.nombre}</span>
              </label>
            ))}
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
          <label htmlFor="placa-comercio">Nombre de tu comercio</label>
          <input id="placa-comercio" value={comercio} onChange={(e) => setComercio(e.target.value)} maxLength={40} placeholder="Ej: Agro Ferretería El Tala" />
        </div>
        <div className="campo">
          <label htmlFor="placa-contacto">Contacto</label>
          <input id="placa-contacto" value={contacto} onChange={(e) => setContacto(e.target.value)} maxLength={60} placeholder="Ej: WhatsApp 11 5555-5555 · Pilar" />
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

        <button type="button" className="boton" onClick={descargar} disabled={generando}>
          {generando ? 'Generando…' : `Descargar ${fmt.nombre.toLowerCase()} (PNG)`}
        </button>
        {puedeCompartir ? (
          <button type="button" className="boton boton--borde" onClick={compartir} disabled={generando}>Compartir</button>
        ) : null}
      </div>
      <div className={`placa__vista placa__vista--${formato}`}>
        <canvas ref={lienzo} width={fmt.w} height={fmt.h} role="img" aria-label={`Vista previa: ${fmt.nombre}`} />
      </div>
    </div>
  );
}
