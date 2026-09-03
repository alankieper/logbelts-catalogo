/**
 * Renderiza a PNG las páginas del catálogo v4 que todavía tienen productos
 * "Requiere revisión" (descripción derivada), para leerlas con visión y
 * cargar la descripción real. Uso:
 *   node data/scripts/render-pendientes.mjs "<pdf v4>" <dirSalida> [pag,pag,...]
 */
import fs from 'fs';
import path from 'path';

const ARGV = process.argv.slice(2);
const PDF = ARGV.find((a) => /\.pdf$/i.test(a));
const OUT = ARGV.find((a) => !/\.pdf$/i.test(a) && !/^[\d,]+$/.test(a)) || 'scratch-pages';
const only = (ARGV.find((a) => /^[\d,]+$/.test(a)) || '').split(',').filter(Boolean).map(Number);

const productos = JSON.parse(fs.readFileSync('data/productos.json', 'utf8'));
const rev = productos.filter((p) => !p.descripcion || (p.fuente_desc && p.fuente_desc.startsWith('derivada')));
let pages = [...new Set(rev.map((p) => p.pagina))].filter(Boolean).sort((a, b) => a - b);
if (only.length) pages = pages.filter((p) => only.includes(p));

fs.mkdirSync(OUT, { recursive: true });
const mupdf = await import('mupdf');
const doc = mupdf.Document.openDocument(fs.readFileSync(PDF), 'application/pdf');
const SC = 3.2;

for (const pn of pages) {
  const page = doc.loadPage(pn - 1);
  const pix = page.toPixmap(mupdf.Matrix.scale(SC, SC), mupdf.ColorSpace.DeviceRGB, false, true);
  const f = path.join(OUT, `p${String(pn).padStart(3, '0')}.png`);
  fs.writeFileSync(f, pix.asPNG());
  const codes = rev.filter((p) => p.pagina === pn).map((p) => p.codigo);
  console.log(`${f}  (${codes.length} pendientes: ${codes.join(', ')})`);
}
console.log(`\n${pages.length} páginas renderizadas en ${OUT}`);
