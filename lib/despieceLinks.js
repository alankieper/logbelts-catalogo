/**
 * Links de despiece a diyspareparts.com, directos a la página de diagramas de cada modelo
 * (formato https://www.diyspareparts.com/parts/<marca>/diagrams/<modelo>/). Nunca a buscadores.
 *
 * - Stihl: formato verificado (fs160, ms250) -> link directo al modelo.
 * - Otras marcas usan nombres de modelo distintos en ese sitio -> índice de diagramas de la marca,
 *   salvo que el modelo esté cargado a mano en DIRECTOS.
 * - Marcas que no están en ese sitio -> sin link.
 */

const BASE = 'https://www.diyspareparts.com/parts';

// Marcas con índice de diagramas en diyspareparts.com (verificado).
export const MARCAS_DIY = {
  Stihl: 'stihl',
  Husqvarna: 'husqvarna',
  Echo: 'echo',
  'Oleo Mac': 'oleo-mac',
  Honda: 'honda',
  Homelite: 'homelite',
  Kohler: 'kohler',
  MTD: 'mtd',
  Murray: 'murray',
  Jonsered: 'jonsered',
  McCulloch: 'mcculloch',
  'John Deere': 'john-deere',
  'Cub Cadet': 'cub-cadet',
};

// Modelos de otras marcas con página verificada a mano: "Marca|Modelo" -> slug del sitio.
const DIRECTOS = {};

// "FS 160" -> fs160, "FS 161/221" -> fs161, "MS 250" -> ms250. Solo modelos con prefijo de letras + número.
function slugStihl(modelo) {
  const primero = String(modelo || '').split('/')[0].trim();
  if (!/^[A-Z]{2,3}\s*-?\s*\d{2,3}[A-Z]?$/i.test(primero)) return null;
  return primero.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** { url, label, directo } o null si no hay despiece online para esa marca. */
export function linkDespiece(marca, modelo) {
  const slugMarca = MARCAS_DIY[marca];
  if (!slugMarca) return null;
  const slugModelo = DIRECTOS[`${marca}|${modelo}`] || (marca === 'Stihl' ? slugStihl(modelo) : null);
  if (slugModelo) {
    return { url: `${BASE}/${slugMarca}/diagrams/${slugModelo}/`, label: `Despiece ${marca} ${modelo}`, directo: true };
  }
  return { url: `${BASE}/${slugMarca}/diagrams/`, label: `Despieces ${marca}`, directo: false };
}
