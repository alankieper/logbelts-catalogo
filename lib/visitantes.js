import { db, usandoDB } from './db';

/**
 * Visitantes del catálogo público que completaron el acceso (empresa/nombre
 * + teléfono). Sólo funciona en modo DB — en modo archivo local no registra
 * nada (igual que el resto de las métricas, ver lib/eventos.js).
 */

export async function registrarVisitante({ empresaNombre, telefono }) {
  if (!usandoDB) return { ok: false, error: 'No disponible en modo local.' };
  const empresa = String(empresaNombre || '').trim().slice(0, 120);
  const tel = String(telefono || '').trim().slice(0, 40);
  if (!empresa || !tel) return { ok: false, error: 'Faltan datos.' };
  try {
    const { data, error } = await db
      .from('cat_visitantes')
      .insert({ empresa_nombre: empresa, telefono: tel })
      .select('id')
      .single();
    if (error) throw error;
    return { ok: true, id: data.id };
  } catch {
    return { ok: false, error: 'No se pudo registrar.' };
  }
}

/** Últimos visitantes (para el panel de métricas). */
export async function leerVisitantes(limite = 2000) {
  if (!usandoDB) return [];
  try {
    const { data, error } = await db
      .from('cat_visitantes')
      .select('id,empresa_nombre,telefono,creado')
      .order('creado', { ascending: false })
      .limit(limite);
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function obtenerVisitante(id) {
  if (!usandoDB || !id) return null;
  try {
    const { data, error } = await db
      .from('cat_visitantes')
      .select('id,empresa_nombre,telefono,creado')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}
