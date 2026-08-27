import { NextResponse } from 'next/server';
import { identificar } from '../../../lib/identificador';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get('foto');
    if (!file || typeof file === 'string' || !file.size) {
      return NextResponse.json({ ok: false, error: 'No llegó ninguna imagen.' }, { status: 400 });
    }
    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: 'La imagen es muy grande. Probá con una foto más chica.' }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const b64 = buf.toString('base64');
    const res = await identificar(b64, file.type || 'image/jpeg');
    return NextResponse.json(res, { status: res.ok ? 200 : 500 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e.message || e).slice(0, 300) }, { status: 500 });
  }
}
