import { registrar } from '../../../lib/eventos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const visitanteId = req.cookies.get('lb_visitante')?.value || null;
    if (body && body.tipo) await registrar({ ...body, visitanteId });
  } catch {
    /* nada */
  }
  return new Response(null, { status: 204 });
}
