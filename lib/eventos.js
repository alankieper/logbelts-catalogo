import { db, usandoDB } from './db';

/**
 * Registro de eventos (búsquedas, consultas, pedidos) y lectura para el panel
 * de métricas. Si la tabla cat_eventos todavía no existe (falta la migración 0006)
 * o no hay DB, todo devuelve vacío sin romper el sitio.
 */

const TIPOS = new Set(['busqueda', 'consulta', 'lista_add', 'lista_envio', 'ver']);

export async function registrar(ev) {
  if (!usandoDB || !ev || !TIPOS.has(ev.tipo)) return;
  try {
    const fila = {
      tipo: ev.tipo,
      q: ev.q ? String(ev.q).slice(0, 160) : null,
      codigo: ev.codigo ? String(ev.codigo).slice(0, 20) : null,
      n: Number.isFinite(ev.n) ? Math.trunc(ev.n) : null,
      meta: ev.meta && typeof ev.meta === 'object' ? ev.meta : null,
    };
    await db.from('cat_eventos').insert(fila);
  } catch {
    /* silencioso: nunca frenar la navegación por un evento */
  }
}

export async function registrarVisita(v) {
  if (!usandoDB || !v) return;
  try {
    await db.from('cat_visitas').insert({
      ip_hash: v.ip_hash || null,
      pais: v.pais || null,
      ciudad: v.ciudad ? String(v.ciudad).slice(0, 80) : null,
      region: v.region || null,
      path: v.path ? String(v.path).slice(0, 120) : null,
      ref: v.ref ? String(v.ref).slice(0, 80) : null,
    });
  } catch {
    /* silencioso */
  }
}

async function leerTabla(tabla, dias, cols) {
  if (!usandoDB) return [];
  const desde = new Date(Date.now() - dias * 86400000).toISOString();
  try {
    let todos = [];
    let offset = 0;
    while (offset < 40000) {
      const { data, error } = await db
        .from(tabla)
        .select(cols)
        .gte('creado', desde)
        .order('creado', { ascending: false })
        .range(offset, offset + 999);
      if (error) throw error;
      todos = todos.concat(data || []);
      if (!data || data.length < 1000) break;
      offset += 1000;
    }
    return todos;
  } catch {
    return [];
  }
}

/** Visitas de los últimos `dias` días. */
export async function leerVisitas(dias = 30) {
  return leerTabla('cat_visitas', dias, 'id,ip_hash,pais,ciudad,region,ref,creado');
}

/** Trae los eventos de los últimos `dias` días (máx 20000). */
export async function leerEventos(dias = 30) {
  if (!usandoDB) return [];
  const desde = new Date(Date.now() - dias * 86400000).toISOString();
  try {
    let todos = [];
    let offset = 0;
    while (offset < 20000) {
      const { data, error } = await db
        .from('cat_eventos')
        .select('tipo,q,codigo,n,meta,creado')
        .gte('creado', desde)
        .order('creado', { ascending: false })
        .range(offset, offset + 999);
      if (error) throw error;
      todos = todos.concat(data || []);
      if (!data || data.length < 1000) break;
      offset += 1000;
    }
    return todos;
  } catch {
    return [];
  }
}
