import { MARCA } from '../../../lib/marca';

/* ---------- Opciones ---------- */

export const FORMATOS = [
  { id: 'feed', nombre: 'Placa para feed', detalle: 'Cuadrada 1:1', w: 1080, h: 1080 },
  { id: 'historia', nombre: 'Historia de Instagram', detalle: 'Vertical 9:16', w: 1080, h: 1920 },
  { id: 'horizontal', nombre: 'Horizontal', detalle: '16:9 · Facebook, WhatsApp, web', w: 1920, h: 1080 },
];

export const TITULOS = [
  `Repuestos ${MARCA.nombre}`,
  'Conseguí tu repuesto',
  'Preparate para la temporada',
  'Calidad premium',
  'Todo para tu máquina',
  'Repuestos para bosque y jardín',
];
export const TITULO_PROPIO = '__propio__';

export const ETIQUETAS = [
  { id: '', nombre: 'Sin etiqueta' },
  { id: 'nuevo', nombre: 'Nuevo ingreso', texto: 'NUEVO INGRESO' },
  { id: 'oferta', nombre: 'Oferta de temporada', texto: 'OFERTA DE TEMPORADA' },
  { id: 'recomendado', nombre: 'Recomendado', texto: 'RECOMENDADO' },
];

// Cada fondo define cómo se pinta y los colores de los textos encima.
export const FONDOS = [
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

export const FONDO_TEMPORADA = { id: 'temporada', nombre: 'Según la temporada' };
export function resolverFondo(id, temporada) {
  const real = id === 'temporada' ? (temporada === 'poda' ? 'poda' : 'cesped') : id;
  return FONDOS.find((f) => f.id === real) || FONDOS[0];
}

// Posiciones de cada elemento según el formato
function disposicion(id, W, H) {
  if (id === 'historia') {
    return {
      logo: { x: 80, y: 230, w: 300 }, etiqueta: { x: W - 80, y: 290 }, cliente: { derecha: W - 80, y: 215, maxW: 300, maxH: 150 },
      circulo: { x: W / 2, y: 880, r: 430 }, foto: { x: W / 2, y: 880, maxW: 940, maxH: 700 },
      titulo: { x: W / 2, y: 1410, maxW: W - 140, tam: 118, lineas: 2, interlinea: 1.02 },
      producto: { x: W / 2, y: 1285, tam: 38, maxW: W - 160 }, etiquetaProd: { x: 110, y: 520 },
      banda: { y: 1560, h: H - 1560 }, nombre: { y: 1680, tam: 62 }, contacto: { y: 1750, tam: 38 }, qr: 230,
    };
  }
  if (id === 'horizontal') {
    return {
      logo: { x: 80, y: 70, w: 260 }, etiqueta: { x: W - 80, y: 125 }, cliente: { derecha: W - 80, y: 60, maxW: 300, maxH: 130 },
      circulo: { x: 560, y: 490, r: 350 }, foto: { x: 560, y: 490, maxW: 860, maxH: 540 },
      titulo: { x: 1420, y: 430, maxW: 820, tam: 104, lineas: 2, interlinea: 1.02 },
      producto: { x: 1420, y: 600, tam: 34, maxW: 820 }, etiquetaProd: { x: 230, y: 190 },
      banda: { y: 880, h: 200 }, nombre: { y: 965, tam: 56 }, contacto: { y: 1025, tam: 34 }, qr: 170,
    };
  }
  return {
    logo: { x: 70, y: 60, w: 250 }, etiqueta: { x: W - 70, y: 110 }, cliente: { derecha: W - 70, y: 50, maxW: 280, maxH: 130 },
    circulo: { x: W / 2, y: 505, r: 320 }, foto: { x: W / 2, y: 500, maxW: 760, maxH: 430 },
    titulo: { x: W / 2, y: 850, maxW: W - 140, tam: 92, lineas: 1, interlinea: 1 },
    producto: { x: W / 2, y: 758, tam: 30, maxW: W - 200 }, etiquetaProd: { x: 110, y: 240 },
    banda: { y: 900, h: 180 }, nombre: { y: 980, tam: 54 }, contacto: { y: 1035, tam: 34 }, qr: 150,
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

/**
 * Dibuja la placa completa en `canvas`. Opciones:
 *  formato, fondo, temporada, foto (URL o { canvas }), posX/posY (-0.5..0.5, fracción del ancho/alto),
 *  titulo, producto (nombre del repuesto), etiqueta, comercio, contacto, logo, modoLogo, qr (canvas)
 */
export async function dibujarPlaca(canvas, o) {
  const formato = FORMATOS.find((f) => f.id === o.formato) || FORMATOS[0];
  const fondo = resolverFondo(o.fondo, o.temporada);
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
      const img = typeof o.foto === 'string' ? await cargarImagen(o.foto) : o.foto.canvas;
      const e = Math.min(L.foto.maxW / img.width, L.foto.maxH / img.height);
      const w = img.width * e, h = img.height * e;
      // posición elegida con el editor (arrastrar o deslizadores)
      const cx = L.foto.x + (o.posX || 0) * W, cy = L.foto.y + (o.posY || 0) * H;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 24;
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
      ctx.restore();
    } catch {}
  }

  // Etiqueta opcional ("Nuevo ingreso", "Oferta de temporada"…), inclinada sobre el producto
  const et = ETIQUETAS.find((e) => e.id === o.etiqueta && e.texto);
  if (et) {
    ctx.save();
    ctx.translate(L.etiquetaProd.x, L.etiquetaProd.y);
    ctx.rotate(-0.12);
    ctx.font = fuenteTexto(formato.id === 'historia' ? 40 : 32);
    const tw = ctx.measureText(et.texto).width;
    const padX = 26, alto = formato.id === 'historia' ? 70 : 58;
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    ctx.fillStyle = et.id === 'oferta' ? '#e5484d' : fondo.oscuro ? '#ffffff' : '#0a2149';
    rectRedondo(ctx, -padX, -alto / 2, tw + padX * 2, alto, alto / 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = et.id === 'oferta' ? '#ffffff' : fondo.oscuro ? '#0a2149' : '#ffffff';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(et.texto, 0, 2);
    ctx.restore();
  }

  // Título (1 o 2 renglones según el formato)
  ctx.textAlign = 'center';
  ctx.fillStyle = fondo.titulo;
  const t = repartir(ctx, (o.titulo || '').toUpperCase(), L.titulo.maxW, L.titulo.tam, L.titulo.lineas, fuenteTitulo);
  const alto = t.tam * L.titulo.interlinea;
  const y0 = L.titulo.y - ((t.renglones.length - 1) * alto) / 2;
  t.renglones.forEach((r, i) => ctx.fillText(r, L.titulo.x, y0 + i * alto));

  if (o.producto) {
    ctx.fillStyle = fondo.acento;
    const p = repartir(ctx, o.producto, L.producto.maxW, L.producto.tam, 1, (s) => fuenteTexto(s));
    ctx.font = fuenteTexto(p.tam);
    ctx.fillText(p.renglones[0], L.producto.x, formato.id === 'horizontal' ? y0 + (t.renglones.length - 1) * alto + 90 : L.producto.y);
  }

  // Banda inferior con el comercio
  ctx.fillStyle = fondo.banda;
  ctx.fillRect(0, L.banda.y, W, L.banda.h);
  // Con QR, el texto se corre a la izquierda y el código va a la derecha de la banda
  const q = o.qr ? Math.min(L.qr, L.banda.h - 24) : 0;
  const anchoTexto = q ? W - q - 200 : W - 140;
  const xTexto = q ? 70 + anchoTexto / 2 : W / 2;
  ctx.fillStyle = fondo.bandaTitulo;
  const nombre = o.comercio || 'Nombre de tu comercio';
  const n = repartir(ctx, nombre, anchoTexto, L.nombre.tam, 1, (s) => fuenteTexto(s));
  ctx.font = fuenteTexto(n.tam);
  ctx.fillText(n.renglones[0], xTexto, L.nombre.y);
  ctx.fillStyle = fondo.bandaTexto;
  const c = repartir(ctx, o.contacto || 'WhatsApp · dirección · localidad', anchoTexto, L.contacto.tam, 1, (s) => fuenteTexto(s, 400));
  ctx.font = fuenteTexto(c.tam, 400);
  ctx.fillText(c.renglones[0], xTexto, L.contacto.y);
  if (q) {
    const qx = W - 70 - q, qy = L.banda.y + (L.banda.h - q) / 2;
    ctx.fillStyle = '#ffffff';
    rectRedondo(ctx, qx - 8, qy - 8, q + 16, q + 16, 12);
    ctx.fill();
    ctx.drawImage(o.qr, qx, qy, q, q);
  }
  return formato;
}

/** Un logo oscuro sobre fondo oscuro (o claro sobre claro) no se ve: va sobre una placa. */
export function necesitaPlaca(lg, fondo) {
  return fondo.oscuro ? lg.luminancia < 0.45 : lg.luminancia > 0.75;
}

