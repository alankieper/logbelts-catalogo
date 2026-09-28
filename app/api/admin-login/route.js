import { NextResponse } from 'next/server';
import { passwordCorrecta } from '../../../lib/adminPassword';
import { crearSesion, opcionesCookie, COOKIE_SESION, COOKIE_NOMBRE, DURACION_SEGUNDOS } from '../../../lib/sesion';
import { esperaAntiFuerzaBruta, olvidarIntentos } from '../../../lib/intentosLogin';

export const runtime = 'nodejs';

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'sin-ip';
  const espera = esperaAntiFuerzaBruta(ip);
  if (espera > 0) {
    return NextResponse.json(
      { ok: false, error: `Demasiados intentos. Probá de nuevo en ${Math.ceil(espera / 1000)} segundos.` },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  if (!passwordCorrecta(body.password)) {
    esperaAntiFuerzaBruta(ip, true); // cuenta el intento fallido
    return NextResponse.json({ ok: false, error: 'Contraseña incorrecta.' }, { status: 401 });
  }

  olvidarIntentos(ip);
  const sesion = await crearSesion('Admin');
  if (!sesion) {
    return NextResponse.json({ ok: false, error: 'Falta configurar el secreto de sesión en el servidor.' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_SESION, sesion, opcionesCookie());
  // sólo para mostrar el nombre en pantalla; no autoriza nada
  response.cookies.set(COOKIE_NOMBRE, 'Admin', { path: '/', maxAge: DURACION_SEGUNDOS, sameSite: 'lax' });
  return response;
}
