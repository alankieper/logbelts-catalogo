/**
 * Recupera por OCR las descripciones que el catálogo v4 imprime en una fuente
 * SIN mapa Unicode (ni pdf.js ni mupdf las extraen), pero que sí se ven al
 * renderizar. Render mupdf -> recorte de la celda de cada CODIGO -> Tesseract (spa).
 *
 * Uso:
 *   node data/scripts/ocr-descripciones-v4.mjs "<pdf v4>"            -> OCR de todas las páginas que hacen falta
 *   node data/scripts/ocr-descripciones-v4.mjs "<pdf v4>" --pages 114 -> sólo esa(s) página(s)
 *   node data/scripts/ocr-descripciones-v4.mjs --apply               -> vuelca ocr-descripciones.json a productos.json
 *
 * Los resultados se MERGEAN en data/scripts/ocr-descripciones.json (no se pisan),
 * así se puede correr página por página y retomar si algo se cae.
 */
import fs from 'fs';

const ARGV = process.argv.slice(2);
const APPLY = ARGV.includes('--apply');
const PDF = ARGV.find((a) => /\.pdf$/i.test(a));
const pagesArg = (() => { const i = ARGV.indexOf('--pages'); return i >= 0 ? ARGV[i + 1].split(',').map(Number) : null; })();

const PRODUCTOS = 'data/productos.json';
const OUT = 'data/scripts/ocr-descripciones.json';
const SC = 3;

const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));

/* ---------------- limpieza de texto OCR ---------------- */
const HEADERISH = /\b(REEMPLAZ|TIEMPOS|JUNTAS DE MOTOR|CARBURACI[ÓO]N|MOTORES? 4T|OHV|DESMALEZADORAS|MOTOSIERRAS|MINITRACTORES|PARTES DE|SEG[ÚU]N MARCA)\b/i;
function limpiar(text) {
  let d = (text || '')
    .replace(/[|_~“”"]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/DESCRIPCION:?/i, '')
    .replace(/\bC[oó]d?igo\b.*$/i, '')
    .replace(/\bBriggs\s*[&8B]\s*Stratton\b/gi, 'Briggs & Stratton')
    .replace(/[(){}\[\]<>]/g, ' ')
    .replace(/\s*[-–—]\s*/g, ' ')
    .replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9)."'/%&.,\s]+/g, ' ')
    .replace(/\bCigue(ñ|n)al\b/gi, 'Cigüeñal')
    .replace(/\bAmisi[oó]n\b/gi, 'Admisión')
    .replace(/\bSil\b/g, 'Stihl')
    // fragmentos de encabezado que se cuelan al final
    .replace(/\s+(?:MPLAZOS?|EMPLAZOS?|URACI[ÓO]N|BOMBINES?|TIEMPOS?|OHV|REEM|LAZOS?|OTOR)\b.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  // tokens de 1 letra sueltos (ruido de bordes), salvo conectores
  d = d.split(' ').filter((w) => (w.length === 1 ? /^[yaoe0-9]$/i.test(w) : !/^[A-Za-z][.,:;]?$/.test(w))).join(' ');
  // cola con basura OCR
  for (let k = 0; k < 4; k++) {
    d = d.replace(/\s+(?:\d*:[\d:]+|[0-9]{0,2}[A-Z]{1,3}[0-9]{0,3}|[A-Z]{1,3}|[:;.]{2,})\s*$/, (m) =>
      /\b(mm|cc|hp|HP|kg|mts|grs)\b/i.test(m) || /\d/.test(m) && /(mm|cc|hp)/i.test(d.slice(-8)) ? m : ' ').trim();
  }
  d = d.replace(/[\s.,:;&]+$/, '').replace(/^[\s.,:;&]+/, '').trim();
  return d;
}
function aceptable(d, conf) {
  if (!d || d.length < 4) return false;
  if (!/[a-záéíóúñ]{3}/i.test(d)) return false;
  if (conf < 58) return false;
  if (HEADERISH.test(d) && d.split(' ').length > 6) return false; // bleed de encabezado
  return true;
}

/* ---------------- modo --apply ---------------- */
if (APPLY) {
  const found = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  let n = 0;
  for (const [code, info] of Object.entries(found)) {
    const p = idx.get(code);
    if (!p) continue;
    const derivada = !p.descripcion || (p.fuente_desc && p.fuente_desc.startsWith('derivada'));
    if (!derivada) continue;
    p.descripcion = info.desc;
    p.nombre = info.desc.split(/\s+(?:Repl\.?|para|Para)\b/)[0].slice(0, 70);
    p.compatibilidad = p.compatibilidad || info.desc;
    p.fuente_desc = 'texto del PDF (OCR)';
    if (p.estado && p.estado.startsWith('derivado')) p.estado = 'completo';
    n++;
  }
  fs.writeFileSync(PRODUCTOS, JSON.stringify(productos, null, 1));
  const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
    'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
    'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
  const cell = (v) => { let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
  fs.writeFileSync('data/productos.csv', '﻿' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
  console.log(`Aplicadas ${n} descripciones (OCR) de ${Object.keys(found).length} guardadas.`);
  process.exit(0);
}

/* ---------------- modo OCR ---------------- */
const mupdf = await import('mupdf');
const { createCanvas, loadImage } = await import('@napi-rs/canvas');
const { createWorker } = await import('tesseract.js');

const isCod = (s) => /^C[OÓ]DIGO$/i.test(s.trim());
const isDesc = (s) => /^DESCRIPCI[ÓO]N\s*:?$/i.test(s.trim());
const isCode = (s) => /^\d{7}$/.test(s.trim());
function columnas(xs, tol = 34) {
  const s = [...xs].sort((a, b) => a - b);
  const cols = [];
  for (const x of s) { const c = cols.find((k) => Math.abs(k.c - x) < tol); if (c) { c.n++; c.sum += x; c.c = c.sum / c.n; } else cols.push({ c: x, sum: x, n: 1 }); }
  return cols.map((k) => k.c);
}
function lineasDe(page) {
  const j = JSON.parse(page.toStructuredText('preserve-whitespace').asJSON());
  const out = [];
  for (const blk of j.blocks || []) { if (blk.type !== 'text') continue; for (const ln of blk.lines || []) { const t = (ln.text || '').trim(); if (t) out.push({ t, x: ln.bbox.x, y: ln.bbox.y }); } }
  return out;
}

const doc = mupdf.Document.openDocument(fs.readFileSync(PDF), 'application/pdf');
const N = doc.countPages();

let targets = [];
for (let i = 0; i < N; i++) {
  const pn = i + 1;
  if (pagesArg && !pagesArg.includes(pn)) continue;
  const L = lineasDe(doc.loadPage(i));
  // anclas de código
  let anc = 0;
  for (let k = 0; k < L.length; k++) {
    if (!isCod(L[k].t)) continue;
    if (L.find((o) => Math.abs(o.y - L[k].y) < 5 && o.x > L[k].x && o.x < L[k].x + 120 && isCode(o.t))) anc++;
  }
  if (anc < 5) continue;
  // texto "de contenido" (posibles descripciones ya legibles)
  const cont = L.filter((l) => !isDesc(l.t) && !isCod(l.t) && !isCode(l.t) && l.y > 40 && l.y < 815 &&
    !/Marcelo T\.|C\.P\.|\+54|Ciudad Aut/i.test(l.t) && !/^\d{1,3}$/.test(l.t.trim()) &&
    !(l.t.length > 12 && l.t === l.t.toUpperCase())).length;
  // hace falta OCR si faltan descripciones (poco texto de contenido para tantos códigos)
  if (pagesArg || cont < anc * 0.9) targets.push(pn);
}
console.log(`páginas a OCRear: ${targets.length} -> ${targets.join(',')}`);

const acumulado = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const worker = await createWorker('spa');
await worker.setParameters({ tessedit_pageseg_mode: '6' });

for (const pn of targets) {
  const page = doc.loadPage(pn - 1);
  const L = lineasDe(page);
  const anchors = [];
  for (let i = 0; i < L.length; i++) {
    if (!isCod(L[i].t)) continue;
    const num = L.find((o) => Math.abs(o.y - L[i].y) < 5 && o.x > L[i].x && o.x < L[i].x + 120 && isCode(o.t));
    if (num) anchors.push({ code: num.t.trim(), x: num.x, y: L[i].y });
  }
  if (anchors.length < 3) { console.log(`  p${pn}: sin anclas`); continue; }
  const cols = columnas(anchors.map((a) => a.x));
  const labels = L.filter((l) => isDesc(l.t));

  const pix = page.toPixmap(mupdf.Matrix.scale(SC, SC), mupdf.ColorSpace.DeviceRGB, false, true);
  const pImg = await loadImage(pix.asPNG());
  const pageW = pix.getWidth();

  let nPage = 0;
  for (const a of anchors) {
    const p = idx.get(a.code);
    if (!p) continue;
    if (p.fuente_desc === 'texto del PDF' || p.fuente_desc === 'texto del PDF (OCR)') continue;
    const colC = cols.reduce((b, c) => (Math.abs(c - a.x) < Math.abs(b - a.x) ? c : b), cols[0]);
    const lbl = labels.filter((l) => Math.abs(l.x - colC) < 75 && l.y > a.y + 12).sort((x, y) => x.y - y.y)[0];
    const yLabel = lbl ? lbl.y : a.y + 118;
    const sig = anchors.filter((b) => Math.abs(b.x - colC) < 75 && b.y > a.y + 25).sort((x, y) => x.y - y.y)[0];
    const yBot = Math.min(sig ? sig.y - 8 : yLabel + 58, yLabel + 60, 818);
    const yTop = yLabel + 7;
    if (yBot - yTop < 10) continue;
    const cx = Math.max(0, Math.round((colC - 58) * SC));
    const cw = Math.min(pageW - cx, Math.round(116 * SC));
    const cy = Math.round(yTop * SC);
    const ch = Math.round((yBot - yTop) * SC);
    const crop = createCanvas(cw, ch);
    const cc = crop.getContext('2d');
    cc.fillStyle = '#fff'; cc.fillRect(0, 0, cw, ch);
    cc.drawImage(pImg, cx, cy, cw, ch, 0, 0, cw, ch);
    const up = createCanvas(cw * 2, ch * 2);
    up.getContext('2d').drawImage(crop, 0, 0, cw * 2, ch * 2);
    let res;
    try { res = await worker.recognize(up.toBuffer('image/png')); } catch { continue; }
    const d = limpiar(res.data.text);
    if (aceptable(d, res.data.confidence)) {
      acumulado[a.code] = { desc: d, pagina: pn, conf: Math.round(res.data.confidence) };
      nPage++;
      process.stdout.write(`  p${pn} ${a.code} (${Math.round(res.data.confidence)}%): ${d}\n`);
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(acumulado, null, 1)); // guardar tras cada página
  console.log(`  -- p${pn}: ${nPage} ok (acumulado ${Object.keys(acumulado).length})`);
}

await worker.terminate();
console.log(`\nTotal acumulado: ${Object.keys(acumulado).length} en ${OUT}. Corré con --apply para volcarlas.`);
