import fs from 'fs';
import zlib from 'zlib';
import { PDFDocument, PDFName, PDFArray, PDFRef } from 'pdf-lib';

const PDF = process.argv[2];
const PAGES_JSON = process.argv[3];               // data/scripts/pages.json
const OUT_DIR = process.argv[4] || 'data/fotos';
const MAP_OUT = process.argv[5] || 'data/scripts/fotos-map.json';
fs.mkdirSync(OUT_DIR, { recursive: true });

const textPages = JSON.parse(fs.readFileSync(PAGES_JSON, 'utf8'));

/* ---------- JPEG bytes por página, en orden de recursión (~orden de lectura) ---------- */
function filtersOf(d) {
  let f = d.lookup(PDFName.of('Filter'));
  if (f instanceof PDFArray) return f.asArray().map(x => x.toString());
  if (f) return [f.toString()];
  return [];
}
function a85(buf) {
  let s = Buffer.from(buf).toString('latin1').replace(/\s+/g, '');
  if (s.startsWith('<~')) s = s.slice(2);
  const e = s.indexOf('~>'); if (e >= 0) s = s.slice(0, e);
  const out = []; let t = 0, n = 0;
  for (const ch of s) {
    if (ch === 'z' && n === 0) { out.push(0, 0, 0, 0); continue; }
    t = t * 85 + (ch.charCodeAt(0) - 33); n++;
    if (n === 5) { out.push((t >>> 24) & 255, (t >>> 16) & 255, (t >>> 8) & 255, t & 255); t = 0; n = 0; }
  }
  if (n) { for (let i = n; i < 5; i++) t = t * 85 + 84; for (let i = 0; i < n - 1; i++) out.push((t >>> (24 - 8 * i)) & 255); }
  return Buffer.from(out);
}
function toJpeg(raw, filters) {
  let b = Buffer.from(raw);
  try {
    if (filters.includes('/ASCII85Decode')) b = a85(b);
    if (filters.includes('/FlateDecode')) { try { b = zlib.inflateSync(b); } catch { b = zlib.inflateRawSync(b); } }
  } catch {}
  if (b[0] === 0xFF && b[1] === 0xD8) return b;
  if (raw[0] === 0xFF && raw[1] === 0xD8) return Buffer.from(raw);
  return null;
}

const pdoc = await PDFDocument.load(new Uint8Array(fs.readFileSync(PDF)), { updateMetadata: false });
const ctx = pdoc.context;
const pdfPages = pdoc.getPages();

function imagesOfPage(pi) {
  const seen = new Set();
  const list = [];
  function walk(res, depth) {
    if (!res || depth > 5) return;
    const xo = res.lookup(PDFName.of('XObject'));
    if (!xo || !xo.entries) return;
    for (const [, val] of xo.entries()) {
      let stream, refKey = '';
      try { if (val instanceof PDFRef) { refKey = val.toString(); stream = ctx.lookup(val); } else stream = val; } catch { continue; }
      if (!stream || !stream.dict) continue;
      if (refKey) { if (seen.has(refKey)) continue; seen.add(refKey); }
      const d = stream.dict;
      const st = (d.lookup(PDFName.of('Subtype')) || '').toString();
      const w = d.lookup(PDFName.of('Width'))?.asNumber?.();
      const h = d.lookup(PDFName.of('Height'))?.asNumber?.();
      if (st === '/Image') {
        const isBanner = w && h && (w / h > 4.5 || (w >= 1800 && h >= 850 && h <= 1000));
        if (!isBanner && w >= 70 && h >= 70) {
          const jpg = toJpeg(stream.contents, filtersOf(d));
          if (jpg) list.push({ jpg, w, h, area: w * h });
        }
      } else if (st === '/Form') walk(d.lookup(PDFName.of('Resources')), depth + 1);
    }
  }
  walk(pdfPages[pi].node.Resources(), 0);
  return list;
}

/* ---------- anclas de código por página ---------- */
const CODE_RE = /\b\d{7}\b/;
function anchorsFor(pg) {
  const its = pg.items;
  const grid = [], table = [];
  for (let i = 0; i < its.length; i++) {
    if (!/^C[OÓ]DIGO$/i.test(its[i].s.trim())) continue;
    const near = its.filter(o => Math.abs(o.y - its[i].y) < 7 && o.x > its[i].x && o.x < its[i].x + 110 && CODE_RE.test(o.s));
    near.sort((a, b) => a.x - b.x);
    if (near[0]) grid.push({ code: near[0].s.trim().match(CODE_RE)[0], x: its[i].x, y: its[i].y });
  }
  const byY = {};
  for (const it of its) (byY[it.y] = byY[it.y] || []).push(it);
  for (const [y, arr] of Object.entries(byY)) {
    const s = arr.slice().sort((a, b) => a.x - b.x);
    if (s[0] && CODE_RE.test(s[0].s.trim()) && s[0].x < 120 && s.filter(a => a.s.trim()).length >= 4)
      table.push({ code: s[0].s.trim().match(CODE_RE)[0], x: s[0].x, y: +y });
  }
  grid.sort((a, b) => a.y - b.y || a.x - b.x);
  return { grid, table };
}

/* ---------- asociar: zip por orden en páginas tipo grilla ---------- */
const fotoMap = {};
let pagGrilla = 0;

for (let p = 1; p <= pdfPages.length; p++) {
  const tp = textPages.find(x => x.p === p);
  if (!tp) continue;
  const { grid, table } = anchorsFor(tp);
  if (table.length >= 3 && grid.length < 3) continue;     // página tabla: sin foto individual
  if (grid.length < 2) continue;
  pagGrilla++;
  const imgs = imagesOfPage(p - 1).filter(im => im.w <= 1600 && im.h <= 1600);
  if (!imgs.length) continue;

  // si hay muchas más imágenes que códigos, quedarse con las más grandes (fotos de producto)
  let use = imgs;
  if (imgs.length > grid.length * 1.6) {
    use = imgs.slice().sort((a, b) => b.area - a.area).slice(0, grid.length);
    // re-ordenar por aparición original
    const ord = new Map(imgs.map((im, i) => [im, i]));
    use.sort((a, b) => ord.get(a) - ord.get(b));
  }

  const n = Math.min(use.length, grid.length);
  const conf = use.length === grid.length ? 'media' : Math.abs(use.length - grid.length) <= 2 ? 'baja' : 'muy_baja';
  for (let i = 0; i < n; i++) {
    const code = grid[i].code;
    if (fotoMap[code]) continue;
    const file = `${code}.jpg`;
    fs.writeFileSync(`${OUT_DIR}/${file}`, use[i].jpg);
    fotoMap[code] = { archivo: file, pagina: p, w: use[i].w, h: use[i].h, confianza: conf, metodo: 'orden' };
  }
}

fs.writeFileSync(MAP_OUT, JSON.stringify(fotoMap, null, 1));
const byConf = {}; for (const k in fotoMap) byConf[fotoMap[k].confianza] = (byConf[fotoMap[k].confianza] || 0) + 1;
console.log('páginas tipo grilla procesadas:', pagGrilla);
console.log('fotos asociadas:', Object.keys(fotoMap).length);
console.log('por confianza:', JSON.stringify(byConf));
console.log('jpg en carpeta:', fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.jpg')).length);
