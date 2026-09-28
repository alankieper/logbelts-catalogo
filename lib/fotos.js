import listaMini from '../data/fotos-mini.json';

/**
 * Direcciones de las fotos de producto.
 *
 * Cada foto guardada en public/fotos tiene una versión liviana de 400 px en
 * public/fotos/m (ver data/scripts/fotos-miniaturas.mjs). En los LISTADOS se usa
 * esa, porque se cargan decenas de fotos juntas y se ven chicas. En la FICHA del
 * producto se usa la original, que es la que se ve grande y tiene zoom.
 *
 * Si una foto todavía no tiene su versión liviana (por ejemplo, una recién subida
 * desde el panel, que vive en Supabase), se devuelve la original: nunca queda rota.
 */

const CON_MINI = new Set(listaMini);

const esRemota = (foto) => /^https?:\/\//.test(foto);

/** Dirección de la foto tal cual está guardada (la grande). */
export function fotoOriginal(foto) {
  if (!foto) return null;
  return esRemota(foto) ? foto : `/fotos/${foto}`;
}

/** Dirección de la versión liviana para listados; cae a la original si no existe. */
export function fotoMini(foto) {
  if (!foto) return null;
  if (esRemota(foto)) return foto;
  if (!CON_MINI.has(foto)) return `/fotos/${foto}`;
  return `/fotos/m/${foto.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;
}
