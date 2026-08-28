/**
 * Extracción de fotos v3 — por POSICIÓN real en la página (no por orden).
 *
 *  1) pdf.js  -> posición y tamaño de cada imagen dibujada en la página
 *  2) pdf-lib -> bytes de cada imagen (mismo orden que pdf.js)
 *  3) se cruza cada foto con el código más cercano de la página
 *
 * Renderiza todos los formatos del PDF a JPEG:
 *   DCT (JPEG), Flate crudo RGB / gris / CMYK, y corrige el CMYK invertido
 *   (si no, la foto sale negra).
 *
 * SÓLO completa productos que hoy no tienen foto. No toca las que ya están.
 *
 * Uso:
 *   node data/scripts/extraer-fotos-v3.mjs "<pdf>" data/scripts/pages.json [--apply]
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { PDFDocument, PDFName, PDFArray, PDFRef } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';

const PDF = process.argv[2];
const PAGES_JSON = process.argv[3] || 'data/scripts/pages.json';
const APPLY = process.argv.includes('--apply');
const OUT_DIRS = ['data/fotos', 'public/fotos'];
const PRODUCTOS = 'data/productos.json';

const textPages = JSON.parse(fs.readFileSync(PAGES_JSON, 'utf8'));
const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));
const yaConFoto = new Set(productos.filter((p) => p.foto).map((p) => p.codigo));
const codigosValidos = new Set(productos.map((p) => p.codigo));

/* ============ decodificación de bytes ============ */
function filtersOf(d) {
  let f = d.lookup(PDFName.of('Filter'));
  if (f instanceof PDFArray) return f.asArray().map((x) => x.toString());
  if (f) return [f.toString()];
  return [];
}
function a85(buf) {
  let s = Buffer.from(buf).toString('latin1').replace(/\s+/g, '');
  if (s.startsWith('<~')) s = s.slice(2);
  const e = s.indexOf('~>');
  if (e >= 0) s = s.slice(0, e);
  const out = [];
  let t = 0, n = 0;
  for (const ch of s) {
    if (ch === 'z' && n === 0) { out.push(0, 0, 0, 0); continue; }
    t = t * 85 + (ch.charCodeAt(0) - 33); n++;
    if (n === 5) { out.push((t >>> 24) & 255, (t >>> 16) & 255, (t >>> 8) & 255, t & 255); t = 0; n = 0; }
  }
  if (n) { for (let i = n; i < 5; i++) t = t * 85 + 84; for (let i = 0; i < n - 1; i++) out.push((t >>> (24 - 8 * i)) & 255); }
  return Buffer.from(out);
}
function inflate(b) {
  try { return zlib.inflateSync(b); } catch {}
  try { return zlib.inflateRawSync(b); } catch {}
  return null;
}
function jpegEsCMYK(buf) {
  let i = 2;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1]; i += 2;
    if (m === 0xd8 || m === 0xd9 || (m >= 0xd0 && m <= 0xd7)) continue;
    if (i + 1 >= buf.length) break;
    const len = buf.readUInt16BE(i);
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return buf[i + 7] === 4;
    if (m === 0xda) break;
    i += len;
  }
  return false;
}

const pdoc = await PDFDocument.load(new Uint8Array(fs.readFileSync(PDF)), { updateMetadata: false });
const ctx = pdoc.context;
const pdfPages = pdoc.getPages();

function csChannels(d) {
  const cs = d.lookup(PDFName.of('ColorSpace'));
  if (!cs) return null;
  const s = cs.toString();
  if (/Indexed/.test(s)) return 'indexed';
  if (/DeviceCMYK/.test(s)) return 4;
  if (/DeviceRGB|CalRGB|Lab/.test(s)) return 3;
  if (/DeviceGray|CalGray/.test(s)) return 1;
  if (/ICCBased/.test(s)) {
    try {
      const st = ctx.lookup(cs.asArray()[1]);
      const n = st?.dict?.lookup(PDFName.of('N'))?.asNumber?.();
      if (n) return n;
    } catch {}
  }
  return null;
}

async function renderImagen(stream) {
  const d = stream.dict;
  const w = d.lookup(PDFName.of('Width'))?.asNumber?.();
  const h = d.lookup(PDFName.of('Height'))?.asNumber?.();
  const bpc = d.lookup(PDFName.of('BitsPerComponent'))?.asNumber?.() || 8;
  const filters = filtersOf(d);
  if (!w || !h || bpc !== 8) return null;

  let b = Buffer.from(stream.contents);
  if (filters.includes('/ASCII85Decode')) b = a85(b);

  if (filters.includes('/DCTDecode') || filters.includes('/JPXDecode')) {
    if (filters.includes('/FlateDecode')) { const inf = inflate(b); if (inf) b = inf; }
    if (b[0] !== 0xff || b[1] !== 0xd8) return null;
    if (jpegEsCMYK(b)) return sharp(b).negate().toColourspace('srgb').jpeg({ quality: 86, chromaSubsampling: '4:4:4' }).toBuffer();
    return sharp(b).jpeg({ quality: 88 }).toBuffer();
  }

  if (!filters.length || filters.includes('/FlateDecode') || filters.includes('/LZWDecode')) {
    const inf = filters.includes('/FlateDecode') ? inflate(b) : b;
    if (!inf) return null;
    let ch = csChannels(d);
    if (ch === 'indexed') return null;
    if (!ch) {
      if (inf.length >= w * h * 3) ch = 3;
      else if (inf.length >= w * h * 4) ch = 4;
      else if (inf.length >= w * h) ch = 1;
      else return null;
    }
    if (inf.length < w * h * ch) return null;
    let rgb;
    if (ch === 4) {
      rgb = Buffer.alloc(w * h * 3);
      for (let i = 0, j = 0; j < rgb.length; i += 4, j += 3) {
        const k = inf[i + 3];
        rgb[j] = (inf[i] * k) / 255;
        rgb[j + 1] = (inf[i + 1] * k) / 255;
        rgb[j + 2] = (inf[i + 2] * k) / 255;
      }
    } else if (ch === 1) {
      rgb = Buffer.alloc(w * h * 3);
      for (let i = 0, j = 0; i < w * h; i++, j += 3) rgb[j] = rgb[j + 1] = rgb[j + 2] = inf[i];
    } else {
      rgb = inf.subarray(0, w * h * 3);
    }
    return sharp(rgb, { raw: { width: w, height: h, channels: 3 } }).jpeg({ quality: 88 }).toBuffer();
  }
  return null;
}

/* ============ pdf-lib: imágenes por página, en orden ============ */
function xobjImagesOfPage(pi) {
  const seen = new Set();
  const list = [];
  function walk(res, depth) {
    if (!res || depth > 6) return;
    const xo = res.lookup(PDFName.of('XObject'));
    if (!xo || !xo.entries) return;
    for (const [, val] of xo.entries()) {
      let stream, rk = '';
      try { if (val instanceof PDFRef) { rk = val.toString(); if (seen.has(rk)) continue; seen.add(rk); stream = ctx.lookup(val); } else stream = val; } catch { continue; }
      if (!stream || !stream.dict) continue;
      const d = stream.dict;
      const st = (d.lookup(PDFName.of('Subtype')) || '').toString();
      if (st === '/Image') {
        const w = d.lookup(PDFName.of('Width'))?.asNumber?.();
        const h = d.lookup(PDFName.of('Height'))?.asNumber?.();
        list.push({ w, h, stream });
      } else if (st === '/Form') {
        walk(d.lookup(PDFName.of('Resources')), depth + 1);
      }
    }
  }
  walk(pdfPages[pi].node.Resources(), 0);
  return list;
}

/* ============ pdf.js: posiciones de imágenes por página ============ */
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
        cx: cx, cyTop: vp.height - cy,
        boxW: Math.hypot(m[0], m[1]), boxH: Math.hypot(m[2], m[3]),
      });
    }
  }
  return out;
}

/* ============ anclas de código ============ */
const CODE_RE = /\b\d{7}\b/;
function anchorsFor(pg) {
  const its = pg.items || [];
  const found = new Map();
  for (let i = 0; i < its.length; i++) {
    const s = its[i].s.trim();
    if (/^C[OÓ]DIGO$/i.test(s)) {
      const near = its.filter((o) => Math.abs(o.y - its[i].y) < 7 && o.x > its[i].x && o.x < its[i].x + 120 && CODE_RE.test(o.s));
      near.sort((a, b) => a.x - b.x);
      if (near[0]) {
        const c = near[0].s.trim().match(CODE_RE)[0];
        if (!found.has(c)) found.set(c, { x: near[0].x, y: its[i].y });
      }
      continue;
    }
    const m = s.match(/^(\d{7})\b/);
    if (m && its[i].x < 150 && !found.has(m[1])) found.set(m[1], { x: its[i].x, y: its[i].y });
  }
  return [...found.entries()]
    .filter(([c]) => codigosValidos.has(c))
    .map(([code, p]) => ({ code, x: p.x, y: p.y }));
}

/* ============ recorrido ============ */
const nuevos = {};
let pares = 0, sinCuadrar = 0, sinAncla = 0;

for (let p = 1; p <= pdfPages.length; p++) {
  const tp = textPages.find((x) => x.p === p);
  if (!tp) continue;
  const anchors = anchorsFor(tp);
  if (!anchors.length) continue;
  if (!anchors.some((a) => !yaConFoto.has(a.code))) continue;

  const pos = await imgPositions(p);
  const xs = xobjImagesOfPage(p - 1);

  // cola de bytes por tamaño exacto (w x h en píxeles)
  const byWH = new Map();
  for (const x of xs) {
    const k = x.w + 'x' + x.h;
    if (!byWH.has(k)) byWH.set(k, []);
    byWH.get(k).push(x.stream);
  }

  // de todo lo que pdf.js dibuja, quedarse con lo que parece FOTO de producto
  // (cuadrada-ish, tamaño mediano), sin banners ni tiras de texto ni pixeles 1x1.
  // Se deduplica por posición: el theme pinta cada foto 2 veces.
  const fotos = [];
  const vistas = [];
  for (const q of pos) {
    if (!q.wpx || !q.hpx) continue;
    if (q.wpx < 90 || q.hpx < 90 || q.wpx > 1550 || q.hpx > 1550) continue;
    const ar = q.wpx / q.hpx;
    if (ar < 0.5 || ar > 1.75) continue;                        // las tiras de texto son más anchas
    if (q.boxW < 42 || q.boxH < 42) continue;
    if (vistas.some((v) => Math.abs(v.cx - q.cx) < 8 && Math.abs(v.cyTop - q.cyTop) < 8)) continue;
    const cola = byWH.get(q.wpx + 'x' + q.hpx);
    if (!cola || !cola.length) continue;
    vistas.push(q);
    fotos.push({ ...q, stream: cola.shift() });
  }
  if (!fotos.length) continue;

  // cruzar cada foto con el código más cercano (mismo eje X, código justo arriba)
  const cand = [];
  for (const f of fotos) {
    for (const a of anchors) {
      const dx = Math.abs(f.cx - a.x);
      const dy = f.cyTop - a.y;                                // >0 => código arriba de la foto
      if (dx > 78) continue;
      if (dy < -60 || dy > 170) continue;
      cand.push({ f, a, d: Math.hypot(dx, dy * 0.8) });
    }
  }
  cand.sort((x, y) => x.d - y.d);
  const fUsada = new Set();
  const aUsada = new Set();
  for (const c of cand) {
    if (fUsada.has(c.f) || aUsada.has(c.a.code)) continue;
    fUsada.add(c.f);
    aUsada.add(c.a.code);
    if (yaConFoto.has(c.a.code) || nuevos[c.a.code]) continue;
    const jpg = await renderImagen(c.f.stream);
    if (jpg && jpg.length > 800) {
      nuevos[c.a.code] = { jpg, pagina: p };
      pares++;
    }
  }
  if (!cand.length) sinAncla++;
}

const codes = Object.keys(nuevos);
console.log('páginas sin poder casar bytes<->posición:', sinCuadrar, '| páginas con fotos sin código cerca:', sinAncla);
console.log('fotos nuevas:', codes.length);
console.log('ejemplos:', codes.slice(0, 20).join(', '));

if (!APPLY) {
  console.log('\nSimulación. Agregá --apply para escribir.');
  process.exit(0);
}

let escritas = 0;
for (const code of codes) {
  for (const dir of OUT_DIRS) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, code + '.jpg'), nuevos[code].jpg);
  }
  if (++escritas % 100 === 0) process.stdout.write(`  ${escritas}/${codes.length}\r`);
}
const idx = new Map(productos.map((p) => [p.codigo, p]));
for (const code of codes) {
  const p = idx.get(code);
  if (!p) continue;
  p.foto = code + '.jpg';
  p.foto_confianza = 'alta';
  p.foto_origen = 'pdf-v3-pos';
}
fs.writeFileSync(PRODUCTOS, JSON.stringify(productos, null, 1));

const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'familia', 'familia_indice', 'subcategoria', 'marcas', 'codigo_original',
  'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'clave_rubro', 'clave_subrubro', 'clave_producto',
  'pagina', 'origen', 'flags', 'encabezado_pdf'];
const cell = (v) => {
  let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v);
  if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
};
fs.writeFileSync('data/productos.csv', '﻿' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
console.log(`\nListo. ${escritas} fotos nuevas. Total con foto: ${productos.filter((p) => p.foto).length}/${productos.length}`);
