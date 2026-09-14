import { NextResponse } from 'next/server';
import { guardarPedido } from '../../../lib/pedidos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Guarda el pedido que se manda por WhatsApp, para que el vendedor lo tenga en el panel. */
export async function POST(request) {
  const d = await request.json().catch(() => null);
  let visitanteId = request.cookies.get('lb_visitante')?.value || null;
  if (visitanteId === 'sin-db') visitanteId = null;
  const r = await guardarPedido({ items: d?.items, visitanteId, origen: d?.origen });
  return NextResponse.json({ ok: r.ok });
}
