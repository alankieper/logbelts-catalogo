import { NextResponse } from 'next/server';
import { registrarVisitante } from '../../../../lib/visitantes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Contactos de la web institucional (popup de bienvenida y formulario de contacto).
 * Se guardan como visitantes (cat_visitantes) para verlos en /admin/metricas, y se deja
 * la cookie lb_visitante para que no se le vuelva a pedir el acceso al catálogo.
 */
export async function POST(request) {
  const d = await request.json().catch(() => null);
  const s = v => String(v || '').replace(/\s+/g, ' ').trim();

  // Campo trampa: los bots lo completan, las personas no lo ven.
  if (s(d?.sitio_web)) return NextResponse.json({ ok: true });

  const empresa = s(d?.empresa);
  const telefono = s(d?.telefono);
  if (!empresa || !telefono) {
    return NextResponse.json({ ok: false, error: 'Faltan datos.' }, { status: 400 });
  }

  // cat_visitantes guarda empresa/nombre en un solo campo (máx. 120 caracteres).
  const empresaNombre = [empresa, s(d?.nombre), s(d?.localidad)].filter(Boolean).join(' · ');
  const r = await registrarVisitante({ empresaNombre, telefono });

  const res = NextResponse.json({ ok: r.ok });
  if (r.ok) {
    res.cookies.set('lb_visitante', r.id, { path: '/', maxAge: 60 * 60 * 24 * 400 });
  }
  return res;
}
