/**
 * Fotos de producto = la imagen embebida en el PDF, en su RESOLUCIÓN NATIVA y con
 * el color tal cual (gestión de color de mupdf, la misma que usa para dibujar la
 * página).  NO se renderiza la página ni se reescala hacia arriba en mupdf (eso
 * pixelaba).  Se toma cada imagen con un "device" de mupdf, se pasa a RGB y se
 * guarda a tamaño nativo; si es muy chica se agranda con suavizado (bicúbico) para
 * que no se vea en bloques.  Sin filtros, sin cambios de color, sin fondos nuevos.
 *
 * Posición: el CTM que da mupdf en fillImage -> se cruza con el código más cercano.
 *
 * Uso:  node data/scripts/fotos-render-v4.mjs "<pdf v4>" data/scripts/pages.json [--apply] [--pages 65,114]
 */
import fs from 'fs';
import path from 'path';
import * as mupdf from 'mupdf';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const PDF = process.argv[2];
const PAGES_JSON = process.argv[3] || 'data/scripts/pages.json';
const APPLY = process.argv.includes('--apply');
const onlyPages = (() => { const i = process.argv.indexOf('--pages'); return i > 0 ? process.argv[i + 1].split(',').map(Number) : null; })();
const OUT_DIRS = ['data/fotos', 'public/fotos'];
const PRODUCTOS = 'data/productos.json';
const OBJETIVO_LADO = 760; // lado mayor deseado (para pantallas retina)

const textPages = JSON.parse(fs.readFileSync(PAGES_JSON, 'utf8'));
const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));
const codigosValidos = new Set(productos.map((p) => p.codigo));

const CODE_RE = /\b\d{7}\b/;
function anchorsFor(pg) {
  const its = pg.items || [];
  const found = new Map();
  for (let i = 0; i < its.length; i++) {
    const s = its[i].s.trim();
    if (/^C[OÓ]DIGO$/i.test(s)) {
      const near = its.filter((o) => Math.abs(o.y - its[i].y) < 7 && o.x > its[i].x && o.x < its[i].x + 120 && CODE_RE.test(o.s));
      near.sort((a, b) => a.x - b.x);
      if (near[0]) { const c = near[0].s.trim().match(CODE_RE)[0]; if (!found.has(c)) found.set(c, { x: near[0].x, y: its[i].y }); }
      continue;
    }
    const mm = s.match(/^(\d{7})\b/);
    if (mm && its[i].x < 150 && !found.has(mm[1])) found.set(mm[1], { x: its[i].x, y: its[i].y });
  }
  return [...found.entries()].filter(([c]) => codigosValidos.has(c)).map(([code, p]) => ({ code, x: p.x, y: p.y }));
}

const doc = mupdf.Document.openDocument(fs.readFileSync(PDF), 'application/pdf');

// junta cada imagen dibujada en la página con su caja (en puntos, top-left)
function imagenesDePagina(pi) {
  const page = doc.loadPage(pi);
  const out = [];
  const dev = new mupdf.Device({
    fillImage(image, ctm) {
      try {
        const a = ctm[0], b = ctm[1], c = ctm[2], d = ctm[3], e = ctm[4], f = ctm[5];
        const bw = Math.hypot(a, b), bh = Math.hypot(c, d);
        out.push({ image, w: image.getWidth(), h: image.getHeight(), x: e, yTop: f, bw, bh, cx: e + bw / 2, cyTop: f + bh / 2 });
      } catch {}
    },
    fillImageMask(image, ctm) { this.fillImage(image, ctm); },
  });
  page.run(dev, mupdf.Matrix.identity);
  try { dev.close(); } catch {}
  return out;
}

async function pixmapAJpeg(image, code) {
  let px = image.toPixmap();
  // pasar a RGB si hace falta
  const cs = String(px.getColorSpace() || '');
  if (!/RGB/i.test(cs)) {
    try { px = px.convertToColorSpace(mupdf.ColorSpace.DeviceRGB); } catch {}
  }
  const w = px.getWidth(), h = px.getHeight();
  const png = px.asPNG();
  const img = await loadImage(png);

  // canvas a tamaño nativo, sobre blanco (por si viene con alfa)
  let cw = w, ch = h;
  // agrandar si es chica, con suavizado (no pixela)
  const lado = Math.max(w, h);
  if (lado < OBJETIVO_LADO) {
    const k = OBJETIVO_LADO / lado;
    cw = Math.round(w * k);
    ch = Math.round(h * k);
  }
  const c = createCanvas(cw, ch);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, 0, 0, cw, ch);
  return c.toBuffer('image/jpeg', 0.9);
}

/* ---- recorrido: asociar imagen <-> código por posición ---- */
const asignado = {}; // code -> image
let sinAncla = 0;

for (let p = 1; p <= doc.countPages(); p++) {
  if (onlyPages && !onlyPages.includes(p)) continue;
  const tp = textPages.find((x) => x.p === p);
  if (!tp) continue;
  const anchors = anchorsFor(tp);
  if (!anchors.length) continue;

  const imgs = imagenesDePagina(p - 1).filter((q) => {
    if (q.w < 90 || q.h < 90) return false;
    if (q.w > 1600 || q.h > 1600) return false;      // banners
    const ar = q.w / q.h;
    if (ar < 0.4 || ar > 2.4) return false;          // tiras de texto
    if (q.bw < 40 || q.bh < 40) return false;
    return true;
  });
  if (!imgs.length) continue;

  // dedupe por posición (el theme a veces dibuja la misma foto 2 veces)
  const vistas = [];
  const fotos = [];
  for (const q of imgs) {
    if (vistas.some((v) => Math.abs(v.cx - q.cx) < 6 && Math.abs(v.cyTop - q.cyTop) < 6)) continue;
    vistas.push(q);
    fotos.push(q);
  }

  const cand = [];
  for (const q of fotos) for (const a of anchors) {
    const dx = Math.abs(q.cx - a.x);
    const dy = q.cyTop - a.y;
    if (dx > 78 || dy < -60 || dy > 170) continue;
    cand.push({ q, a, d: Math.hypot(dx, dy * 0.8) });
  }
  cand.sort((x, y) => x.d - y.d);
  const qU = new Set(), aU = new Set();
  for (const cc of cand) {
    if (qU.has(cc.q) || aU.has(cc.a.code)) continue;
    qU.add(cc.q); aU.add(cc.a.code);
    asignado[cc.a.code] = cc.q.image;
  }
  if (!cand.length) sinAncla++;
}

const codes = Object.keys(asignado);
console.log(`fotos asociadas: ${codes.length}  (páginas sin match: ${sinAncla})`);
if (!APPLY) { console.log('\nSimulación. Agregá --apply para escribir.'); process.exit(0); }

function writeRetry(file, buf, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try { fs.writeFileSync(file, buf); return; } catch (e) { if (i === tries - 1) throw e; const u = Date.now() + 150 * (i + 1); while (Date.now() < u) {} }
  }
}

let hechas = 0, errs = 0;
for (const code of codes) {
  try {
    const jpg = await pixmapAJpeg(asignado[code], code);
    for (const dir of OUT_DIRS) { fs.mkdirSync(dir, { recursive: true }); writeRetry(path.join(dir, code + '.jpg'), jpg); }
    const prod = idx.get(code);
    if (prod) { prod.foto = code + '.jpg'; prod.foto_origen = 'pdf-nativa'; delete prod.foto_confianza; }
  } catch (e) { errs++; }
  if (++hechas % 100 === 0) process.stdout.write(`  ${hechas}/${codes.length}\r`);
}

writeRetry(PRODUCTOS, JSON.stringify(productos, null, 1));
const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
  'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
  'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
const cell = (v) => { let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
writeRetry('data/productos.csv', '﻿' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
console.log(`\nListo. ${hechas} fotos (nativas del PDF, errores: ${errs}). Total con foto: ${productos.filter((x) => x.foto).length}/${productos.length}`);
