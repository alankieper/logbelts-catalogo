/**
 * Genera extension-fotos/lista-fisico.json: fotos que le faltan o hay que cambiar en el CATÁLOGO FÍSICO
 * (InDesign "Catalogo Logbelts 2026 - FINAL", armado sobre el v4 de Gastón), para la pestaña
 * "Catálogo físico" de la extensión de Chrome.
 *
 * Fuentes:
 *   - productos_final_consolidado.csv (planilla de Cowork): ESTADO = PLACEHOLDER_PENDIENTE  -> "falta"
 *   - ARMADO_CLAUDE/PENDIENTES_PAGINA_NUEVA.txt: fotos de otro producto (lista FOTO_EQUIVOCADA) -> "equivocada"
 *   - ARMADO_CLAUDE/FICHAS_CON_FOTO_PROVISORIA.txt: marca de agua / logo ajeno (badge "!")      -> "provisoria"
 *   - ARMADO_CLAUDE/MEJORAS_MARCADAS_ALAN.txt: fondo, tamaño, artefactos ("MEJORAR ALAN")        -> "mejorar"
 *
 * Uso:  node data/scripts/generar-lista-fisico.mjs [--consolidado <csv>] [--armado <carpeta ARMADO_CLAUDE>]
 */
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { textoBusqueda } from './generar-lista-extension.mjs';

const arg = (nombre, defecto) => {
  const i = process.argv.indexOf(nombre);
  return i > 0 ? process.argv[i + 1] : defecto;
};
const CONSOLIDADO = arg('--consolidado', 'C:/Users/Administrador/Desktop/markitdown catalogo lobelts/final_consolidado/productos_final_consolidado.csv');
const ARMADO = arg('--armado', 'C:/Users/Administrador/Desktop/catalogo in desing para claude/ARMADO_CLAUDE');
const SALIDA = path.join('extension-fotos', 'lista-fisico.json');

// Casos de "foto de otro producto" anotados en PENDIENTES_PAGINA_NUEVA.txt / MEJORAS_MARCADAS_ALAN.txt (al 2026-09-07).
const FOTO_EQUIVOCADA = [
  ['2125159', 'La foto asignada es un kit de carburador, no un cable de acelerador.'],
  ['2205030', 'La foto es un kit de pistón completo, no un aro de pistón suelto.'],
  ['2220178', 'La foto es un bloque de cárter, no una cubierta / carcasa.'],
  ['2219091', 'La foto es un resorte, no un engranaje sinfín.'],
  ['2219094', 'Comparte foto con 2219093 (buje de goma, no engranaje sinfín).'],
  ['2220105', 'Usa la misma foto que 2220104 (BIG): falta una foto real de la versión SMALL.'],
];

function leerCsv(archivo) {
  const wb = XLSX.read(fs.readFileSync(archivo, 'utf8'), { type: 'string' });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
}

// Tablas de texto tipo "2103196    | página | motivo" con renglones de continuación.
function codigosDeTabla(archivo) {
  if (!fs.existsSync(archivo)) return [];
  const out = [];
  let actual = null;
  for (const linea of fs.readFileSync(archivo, 'utf8').split(/\r?\n/)) {
    const fila = linea.match(/^\s*-?\s*(\d{7})\s*\|\s*([^|]*?)\s*\|\s*(.*)$/);
    if (fila) {
      actual = { c: fila[1], pag: fila[2], nota: fila[3].trim() };
      out.push(actual);
      continue;
    }
    if (!actual) continue;
    const cont = linea.match(/^\s{3,}\|\s*([^|]*?)\s*\|\s*(.*)$/);
    if (cont) {
      if (cont[1]) actual.pag += ' ' + cont[1];
      if (cont[2].trim()) actual.nota += ' ' + cont[2].trim();
    } else if (/^\s{2,}\S/.test(linea) && !linea.includes('|')) {
      actual.nota += ' ' + linea.trim();
    } else {
      actual = null;
    }
  }
  return out.map((x) => ({ ...x, pag: x.pag.replace(/\s+/g, ' ').trim(), nota: x.nota.replace(/\s+/g, ' ').trim() }));
}

// Excel de faltantes por factura: trae el modelo real cuando la planilla de Cowork sólo dice "Carburador".
const FALTANTES = arg('--faltantes', 'C:/Users/Administrador/Downloads/Faltantes_Catalogo_Logbelts_Con_Fotos_v2.xlsx');
const modelosFactura = new Map();
if (fs.existsSync(FALTANTES)) {
  const wb = XLSX.read(fs.readFileSync(FALTANTES), { type: 'buffer' });
  const hoja = wb.Sheets['Faltantes (Todas)'] || wb.Sheets[wb.SheetNames[0]];
  for (const r of XLSX.utils.sheet_to_json(hoja, { defval: '', raw: false })) {
    const c = String(r['Codigo Logbelts (7 dig)'] || '').trim();
    const modelo = String(r['Modelo / Rubro'] || '').trim();
    // "CARBURETOR", "GEARBOX": rubro en inglés, no sirve como modelo
    if (/^\d{7}$/.test(c) && modelo && !/^[A-Z\s]+$/.test(modelo)) modelosFactura.set(c, modelo);
  }
}
const tieneModelo = (t) => /\d/.test(t) || /\b(stihl|husqvarna|echo|honda|kohler|briggs|b&s|tecumseh|oleo|zama|walbro|toro|mtd)\b/i.test(t);

const productos = new Map(JSON.parse(fs.readFileSync('data/productos.json', 'utf8')).map((p) => [p.codigo, p]));
const consolidado = fs.existsSync(CONSOLIDADO) ? leerCsv(CONSOLIDADO) : [];
if (!consolidado.length) console.warn('Aviso: no encontré la planilla', CONSOLIDADO);
const porCodigo = new Map(consolidado.map((r) => [String(r.codigo).trim(), r]));

const items = new Map(); // código -> item (gana el motivo más grave)
const PRIORIDAD = { falta: 0, equivocada: 1, provisoria: 2, mejorar: 3 };
function agregar(c, m, nota, pag) {
  const previo = items.get(c);
  if (previo && PRIORIDAD[previo.m] <= PRIORIDAD[m]) {
    if (nota && !previo.nota.includes(nota)) previo.nota += ` · ${nota}`;
    return;
  }
  items.set(c, { c, m, nota: [nota, previo?.nota].filter(Boolean).join(' · '), pag: pag || previo?.pag || '' });
}

for (const r of consolidado) {
  if (/PLACEHOLDER/i.test(r.ESTADO)) {
    agregar(String(r.codigo).trim(), 'falta', 'Sin foto real en el catálogo (placeholder).', r.pagina_gaston ? `pág. ${r.pagina_gaston} (v4 Gastón)` : '');
  }
}
for (const [c, nota] of FOTO_EQUIVOCADA) agregar(c, 'equivocada', nota);
for (const x of codigosDeTabla(path.join(ARMADO, 'FICHAS_CON_FOTO_PROVISORIA.txt'))) agregar(x.c, 'provisoria', x.nota, x.pag);
for (const x of codigosDeTabla(path.join(ARMADO, 'MEJORAS_MARCADAS_ALAN.txt'))) agregar(x.c, 'mejorar', x.nota, x.pag);

// Los "falta" que ya tienen foto en Descargas/fotos-catalogo-fisico no se vuelven a pedir.
const CARPETA_FISICO = arg('--carpeta', path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads', 'fotos-catalogo-fisico'));
// Cuenta también las ya importadas (subcarpeta importadas/), no las apartadas en revisar/.
const conFoto = new Set(
  fs.existsSync(CARPETA_FISICO)
    ? fs
        .readdirSync(CARPETA_FISICO, { recursive: true })
        .map(String)
        .filter((f) => !/^revisar[\\/]/i.test(f))
        .map((f) => path.basename(f).match(/^(\d{7})(?:-\d+)?\.(?:jpe?g|png|webp|avif|gif)$/i)?.[1])
        .filter(Boolean)
    : [],
);
let yaResueltos = 0;

const lista = [];
for (const it of items.values()) {
  if (it.m === 'falta' && conFoto.has(it.c)) {
    yaResueltos++;
    continue;
  }
  const web = productos.get(it.c);
  const fila = porCodigo.get(it.c);
  let desc = String(fila?.descripcion || web?.nombre || '').trim();
  const modelo = modelosFactura.get(it.c);
  if (modelo && !tieneModelo(desc)) desc = `${desc} ${modelo}`.trim();
  const p = {
    ...(web || {}),
    codigo: it.c,
    nombre: desc,
    descripcion: desc,
    familia: web?.familia || fila?.familia || '',
    compatibilidad: null,
  };
  lista.push({
    c: it.c,
    n: desc || '(sin descripción)',
    b: desc ? textoBusqueda(p) : it.c,
    f: p.familia || 'Sin familia',
    s: web?.subcategoria || fila?.familia || '',
    m: it.m,
    nota: it.nota,
    pag: it.pag,
    px: null,
    foto: web?.foto || null,
    v: 0,
    o: (web?.codigo_original || []).filter(Boolean).slice(0, 4),
    mk: web?.marcas?.[0] || null,
  });
}

lista.sort((a, b) => PRIORIDAD[a.m] - PRIORIDAD[b.m] || a.c.localeCompare(b.c));
fs.writeFileSync(SALIDA, JSON.stringify(lista));

const cuenta = lista.reduce((acc, x) => ((acc[x.m] = (acc[x.m] || 0) + 1), acc), {});
console.log(`Lista del catálogo físico: ${lista.length} códigos`, cuenta);
if (yaResueltos) console.log(`Salteados ${yaResueltos} que faltaban pero ya tienen foto en ${CARPETA_FISICO}`);
console.log(`Con ficha en la web: ${lista.filter((x) => productos.has(x.c)).length} · con foto web para Google Lens: ${lista.filter((x) => x.foto).length}`);
console.log('Recargá la extensión en chrome://extensions para ver los cambios.');
