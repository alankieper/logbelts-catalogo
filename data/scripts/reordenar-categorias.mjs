/**
 * Corrige subcategorías "bolsa mixta" detectadas manualmente (páginas donde el
 * extractor le puso a TODO el grupo el encabezado de la última sección real
 * que encontró, ej. "BOBINA DE INGNICION 2T" lleno de silenciadores,
 * embragues y cigüeñales) + normaliza nombres de subcategoría duplicados por
 * typo/mayúsculas + separa los "Escape/Silenciador" que quedaron con
 * clave_producto="Kit de cilindros" (bug de clasificación) en una
 * subcategoría "Escapes" propia.
 *
 * Sólo toca subcategoria / clave_producto (y, en 5 casos puntuales donde el
 * nombre actual es el placeholder genérico "Kit de cilindros", el nombre —
 * usando la descripción real ya verificada del catálogo). No inventa nada:
 * cada reasignación se basa en el nombre/clave_producto que el propio
 * producto ya tenía.
 *
 * Uso: node data/scripts/reordenar-categorias.mjs [--apply]
 */
import fs from 'fs';

const APPLY = process.argv.includes('--apply');
const PRODUCTOS = 'data/productos.json';
const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));
const byCode = new Map(productos.map((p) => [p.codigo, p]));
// snapshot del valor ORIGINAL (antes de cualquier paso) para poder reportar
// "antes -> después" real aunque un mismo campo se toque en más de un paso.
const original = new Map(productos.map((p) => [p.codigo, { subcategoria: p.subcategoria, clave_producto: p.clave_producto, nombre: p.nombre }]));

// set() SIEMPRE muta en memoria (aunque no se guarde a disco sin --apply), para
// que los pasos siguientes vean el resultado real de los anteriores y la
// vista previa sea idéntica a lo que pasaría con --apply.
function set(codigo, campo, valor) {
  const p = byCode.get(codigo);
  if (!p) { console.log('  !! no existe', codigo); return; }
  if (p[campo] === valor) return;
  p[campo] = valor;
}

// ---------- 1) Renombres puros (typo / mayúsculas / plural) — misma familia ----------
const RENOMBRES = [
  ['Carburación', 'MANGUERA DE COMBUSTIBLE', 'Mangueras de combustible'],
  ['Carburación', 'MANGUERAS DE COMBUSTIBLE', 'Mangueras de combustible'],
  ['Desmalezadoras', 'Carburador', 'Carburadores'],
  ['Desmalezadoras', 'Cabezales porta tanza', 'Cabezales de tanza'],
  ['Desmalezadoras', 'CABEZALES DE TANZA', 'Cabezales de tanza'],
];
for (const [familia, viejo, nuevo] of RENOMBRES) {
  for (const p of productos) if (p.familia === familia && p.subcategoria === viejo) set(p.codigo, 'subcategoria', nuevo);
}

// ---------- 2) Bobina de ignición: normalizar todas las variantes typo/mayúscula ----------
const BOBINA_VARIANTES = ['BOBINA DE INGNICION 2T', 'BOBINA DE I N G N I C I ON 4T'];
for (const p of productos) {
  if (BOBINA_VARIANTES.includes(p.subcategoria) && p.clave_producto === 'Bobina de ignición') {
    set(p.codigo, 'subcategoria', 'Bobina de ignición');
  }
}

// ---------- 3) Escapes / silenciadores: bug de clasificación (clave_producto quedó
//    "Kit de cilindros" para items que en realidad son escapes) -> subcategoría y
//    clave_producto propios "Escapes" / "Escape", por familia. ----------
const ESCAPE_RE = /silenciador|tubo de escape|tornillo de escape|^escape\b/i;
const DESC_ESCAPE = { // 5 códigos cuyo nombre quedó el placeholder genérico "Kit de cilindros";
  // se usa la descripción real ya verificada del catálogo (ver descripciones-v4-ocr).
  '2203401': 'Escape REPL · MS170 MS180',
  '2203402': 'Escape REPL · ST MS 380/381',
  '2203403': 'Escape REPL · ST MS 340/360',
  '2203404': 'Escape REPL · ST MS 361',
  '2203405': 'Escape REPL · HUS 61/268/272',
};
// 2227657: nombre quedó "ESCAPES" por error de extracción, pero clave_producto="Retén"
// y su lugar (Motosierras/RETENES, una vez purgada) es correcto — no es un escape real.
const NO_ES_ESCAPE = new Set(['2227657']);
// catch-alls legítimos de "todas las partes de este motor" (agrupación real del
// catálogo, no un bug) — no se les saca ningún ítem aunque el nombre diga "escape".
const CATCHALL_LEGITIMO = new Set([
  'PARTES DE MOTOR 4T 13 HP 15HP HP 16HP REEMPLAZO GX270 GX390 GX420 GX440',
  'PARTES DE MOTOR 5.5 HP 6.5 HP REEMPLAZO GX160 GX200',
]);
for (const p of productos) {
  if (NO_ES_ESCAPE.has(p.codigo)) continue;
  if (CATCHALL_LEGITIMO.has(p.subcategoria)) continue;
  const esEscape = ESCAPE_RE.test(p.nombre || '') || DESC_ESCAPE[p.codigo];
  if (!esEscape) continue;
  if (p.clave_producto !== 'Kit de cilindros' && p.clave_producto !== 'Retén') continue; // sólo el bug conocido, no tocar otros
  set(p.codigo, 'clave_producto', 'Escape');
  set(p.codigo, 'subcategoria', 'Escapes');
  if (DESC_ESCAPE[p.codigo] && p.nombre === 'Kit de cilindros') set(p.codigo, 'nombre', DESC_ESCAPE[p.codigo]);
}

// ---------- 4) Bolsas mixtas puntuales: reasignar cada item a la subcategoría
//    correcta según su propio clave_producto, dentro de la misma familia. ----------
const REASIGNAR_POR_CLAVE = [
  // [familia, subcategoriaJunk, { clave_producto: subcategoriaDestino }]
  ['Motosierras', 'BOBINA DE INGNICION 2T', { 'Kit de cilindros': 'CILINDROS COMPLETOS', 'Cigüeñal': 'Cigüeñal' }],
  ['Motosierras', 'TAPAS DE DEPOSITOS', { 'Tanque de combustible / tapa': 'Tanque de combustible / tapa', 'Cigüeñal': 'Cigüeñal', 'Retén': 'RETENES' }],
  ['Motosierras', 'SIN FINES HUSQVARNA / OTROS', { 'Bomba de aceite': 'BOMBA DE ACEITE Y SIN FIN', 'Cigüeñal': 'Cigüeñal', 'Partes': 'Partes' }],
  ['Desmalezadoras', 'CAJAS DE ENGRANAJES', {
    'Kit de cilindros': 'Kit de cilindros', 'Kit de pistón': 'Kit de pistón', 'Aros': 'Aros',
    'Embragues / campanas / resortes': 'Embragues / campanas / resortes', 'Partes': 'Partes',
    'Cigüeñal': 'Cigüeñal', 'Caja de engranaje': 'Caja de engranaje',
  }],
];
for (const [familia, junk, mapa] of REASIGNAR_POR_CLAVE) {
  for (const p of productos) {
    if (p.familia !== familia || p.subcategoria !== junk) continue;
    const destino = mapa[p.clave_producto];
    if (destino) set(p.codigo, 'subcategoria', destino);
  }
}

// ---------- 5) Embragues/piñones de "Motosierras/BOBINA DE INGNICION 2T" — se
//    separan por texto del nombre (campana vs piñón vs conjunto). ----------
for (const p of productos) {
  if (p.familia !== 'Motosierras' || p.subcategoria !== 'BOBINA DE INGNICION 2T') continue;
  if (p.clave_producto !== 'Embragues / campanas / resortes') continue;
  const n = p.nombre || '';
  if (/campana/i.test(n)) set(p.codigo, 'subcategoria', 'CAMPANA DE EMBRAGUE');
  else if (/pi[ñn]on/i.test(n)) set(p.codigo, 'subcategoria', 'Embragues / campanas / resortes');
  else if (/embrague/i.test(n)) set(p.codigo, 'subcategoria', 'EMBRAGUES');
}

// ---------- 6) Cables/cajas de engranaje mezclados en "CABLES ACELERADOR" /
//    "C ABLES ACELERADOR" (Desmalezadoras). ----------
for (const p of productos) {
  if (p.familia !== 'Desmalezadoras') continue;
  if (p.subcategoria !== 'CABLES ACELERADOR' && p.subcategoria !== 'C ABLES ACELERADOR') continue;
  if (p.clave_producto === 'Caja de engranaje') set(p.codigo, 'subcategoria', 'Caja de engranaje');
  else if (p.clave_producto === 'Cables') set(p.codigo, 'subcategoria', 'Cables');
  else if (p.clave_producto === 'Partes') set(p.codigo, 'subcategoria', 'Partes');
  // lo que no matchea (ej. clave "Cuchillas", cruzada de familia) se deja para revisión manual.
}

// ---------- Reporte (comparando estado final vs. snapshot original) ----------
const cambios = [];
for (const p of productos) {
  const o = original.get(p.codigo);
  for (const campo of ['subcategoria', 'clave_producto', 'nombre']) {
    if (o[campo] !== p[campo]) cambios.push({ codigo: p.codigo, campo, antes: o[campo], despues: p[campo] });
  }
}
console.log(`cambios: ${cambios.length}`);
const porCampo = {};
for (const c of cambios) porCampo[c.campo] = (porCampo[c.campo] || 0) + 1;
console.log(porCampo);
console.log('\nmuestra:');
cambios.slice(0, 60).forEach((c) => console.log(`  ${c.codigo}  ${c.campo}: ${JSON.stringify(c.antes)} -> ${JSON.stringify(c.despues)}`));
if (cambios.length > 60) console.log(`  ... y ${cambios.length - 60} más`);

fs.writeFileSync('data/scripts/reordenar-categorias-reporte.json', JSON.stringify(cambios, null, 1));

if (APPLY) {
  for (const p of productos) if (byCode.has(p.codigo) && cambios.some((c) => c.codigo === p.codigo)) p.editado_en = new Date().toISOString();
  fs.writeFileSync(PRODUCTOS, JSON.stringify(productos, null, 1));
  const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
    'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
    'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
  const cell = (v) => { let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
  fs.writeFileSync('data/productos.csv', '﻿' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
  console.log('\nEscrito data/productos.json + .csv');
}
