import { NextResponse } from 'next/server';
import { esAdmin } from './lib/admins';

/**
 * El catálogo es público. Sólo /admin y las herramientas internas piden login.
 *
 * Además, si el interruptor "Login clientes" está prendido (tabla cat_config,
 * se activa/desactiva desde /admin/metricas), el catálogo público entero pide
 * completar empresa/nombre + teléfono en /acceso antes de dejar ver nada —
 * una sola vez por navegador (cookie `lb_visitante`, no se vuelve a pedir
 * hasta que la borren). Ese identificador después viaja en cada evento
 * (búsqueda, vista de producto, etc.) para poder ver qué buscó cada uno.
 */

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const USANDO_DB = !!(SUPA_URL && SUPA_KEY && process.env.CATALOGO_USA_DB === '1');

const GATE_TTL = 20 * 1000;
let gateCache = { valor: false, at: 0 };

// Fetch directo a PostgREST (sin supabase-js) para no arriesgar compatibilidad
// con el runtime Edge de Next.js, que corre el middleware en cada request.
async function gateClientesActivo() {
  if (!USANDO_DB) return false;
  if (Date.now() - gateCache.at < GATE_TTL) return gateCache.valor;
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/cat_config?id=eq.1&select=gate_clientes`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      cache: 'no-store',
    });
    if (!r.ok) throw new Error('bad status');
    const filas = await r.json();
    const valor = !!(filas && filas[0] && filas[0].gate_clientes);
    gateCache = { valor, at: Date.now() };
    return valor;
  } catch {
    // ante cualquier falla nunca tumbamos el catálogo: se sigue con el
    // último valor conocido (o false si todavía no se pudo leer nunca).
    return gateCache.valor;
  }
}

// Rutas siempre libres del "login clientes" (nunca deben quedar bloqueadas).
function exceptuadaDelGate(path) {
  return (
    path.startsWith('/api') ||
    path.startsWith('/auth') ||
    path === '/acceso' ||
    path === '/login' ||
    path === '/logout' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml'
  );
}

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // ---- Panel de administración y herramientas internas ----
  const requiereLoginAdmin =
    path.startsWith('/admin') ||
    path.startsWith('/nueva') ||
    path.startsWith('/api/mejoras');

  if (requiereLoginAdmin) {
    const usuarioCookie = request.cookies.get('logbelts_user');
    const usuario = usuarioCookie ? decodeURIComponent(usuarioCookie.value) : null;

    if (!usuario) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    if (path.startsWith('/admin') && !esAdmin(usuario)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ---- Login clientes (catálogo público) ----
  if (!exceptuadaDelGate(path) && !request.cookies.get('lb_visitante')) {
    if (await gateClientesActivo()) {
      const url = request.nextUrl.clone();
      url.pathname = '/acceso';
      url.search = '';
      url.searchParams.set('next', path + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/|fotos/|.*\\.(?:png|jpg|jpeg|svg|webp|ico|ttf|woff|woff2|otf)$).*)'],
};
