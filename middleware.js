import { NextResponse } from 'next/server';
import { esAdmin } from './lib/admins';

/**
 * El catálogo es público. Sólo /admin y las herramientas internas piden login.
 */
export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Sólo el panel de administración y las rutas internas viejas siguen protegidas.
  const requiereLogin =
    path.startsWith('/admin') ||
    path.startsWith('/nueva') ||
    path.startsWith('/api/mejoras');

  if (!requiereLogin) return NextResponse.next();

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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/|fotos/|.*\\.(?:png|jpg|jpeg|svg|webp|ico|ttf|woff|woff2|otf)$).*)'],
};
