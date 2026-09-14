import { randomUUID } from 'crypto';
import { db, usandoDB } from './db';
import { normalizarProvincia } from './provincias';
import { avisarNuevoContacto } from './notificar';

/**
 * Contactos comerciales de la web (tabla cat_contactos, migración 0011).
 * Guardar funciona con la clave pública; leer y editar necesita SUPABASE_SERVICE_ROLE_KEY,
 * porque son datos personales y la clave pública viaja en el navegador.
 */

export const ESTADOS = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'contactado', label: 'Contactado' },
  { id: 'cliente', label: 'Cliente' },
  { id: 'descartado', label: 'Descartado' },
];

export const ORIGENES = {
  popup: 'Popup de bienvenida',
  contacto: 'Formulario de contacto',
  busqueda: 'Búsqueda sin resultado',
  maquina: 'Consulta por máquina',
  pedido: 'Pedido rápido',
  asistente: 'Asistente',
};

export const gestionDisponible = usandoDB && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

const corto = (v, n) => {
  const s = String(v ?? '').replace(/\s+/g, ' ').trim();
  return s ? s.slice(0, n) : null;
};

async function vendedoresQueRecibenContactos() {
  try {
    const { data, error } = await db
      .from('vendedores')
      .select('id,nombre,telefono,email,provincias,recibe_contactos,activo')
      .eq('activo', true);
    if (error) throw error;
    return (data || []).filter(v => v.recibe_contactos !== false);
  } catch {
    return []; // falta la migración 0011 o no hay DB: el contacto queda sin asignar
  }
}

/** Vendedor de la zona; si nadie cubre esa provincia, uno "general" (sin provincias); si no, cualquiera activo. */
export async function asignarVendedor(provincia) {
  const vendedores = await vendedoresQueRecibenContactos();
  if (!vendedores.length) return null;
  const deZona = provincia ? vendedores.filter(v => (v.provincias || []).includes(provincia)) : [];
  const generales = vendedores.filter(v => !(v.provincias || []).length);
  const candidatos = deZona.length ? deZona : generales.length ? generales : vendedores;
  return candidatos[Math.floor(Math.random() * candidatos.length)];
}

export async function guardarContacto(d) {
  if (!usandoDB) return { ok: false, error: 'Sin base de datos.' };
  const provincia = normalizarProvincia(d.provincia);
  const vendedor = await asignarVendedor(provincia);
  const fila = {
    id: randomUUID(),
    origen: ORIGENES[d.origen] ? d.origen : 'contacto',
    empresa: corto(d.empresa, 120),
    nombre: corto(d.nombre, 120),
    telefono: corto(d.telefono, 40),
    email: corto(d.email, 120),
    localidad: corto(d.localidad, 80),
    provincia,
    consulta: d.consulta ? String(d.consulta).trim().slice(0, 2000) : null,
    vendedor_id: vendedor?.id || null,
    visitante_id: d.visitanteId || null,
    meta: d.meta && typeof d.meta === 'object' ? d.meta : null,
  };
  try {
    const { error } = await db.from('cat_contactos').insert(fila);
    if (error) throw error;
  } catch {
    return { ok: false, error: 'No se pudo guardar.' };
  }
  try { await avisarNuevoContacto(fila, vendedor); } catch { /* el aviso es opcional */ }
  return {
    ok: true,
    id: fila.id,
    vendedor: vendedor ? { nombre: vendedor.nombre, telefono: vendedor.telefono || null } : null,
  };
}

export async function leerContactos({ estado, vendedor, q, limite = 500 } = {}) {
  if (!gestionDisponible) return { disponible: false, filas: [] };
  try {
    let consulta = db.from('cat_contactos').select('*').order('creado', { ascending: false }).limit(limite);
    if (estado) consulta = consulta.eq('estado', estado);
    if (vendedor === 'sin') consulta = consulta.is('vendedor_id', null);
    else if (vendedor) consulta = consulta.eq('vendedor_id', vendedor);
    const texto = String(q || '').replace(/[,()%*]/g, ' ').trim();
    if (texto) {
      consulta = consulta.or(
        ['empresa', 'nombre', 'telefono', 'localidad', 'provincia', 'consulta'].map(c => `${c}.ilike.%${texto}%`).join(',')
      );
    }
    const { data, error } = await consulta;
    if (error) throw error;
    return { disponible: true, filas: data || [] };
  } catch (e) {
    return { disponible: true, filas: [], error: e.message || 'No se pudieron leer los contactos.' };
  }
}

export async function contarContactosPorEstado() {
  const cuenta = Object.fromEntries(ESTADOS.map(e => [e.id, 0]));
  if (!gestionDisponible) return cuenta;
  try {
    const { data, error } = await db.from('cat_contactos').select('estado').limit(10000);
    if (error) throw error;
    for (const f of data || []) cuenta[f.estado] = (cuenta[f.estado] || 0) + 1;
  } catch { /* sin tabla todavía */ }
  return cuenta;
}

export async function actualizarContacto(id, { estado, vendedor_id, notas }) {
  if (!gestionDisponible || !id) return { ok: false };
  const cambios = { actualizado: new Date().toISOString() };
  if (ESTADOS.some(e => e.id === estado)) cambios.estado = estado;
  if (vendedor_id !== undefined) cambios.vendedor_id = vendedor_id || null;
  if (notas !== undefined) cambios.notas = notas ? String(notas).slice(0, 2000) : null;
  const { error } = await db.from('cat_contactos').update(cambios).eq('id', id);
  return { ok: !error, error: error?.message };
}
