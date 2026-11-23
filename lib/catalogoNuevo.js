import { createClient } from '@supabase/supabase-js';
import * as store from './catalogoStore';
import { usandoDB } from './db';
import { invalidarCache } from './catalogo';

// Para decidir y guardar se lee el producto EN VIVO (sin la copia guardada del catálogo):
// leer la copia guardada hacía que a veces el segundo paso pisara el primero con datos viejos.
const dbVivo = usandoDB
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
    })
  : null;

/**
 * Fotos del catálogo PDF 2026.04.32.
 * Al cargar ese catálogo, la foto de cada producto en el PDF se agregó como segunda foto
 * (galería) al lado de la principal, para que el admin elija cuál queda. Esas fotos se
 * reconocen por el final del nombre del archivo.
 */
export const MARCA_PDF = '-catalogo-2026-04-32.jpg';
export const esFotoPdf = (url) => typeof url === 'string' && url.endsWith(MARCA_PDF);

/** Productos que tienen la foto del PDF esperando decisión, y los que la recibieron como única foto. */
export async function listarCatalogoNuevo() {
  const todos = await store.leerTodos();
  const aElegir = [];
  const soloPdf = [];
  for (const p of todos) {
    if (p.oculto) continue;
    const pdf = (p.galeria || []).find(esFotoPdf);
    if (pdf && p.foto && !esFotoPdf(p.foto)) aElegir.push({ codigo: p.codigo, nombre: p.nombre || '', actual: p.foto, pdf });
    else if (esFotoPdf(p.foto) && p.foto_confianza !== 'manual' && !(p.flags || []).includes('NUEVO')) soloPdf.push({ codigo: p.codigo, nombre: p.nombre || '', pdf: p.foto });
  }
  const orden = (a, b) => a.codigo.localeCompare(b.codigo);
  return { aElegir: aElegir.sort(orden), soloPdf: soloPdf.sort(orden) };
}

/**
 * Deja UNA sola foto: cual = 'pdf' (la del catálogo nuevo pasa a principal y la anterior se quita)
 * o 'actual' (se queda la de siempre y se quita la del PDF).
 */
export async function elegirFoto(codigo, cual) {
  if (!dbVivo) throw new Error('Esta sección necesita la base de datos.');
  const { data: p, error } = await dbVivo.from('cat_productos').select('codigo, foto, galeria').eq('codigo', codigo).maybeSingle();
  if (error) throw new Error(error.message);
  if (!p) throw new Error('No existe el producto ' + codigo);
  const galeria = p.galeria || [];
  const pdf = galeria.find(esFotoPdf);
  if (!pdf) return { ok: true }; // ya estaba resuelto
  // Un solo guardado: queda una sola de las dos fotos y la otra se quita.
  const cambios = cual === 'pdf'
    ? { foto: pdf, foto_confianza: 'manual', galeria: galeria.filter((u) => u !== pdf && u !== p.foto) }
    : { galeria: galeria.filter((u) => u !== pdf) };
  const { error: e2 } = await dbVivo.from('cat_productos').update({ ...cambios, editado_en: new Date().toISOString() }).eq('codigo', codigo);
  if (e2) throw new Error(e2.message);
  invalidarCache();
  return { ok: true };
}

/** Saca la foto del PDF de un producto que la tenía como única foto (queda sin foto). */
export async function sacarFotoPdf(codigo) {
  if (!dbVivo) throw new Error('Esta sección necesita la base de datos.');
  const { data: p, error } = await dbVivo.from('cat_productos').select('foto').eq('codigo', codigo).maybeSingle();
  if (error) throw new Error(error.message);
  if (!p) throw new Error('No existe el producto ' + codigo);
  if (!esFotoPdf(p.foto)) return { ok: true };
  const { error: e2 } = await dbVivo.from('cat_productos').update({ foto: null, foto_confianza: null, editado_en: new Date().toISOString() }).eq('codigo', codigo);
  if (e2) throw new Error(e2.message);
  invalidarCache();
  return { ok: true };
}
