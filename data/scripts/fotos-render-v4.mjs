/**
 * Fotos de producto tomadas TAL CUAL las muestra el PDF: se renderiza la página
 * con mupdf (color correcto, sin conversión CMYK a mano) y se recorta la imagen
 * de cada producto en su posición exacta.  Sin filtros, sin fondos, sin recortes
 * nuevos, sin cambios de color: sólo el recorte de lo que ya está en el catálogo.
 *
 * Posición de cada imagen: pdf.js (operator list).  Recorte: mupdf render + canvas.
 * Reemplaza data/fotos y public/fotos para los códigos que se pueden ubicar.
 *
 * Uso:  node data/scripts/fotos-render-v4.mjs "<pdf v4>" data/scripts/pages.json [--apply] [--pages 63,114]
 */
import fs from 'fs';
import path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as mupdf from 'mupdf';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const PDF = process.argv[2];
const PAGES_JSON = process.argv[3] || 'data/scripts/pages.json';
const APPLY = process.argv.includes('--apply');
const onlyPages = (() => { const i = process.argv.indexOf('--pages'); return i > 0 ? process.argv[i + 1].split(',').map(Number) : null; })();
const OUT_DIRS = ['data/fotos', 'public/fotos'];
const PRODUCTOS = 'data/productos.json';
const SCALE = 8; // alta resolución: que no se vea pixelado en pantallas retina

const textPages = JSON.parse(fs.readFileSync(PAGES_JSON, 'utf8'));
const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));
const codigosValidos = new Set(productos.map((p) => p.codigo));

/* ---- posiciones de imágenes con pdf.js ---- */
const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(PDF)), useSystemFonts: true }).promise;
const OPS = pdfjs.OPS;
const mul = (a, b) => [
  a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
];
async function imgPositions(pnum) {
  const page = await doc.getPage(pnum);
  const vp = page.getViewport({ scale: 1 });
  const ol = await page.getOperatorList();
  const stack = [];
  let m = [1, 0, 0, 1, 0, 0];
  const out = [];
  for (let i = 0; i < ol.fnArray.length; i++) {
    const fn = ol.fnArray[i];
    const args = ol.argsArray[i];
    if (fn === OPS.save) stack.push(m.slice());
    else if (fn === OPS.restore) m = stack.pop() || m;
    else if (fn === OPS.transform) m = mul(m, args);
    else if (fn === OPS.paintImageXObject || fn === OPS.paintJpegXObject || fn === OPS.paintImageMaskXObject || fn === OPS.paintInlineImageXObject) {
      const cx = m[0] * 0.5 + m[2] * 0.5 + m[4];
      const cy = m[1] * 0.5 + m[3] * 0.5 + m[5];
      out.push({
        wpx: args[1], hpx: args[2],
        cx, cyTop: vp.height - cy,
        boxW: Math.hypot(m[0], m[1]), boxH: Math.hypot(m[2], m[3]),
      });
    }
  }
  return { pos: out, vp };
}

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

/* ---- recorrido ---- */
const recortes = {}; // code -> {pagina, x, y, w, h}  (en puntos, top-left)
let sinAncla = 0;

for (let p = 1; p <= doc.numPages; p++) {
  if (onlyPages && !onlyPages.includes(p)) continue;
  const tp = textPages.find((x) => x.p === p);
  if (!tp) continue;
  const anchors = anchorsFor(tp);
  if (!anchors.length) continue;

  const { pos } = await imgPositions(p);
  const fotos = [];
  const vistas = [];
  for (const q of pos) {
    if (!q.wpx || !q.hpx) continue;
    if (q.wpx < 90 || q.hpx < 90 || q.wpx > 1550 || q.hpx > 1550) continue;
    const ar = q.wpx / q.hpx;
    if (ar < 0.5 || ar > 1.75) continue;
    if (q.boxW < 42 || q.boxH < 42) continue;
    if (vistas.some((v) => Math.abs(v.cx - q.cx) < 8 && Math.abs(v.cyTop - q.cyTop) < 8)) continue;
    vistas.push(q);
    fotos.push(q);
  }
  if (!fotos.length) continue;

  const cand = [];
  for (const f of fotos) for (const a of anchors) {
    const dx = Math.abs(f.cx - a.x);
    const dy = f.cyTop - a.y;
    if (dx > 78 || dy < -60 || dy > 170) continue;
    cand.push({ f, a, d: Math.hypot(dx, dy * 0.8) });
  }
  cand.sort((x, y) => x.d - y.d);
  const fU = new Set(), aU = new Set();
  for (const c of cand) {
    if (fU.has(c.f) || aU.has(c.a.code)) continue;
    fU.add(c.f); aU.add(c.a.code);
    const f = c.f;
    recortes[c.a.code] = {
      pagina: p,
      x: f.cx - f.boxW / 2,
      y: f.cyTop - f.boxH / 2,
      w: f.boxW,
      h: f.boxH,
    };
  }
  if (!cand.length) sinAncla++;
}

const codes = Object.keys(recortes);
console.log(`fotos ubicadas: ${codes.length}  (páginas sin match: ${sinAncla})`);
if (!APPLY) { console.log('\nSimulación. Agregá --apply para renderizar y escribir.'); process.exit(0); }

/* ---- render con mupdf + recorte ---- */
const mdoc = mupdf.Document.openDocument(fs.readFileSync(PDF), 'application/pdf');
const porPagina = {};
for (const [code, r] of Object.entries(recortes)) (porPagina[r.pagina] = porPagina[r.pagina] || []).push({ code, ...r });

// tapa con blanco líneas divisorias de la grilla que se hayan colado en un borde.
// NO recorta ni redimensiona: sólo pinta de blanco columnas/filas del borde que
// sean casi enteramente de un color saturado (azul/negro de la maqueta).
function limpiarBordes(ctx, w, h) {
  const bandX = Math.max(6, Math.round(w * 0.12));
  const bandY = Math.max(6, Math.round(h * 0.12));
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  // croma = color fuerte (azul/amarillo/rojo de la maqueta). Las piezas son grises.
  const croma = (i) => { const r = d[i], g = d[i + 1], b = d[i + 2]; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx - mn > 55 && (mx - mn) / (mx || 1) > 0.3; };
  const negro = (i) => Math.max(d[i], d[i + 1], d[i + 2]) < 60;
  const pintaCol = (x) => { for (let y = 0; y < h; y++) { const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 255; } };
  const pintaRow = (y) => { for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 255; } };
  let cambiado = false;
  const scanCol = (x) => { let c = 0, n = 0; for (let y = 0; y < h; y++) { const i = (y * w + x) * 4; if (croma(i)) c++; if (negro(i)) n++; } if (c / h > 0.15 || n / h > 0.6) { pintaCol(x); cambiado = true; } };
  const scanRow = (y) => { let c = 0, n = 0; for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (croma(i)) c++; if (negro(i)) n++; } if (c / w > 0.15 || n / w > 0.6) { pintaRow(y); cambiado = true; } };
  for (let x = 0; x < bandX; x++) scanCol(x);
  for (let x = 0; x < bandX; x++) scanCol(w - 1 - x);
  for (let y = 0; y < bandY; y++) scanRow(y);
  for (let y = 0; y < bandY; y++) scanRow(h - 1 - y);
  if (cambiado) ctx.putImageData(img, 0, 0);
}

// recorta el lienzo a la caja que contiene la pieza (todo lo que no es blanco de
// fondo) y le deja un margen parejo.  Es el mismo encuadre que ya usan las fotos
// del catálogo (pieza centrada sobre blanco).  No cambia color ni nitidez.
function encuadrar(canvas, ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h).data;
  const noBlanco = (i) => d[i] < 244 || d[i + 1] < 244 || d[i + 2] < 244;
  let x0 = w, y0 = h, x1 = 0, y1 = 0, cnt = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (noBlanco((y * w + x) * 4)) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      cnt++;
    }
  }
  if (cnt < 30 || x1 <= x0 || y1 <= y0) return canvas; // nada que encuadrar
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const m = Math.round(Math.max(cw, ch) * 0.08); // margen parejo
  const ox = Math.max(0, x0 - m), oy = Math.max(0, y0 - m);
  const ex = Math.min(w, x1 + 1 + m), ey = Math.min(h, y1 + 1 + m);
  const nw = ex - ox, nh = ey - oy;
  if (nw >= w - 2 && nh >= h - 2) return canvas; // ya estaba encuadrada
  const out = createCanvas(nw, nh);
  const octx = out.getContext('2d');
  octx.fillStyle = '#ffffff';
  octx.fillRect(0, 0, nw, nh);
  octx.drawImage(canvas, ox, oy, nw, nh, 0, 0, nw, nh);
  return out;
}

function writeRetry(file, buf, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try { fs.writeFileSync(file, buf); return; } catch (e) {
      if (i === tries - 1) throw e;
      const until = Date.now() + 150 * (i + 1); while (Date.now() < until) {}
    }
  }
}

let hechas = 0;
for (const [pag, items] of Object.entries(porPagina)) {
  const page = mdoc.loadPage(Number(pag) - 1);
  const pix = page.toPixmap(mupdf.Matrix.scale(SCALE, SCALE), mupdf.ColorSpace.DeviceRGB, false, true);
  const img = await loadImage(pix.asPNG());
  const PW = pix.getWidth(), PH = pix.getHeight();

  for (const it of items) {
    // recorte con un pequeño inset para no arrastrar líneas divisorias de la grilla
    const inset = 4;
    let sx = Math.round((it.x + inset) * SCALE);
    let sy = Math.round((it.y + inset) * SCALE);
    let sw = Math.round((it.w - inset * 2) * SCALE);
    let sh = Math.round((it.h - inset * 2) * SCALE);
    sx = Math.max(0, sx); sy = Math.max(0, sy);
    sw = Math.min(PW - sx, sw); sh = Math.min(PH - sy, sh);
    if (sw < 20 || sh < 20) continue;
    const c = createCanvas(sw, sh);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sw, sh);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    limpiarBordes(ctx, sw, sh);
    // encuadre a la pieza sobre blanco (como vienen las fotos del catálogo)
    const fin = encuadrar(c, ctx, sw, sh);
    const jpg = fin.toBuffer('image/jpeg', 0.9);
    for (const dir of OUT_DIRS) { fs.mkdirSync(dir, { recursive: true }); writeRetry(path.join(dir, it.code + '.jpg'), jpg); }
    const prod = idx.get(it.code);
    if (prod) { prod.foto = it.code + '.jpg'; prod.foto_origen = 'pdf-render'; delete prod.foto_confianza; }
    if (++hechas % 100 === 0) process.stdout.write(`  ${hechas}/${codes.length}\r`);
  }
}

writeRetry(PRODUCTOS, JSON.stringify(productos, null, 1));
const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
  'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
  'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
const cell = (v) => { let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
writeRetry('data/productos.csv', '﻿' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
console.log(`\nListo. ${hechas} fotos renderizadas del PDF. Total con foto: ${productos.filter((x) => x.foto).length}/${productos.length}`);
