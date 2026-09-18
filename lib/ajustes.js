import { db, usandoDB } from './db';
import { estadoTemporada } from './temporada';

/**
 * Ajustes del sitio guardados en cat_config.ajustes (JSON), editables desde el admin.
 *   temporada:          'auto' | 'cesped' | 'poda' | 'pre-cesped' | 'pre-poda'
 *   estadisticasDesde:  fecha ISO del último reinicio de estadísticas
 * Sin base de datos (o sin la migración 0012) todo vuelve a los valores por defecto.
 */

const TTL = 60 * 1000;
let cache = null;
let cacheAt = 0;

export async function leerAjustes() {
  if (!usandoDB) return {};
  if (cache && Date.now() - cacheAt < TTL) return cache;
  try {
    const { data, error } = await db.from('cat_config').select('ajustes').eq('id', 1).single();
    if (error) throw error;
    cache = data?.ajustes || {};
  } catch {
    cache = {};
  }
  cacheAt = Date.now();
  return cache;
}

export async function guardarAjustes(cambios) {
  if (!usandoDB) return { ok: false, error: 'No disponible sin base de datos.' };
  const actuales = await leerAjustes();
  const ajustes = { ...actuales, ...cambios };
  const { error } = await db.from('cat_config').upsert({ id: 1, ajustes, actualizado: new Date().toISOString() });
  if (error) {
    return {
      ok: false,
      error: /ajustes/.test(error.message)
        ? 'Falta correr la migración 0012 en Supabase (supabase/migrations/0012_ajustes.sql).'
        : 'No se pudo guardar el cambio.',
    };
  }
  cache = ajustes;
  cacheAt = Date.now();
  return { ok: true };
}

/** Estado de temporada vigente (modo del admin, o automático por fecha). */
export async function temporadaVigente(fecha = new Date()) {
  const { temporada } = await leerAjustes();
  return estadoTemporada(temporada || 'auto', fecha);
}
