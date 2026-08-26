import { NextResponse } from 'next/server';
import { esAdmin } from './lib/admins';

export function middleware(request) {
  const usuarioCookie = request.cookies.get('logbelts_user');
  const usuario = usuarioCookie ? decodeURIComponent(usuarioCookie.value) : null;
  const path = request.nextUrl.pathname;
  const esPublica = path.startsWith('/login') || path.startsWith('/auth') || path.startsWith('/api/admin-login');

  if (!usuario && !esPublica) {
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\.(?:png|jpg|jpeg|svg|webp|ico|ttf|woff|woff2|otf)$).*)'],
};
