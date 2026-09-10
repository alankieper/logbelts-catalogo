import { NextResponse } from 'next/server';
import { registrarVisitante } from '../../../lib/visitantes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sanitizarNext(raw) {
  const n = typeof raw === 'string' ? raw : '';
  if (n.startsWith('/') && !n.startsWith('//')) return n;
  return '/';
}

export async function POST(request) {
  const form = await request.formData().catch(() => null);
  const empresaNombre = (form?.get('empresa_nombre') || '').toString().trim();
  const telefono = (form?.get('telefono') || '').toString().trim();
  const next = sanitizarNext((form?.get('next') || '').toString());

  if (!empresaNombre || !telefono) {
    const url = new URL('/acceso', request.url);
    url.searchParams.set('next', next);
    url.searchParams.set('err', '1');
    return NextResponse.redirect(url, { status: 303 });
  }

  const r = await registrarVisitante({ empresaNombre, telefono });

  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  // Si por algo falló el guardado en la base, igual lo dejamos pasar (nunca
  // trabar el acceso al catálogo por un problema de backend); el id "sin-db"
  // deja rastro de que ese evento no tiene visitante real asociado.
  response.cookies.set('lb_visitante', r.ok ? r.id : 'sin-db', {
    path: '/',
    maxAge: 60 * 60 * 24 * 400,
  });
  return response;
}
