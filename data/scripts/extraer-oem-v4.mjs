/**
 * Extrae códigos originales (OEM) que YA ESTÁN en el texto del catálogo v4
 * (descripción, compatibilidad, nombre, ref. interna) y que el parser no
 * separó bien. Sólo formatos reconocibles de fabricante — nada inventado.
 * No pisa los OEM ya cargados, sólo agrega.
 *
 * Uso:  node data/scripts/extraer-oem-v4.mjs [--apply]
 */
import fs from 'fs';

const APPLY = process.argv.includes('--apply');
const FILE = 'data/productos.json';
const productos = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const textoDe = (p) =>
  [p.nombre, p.descripcion, p.compatibilidad, (p.ref_interna || []).join(' '), p.encabezado_pdf]
    .filter(Boolean)
    .join('  ');

// patrones OEM por fabricante (formato específico -> baja chance de falso positivo)
const REGLAS = [
  // Stihl: 4-3-4 dígitos (1141 020 1206)
  { re: /\b(\d{4})[ .\-](\d{3})[ .\-](\d{4})\b/g, fmt: (m) => `${m[1]} ${m[2]} ${m[3]}` },
  // Stihl carburador: 1141-120-06xx style ya cubierto arriba; kits ZAMA/WALBRO abajo
  // Husqvarna / Poulan / AYP: 9 dígitos que empiezan con 5 (532175566)
  { re: /\b(5\d{8})\b/g, fmt: (m) => m[1] },
  // AYP / Husqvarna con espacio o guion: 3 + 5/6 (618 04865, 756-04129, 918-04865)
  { re: /\b(\d{3})[ \-](\d{5,6})\b/g, fmt: (m) => `${m[1]}-${m[2]}` },
  // Briggs & Stratton: "Briggs 692137" / "B&S 591731 796109"
  { re: /\b(?:Briggs(?:\s*&\s*Stratton)?|B\s*&\s*S)\s+(\d{6})(?:\s+(\d{6}))?/gi, fmt: (m) => [m[1], m[2]].filter(Boolean) },
  // Kohler: "Kohler 32 041 04"
  { re: /\bKohler\s+(\d{2})\s?(\d{3})\s?(\d{2})\b/gi, fmt: (m) => `${m[1]} ${m[2]} ${m[3]}` },
  // Tecumseh: "Tecumseh 632347"
  { re: /\bTecumseh\s+(\d{5,7}[A-Z]?)\b/gi, fmt: (m) => m[1] },
  // Echo: sólo el formato de nº de parte real (A021xxxxxx / P021xxxxxx). Los "Echo 2300/4605" son MODELOS, no OEM.
  { re: /\b([AP]0\d{2}[A-Z0-9]{6})\b/gi, fmt: (m) => m[1] },
  // Carburadores Walbro / Zama / Tillotson: designación de modelo (WT-XXX, C1U-K52, HDA-268...)
  // sólo si hay contexto de carburador (para no agarrar "Stihl HS-45" que es una máquina)
  { re: /\b(?:Walbro|Zama|Tillotson|Nikki|Ruixing|carburador|Tipo|Repl)\b[^.\n]{0,40}?\b(W[TYA]|WYJ|WYL|WYK|WA|C1[QUT]|C3[AM]|RB|HDA|HD[A-Z]?)[ \-]?([A-Z]?\d{1,3}[A-Z]?)\b/gi, fmt: (m) => `${m[1]}-${m[2]}` },
  // GND / D## refs internas de la casa (GND-0xxx) — ya salen como ref_interna, se ignoran acá
];

// descartes: cosas que parecen código pero son medidas / modelos de máquina
const ESMODELO = /\b(FS|MS|HS|BG|BR|TS|SH|SR|GX|GC|GS|CS|SRM|PB|GT|LT|YT|YTH|RZT|EU|EX)\s?\d/i;

function candidatos(texto) {
  const out = new Set();
  for (const { re, fmt } of REGLAS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(texto))) {
      const v = fmt(m);
      for (const c of Array.isArray(v) ? v : [v]) {
        const cc = norm(c);
        if (cc.length < 4) continue;
        if (/^\d{1,2}[ x]\d{1,2}$/.test(cc)) continue; // medida
        if (ESMODELO.test(cc)) continue;
        out.add(cc);
      }
    }
  }
  return [...out];
}

let tocados = 0, agregadosTot = 0;
const ejemplos = [];
for (const p of productos) {
  const yaSet = new Set((p.codigo_original || []).map((x) => norm(x).toUpperCase()));
  const nuevos = candidatos(textoDe(p)).filter((c) => !yaSet.has(c.toUpperCase()));
  if (!nuevos.length) continue;
  tocados++;
  agregadosTot += nuevos.length;
  if (ejemplos.length < 40) ejemplos.push(`${p.codigo}  [${(p.marcas || []).join('/')}]  +${JSON.stringify(nuevos)}  ← ${(p.descripcion || p.nombre || '').slice(0, 60)}`);
  if (APPLY) {
    p.codigo_original = [...(p.codigo_original || []), ...nuevos];
    p.fuente_oem = 'texto del catálogo';
  }
}

console.log(`${APPLY ? 'APLICADO' : 'SIMULACIÓN'} — productos con OEM nuevo: ${tocados} · códigos agregados: ${agregadosTot}`);
console.log(`Total con OEM ahora: ${productos.filter((p) => p.codigo_original && p.codigo_original.length).length}/${productos.length}`);
console.log('\nEjemplos:');
ejemplos.forEach((e) => console.log('  ' + e));

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(productos, null, 1));
  const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
    'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
    'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
  const cell = (v) => { let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
  fs.writeFileSync('data/productos.csv', '﻿' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
  console.log('\nEscrito data/productos.json + .csv');
}
