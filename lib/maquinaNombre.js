/**
 * Nombres de máquina del campo "Despiece" de cada producto.
 *
 * Cada producto tiene una lista `despiece` con las máquinas a las que corresponde, escritas como
 * "Stihl FS 55", "Husqvarna 143R", "Honda GX 160". Dos productos quedan vinculados a la MISMA máquina
 * cuando su nombre normalizado coincide: se ignoran mayúsculas, espacios, guiones, puntos y tildes
 * ("FS55", "fs-55" y "FS 55" son la misma máquina).
 *
 * Sin dependencias de servidor: lo usan el sitio, el admin y los scripts de data/scripts.
 */

// Marcas que se reconocen al principio del nombre ("Stihl FS 55" -> marca Stihl, modelo FS 55).
// Van de la más larga a la más corta para que "Oleo Mac" gane sobre un posible "Oleo".
export const MARCAS_MAQUINA = [
  'Briggs & Stratton', 'John Deere', 'Oleo Mac', 'McCulloch', 'Husqvarna', 'Shindaiwa', 'Kawasaki',
  'Homelite', 'Tecumseh', 'Jonsered', 'Motomel', 'Partner', 'Dolmar', 'Makita', 'Zenoah', 'Tanaka',
  'Poulan', 'Kohler', 'Loncin', 'Robin', 'Stihl', 'Honda', 'Chinas', 'Echo', 'Efco', 'MTD', 'Toro',
].sort((a, b) => b.length - a.length);

// Prefijos de modelo que ya indican la marca (misma regla que usa el resto del sitio)
const PREFIJOS = [
  [/^(MS|MSE|MSA|FS|FSA|FC|HS|HSA|HL|HT|KM|BG|BR|SR|TS|FR|KA|RE|SE|SH|BT)\b/, 'Stihl'],
  [/^(GX|GXV|GC|GCV|EU|EX|EB|EG|EM|WX|WB)\b/, 'Honda'],
  [/^(SRM|DSRM|PB|PPT|PAS|DPB|CS|GT|SHC|HC)\b/, 'Echo'],
  [/^(GS|SP|BC|PM|OM|EF|GST)\b/, 'Oleo Mac'],
  [/^(YTH|GTH|RZT|CTH|LT|YT|CT|TC)\b/, 'Husqvarna'],
];

const sinTildes = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Clave de comparación: "FS-55 " -> "fs55". */
export function claveTexto(s) {
  return sinTildes(s).toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function slugTexto(s) {
  return sinTildes(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Forma prolija del modelo: "fs55" -> "FS 55", "ms-250c" -> "MS 250C", "143r" -> "143R". */
export function formatoModelo(s) {
  let t = sinTildes(s).toUpperCase().replace(/[\s_]+/g, ' ').trim();
  t = t.replace(/^([A-Z]{1,5})[\s.-]*(\d)/, '$1 $2');
  return t.replace(/(\d)\s+(?=[A-Z]{1,3}$)/, '$1');
}

function marcaDelPrefijo(modelo) {
  const m = formatoModelo(modelo);
  for (const [re, marca] of PREFIJOS) if (re.test(m)) return marca;
  return null;
}

/**
 * "Stihl FS 55" -> { marca: 'Stihl', modelo: 'FS 55', clave: 'stihl|fs55' }
 * Si no dice la marca, se deduce del prefijo del modelo (FS -> Stihl) o de la marca del producto.
 */
export function parsearMaquina(valor, marcaProducto = null) {
  const texto = String(valor || '').replace(/\s+/g, ' ').trim();
  if (!texto) return null;
  let marca = null;
  let modelo = texto;
  const plano = sinTildes(texto).toLowerCase();
  for (const m of MARCAS_MAQUINA) {
    const pm = sinTildes(m).toLowerCase();
    if (plano === pm) return null; // sólo la marca, sin modelo
    if (plano.startsWith(pm + ' ') || plano.startsWith(pm + '-')) {
      marca = m;
      modelo = texto.slice(m.length).replace(/^[\s-]+/, '');
      break;
    }
  }
  if (!claveTexto(modelo)) return null;
  if (!marca) marca = marcaDelPrefijo(modelo) || marcaProducto || 'Genérico';
  const mod = formatoModelo(modelo);
  return { marca, modelo: mod, clave: `${slugTexto(marca)}|${claveTexto(mod)}`, texto: `${marca} ${mod}` };
}

/** Texto del campo (lista o "a, b; c | d") -> lista de nombres limpios, sin repetidos. */
export function listaDespiece(valor) {
  const arr = Array.isArray(valor) ? valor : String(valor || '').split(/[,;|\n]/);
  const vistos = new Set();
  const out = [];
  for (const x of arr) {
    const t = String(x || '').replace(/\s+/g, ' ').trim();
    const k = claveTexto(t);
    if (!k || vistos.has(k)) continue;
    vistos.add(k);
    out.push(t);
  }
  return out;
}
