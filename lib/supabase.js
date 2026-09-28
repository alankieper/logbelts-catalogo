import { createClient } from '@supabase/supabase-js';

/**
 * Conexión a Supabase para código del SERVIDOR (páginas del panel, server actions, rutas /api).
 * Nunca importar desde un componente 'use client'.
 *
 * Usa la clave de servicio si está disponible: desde la migración 0015 la clave pública ya no
 * puede escribir ni leer datos privados. Si falta, cae a la clave pública (útil en desarrollo).
 *
 * La conexión se arma la primera vez que se usa, no al importar el archivo: así una variable
 * de entorno faltante no rompe el build entero.
 */

let _cliente = null;

function cliente() {
  if (_cliente) return _cliente;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Faltan las variables de Supabase (NEXT_PUBLIC_SUPABASE_URL y la clave).');
  _cliente = createClient(url, key, {
    auth: { persistSession: false },
    // Next.js cachea fetch() por default en Server Components/Route Handlers, incluso con
    // `dynamic = 'force-dynamic'`. Sin esto, una fila nueva puede no aparecer hasta que algo revalide.
    global: { fetch: (url2, options) => fetch(url2, { ...options, cache: 'no-store' }) },
  });
  return _cliente;
}

export const supabase = new Proxy(
  {},
  {
    get(_destino, prop) {
      const c = cliente();
      const valor = c[prop];
      return typeof valor === 'function' ? valor.bind(c) : valor;
    },
  }
);
