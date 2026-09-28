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
 *  · Las tablas del catálogo (productos, categorías, despieces, configuración, distribuidores) se guardan con la etiqueta 'catalogo'. Gracias a eso
 *    las páginas del sitio se pueden guardar ya armadas en la red de Vercel. Cuando se edita
 *    algo en el panel, `refrescarCatalogo()` (lib/revalidar.js) borra esa etiqueta y el cambio
 *    se ve enseguida. Como red de seguridad, igual se renueva sola cada hora, por si
 *    alguien tocara la base directo desde Supabase.
 *  · TODO LO DEMÁS (métricas, visitas, contactos, configuración) se lee siempre en vivo.
 */
const ETIQUETA_CATALOGO = 'catalogo';

// Las tablas que arman el sitio público y sólo cambian cuando se edita algo en el panel.
// Las de métricas, visitas, contactos y pedidos NO están acá: ésas se leen siempre en vivo.
const TABLAS_DEL_CATALOGO = ['cat_productos', 'cat_categorias', 'cat_despieces', 'cat_config', 'cat_distribuidores'];

const esLecturaDelCatalogo = (input, init) => {
  const metodo = (init?.method || 'GET').toUpperCase();
  if (metodo !== 'GET') return false;
  const url = typeof input === 'string' ? input : input?.url || '';
  return TABLAS_DEL_CATALOGO.some((t) => url.includes('/rest/v1/' + t));
};

const fetchCatalogo = (input, init) =>
  esLecturaDelCatalogo(input, init)
    ? fetch(input, { ...init, next: { tags: [ETIQUETA_CATALOGO], revalidate: 3600 } })
    : fetch(input, { ...init, cache: 'no-store' });

export const db = usandoDB
  ? createClient(url, key, {
      auth: { persistSession: false },
      global: { fetch: fetchCatalogo },
    })
  : null;
