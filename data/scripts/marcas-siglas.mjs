/**
 * Completa el campo `marcas` de data/productos.json a partir de las siglas
 * que usa el catálogo en las descripciones:
 *    St / St- / St. / "Repl St" / "REEMPLAZO ST"   -> Stihl
 *    Huq / Hqv / Husq                              -> Husqvarna
 *    Om / O.M.                                     -> Oleo Mac
 *
 * No pisa marcas ya detectadas: sólo agrega la que falte.
 * Uso:  node data/scripts/marcas-siglas.mjs [--apply]
 * Sin --apply hace una simulación y muestra el resumen.
 */
import fs from 'fs';
import path from 'path';

const APPLY = process.argv.includes('--apply');
const FILE = path.join('data', 'productos.json');
const CSV = path.join('data', 'productos.csv');

const SIGLAS = [
  { marca: 'Stihl', re: /(?:^|[\s(\/,;])st(?=[\s.\-\/)]|$)/i },
  { marca: 'Husqvarna', re: /\b(?:huq|hqv|husq|husqv)\b/i },
  { marca: 'Oleo Mac', re: /\b(?:om|o\.m\.?)\b/i },
];

const productos = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const textOf = (p) =>
  [p.nombre, p.descripcion, p.compatibilidad, p.encabezado_pdf, (p.ref_interna || []).join(' ')]
    .filter(Boolean)
    .join('  ');

let cambiados = 0;
const ejemplos = [];
const resumen = {};

for (const p of productos) {
  const t = textOf(p);
  const actuales = new Set((p.marcas || []).map((m) => m.toLowerCase()));
  const nuevas = [];
  for (const { marca, re } of SIGLAS) {
    if (re.test(t) && !actuales.has(marca.toLowerCase())) nuevas.push(marca);
  }
  if (nuevas.length) {
    cambiados++;
    resumen[nuevas.join('+')] = (resumen[nuevas.join('+')] || 0) + 1;
    if (ejemplos.length < 30) ejemplos.push(`${p.codigo}  +[${nuevas.join(', ')}]  ${(p.nombre || '').slice(0, 60)}`);
    if (APPLY) {
      p.marcas = [...(p.marcas || []), ...nuevas];
      p.fuente_marca = 'sigla';
    }
  }
}

console.log(APPLY ? '=== APLICANDO ===' : '=== SIMULACIÓN (usar --apply para escribir) ===');
console.log('productos afectados:', cambiados, '/', productos.length);
console.log('por sigla agregada:', JSON.stringify(resumen, null, 1));
console.log('\nejemplos:');
ejemplos.forEach((e) => console.log('  ' + e));

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(productos, null, 1));

  const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'familia', 'familia_indice', 'subcategoria', 'marcas', 'codigo_original',
    'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'clave_rubro', 'clave_subrubro', 'clave_producto',
    'pagina', 'origen', 'flags', 'encabezado_pdf'];
  const cell = (v) => {
    let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v);
    if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  fs.writeFileSync(CSV, '﻿' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
  console.log('\nEscrito data/productos.json y data/productos.csv');
}
