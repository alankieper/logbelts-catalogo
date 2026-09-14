/**
 * Links de despiece a diyspareparts.com, directos a la página de diagramas de cada modelo
 * (formato https://www.diyspareparts.com/parts/<marca>/diagrams/<modelo>/). Nunca a buscadores.
 *
 * Ese sitio no tiene página para todos los modelos del catálogo y los nombres no siguen una regla
 * fija (fs160 y ms250 existen; fs38, bg55 o hs81 no). Por eso:
 * - Modelos verificados (DIRECTOS) -> link directo al modelo.
 * - Resto de marcas presentes en el sitio -> índice de diagramas de la marca.
 * - Marcas que no están en el sitio -> sin link.
 * Los links cargados en Admin > Manuales (despieces curados) tienen prioridad sobre estos.
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

// Páginas de modelo verificadas: "Marca|Modelo" (como figura en el catálogo) -> slug del sitio.
const DIRECTOS = {
  'Stihl|FS 160': 'fs160',
  'Stihl|MS 250': 'ms250',
  'Stihl|MS 170': 'ms170',
};

const plano = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const DIRECTOS_PLANOS = Object.fromEntries(
  Object.entries(DIRECTOS).map(([clave, slug]) => {
    const [marca, modelo] = clave.split('|');
    return [`${marca}|${plano(modelo)}`, slug];
  })
);

/** { url, label, directo } o null si no hay despiece online para esa marca. */
export function linkDespiece(marca, modelo) {
  const slugMarca = MARCAS_DIY[marca];
  if (!slugMarca) return null;
  const slugModelo = DIRECTOS_PLANOS[`${marca}|${plano(modelo)}`];
  if (slugModelo) {
    return { url: `${BASE}/${slugMarca}/diagrams/${slugModelo}/`, label: `Despiece ${marca} ${modelo}`, directo: true };
  }
  return { url: `${BASE}/${slugMarca}/diagrams/`, label: `Despieces ${marca}`, directo: false };
}
