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

export const db = usandoDB
  ? createClient(url, key, { auth: { persistSession: false } })
  : null;
