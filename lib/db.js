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

// fetch sin caché: Next.js 14 (App Router) cachea por defecto TODA llamada fetch,
// y supabase-js usa fetch por debajo -> los datos quedaban "congelados" en Vercel
// hasta el próximo deploy. Con `cache: 'no-store'` cada lectura va siempre a la DB.
const fetchSinCache = (input, init) => fetch(input, { ...init, cache: 'no-store' });

export const db = usandoDB
  ? createClient(url, key, {
      auth: { persistSession: false },
      global: { fetch: fetchSinCache },
    })
  : null;
