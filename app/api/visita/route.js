import crypto from 'crypto';
import { registrarVisita } from '../../../lib/eventos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const h = req.headers;
    const ipRaw =
      (h.get('x-forwarded-for') || '').split(',')[0].trim() ||
      h.get('x-real-ip') ||
      h.get('cf-connecting-ip') ||
      '';
    const salt = process.env.VISITA_SALT || 'logbelts-catalogo';
    const ip_hash = ipRaw
      ? crypto.createHash('sha256').update(ipRaw + salt).digest('hex').slice(0, 24)
      : null;

    const pais = h.get('x-vercel-ip-country') || null;
    let ciudad = h.get('x-vercel-ip-city') || null;
    try { if (ciudad) ciudad = decodeURIComponent(ciudad); } catch {}
    const region = h.get('x-vercel-ip-country-region') || null;

    const body = await req.json().catch(() => ({}));
    const path = (body && body.path) || null;
    let ref = null;
    try {
      if (body && body.ref) {
        const host = new URL(body.ref).hostname.replace(/^www\./, '');
        // sólo si viene de otro sitio
        if (host && !/logbelts-catalogo\.vercel\.app$/i.test(host)) ref = host;
      }
    } catch {}

    await registrarVisita({ ip_hash, pais, ciudad, region, path, ref });
  } catch {
    /* nada */
  }
  return new Response(null, { status: 204 });
}
