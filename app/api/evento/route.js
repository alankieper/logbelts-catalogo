import { registrar } from '../../../lib/eventos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (body && body.tipo) await registrar(body);
  } catch {
    /* nada */
  }
  return new Response(null, { status: 204 });
}
