import { NextResponse } from 'next/server';
import { registrarVisitante } from '../../../../lib/visitantes';
import { guardarContacto, ORIGENES } from '../../../../lib/contactos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Contactos de la web (popup, formulario, búsqueda sin resultado, consulta por máquina).
 * 1) Se guardan en cat_contactos con vendedor asignado por provincia (seguimiento en /admin/contactos).
 * 2) Si todavía no es visitante, se registra en cat_visitantes y se deja la cookie lb_visitante,
 *    así no se le vuelve a pedir el acceso al catálogo.
 */
export async function POST(request) {
  const d = await request.json().catch(() => null);
  const s = v => String(v || '').replace(/\s+/g, ' ').trim();

  // Campo trampa: los bots lo completan, las personas no lo ven.
  if (s(d?.sitio_web)) return NextResponse.json({ ok: true });

  const empresa = s(d?.empresa);
  const nombre = s(d?.nombre);
  const telefono = s(d?.telefono);
  if (!telefono || !(empresa || nombre)) {
    return NextResponse.json({ ok: false, error: 'Faltan datos.' }, { status: 400 });
  }

  let visitanteId = request.cookies.get('lb_visitante')?.value || null;
  if (visitanteId === 'sin-db') visitanteId = null;
  let nuevoVisitante = null;
  if (!visitanteId) {
    const empresaNombre = [empresa, nombre, s(d?.localidad)].filter(Boolean).join(' · ');
    const r = await registrarVisitante({ empresaNombre, telefono });
    if (r.ok) nuevoVisitante = visitanteId = r.id;
  }

  const contacto = await guardarContacto({
    origen: ORIGENES[d?.origen] ? d.origen : 'contacto',
    empresa, nombre, telefono,
    email: s(d?.email),
    localidad: s(d?.localidad),
    provincia: s(d?.provincia),
    consulta: d?.consulta ? String(d.consulta) : null,
    meta: d?.meta && typeof d.meta === 'object' ? d.meta : null,
    visitanteId,
  });

  const res = NextResponse.json({ ok: contacto.ok || !!nuevoVisitante, vendedor: contacto.vendedor || null });
  if (nuevoVisitante) {
    res.cookies.set('lb_visitante', nuevoVisitante, { path: '/', maxAge: 60 * 60 * 24 * 400 });
  }
  return res;
}
