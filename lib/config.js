import { db, usandoDB } from './db';

/**
 * Interruptor "Login clientes": si está prendido, el middleware exige
 * completar empresa/nombre + teléfono (una sola vez, por cookie) antes de
 * ver el catálogo público. Sólo funciona en modo DB (igual que el resto
 * de las métricas) — en modo archivo local queda siempre apagado.
 */

export async function gateClientesActivo() {
  if (!usandoDB) return false;
  try {
    const { data, error } = await db.from('cat_config').select('gate_clientes').eq('id', 1).single();
    if (error) throw error;
    return !!data?.gate_clientes;
  } catch {
    return false;
  }
}

export async function setGateClientes(activo) {
  if (!usandoDB) return { ok: false, error: 'No disponible en modo local (sin base de datos).' };
  try {
    const { error } = await db
      .from('cat_config')
      .upsert({ id: 1, gate_clientes: !!activo, actualizado: new Date().toISOString() });
    if (error) throw error;
    return { ok: true };
  } catch {
    return { ok: false, error: 'No se pudo guardar el cambio.' };
  }
}
