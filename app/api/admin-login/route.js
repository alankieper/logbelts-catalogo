import { NextResponse } from 'next/server';
import { ADMIN_PASSWORD } from '../../../lib/adminPassword';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const password = body.password || '';

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'Contraseña incorrecta.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('logbelts_user', encodeURIComponent('Admin'), {
    path: '/',
    maxAge: 60 * 60 * 24 * 400,
  });
  return response;
}
