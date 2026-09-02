/**
 * Extrae las descripciones REALES del catálogo v4 maquetadas en grilla por
 * posición (bloques "CODIGO NNNN" / "DESCRIPCIÓN:" / texto), que el parser
 * principal no captura porque el texto viene fuera de orden en el PDF.
 *
 * Método: por cada CODIGO se define una "celda" (misma columna, justo debajo)
 * y se junta todo el texto que cae adentro. Columnas y filas se detectan de
 * las posiciones de los propios CODIGO.
 *
 * Uso:  node data/scripts/extraer-descripciones-v4.mjs [--apply]
 *   --apply   escribe data/productos.json + .csv
 *   --all     además de las 'derivada', reemplaza descripciones del parser que
 *             tengan bleed de encabezado o texto repetido
 */
import fs from 'fs';

const APPLY = process.argv.includes('--apply');
const ALL = process.argv.includes('--all');
const PAGES = 'data/scripts/pages.json';
const PRODUCTOS = 'data/productos.json';

const textPages = JSON.parse(fs.readFileSync(PAGES, 'utf8'));
const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
const isCodigoTok = (s) => /^C[OÓ]DIGO$/i.test(s.trim());
const isDescTok = (s) => /^DESCRIPCI[ÓO]N\s*:?$/i.test(s.trim());
const isCode = (s) => /^\d{7}$/.test(s.trim());
const FOOTER = /Marcelo T\.|C\.P\.\s*1058|Ciudad Aut[óo]noma|\+54\s|6093\s?6665|6114\s?2012|4660295|^GASTON$/i;
const NOISE = /^\[FOTO|^C[óo]digo Logbelts:|^DATOS NO$|^ENCONTRADOS$|A ASIGNAR|VERIFICAR FOTO|^—$|^-$/i;

function shortName(desc) {
  let n = desc.split(/\s+(?:Repl\.?|REPL|para|Para|compatible|Compatible)\b/)[0];
  n = clean(n);
  if (!n || n.length < 3) n = clean(desc);
  if (n.length > 70) n = n.slice(0, 67).replace(/\s+\S*$/, '') + '…';
  return n;
}

// agrupa valores en centros de columna
function columnas(xs, tol = 34) {
  const s = [...xs].sort((a, b) => a - b);
  const cols = [];
  for (const x of s) {
    const c = cols.find((k) => Math.abs(k.c - x) < tol);
    if (c) { c.n++; c.sum += x; c.c = c.sum / c.n; }
    else cols.push({ c: x, sum: x, n: 1 });
  }
  return cols.map((k) => k.c);
}

const encontrados = {}; // code -> {desc, pagina}

for (const pg of textPages) {
  const its = (pg.items || []).filter((i) => i.s != null && i.s.trim() !== '');
  if (its.filter((i) => isDescTok(i.s)).length < 3) continue;

  // anclas de código
  const anchors = [];
  for (let i = 0; i < its.length; i++) {
    if (!isCodigoTok(its[i].s)) continue;
    const num = its.find((o) => Math.abs(o.y - its[i].y) < 6 && o.x > its[i].x && o.x < its[i].x + 120 && isCode(o.s));
    if (num) anchors.push({ code: num.s.trim(), x: num.x, y: its[i].y });
  }
  if (anchors.length < 3) continue;

  const colCenters = columnas(anchors.map((a) => a.x));
  const colOf = (x) => {
    let best = 0, bd = 1e9;
    for (let i = 0; i < colCenters.length; i++) {
      const d = Math.abs(colCenters[i] - x);
      if (d < bd) { bd = d; best = i; }
    }
    return bd < 90 ? best : -1;
  };

  // a cada ancla le asigno columna y fila (banda Y)
  for (const a of anchors) a.col = colOf(a.x);
  const rowYs = [...new Set(anchors.map((a) => Math.round(a.y / 8) * 8))].sort((x, y) => x - y);

  // texto de contenido (posible descripción)
  const content = its.filter((i) => {
    const s = i.s.trim();
    if (isCodigoTok(s) || isDescTok(s) || isCode(s)) return false;
    if (FOOTER.test(s) || NOISE.test(s)) return false;
    if (/^\d{1,3}$/.test(s)) return false;
    if (i.y < 44) return false;
    if (s.length > 14 && s === s.toUpperCase() && /[A-ZÁÉÍÓÚÑ]{4,}[ -].*[ -][A-ZÁÉÍÓÚÑ]{3,}/.test(s)) return false; // encabezado en mayúsculas
    return true;
  });

  // por cada ancla, junto el texto de su celda: misma columna, y entre (anchorY+12) y el próximo anchor de esa columna (o +230)
  for (const a of anchors) {
    if (a.col < 0) continue;
    const siguiente = anchors
      .filter((b) => b.col === a.col && b.y > a.y + 20)
      .sort((x, y) => x.y - y.y)[0];
    const yTop = a.y + 12;
    const yBot = Math.min(siguiente ? siguiente.y - 8 : a.y + 230, a.y + 240);
    const dentro = content
      .filter((t) => t.y > yTop && t.y < yBot && colOf(t.x) === a.col)
      .sort((p, q) => p.y - q.y || p.x - q.x);
    if (!dentro.length) continue;
    // sacar líneas repetidas (el PDF a veces pinta la descripción 2 veces)
    const lineas = [];
    for (const t of dentro) {
      const s = t.s.trim();
      if (!lineas.length || lineas[lineas.length - 1].toLowerCase() !== s.toLowerCase()) lineas.push(s);
    }
    let desc = clean(lineas.join(' '));
    // caso "frase frase" -> "frase"
    const mitad = desc.slice(0, Math.floor(desc.length / 2)).trim();
    if (mitad.length > 8 && (desc === mitad + ' ' + mitad || desc.toLowerCase() === (mitad + ' ' + mitad).toLowerCase())) desc = mitad;
    if (desc.length < 4) continue;
    const prev = encontrados[a.code];
    if (!prev || desc.length > prev.desc.length) encontrados[a.code] = { desc, pagina: pg.p };
  }
}

// aplicar
const bleed = (d) => {
  if (!d) return true;
  // repetición literal ("X Y Z X Y Z") o encabezado pegado en MAYÚSCULAS
  const half = d.slice(0, Math.floor(d.length / 2)).trim();
  if (half.length > 10 && d.includes(half + ' ' + half)) return true;
  if (/\b(PARTES DE|REEMPLAZO|DESMALEZADORAS|MOTOSIERRAS|MINITRACTORES|CARBURACI[ÓO]N)\b/.test(d)) return true;
  return false;
};

let nuevas = 0, reemp = 0;
const ej = [];
for (const [code, info] of Object.entries(encontrados)) {
  const p = idx.get(code);
  if (!p) continue;
  const derivada = !p.descripcion || (p.fuente_desc && p.fuente_desc.startsWith('derivada'));
  const sucia = ALL && p.fuente_desc === 'texto del PDF' && bleed(p.descripcion) && info.desc.length >= 6;
  if (!derivada && !sucia) continue;
  if (ej.length < 30) ej.push(`${code}  «${(p.descripcion || '(vacía)').slice(0, 46)}»  ->  «${info.desc.slice(0, 60)}»`);
  if (!p.descripcion) nuevas++; else reemp++;
  if (APPLY) {
    p.descripcion = info.desc;
    p.nombre = shortName(info.desc);
    if (!p.compatibilidad || bleed(p.compatibilidad)) p.compatibilidad = info.desc;
    p.fuente_desc = 'texto del PDF';
    if (p.estado && p.estado.startsWith('derivado')) p.estado = 'completo';
  }
}

console.log(`descripciones halladas por posición: ${Object.keys(encontrados).length}`);
console.log(`aplicadas: nuevas ${nuevas} + reemplazos ${reemp} = ${nuevas + reemp}` + (ALL ? ' (modo --all)' : ' (solo derivadas)'));
console.log('\nejemplos:');
ej.forEach((e) => console.log('  ' + e));

if (APPLY) {
  fs.writeFileSync(PRODUCTOS, JSON.stringify(productos, null, 1));
  const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
    'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
    'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
  const cell = (v) => {
    let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v);
    if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  fs.writeFileSync('data/productos.csv', '﻿' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
  console.log('\nEscrito data/productos.json + .csv');
}
