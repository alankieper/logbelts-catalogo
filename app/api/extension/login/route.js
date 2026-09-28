import { NextResponse } from 'next/server';
import { passwordCorrecta } from '../../../../lib/adminPassword';
import { crearToken } from '../../../../lib/extensionToken';

export const dynamic = 'force-dynamic';

// La extensión de Chrome manda la contraseña del admin una vez y recibe un token para subir fotos.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!passwordCorrecta(body.password)) {
    await new Promise((r) => setTimeout(r, 800)); // frena intentos repetidos
    return NextResponse.json({ ok: false, error: 'Contraseña incorrecta.' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, token: crearToken() });
}
