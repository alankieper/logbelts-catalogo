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
      visitante_id: ev.visitanteId || null,
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
      visitante_id: v.visitanteId || null,
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
  return leerTabla('cat_visitas', dias, 'id,ip_hash,pais,ciudad,region,ref,visitante_id,creado');
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
        .select('tipo,q,codigo,n,meta,visitante_id,creado')
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

/** Todos los eventos de un visitante puntual (para ver qué buscó/vio). */
export async function leerEventosDeVisitante(visitanteId, limite = 500) {
  if (!usandoDB || !visitanteId) return [];
  try {
    const { data, error } = await db
      .from('cat_eventos')
      .select('tipo,q,codigo,n,meta,creado')
      .eq('visitante_id', visitanteId)
      .order('creado', { ascending: false })
      .limit(limite);
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

/** Última actividad (de cualquier tipo) de cada visitante que alguna vez hizo algo, sin límite de días. */
export async function leerUltimaActividadPorVisitante(limite = 8000) {
  if (!usandoDB) return new Map();
  try {
    const { data, error } = await db
      .from('cat_eventos')
      .select('visitante_id, creado')
      .not('visitante_id', 'is', null)
      .order('creado', { ascending: false })
      .limit(limite);
    if (error) throw error;
    const m = new Map();
    for (const row of data || []) {
      if (!m.has(row.visitante_id)) m.set(row.visitante_id, row.creado);
    }
    return m;
  } catch {
    return new Map();
  }
}

/** Días (sesiones) en que entró un visitante puntual, para ver "entró el 2/7, 5/7...". */
export async function leerVisitasDeVisitante(visitanteId, limite = 500) {
  if (!usandoDB || !visitanteId) return [];
  try {
    const { data, error } = await db
      .from('cat_visitas')
      .select('creado')
      .eq('visitante_id', visitanteId)
      .order('creado', { ascending: false })
      .limit(limite);
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}
