import * as XLSX from 'xlsx';

/**
 * Ida y vuelta del catálogo en Excel para carga masiva de datos.
 * Columnas EDITABLES: nombre, descripcion, familia, subcategoria, marcas,
 * codigo_original, compatibilidad, ubicacion, medidas.
 * El resto es de sólo lectura (contexto). El código es la llave, no se toca.
 */

export const COLS_EDITABLES = [
  'nombre', 'descripcion', 'familia', 'subcategoria', 'marcas',
  'codigo_original', 'compatibilidad', 'ubicacion',
];
const MULTI = new Set(['marcas', 'codigo_original']);
// contexto = sólo lectura. medidas va acá porque tiene comas/comillas y no conviene editarla en masa.
const CONTEXTO = ['medidas', 'estado', 'fuente_desc', 'pagina', 'tiene_foto'];

const joinMulti = (v) => (Array.isArray(v) ? v.join(' | ') : v || '');
// SEPARADOR: sólo la barra "|". Nunca coma (los datos ya tienen comas: "91,40 mm").
const splitMulti = (v) =>
  String(v == null ? '' : v)
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
const normTxt = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

export function exportarXlsx(productos) {
  const filas = productos.map((p) => {
    const row = { codigo: p.codigo };
    for (const c of COLS_EDITABLES) row[c] = MULTI.has(c) ? joinMulti(p[c]) : p[c] || '';
    row.medidas = Array.isArray(p.medidas) ? p.medidas.join(' | ') : p.medidas || '';
    row.estado = p.estado || '';
    row.fuente_desc = p.fuente_desc || '';
    row.pagina = p.pagina || '';
    row.tiene_foto = p.foto ? 'sí' : '';
    return row;
  });
  const ws = XLSX.utils.json_to_sheet(filas, { header: ['codigo', ...COLS_EDITABLES, ...CONTEXTO] });
  ws['!cols'] = [
    { wch: 10 }, { wch: 34 }, { wch: 55 }, { wch: 22 }, { wch: 22 }, { wch: 24 },
    { wch: 28 }, { wch: 40 }, { wch: 16 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 8 }, { wch: 9 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Catálogo');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/** Lee el xlsx subido y devuelve [{codigo, <campos editables>}] tal como vino. */
export function parseXlsx(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
  return filas
    .map((f) => {
      const codigo = String(f.codigo || f.Codigo || f['código'] || '').trim();
      if (!/^\d{5,8}$/.test(codigo)) return null;
      const out = { codigo };
      for (const c of COLS_EDITABLES) {
        if (!(c in f)) continue;
        out[c] = MULTI.has(c) ? splitMulti(f[c]) : String(f[c] == null ? '' : f[c]).trim();
      }
      return out;
    })
    .filter(Boolean);
}

/**
 * Compara las filas del Excel contra los productos actuales y arma la lista de
 * cambios (sólo lo que difiere). Devuelve { cambios: [{codigo, campos}], sinCambio, noEncontrados }.
 */
export function calcularCambios(filas, productos) {
  const idx = new Map(productos.map((p) => [p.codigo, p]));
  const cambios = [];
  const noEncontrados = [];
  let sinCambio = 0;

  for (const f of filas) {
    const p = idx.get(f.codigo);
    if (!p) { noEncontrados.push(f.codigo); continue; }
    const campos = {};
    for (const c of COLS_EDITABLES) {
      if (!(c in f)) continue;
      if (MULTI.has(c)) {
        const antes = (Array.isArray(p[c]) ? p[c] : []).map(normTxt).filter(Boolean);
        const ahora = f[c];
        if (antes.join(' | ').toLowerCase() !== ahora.map(normTxt).join(' | ').toLowerCase()) campos[c] = ahora;
      } else {
        const antes = normTxt(p[c]);
        const ahora = normTxt(f[c]);
        if (antes !== ahora) campos[c] = ahora || null;
      }
    }
    if (Object.keys(campos).length) cambios.push({ codigo: f.codigo, campos });
    else sinCambio++;
  }
  return { cambios, sinCambio, noEncontrados };
}
