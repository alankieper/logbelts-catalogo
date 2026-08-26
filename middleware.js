import { NextResponse } from 'next/server';

export function middleware(request) {
  const usuario = request.cookies.get('logbelts_user');
  const path = request.nextUrl.pathname;
  const esPublica = path.startsWith('/login') || path.startsWith('/auth');

  if (!usuario && !esPublica) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\.(?:png|jpg|jpeg|svg|webp|ico|ttf|woff|woff2|otf)$).*)'],
};
