/**
 * Vuelca las descripciones leídas del catálogo v4 (scratch/desc-catalogo.json,
 * transcripción por visión de la grilla "DESCRIPCIÓN:" de cada página) a
 * data/productos.json — SÓLO para los productos que hoy tienen descripción
 * "derivada" (los que en la página muestran "Requiere revisión").
 *
 * No toca `nombre`. Marca fuente_desc = 'texto del PDF' y pasa el estado a
 * 'completo'. Rellena `compatibilidad` sólo si estaba vacía.
 *
 * Uso:  node data/scripts/aplicar-desc-catalogo.mjs <desc-catalogo.json> [--apply]
 */
import fs from 'fs';

const ARGV = process.argv.slice(2);
const APPLY = ARGV.includes('--apply');
const SRC = ARGV.find((a) => a.endsWith('.json')) ||
  'C:/Users/ADMINI~2/AppData/Local/Temp/claude/C--Users-Administrador-Documents-logbelts-catalogo/385192ea-e501-4b4f-847e-7aa282bb568f/scratchpad/desc-catalogo.json';
const PRODUCTOS = 'data/productos.json';

const desc = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));

let aplicadas = 0, saltadas = 0;
const ej = [];
for (const [codigo, texto] of Object.entries(desc)) {
  const p = idx.get(codigo);
  if (!p) { saltadas++; continue; }
  const derivada = !p.descripcion || (p.fuente_desc && p.fuente_desc.startsWith('derivada'));
  if (!derivada) { saltadas++; continue; } // ya tiene descripción real, no la piso
  if (ej.length < 25) ej.push(`${codigo}  «${(p.descripcion || '(vacía)').slice(0, 34)}»  ->  «${texto.slice(0, 64)}»`);
  aplicadas++;
  if (APPLY) {
    p.descripcion = texto;
    if (!p.compatibilidad) p.compatibilidad = texto;
    p.fuente_desc = 'texto del PDF';
    if (p.estado && p.estado.startsWith('derivado')) p.estado = 'completo';
  }
}

console.log(`descripciones en el archivo: ${Object.keys(desc).length}`);
console.log(`aplicables (siguen "Requiere revisión"): ${aplicadas} · saltadas: ${saltadas}`);
console.log('\nejemplos:');
ej.forEach((e) => console.log('  ' + e));

if (APPLY) {
  fs.writeFileSync(PRODUCTOS, JSON.stringify(productos, null, 1));
  const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
    'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
    'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
  const cell = (v) => { let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
  fs.writeFileSync('data/productos.csv', '\uFEFF' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
  console.log('\nEscrito data/productos.json + .csv');
}
