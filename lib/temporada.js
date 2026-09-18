/**
 * Lógica comercial de temporadas de Logbelts: ÚNICA fuente de verdad para decidir
 * qué familias tienen protagonismo en la web según la época del año.
 *
 *   Temporada de césped ........ septiembre → abril
 *   Temporada de poda y otoño .. mayo → agosto
 *   Pretemporada ............... el mes anterior a que empiece cada temporada
 *                                (agosto prepara césped, abril prepara poda)
 *
 * Nunca se ocultan productos por temporada: sólo cambia el orden y la exposición.
 * El modo se puede forzar desde el admin (/admin/temporada); si no, se calcula por fecha.
 * Para cambiar prioridades, textos o meses, se edita sólo este archivo.
 */

export const TEMPORADAS = {
  cesped: {
    id: 'cesped',
    nombre: 'Temporada de césped',
    meses: [9, 10, 11, 12, 1, 2, 3, 4],
    // Familias con protagonismo (por slug, en orden de prioridad)
    familias: ['desmalezadoras', 'minitractores', 'maquinas-de-cortar-cesped', 'motores-4t-y-generadores'],
    antetitulo: 'Temporada de césped · septiembre a abril',
    titulo: 'Prepará tu stock para la temporada de césped',
    bajada: 'Desmalezadoras, minitractores y todos sus repuestos: lo que más se mueve de septiembre a abril.',
  },
  poda: {
    id: 'poda',
    nombre: 'Temporada de poda y otoño',
    meses: [5, 6, 7, 8],
    familias: ['motosierras', 'sistemas-de-arranque', 'carburacion'],
    antetitulo: 'Temporada de poda y otoño · mayo a agosto',
    titulo: 'Prepará tu stock para la temporada de poda',
    bajada: 'Motosierras, cadenas, espadas, piñones y sistemas de arranque: lo que más se mueve de mayo a agosto.',
  },
};

/** Mes de pretemporada de cada temporada (el anterior a su inicio). */
export const PRETEMPORADA = { cesped: 8, poda: 4 };

/** Modos que se pueden elegir en el admin. */
export const MODOS = [
  { id: 'auto', nombre: 'Automático (según la fecha)' },
  { id: 'cesped', nombre: 'Temporada de césped' },
  { id: 'poda', nombre: 'Temporada de poda y otoño' },
  { id: 'pre-cesped', nombre: 'Pretemporada de césped' },
  { id: 'pre-poda', nombre: 'Pretemporada de poda' },
];

/**
 * Familias fijas al comienzo de "Todo el catálogo por familia", en este orden exacto
 * (pedido de Logbelts: no se alteran con la temporada).
 */
export const FAMILIAS_INICIO = ['desmalezadoras', 'minitractores', 'motosierras'];

const coincide = (slug, clave) => slug === clave || slug.startsWith(`${clave}-`) || slug.startsWith(clave.replace(/s$/, ''));

/**
 * Estado de temporada para una fecha y un modo.
 * Devuelve { modo, actual, pre, foco, temporada } donde:
 *  - actual: temporada del calendario ('cesped' | 'poda')
 *  - pre:    temporada que se está preparando (o null)
 *  - foco:   temporada que tiene el protagonismo en la web (en pretemporada, la que viene)
 */
export function estadoTemporada(modo = 'auto', fecha = new Date()) {
  const mes = fecha.getMonth() + 1;
  const delCalendario = TEMPORADAS.cesped.meses.includes(mes) ? 'cesped' : 'poda';
  let actual = delCalendario;
  let pre = null;

  if (modo === 'cesped' || modo === 'poda') actual = modo;
  else if (modo === 'pre-cesped') pre = 'cesped';
  else if (modo === 'pre-poda') pre = 'poda';
  else {
    modo = 'auto';
    if (mes === PRETEMPORADA.cesped) pre = 'cesped';
    else if (mes === PRETEMPORADA.poda) pre = 'poda';
  }
  if (pre === actual) pre = null;

  const foco = pre || actual;
  return { modo, actual, pre, foco, temporada: TEMPORADAS[foco] };
}

/**
 * Ordena las familias para mostrarlas: primero las fijas de inicio, después las que tienen
 * protagonismo en la temporada en foco y al final el resto por cantidad de productos.
 * Recibe objetos con { slug, count } y no descarta ninguno.
 */
export function ordenarFamilias(familias, estado) {
  const prioridad = [...FAMILIAS_INICIO, ...(estado?.temporada?.familias || [])];
  const rango = (f) => {
    const i = prioridad.findIndex((clave) => coincide(f.slug, clave));
    return i === -1 ? Infinity : i;
  };
  return familias
    .map((f, i) => ({ f, i, r: rango(f) }))
    .sort((a, b) => a.r - b.r || (b.f.count || 0) - (a.f.count || 0) || a.i - b.i)
    .map((x) => x.f);
}

/** ¿La familia tiene protagonismo en la temporada en foco? */
export function esDeTemporada(slug, estado) {
  return (estado?.temporada?.familias || []).some((clave) => coincide(slug, clave));
}
