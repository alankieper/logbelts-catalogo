/**
 * Agrega las 53 Correas de Kevlar que están en el catálogo PDF v4 (páginas 4-13,
 * sección "MINITRACTORES - CORREAS DE KEVLAR") pero faltaban en la web — verificado
 * por conteo total (2412 web + 53 = 2465 = total del PDF).
 *
 * También aplica la foto de referencia genérica (public/fotos/correas-kevlar-generica.jpg,
 * provista por el cliente) a TODAS las correas de kevlar, las 268 que ya existían
 * (0 tenían foto) + las 53 nuevas — pedido explícito del cliente: "a todas las
 * correas ponele esta imagen asi tienen de referencia esa imagen".
 *
 * Fuente de las 53 filas: extracción columna-por-columna de data/scripts/pages.json
 * (páginas 4-13), asignando cada texto a la columna de header más cercana en x
 * (LOGBELTS/ORIGINAL/UBICACIÓN/DESCRIPCIÓN/LARGO), validada contra un producto ya
 * existente (5888065) que coincidió exactamente.
 *
 * Uso: node data/scripts/agregar-correas-faltantes.mjs [--apply]
 */
import fs from 'fs';

const APPLY = process.argv.includes('--apply');
const PRODUCTOS = 'data/productos.json';
const FILAS = 'C:/Users/Administrador/AppData/Local/Temp/claude/C--Users-Administrador-Documents-logbelts-catalogo/385192ea-e501-4b4f-847e-7aa282bb568f/scratchpad/correas-53-final.json';
const FOTO_GENERICA = 'correas-kevlar-generica.jpg';

const filas = JSON.parse(fs.readFileSync(FILAS, 'utf8'));
const productos = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));
const byCode = new Map(productos.map((p) => [p.codigo, p]));

// marcas por página, según el título de sección de cada página (encabezado_pdf)
const MARCAS_POR_PAGINA = {
  4: ['MTD', 'Yard Machines', 'Yard-Man', 'Troy Bilt', 'White'],
  5: ['MTD', 'Yard Machines', 'Yard-Man', 'Troy Bilt', 'White'],
  6: ['MTD', 'Yard Machines', 'Yard-Man', 'Troy Bilt', 'White'],
  7: ['AYP', 'Poulan', 'Weed Eater', 'Craftsman'],
  8: ['AYP', 'Poulan', 'Weed Eater', 'Craftsman'],
  9: ['Murray', 'Noma'],
  10: ['Husqvarna'],
  11: ['Husqvarna'],
  12: ['Toro'],
  13: ['Hustler'],
};

const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

let creados = 0;
const yaExisten = [];
for (const f of filas) {
  if (byCode.has(f.codigo)) { yaExisten.push(f.codigo); continue; }
  const original = norm(f.ORIGINAL);
  const ubicacion = norm(f.UBICACIÓN);
  const desc = norm(f.DESCRIPCIÓN);
  const largo = norm(f.LARGO);
  const nombrePartes = [original, ubicacion, desc, largo].filter(Boolean);
  const descPartes = [ubicacion, desc, largo].filter(Boolean);
  const marcas = MARCAS_POR_PAGINA[f.pagina] || [];

  const p = {
    codigo: f.codigo,
    estado: 'completo',
    nombre: nombrePartes.join(' '),
    descripcion: descPartes.join(' '),
    fuente_desc: 'texto del PDF',
    familia: 'Minitractores',
    familia_indice: 'Minitractores',
    subcategoria: 'CORREAS DE KEVLAR',
    marcas,
    codigo_original: original ? [original] : [],
    compatibilidad: desc || null,
    ubicacion: ubicacion || null,
    medidas: largo ? [largo] : [],
    ref_interna: [],
    clave_rubro: 'Minitractores',
    clave_subrubro: 'Minitractor',
    clave_producto: 'Correas',
    clave_valida: true,
    fuente_nombre: null,
    pagina: f.pagina,
    origen: 'tabla',
    flags: [],
    encabezado_pdf: f.marcasTitulo,
    foto: FOTO_GENERICA,
    foto_confianza: 'referencia',
    oculto: false,
    descontinuado: false,
    editado_en: new Date().toISOString(),
  };
  productos.push(p);
  byCode.set(p.codigo, p);
  creados++;
}

// Foto de referencia para TODAS las correas de kevlar (existentes + nuevas)
let fotosPuestas = 0;
for (const p of productos) {
  if (p.subcategoria === 'CORREAS DE KEVLAR' && !p.foto) {
    p.foto = FOTO_GENERICA;
    p.foto_confianza = 'referencia';
    p.editado_en = new Date().toISOString();
    fotosPuestas++;
  }
}

console.log(`productos nuevos creados: ${creados}`);
if (yaExisten.length) console.log('ya existían (se ignoran):', yaExisten);
console.log(`fotos de referencia aplicadas (a correas que no tenían foto): ${fotosPuestas}`);
console.log(`total correas de kevlar ahora: ${productos.filter((p) => p.subcategoria === 'CORREAS DE KEVLAR').length}`);
console.log(`total catálogo ahora: ${productos.length}`);

if (APPLY) {
  fs.writeFileSync(PRODUCTOS, JSON.stringify(productos, null, 1));
  const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
    'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
    'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
  const cell = (v) => { let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
  fs.writeFileSync('data/productos.csv', '\uFEFF' + [COLS.join(';'), ...productos.map((r) => COLS.map((c) => cell(r[c])).join(';'))].join('\r\n'));
  console.log('\nEscrito data/productos.json + .csv');
}
