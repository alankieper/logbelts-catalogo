/**
 * Completa por primera vez el campo "Despiece" (máquinas de cada producto) leyendo el texto de
 * compatibilidad y el nombre. Después se corrige a mano desde Editar producto o con el Excel.
 *
 *   node data/scripts/extraer-despiece.mjs            -> muestra el resumen
 *   node data/scripts/extraer-despiece.mjs --escribir -> guarda:
 *       data/producto-despiece.json  (lo usa el sitio mientras la base no tenga la columna)
 *       data/productos.json          (campo `despiece`, sólo donde está vacío)
 *       supabase/migrations/0014_despiece_inicial.sql  (lo mismo para la base de datos)
 */
import fs from 'fs';
import path from 'path';
import { parsearMaquina } from '../../lib/maquinaNombre.js';

const RAIZ = process.cwd();
const productos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data/productos.json'), 'utf8'));

// Prefijos de modelo (el más largo primero). Después del prefijo: número y hasta 3 letras.
const PREF = 'MSE|MSA|MS|FSA|FS|FC|HSA|HS|HL|HT|KM|BG|BR|SR|TS|FR|KA|SH|BT|GXV|GX|GCV|GC|SRM|PB|CS|GT|SP|BC|GS';
const NUM = '\\d{2,4}(?!\\d)(?:[A-Z]{1,3}\\b)?';
const reCadena = (inicio) => new RegExp(`${inicio}\\s*[-.]?\\s*(${NUM}(?:\\s*\\/\\s*${NUM})*)`, 'gi');

// Marcas que suelen escribirse delante de modelos sólo numéricos ("Husq 365/372", "Stihl 070")
const MARCAS_NUM = [
  ['Husqvarna', 'husqvarna|husq\\.?|hus|hq'],
  ['Stihl', 'stihl|repl\\s+st'],
  ['Oleo Mac', 'oleo\\s*-?\\s*mac|oleomac'],
  ['Echo', 'echo'],
  ['Shindaiwa', 'shindaiwa'],
  ['Zenoah', 'zenoah'],
  ['Kawasaki', 'kawasaki'],
  ['McCulloch', 'mc\\s*culloch'],
  ['Partner', 'partner'],
  ['Dolmar', 'dolmar'],
  ['Efco', 'efco'],
  ['Tanaka', 'tanaka'],
  ['Homelite', 'homelite'],
];

function partes(cadena) {
  return cadena.split('/').map((s) => s.trim().toUpperCase()).filter(Boolean);
}
// "38mm", "52cc", "3/8" no son modelos
const esMedida = (texto, fin) => /^\s*(mm|cc|cm|"|x\s*\d|,\d|\.\d)/i.test(texto.slice(fin, fin + 4));

export function extraer(p) {
  const texto = [p.compatibilidad, p.nombre].filter(Boolean).join(' · ')
    // "SR(BR)400" -> "SR 400"
    .replace(/\b([A-Z]{2})\(([A-Z]{2})\)\s*/g, '$1 ');
  const out = [];
  const add = (marca, modelo) => {
    const m = parsearMaquina(marca ? `${marca} ${modelo}` : modelo, (p.marcas || [])[0] || null);
    if (m && !out.some((x) => x.clave === m.clave)) out.push(m);
  };

  // 1) Con prefijo: FS38/55, MS 170/180, GX160, SP42/44/430
  for (const r of texto.matchAll(reCadena(`\\b(${PREF})`))) {
    if (esMedida(texto, r.index + r[0].length)) continue;
    const pref = r[1].toUpperCase();
    for (const n of partes(r[2])) add(null, `${pref} ${n}`);
  }
  // 2) Marca + números: "Husq 365/372XP", "Stihl 070", "Oleo Mac 746/753"
  for (const [marca, re] of MARCAS_NUM) {
    for (const r of texto.matchAll(reCadena(`\\b(?:${re})\\b\\.?(?:\\s+st)?`))) {
      if (esMedida(texto, r.index + r[0].length)) continue;
      for (const n of partes(r[1])) add(marca, n);
    }
  }
  // 3) Desmalezadoras chinas por cilindrada: "Chinas 43/52cc" -> Chinas 43cc, Chinas 52cc
  for (const r of texto.matchAll(/\bchinas?\s+(\d{2}(?:\s*\/\s*\d{2})*)\s*cc\b/gi)) {
    for (const n of partes(r[1])) add('Chinas', `${n}cc`);
  }
  return out.map((m) => m.texto);
}

const resultado = {};
for (const p of productos) {
  const l = extraer(p);
  if (l.length) resultado[p.codigo] = l;
}

// "Stihl 170" (sin prefijo) es la misma máquina que "Stihl MS 170" cuando hay una sola opción
// con prefijo para ese número (MS / FS / TS...).
const conPrefijo = new Map();
for (const l of Object.values(resultado)) {
  for (const t of l) {
    const m = t.match(/^Stihl ([A-Z]{2,3}) (\d{3})$/);
    if (!m) continue;
    if (!conPrefijo.has(m[2])) conPrefijo.set(m[2], new Set());
    conPrefijo.get(m[2]).add(m[1]);
  }
}
// Si hay más de una opción (MS 250 y FS 250), decide la familia del producto o las otras
// máquinas del mismo producto ("Stihl 170/180/250" en una motosierra -> MS 250).
const familiaDe = new Map(productos.map((p) => [p.codigo, (p.familia || '').toLowerCase()]));
for (const [c, l] of Object.entries(resultado)) {
  const hermanos = new Set(l.map((t) => (t.match(/^Stihl ([A-Z]{2,3}) /) || [])[1]).filter(Boolean));
  const fam = familiaDe.get(c) || '';
  const porFamilia = /motosierra/.test(fam) ? 'MS' : /desmalezadora/.test(fam) ? 'FS' : null;
  const nuevo = [];
  for (const t of l) {
    const m = t.match(/^Stihl (\d{3})$/);
    if (m && /^00\d$/.test(m[1])) continue; // "002", "003": variantes de pieza, no máquinas
    const pref = m ? [...(conPrefijo.get(m[1]) || [])] : [];
    let elegido = null;
    if (pref.length === 1) elegido = pref[0];
    else if (pref.length > 1) elegido = pref.find((x) => hermanos.has(x)) || (pref.includes(porFamilia) ? porFamilia : null);
    const final = elegido ? `Stihl ${elegido} ${m[1]}` : t;
    if (!nuevo.includes(final)) nuevo.push(final);
  }
  if (nuevo.length) resultado[c] = nuevo;
  else delete resultado[c];
}

// ---- resumen ----
const maquinas = new Map();
for (const l of Object.values(resultado)) for (const t of l) maquinas.set(t, (maquinas.get(t) || 0) + 1);
console.log(`Productos con máquina: ${Object.keys(resultado).length} de ${productos.length}`);
console.log(`Máquinas distintas: ${maquinas.size}`);
console.log([...maquinas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, n]) => `  ${n}\t${k}`).join('\n'));

if (process.argv.includes('--escribir')) {
  fs.writeFileSync(path.join(RAIZ, 'data/producto-despiece.json'), JSON.stringify(resultado, null, 1));
  let n = 0;
  for (const p of productos) {
    if ((!p.despiece || !p.despiece.length) && resultado[p.codigo]) { p.despiece = resultado[p.codigo]; n++; }
    else if (!p.despiece) p.despiece = [];
  }
  fs.writeFileSync(path.join(RAIZ, 'data/productos.json'), JSON.stringify(productos, null, 1));

  const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
  const filas = Object.entries(resultado).map(([c, l]) => `  (${q(c)}, array[${l.map(q).join(', ')}]::text[])`);
  const sql = `-- ============================================================
-- Carga inicial del campo "Despiece" (máquinas de cada producto), detectado del texto de
-- compatibilidad. Sólo completa productos que todavía lo tienen vacío: se puede volver a correr
-- sin pisar lo que se corrigió a mano desde el admin o el Excel.
-- Generado con: node data/scripts/extraer-despiece.mjs --escribir
-- ============================================================

update cat_productos p
set despiece = v.d
from (values
${filas.join(',\n')}
) as v(codigo, d)
where p.codigo = v.codigo
  and coalesce(array_length(p.despiece, 1), 0) = 0;
`;
  fs.writeFileSync(path.join(RAIZ, 'supabase/migrations/0014_despiece_inicial.sql'), sql);
  console.log(`\nGuardado. ${n} productos completados en data/productos.json.`);
}
