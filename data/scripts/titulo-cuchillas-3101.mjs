/**
 * Todo código que empieza con "3101" es una cuchilla de minitractor.
 * Pedido del cliente: anteponer "Cuchillas Minitractor " al título de cada
 * una, dejando el resto del nombre (la descripción que ya tenían) como
 * continuación.
 *
 * Uso: node data/scripts/titulo-cuchillas-3101.mjs [--apply]
 */
import fs from 'fs';

const APPLY = process.argv.includes('--apply');
const PRODUCTOS = 'data/productos.json';
const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));

let tituloCambiado = 0;
const tocados = [];

for (const p of productos) {
  if (!p.codigo.startsWith('3101')) continue;
  if (/^cuchillas minitractor\b/i.test(p.nombre || '')) continue;
  p.nombre = 'Cuchillas Minitractor ' + (p.nombre || '').trim();
  p.editado_en = new Date().toISOString();
  tituloCambiado++;
  tocados.push(p.codigo);
}

console.log(`códigos 3101* encontrados: ${productos.filter((p) => p.codigo.startsWith('3101')).length}`);
console.log(`título con "Cuchillas Minitractor " agregado: ${tituloCambiado}`);
console.log('\nmuestra:');
productos.filter((p) => tocados.includes(p.codigo)).slice(0, 8)
  .forEach((p) => console.log(`  ${p.codigo}  ${p.nombre}`));

fs.writeFileSync('data/scripts/titulo-cuchillas-3101-reporte.json', JSON.stringify(tocados, null, 1));

if (APPLY) {
  fs.writeFileSync(PRODUCTOS, JSON.stringify(productos, null, 1));
  const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
    'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
    'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
  const cell = (v) => { let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
  fs.writeFileSync('data/productos.csv', '﻿' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
  console.log('\nEscrito data/productos.json + .csv');
}
