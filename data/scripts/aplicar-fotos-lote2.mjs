/**
 * Reemplaza las fotos de los productos por las del ZIP de Gastón (lote 2).
 * Las fotos vienen recortadas SIN MODIFICAR de las páginas reales -> se copian
 * tal cual (PNG), sin reescalar ni retocar.
 *
 * Uso:  node data/scripts/aplicar-fotos-lote2.mjs "<carpeta con los .png>" [--apply]
 *   La carpeta puede tener una subcarpeta `fotos/` con más .png (se toman también;
 *   si un código está en las dos, gana el de la carpeta raíz).
 */
import fs from 'fs';
import path from 'path';

const ARGV = process.argv.slice(2);
const APPLY = ARGV.includes('--apply');
const SRC = ARGV.find((a) => !a.startsWith('--')) ||
  'C:/Users/ADMINI~2/AppData/Local/Temp/claude/C--Users-Administrador-Documents-logbelts-catalogo/385192ea-e501-4b4f-847e-7aa282bb568f/scratchpad/lote2/fotos - copia';

const PUB = 'public/fotos';
const DATA = 'data/fotos';
const PRODUCTOS = 'data/productos.json';

// 1) juntar códigos -> ruta del png (raíz gana sobre subcarpeta)
const pngs = new Map();
const nested = path.join(SRC, 'fotos');
if (fs.existsSync(nested)) {
  for (const f of fs.readdirSync(nested)) if (f.toLowerCase().endsWith('.png')) pngs.set(f.replace(/\.png$/i, ''), path.join(nested, f));
}
for (const f of fs.readdirSync(SRC)) if (f.toLowerCase().endsWith('.png')) pngs.set(f.replace(/\.png$/i, ''), path.join(SRC, f));

const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));

let reemplazadas = 0, nuevas = 0, noExiste = [];
const huerfanos = [];

for (const [code, ruta] of pngs) {
  const p = idx.get(code);
  if (!p) { noExiste.push(code); continue; }
  const antes = p.foto || null;
  if (antes) reemplazadas++; else nuevas++;
  // .jpg viejo que queda huérfano
  if (antes && antes !== code + '.png' && !/^https?:\/\//.test(antes)) huerfanos.push(antes);

  if (APPLY) {
    fs.mkdirSync(PUB, { recursive: true });
    fs.mkdirSync(DATA, { recursive: true });
    fs.copyFileSync(ruta, path.join(PUB, code + '.png'));
    fs.copyFileSync(ruta, path.join(DATA, code + '.png'));
    p.foto = code + '.png';
    p.foto_origen = 'gaston-lote2';
    delete p.foto_confianza;
  }
}

console.log(`PNG en el paquete: ${pngs.size}`);
console.log(`  reemplazan foto existente: ${reemplazadas}`);
console.log(`  productos que estaban sin foto: ${nuevas}`);
console.log(`  códigos del paquete que no existen en el catálogo: ${noExiste.length}${noExiste.length ? ' -> ' + noExiste.join(', ') : ''}`);

if (APPLY) {
  let borrados = 0;
  for (const h of [...new Set(huerfanos)]) {
    const f = path.join(PUB, h);
    if (fs.existsSync(f)) { fs.unlinkSync(f); borrados++; }
    const g = path.join(DATA, h);
    if (fs.existsSync(g)) fs.unlinkSync(g);
  }
  console.log(`  .jpg viejos borrados de public/fotos: ${borrados}`);

  fs.writeFileSync(PRODUCTOS, JSON.stringify(productos, null, 1));
  const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
    'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
    'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
  const cell = (v) => { let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
  fs.writeFileSync('data/productos.csv', '\uFEFF' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
  console.log('\nEscrito data/productos.json + .csv, y las fotos en public/fotos + data/fotos');
}
