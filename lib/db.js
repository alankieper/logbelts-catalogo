import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase para el servidor.
 * Si no hay credenciales, `usandoDB` es false y el resto del código
 * cae automáticamente al archivo data/productos.json (modo local).
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Prende con CATALOGO_USA_DB=1 (después de correr la migración y el seed).
// Sin eso, o sin credenciales, usa data/productos.json (modo local).
export const usandoDB = !!(url && key && process.env.CATALOGO_USA_DB === '1');

/**
 * Cómo se cachean las lecturas.
 *
 * Next.js 14 cachea por defecto TODA llamada fetch, y supabase-js usa fetch por debajo:
 * sin control, los datos quedaban congelados hasta el próximo deploy.
 *
 * Ahora hay dos comportamientos:
 *  · La LISTA DE PRODUCTOS (cat_productos) se guarda con la etiqueta 'catalogo'. Gracias a eso
 *    las páginas del sitio se pueden guardar ya armadas en la red de Vercel. Cuando se edita
 *    algo en el panel, `refrescarCatalogo()` (lib/revalidar.js) borra esa etiqueta y el cambio
 *    se ve enseguida. Como red de seguridad, igual se renueva sola cada minuto, por si
 *    alguien tocara la base directo desde Supabase.
 *  · TODO LO DEMÁS (métricas, visitas, contactos, configuración) se lee siempre en vivo.
 */
const ETIQUETA_CATALOGO = 'catalogo';

const esLecturaDeProductos = (input, init) => {
  const metodo = (init?.method || 'GET').toUpperCase();
  if (metodo !== 'GET') return false;
  const url = typeof input === 'string' ? input : input?.url || '';
  return url.includes('/rest/v1/cat_productos');
};

const fetchCatalogo = (input, init) =>
  esLecturaDeProductos(input, init)
    ? fetch(input, { ...init, next: { tags: [ETIQUETA_CATALOGO], revalidate: 60 } })
    : fetch(input, { ...init, cache: 'no-store' });

export const db = usandoDB
  ? createClient(url, key, {
      auth: { persistSession: false },
      global: { fetch: fetchCatalogo },
    })
  : null;
