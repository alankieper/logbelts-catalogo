/**
 * Absorbe nombre/descripción del "Excel maestro" (columnas CÓDIGO, NOMBRE,
 * CATEGORÍA, DESCRIPCIÓN) hacia productos.json, matcheando por código.
 *
 * Reglas (pedidas por el cliente):
 *  - Si en el Excel la celda está vacía (o es el valor basura "CODIGO" que
 *    trae el NOMBRE en muchas filas), NO se toca ese campo: no se borra lo
 *    que ya tiene la ficha, no se deja un espacio vacío.
 *  - Si el Excel tiene el mismo código repetido con valores DISTINTOS, no se
 *    aplica nada para ese código (ambiguo) — se reporta aparte.
 *  - Códigos del Excel que no existen en el catálogo: se reportan aparte,
 *    no se crean productos nuevos (esta pasada es sólo para actualizar).
 *
 * Uso:  node data/scripts/aplicar-excel-maestro.mjs "<xlsx>" [--apply]
 */
import fs from 'fs';
import XLSX from 'xlsx';

const ARGV = process.argv.slice(2);
const APPLY = ARGV.includes('--apply');
const XLSX_PATH = ARGV.find((a) => !a.startsWith('--'));
if (!XLSX_PATH) { console.error('Uso: node data/scripts/aplicar-excel-maestro.mjs "<xlsx>" [--apply]'); process.exit(1); }

const PRODUCTOS = 'data/productos.json';
const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const esJunkNombre = (s) => /^codigo$/i.test(s);

const wb = XLSX.readFile(XLSX_PATH);
const hoja = wb.Sheets[wb.SheetNames[0]];
const filas = XLSX.utils.sheet_to_json(hoja, { defval: '' });

// código -> { nombres:Set, descs:Set }
const porCodigo = new Map();
for (const f of filas) {
  const cod = norm(f['CÓDIGO'] ?? f['CODIGO'] ?? f['Código']);
  if (!/^\d{5,8}$/.test(cod)) continue;
  if (!porCodigo.has(cod)) porCodigo.set(cod, { nombres: new Set(), descs: new Set() });
  const nom = norm(f['NOMBRE']);
  if (nom && !esJunkNombre(nom)) porCodigo.get(cod).nombres.add(nom);
  const desc = norm(f['DESCRIPCIÓN'] ?? f['DESCRIPCION']);
  if (desc) porCodigo.get(cod).descs.add(desc);
}

const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));

let actualizados = 0, sinCambio = 0;
const noExisten = [];
const conflictos = [];
const cambiosLog = [];
const codigosTocados = [];

for (const [cod, { nombres, descs }] of porCodigo) {
  const p = idx.get(cod);
  const conflictoNombre = nombres.size > 1;
  const conflictoDesc = descs.size > 1;
  if (conflictoNombre || conflictoDesc) {
    conflictos.push({ codigo: cod, nombres: [...nombres], descs: [...descs] });
    continue;
  }
  if (!p) {
    if (nombres.size || descs.size) noExisten.push(cod);
    continue;
  }
  const nombreNuevo = [...nombres][0];
  const descNueva = [...descs][0];
  let cambio = false;
  const antes = { nombre: p.nombre, descripcion: p.descripcion };

  if (nombreNuevo && norm(p.nombre) !== nombreNuevo) { p.nombre = nombreNuevo; cambio = true; }
  if (descNueva && norm(p.descripcion) !== descNueva) {
    p.descripcion = descNueva;
    p.fuente_desc = 'editado';
    if (p.estado && p.estado.startsWith('derivado')) p.estado = 'completo';
    cambio = true;
  }

  if (cambio) {
    actualizados++;
    codigosTocados.push(cod);
    p.editado_en = new Date().toISOString();
    if (cambiosLog.length < 40) cambiosLog.push({ codigo: cod, antes, despues: { nombre: p.nombre, descripcion: p.descripcion } });
  } else {
    sinCambio++;
  }
}

console.log(`códigos en el Excel: ${porCodigo.size}`);
console.log(`actualizados: ${actualizados} · sin cambio: ${sinCambio} · conflicto (valores distintos para el mismo código): ${conflictos.length} · no existen en el catálogo: ${noExisten.length}`);
console.log('\nejemplos de cambio:');
cambiosLog.forEach((c) => console.log(`  ${c.codigo}  nombre: ${JSON.stringify(c.antes.nombre)} -> ${JSON.stringify(c.despues.nombre)}`));
if (conflictos.length) {
  console.log('\nconflictos (no se tocan):');
  conflictos.slice(0, 20).forEach((c) => console.log(`  ${c.codigo}  nombres: ${JSON.stringify(c.nombres)}  descs: ${JSON.stringify(c.descs)}`));
}

fs.writeFileSync(
  'data/scripts/excel-maestro-reporte.json',
  JSON.stringify({ actualizados, sinCambio, conflictos, noExisten, codigosTocados }, null, 1)
);

if (APPLY) {
  fs.writeFileSync(PRODUCTOS, JSON.stringify(productos, null, 1));
  const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
    'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
    'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
  const cell = (v) => { let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
  fs.writeFileSync('data/productos.csv', '﻿' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
  console.log('\nEscrito data/productos.json + .csv');
}
