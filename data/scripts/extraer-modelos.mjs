import fs from 'fs';
import path from 'path';

const P = JSON.parse(fs.readFileSync(path.join('data', 'productos.json'), 'utf8'));
const OUT_JSON = process.argv[2] || 'data/modelos.json';
const OUT_CSV = process.argv[3] || 'data/modelos.csv';

const MARCAS = [
  'Stihl', 'Husqvarna', 'Honda', 'Oleo Mac', 'Echo', 'Homelite', 'McCulloch', 'Jonsered', 'Shindaiwa',
  'Briggs & Stratton', 'Kohler', 'Tecumseh', 'MTD', 'Cub Cadet', 'AYP', 'Poulan', 'Weed Eater',
  'Craftsman', 'Murray', 'Noma', 'Toro', 'John Deere', 'Hustler', 'Ariens', 'Troy Bilt', 'Yard Machines',
  'Yard-Man', 'White', 'Maruyama', 'Kawasaki', 'Robin', 'Loncin', 'Shibaura', 'Mitsubishi', 'Zomax', 'Zenoah',
];
const MARCA_RE = new RegExp('\\b(' + MARCAS.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*')).join('|') + ')\\b', 'gi');

// tokens de modelo: FS-85, MS 250, GX160, YTH1542, LT1045, D130, Z246, RZT 50, 268, 5200, 143R
const MODELO_RE = /\b((?:FS|MS|HS|BG|BR|SR|TS|SH|GX|GC|GS|CS|SRM|PB|GT|EB|BC|SP|PM|XL|ST|LT|YT|YTH|GTH|RZT|EZM|IZ|MZ|Z|D|LA|GX|GCV|EU|EX|WB|WX)[- ]?\d{2,4}[A-Z0-9\/]{0,4}|\d{3,4}(?:XP|R|RII|RX)?|\d{2}[A-Z]\d{2,3})\b/gi;

function normModelo(s) {
  return s
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/^([A-Z]{2,4})[- ]?(\d)/, '$1 $2')
    .trim();
}
function normMarca(m) {
  const x = m.toLowerCase().replace(/\s+/g, '');
  if (x.startsWith('hqv') || x.startsWith('husq')) return 'Husqvarna';
  if (x === 'b&s' || x.startsWith('briggs')) return 'Briggs & Stratton';
  if (x.startsWith('mccull') || x === 'mcculloch') return 'McCulloch';
  if (x.startsWith('oleo')) return 'Oleo Mac';
  if (x.startsWith('yard') && x.includes('man')) return 'Yard-Man';
  if (x.startsWith('yard')) return 'Yard Machines';
  const hit = MARCAS.find((b) => b.toLowerCase().replace(/\s+/g, '') === x);
  return hit || m;
}

// mapa marca -> Set(modelo) -> [codigos]
const mapa = new Map();
function add(marca, modelo, codigo) {
  marca = normMarca(marca);
  modelo = normModelo(modelo);
  if (!modelo || modelo.length < 2) return;
  if (!mapa.has(marca)) mapa.set(marca, new Map());
  const mm = mapa.get(marca);
  if (!mm.has(modelo)) mm.set(modelo, new Set());
  mm.get(modelo).add(codigo);
}

for (const p of P) {
  const texto = [p.compatibilidad, p.nombre, p.encabezado_pdf].filter(Boolean).join(' · ');
  if (!texto) continue;

  // marcas presentes en el texto o declaradas
  const marcasTxt = new Set((p.marcas || []).map(normMarca));
  let m;
  MARCA_RE.lastIndex = 0;
  while ((m = MARCA_RE.exec(texto))) marcasTxt.add(normMarca(m[1]));
  if (!marcasTxt.size) continue;

  // modelos en el texto
  const modelos = new Set();
  MODELO_RE.lastIndex = 0;
  while ((m = MODELO_RE.exec(texto))) modelos.add(m[1]);
  // separar "FS-85/106/108" -> 85, 106, 108 con prefijo
  const extra = texto.match(/\b([A-Z]{2,4})[- ]?(\d{2,4}(?:\/\d{2,4})+)/gi) || [];
  for (const e of extra) {
    const mm2 = e.match(/^([A-Z]{2,4})[- ]?(.+)$/i);
    if (mm2) for (const num of mm2[2].split('/')) modelos.add(mm2[1] + ' ' + num);
  }

  if (!modelos.size) continue;
  // asignar cada modelo a cada marca del producto (aprox; se corrige en revisión)
  const marcasArr = [...marcasTxt];
  for (const mod of modelos) {
    // si el modelo empieza con un prefijo tipico de una marca, priorizar esa
    let marca = marcasArr[0];
    if (/^(FS|MS|HS|BG|BR|SR|TS|SH)\b/i.test(mod) && marcasArr.includes('Stihl')) marca = 'Stihl';
    else if (/^(GX|GC|GCV|EU|EX|EB|WB|WX)\b/i.test(mod) && marcasArr.includes('Honda')) marca = 'Honda';
    else if (/^(YTH|GTH|RZT|LT|YT|IZ|MZ|Z)\b/i.test(mod) && marcasArr.includes('Husqvarna')) marca = 'Husqvarna';
    add(marca, mod, p.codigo);
  }
}

// --- limpieza: descartar prefijos de nº de parte que no son modelos de máquina ---
const MARCAS_MINITRACTOR = new Set(['MTD', 'Cub Cadet', 'AYP', 'Poulan', 'Murray', 'Noma', 'Toro', 'John Deere', 'Craftsman', 'Troy Bilt', 'Yard Machines', 'Yard-Man', 'White', 'Hustler', 'Ariens']);
const PREFIJO_PARTE = /^(?:MTD |AYP |)?(?:7\d{2}|9\d{2}|1\d{3})$/; // 742, 918, 1988...
function esModeloReal(marca, modelo) {
  if (/[A-Z]{2,}/.test(modelo)) return true; // FS 85, GX160, YTH1542, D130
  if (PREFIJO_PARTE.test(modelo)) return false;
  if (MARCAS_MINITRACTOR.has(marca) && /^\d{2,4}$/.test(modelo)) return false; // números sueltos en minitractores = nº de parte
  // motosierras/desmalezadoras: número de cilindrada/modelo es válido (Husqvarna 268, Stihl 250)
  return /^\d{2,4}(?:XP|R|RII)?$/.test(modelo);
}

// salida
const filas = [];
for (const [marca, mm] of mapa) {
  for (const [modelo, cods] of mm) {
    if (!esModeloReal(marca, modelo)) continue;
    if (cods.size < 1) continue;
    filas.push({ marca, modelo, productos: cods.size, ejemplos: [...cods].slice(0, 5) });
  }
}
filas.sort((a, b) => a.marca.localeCompare(b.marca) || b.productos - a.productos || a.modelo.localeCompare(b.modelo));

fs.writeFileSync(OUT_JSON, JSON.stringify(filas, null, 1));

// mapa producto -> modelos (para enganchar despieces en la ficha)
const validos = new Set(filas.map((f) => f.marca + '|' + f.modelo));
const porProducto = {};
for (const [marca, mm] of mapa) {
  for (const [modelo, cods] of mm) {
    if (!validos.has(marca + '|' + modelo)) continue;
    for (const c of cods) {
      (porProducto[c] = porProducto[c] || []).push({ marca, modelo });
    }
  }
}
fs.writeFileSync(path.join('data', 'producto-modelos.json'), JSON.stringify(porProducto));
const cell = (v) => (Array.isArray(v) ? v.join(' ') : v == null ? '' : String(v));
fs.writeFileSync(
  OUT_CSV,
  '﻿' + ['marca;modelo;productos;ejemplos', ...filas.map((f) => [f.marca, f.modelo, f.productos, f.ejemplos.join(' ')].map(cell).join(';'))].join('\r\n')
);

// resumen
const porMarca = {};
for (const f of filas) porMarca[f.marca] = (porMarca[f.marca] || 0) + 1;
console.log('MODELOS DISTINTOS:', filas.length);
console.log('por marca:');
for (const [k, v] of Object.entries(porMarca).sort((a, b) => b[1] - a[1])) console.log('  ' + String(v).padStart(4), k);
console.log('\ntop 25 por cantidad de productos:');
for (const f of filas.slice().sort((a, b) => b.productos - a.productos).slice(0, 25))
  console.log('  ' + String(f.productos).padStart(4), f.marca, f.modelo);
