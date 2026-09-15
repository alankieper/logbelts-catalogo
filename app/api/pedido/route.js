import { NextResponse } from 'next/server';
import { guardarPedido, limpiarItems } from '../../../lib/pedidos';
import { asignarVendedor } from '../../../lib/contactos';
import { normalizarProvincia } from '../../../lib/provincias';
import { avisarNuevoPedido } from '../../../lib/notificar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Guarda el pedido que se manda por WhatsApp, para que el vendedor lo tenga en el panel, y le avisa por email. */
export async function POST(request) {
  const d = await request.json().catch(() => null);
  let visitanteId = request.cookies.get('lb_visitante')?.value || null;
  if (visitanteId === 'sin-db') visitanteId = null;
  const origen = d?.origen === 'rapido' ? 'rapido' : 'lista';
  const r = await guardarPedido({ items: d?.items, visitanteId, origen });

  // Aviso opcional (aunque no haya DB): nunca frena ni hace fallar la respuesta
  try {
    const items = limpiarItems(d?.items);
    if (items.length && process.env.RESEND_API_KEY) {
      const provincia = normalizarProvincia(d?.provincia);
      const vendedor = await asignarVendedor(provincia);
      await avisarNuevoPedido({ items, origen, provincia }, vendedor);
    }
  } catch { /* el aviso es opcional */ }

  return NextResponse.json({ ok: r.ok });
}
