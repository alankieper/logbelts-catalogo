import { NextResponse } from 'next/server';
import { tokenDe, tokenValido } from '../../../../lib/extensionToken';
import { guardarPendiente } from '../../../../lib/fotosPendientes';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX = 4 * 1024 * 1024; // la extensión manda JPG de hasta 1000x1000 (~200 KB)

// Prueba de conexión desde la extensión.
export async function GET(request) {
  if (!tokenValido(tokenDe(request))) return NextResponse.json({ ok: false, error: 'Sesión vencida.' }, { status: 401 });
  return NextResponse.json({ ok: true });
}

// Recibe una foto de la extensión y la deja en la bandeja "Fotos pendientes" del admin.
export async function POST(request) {
  if (!tokenValido(tokenDe(request))) return NextResponse.json({ ok: false, error: 'Sesión vencida.' }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const foto = form?.get('foto');
  const codigo = String(form?.get('codigo') || '').trim();
  if (!/^\d{7}$/.test(codigo)) return NextResponse.json({ ok: false, error: 'Código inválido.' }, { status: 400 });
  if (!foto || typeof foto.arrayBuffer !== 'function') return NextResponse.json({ ok: false, error: 'Falta la foto.' }, { status: 400 });
  if (!/^image\//.test(foto.type || '')) return NextResponse.json({ ok: false, error: 'El archivo no es una imagen.' }, { status: 400 });
  if (foto.size > MAX) return NextResponse.json({ ok: false, error: 'La foto pesa demasiado.' }, { status: 413 });

  try {
    const r = await guardarPendiente({
      codigo,
      datos: Buffer.from(await foto.arrayBuffer()),
      tipo: foto.type,
      origen: String(form.get('origen') || '').slice(0, 1000),
      pagina: String(form.get('pagina') || '').slice(0, 1000),
      lado: Number(form.get('lado')) || null,
    });
    return NextResponse.json({ ok: true, nombre: r.nombre });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message || 'No se pudo guardar la foto.' }, { status: 500 });
  }
}
