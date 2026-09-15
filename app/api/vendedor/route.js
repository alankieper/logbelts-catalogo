import { NextResponse } from 'next/server';
import { asignarVendedor } from '../../../lib/contactos';
import { normalizarProvincia } from '../../../lib/provincias';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Vendedor de la zona para abrir WhatsApp directo con él.
 * Devuelve sólo nombre y teléfono (nunca email ni otros datos). Sin DB o sin vendedores: vendedor null.
 */
export async function GET(request) {
  const provincia = normalizarProvincia(request.nextUrl.searchParams.get('provincia'));
  let vendedor = null;
  try {
    const v = provincia ? await asignarVendedor(provincia) : null;
    if (v && v.telefono) vendedor = { nombre: v.nombre || null, telefono: v.telefono };
  } catch { /* cae al WhatsApp general */ }
  return NextResponse.json({ provincia, vendedor }, { headers: { 'Cache-Control': 'no-store' } });
}
