import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import { asistenteDisponible, responder } from '../../../lib/asistente';
import { registrar } from '../../../lib/eventos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Límite simple por IP (por instancia): 20 consultas cada 10 minutos.
const VENTANA_MS = 10 * 60 * 1000;
const MAX_CONSULTAS = 20;
const uso = new Map();

function permitido(clave) {
  const ahora = Date.now();
  const recientes = (uso.get(clave) || []).filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length >= MAX_CONSULTAS) return false;
  recientes.push(ahora);
  uso.set(clave, recientes);
  if (uso.size > 5000) uso.clear();
  return true;
}

export async function POST(request) {
  if (!asistenteDisponible) {
    return NextResponse.json({ ok: false, error: 'El asistente no está disponible.' }, { status: 503 });
  }

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (!permitido(createHash('sha256').update(ip).digest('hex').slice(0, 24))) {
    return NextResponse.json({ ok: false, error: 'Hiciste muchas consultas seguidas. Probá en unos minutos o escribinos por WhatsApp.' }, { status: 429 });
  }

  const d = await request.json().catch(() => null);
  const historial = (Array.isArray(d?.mensajes) ? d.mensajes : [])
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
  while (historial.length && historial[0].role !== 'user') historial.shift();
  if (!historial.length || historial[historial.length - 1].role !== 'user') {
    return NextResponse.json({ ok: false, error: 'Falta la consulta.' }, { status: 400 });
  }

  const visitanteId = request.cookies.get('lb_visitante')?.value;
  registrar({
    tipo: 'asistente',
    q: historial[historial.length - 1].content,
    visitanteId: visitanteId && visitanteId !== 'sin-db' ? visitanteId : null,
  });

  try {
    const r = await responder(historial);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    console.error('asistente:', e?.status || '', e?.name || '', String(e?.message || e).slice(0, 200));
    const status = e instanceof Anthropic.RateLimitError ? 429 : 502;
    return NextResponse.json({ ok: false, error: 'No pude responder ahora. Probá de nuevo o escribinos por WhatsApp.' }, { status });
  }
}
