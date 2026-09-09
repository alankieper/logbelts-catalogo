/**
 * Todo código que empieza con "5888" es una correa de kevlar (Minitractores).
 * Pedido del cliente: (1) asegurarse de que estén ubicadas en esa categoría
 * (corrige 38 productos que por un bug de extracción habían quedado con
 * subcategoria="UBICACIÓN" en vez de "CORREAS DE KEVLAR") y (2) anteponer
 * "Correa " al título de cada una, dejando el resto del nombre como estaba.
 *
 * Uso: node data/scripts/normalizar-correas-5888.mjs [--apply]
 */
import fs from 'fs';

const APPLY = process.argv.includes('--apply');
const PRODUCTOS = 'data/productos.json';
const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));

let subcatCorregida = 0;
let tituloCambiado = 0;
const tocados = [];

for (const p of productos) {
  if (!p.codigo.startsWith('5888')) continue;
  let cambio = false;

  if (p.subcategoria !== 'CORREAS DE KEVLAR') {
    p.subcategoria = 'CORREAS DE KEVLAR';
    subcatCorregida++;
    cambio = true;
  }
  if (p.familia !== 'Minitractores') { p.familia = 'Minitractores'; cambio = true; }
  if (p.familia_indice !== 'Minitractores') { p.familia_indice = 'Minitractores'; cambio = true; }

  if (!/^correa\b/i.test(p.nombre || '')) {
    p.nombre = 'Correa ' + (p.nombre || '').trim();
    tituloCambiado++;
    cambio = true;
  }

  if (cambio) {
    p.editado_en = new Date().toISOString();
    tocados.push(p.codigo);
  }
}

console.log(`códigos 5888* encontrados: ${productos.filter((p) => p.codigo.startsWith('5888')).length}`);
console.log(`subcategoría corregida: ${subcatCorregida}`);
console.log(`título con "Correa " agregado: ${tituloCambiado}`);
console.log(`total productos tocados: ${tocados.length}`);
console.log('\nmuestra:');
productos.filter((p) => tocados.includes(p.codigo)).slice(0, 8)
  .forEach((p) => console.log(`  ${p.codigo}  ${p.subcategoria}  ·  ${p.nombre}`));

fs.writeFileSync('data/scripts/normalizar-correas-5888-reporte.json', JSON.stringify(tocados, null, 1));

if (APPLY) {
  fs.writeFileSync(PRODUCTOS, JSON.stringify(productos, null, 1));
  const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
    'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
    'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
  const cell = (v) => { let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
  fs.writeFileSync('data/productos.csv', '﻿' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
  console.log('\nEscrito data/productos.json + .csv');
}
