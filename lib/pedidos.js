import { randomUUID } from 'crypto';
import { db, usandoDB } from './db';
import { gestionDisponible } from './contactos';

/** Pedidos enviados desde la web (tabla cat_pedidos, migración 0011). Sin precios: los cotiza el vendedor. */

export function limpiarItems(items) {
  if (!Array.isArray(items)) return [];
  const vistos = new Map();
  for (const it of items.slice(0, 300)) {
    const codigo = String(it?.codigo || '').trim().slice(0, 20);
    if (!codigo) continue;
    const cant = Math.min(9999, Math.max(1, Math.trunc(Number(it?.cant) || 1)));
    const previo = vistos.get(codigo);
    if (previo) previo.cant = Math.min(9999, previo.cant + cant);
    else vistos.set(codigo, { codigo, nombre: String(it?.nombre || '').trim().slice(0, 160), cant });
  }
  return [...vistos.values()];
}

export async function guardarPedido({ items, visitanteId, origen = 'lista' }) {
  const limpios = limpiarItems(items);
  if (!usandoDB || !limpios.length) return { ok: false };
  try {
    const { error } = await db.from('cat_pedidos').insert({
      id: randomUUID(),
      origen: origen === 'rapido' ? 'rapido' : 'lista',
      visitante_id: visitanteId || null,
      items: limpios,
      n: limpios.length,
    });
    if (error) throw error;
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function leerPedidos(limite = 200) {
  if (!gestionDisponible) return [];
  try {
    const { data, error } = await db.from('cat_pedidos').select('*').order('creado', { ascending: false }).limit(limite);
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}
