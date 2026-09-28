import { NextResponse } from 'next/server';
import { COOKIE_SESION, COOKIE_NOMBRE } from '../../lib/sesion';

export async function GET(request) {
  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url);
  for (const c of [COOKIE_SESION, COOKIE_NOMBRE, 'logbelts_user']) {
    response.cookies.set(c, '', { path: '/', maxAge: 0 });
  }
  return response;
}
