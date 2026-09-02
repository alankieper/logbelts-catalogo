import { db, usandoDB } from './db';

/**
 * Media de producto (fotos y videos) en Supabase Storage, bucket público 'media'.
 * La SUBIDA se hace directo desde el navegador del admin (ver components/SubirMedia.js)
 * para no chocar con el límite de tamaño de las server actions / funciones de Vercel.
 * Acá sólo queda el borrado del archivo cuando se reemplaza o se quita.
 */

export const BUCKET = 'media';
export const MAX_FOTO = 15 * 1024 * 1024;   // 15 MB
export const MAX_VIDEO = 80 * 1024 * 1024;  // 80 MB

/** Borra un archivo del bucket a partir de su URL pública (si es de nuestro bucket). */
export async function borrarMediaPorUrl(url) {
  if (!usandoDB || !url) return;
  const m = String(url).match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
  if (!m) return;
  try { await db.storage.from(BUCKET).remove([decodeURIComponent(m[1])]); } catch {}
}
