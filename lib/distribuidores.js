import { randomUUID } from 'crypto';
import { db, usandoDB } from './db';
import { CAPITALES, normalizarProvincia } from './provincias';
import { CIUDADES_AR, normalizarCiudad } from '../app/admin/metricas/mapaArgentina';

/** Distribuidores públicos para "Dónde comprar" (tabla cat_distribuidores, migración 0011). */

export const escrituraDisponible = usandoDB && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

// Ubicación en el mapa: coordenadas cargadas > ciudad conocida > capital de la provincia.
function conUbicacion(d) {
  if (d.lat != null && d.lng != null) return { ...d, coord: [d.lng, d.lat], aproximado: false };
  const ciudad = CIUDADES_AR[normalizarCiudad(d.localidad || '')];
  if (ciudad) return { ...d, coord: ciudad, aproximado: false };
  return { ...d, coord: CAPITALES[d.provincia] || null, aproximado: true };
}

export async function leerDistribuidores({ incluirOcultos = false } = {}) {
  if (!usandoDB) return [];
  try {
    const { data, error } = await db
      .from('cat_distribuidores')
      .select('*')
      .order('provincia', { ascending: true })
      .order('orden', { ascending: true })
      .order('nombre', { ascending: true });
    if (error) throw error;
    return (data || []).filter(d => incluirOcultos || d.publico).map(conUbicacion);
  } catch {
    return []; // falta la migración 0011
  }
}

const corto = (v, n) => {
  const s = String(v ?? '').replace(/\s+/g, ' ').trim();
  return s ? s.slice(0, n) : null;
};
const numero = v => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export async function guardarDistribuidor(datos) {
  if (!escrituraDisponible) return { ok: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY.' };
  const fila = {
    nombre: corto(datos.nombre, 120),
    direccion: corto(datos.direccion, 160),
    localidad: corto(datos.localidad, 80),
    provincia: normalizarProvincia(datos.provincia),
    telefono: corto(datos.telefono, 40),
    whatsapp: corto(datos.whatsapp, 40),
    lat: numero(datos.lat),
    lng: numero(datos.lng),
    publico: datos.publico !== false,
    orden: Math.trunc(Number(datos.orden) || 0),
  };
  if (!fila.nombre) return { ok: false, error: 'Falta el nombre.' };
  const q = datos.id
    ? db.from('cat_distribuidores').update(fila).eq('id', datos.id)
    : db.from('cat_distribuidores').insert({ id: randomUUID(), ...fila });
  const { error } = await q;
  return { ok: !error, error: error?.message };
}

export async function borrarDistribuidor(id) {
  if (!escrituraDisponible || !id) return { ok: false };
  const { error } = await db.from('cat_distribuidores').delete().eq('id', id);
  return { ok: !error, error: error?.message };
}
