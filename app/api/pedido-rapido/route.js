import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { PUNTAJE, buscar, getProducto } from '../../../lib/catalogo';
import { MARCA } from '../../../lib/marca';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_LINEAS = 300;
const MAX_BYTES = 2 * 1024 * 1024;

const resumen = p => ({
  codigo: p.codigo,
  nombre: p.nombre || p.clave_producto || p.codigo,
  foto: p.foto ? (/^https?:\/\//.test(p.foto) ? p.foto : `/fotos/${p.foto}`) : null,
});

/** "5888064 x3", "754-0260;2", "2 u 2291029" -> { codigo, cant } */
function interpretarLinea(texto) {
  const limpio = String(texto || '').trim();
  if (!limpio) return null;
  let cant = 1;
  const cantExplicita = limpio.match(/(?:^|\s)[x*]\s*(\d{1,4})\b/i) || limpio.match(/\b(\d{1,4})\s*(?:u|un|uds?|unid(?:ades)?)\b/i);
  if (cantExplicita) cant = Number(cantExplicita[1]);

  const tokens = limpio.split(/[\s\t;,|]+/).filter(Boolean);
  // Código propio del catálogo (en Logbelts, 7 dígitos). Con otro formato igual lo resuelve la búsqueda de abajo.
  const propio = tokens.find(t => /^\d{7}$/.test(t));
  let codigo = propio;
  if (!codigo) {
    codigo = tokens
      .filter(t => /\d/.test(t) && t.replace(/[^a-z0-9]/gi, '').length >= 4 && !/^\d{1,4}$/.test(t))
      .sort((a, b) => b.length - a.length)[0];
  }
  if (!codigo) return { entrada: limpio, codigo: null, cant };
  if (!cantExplicita) {
    const suelto = tokens.find(t => t !== codigo && /^\d{1,4}$/.test(t));
    if (suelto) cant = Number(suelto);
  }
  return { entrada: limpio, codigo: codigo.replace(/^[x*]/i, ''), cant: Math.min(9999, Math.max(1, cant)) };
}

function lineasDeExcel(buffer) {
  const libro = XLSX.read(buffer, { type: 'buffer' });
  const hoja = libro.Sheets[libro.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, blankrows: false, defval: '' });
  const iCab = filas.findIndex(f => f.some(c => /c[oó]d/i.test(String(c))));
  if (iCab >= 0) {
    const cab = filas[iCab].map(c => String(c));
    const iCod = cab.findIndex(c => /c[oó]d/i.test(c));
    const iCant = cab.findIndex(c => /cant/i.test(c));
    return filas.slice(iCab + 1).map(f => `${f[iCod] ?? ''} ${iCant >= 0 ? `x${f[iCant] || 1}` : ''}`);
  }
  return filas.map(f => f.join(' '));
}

async function resolver(item) {
  if (!item || !item.codigo) return { entrada: item?.entrada || '', cant: item?.cant || 1, estado: 'no_encontrado', opciones: [] };
  const exacto = await getProducto(item.codigo);
  if (exacto) return { ...item, estado: 'ok', producto: resumen(exacto), motivo: MARCA.codigo.etiqueta };

  const res = await buscar(item.codigo, 4);
  if (res[0] && res[0].score >= PUNTAJE.ORIGINAL) return { ...item, estado: 'ok', producto: resumen(res[0].p), motivo: res[0].motivo };
  const opciones = res.filter(r => r.score >= PUNTAJE.TEXTO).slice(0, 3).map(r => ({ ...resumen(r.p), motivo: r.motivo }));
  return { ...item, estado: opciones.length ? 'dudoso' : 'no_encontrado', opciones };
}

export async function POST(request) {
  let lineas = [];
  const tipo = request.headers.get('content-type') || '';
  try {
    if (tipo.includes('multipart/form-data')) {
      const form = await request.formData();
      const archivo = form.get('archivo');
      if (!archivo || typeof archivo.arrayBuffer !== 'function') throw new Error('Falta el archivo.');
      if (archivo.size > MAX_BYTES) throw new Error('El archivo supera los 2 MB.');
      lineas = lineasDeExcel(Buffer.from(await archivo.arrayBuffer()));
    } else {
      const d = await request.json();
      lineas = String(d?.texto || '').split(/\r?\n/);
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message || 'No se pudo leer el pedido.' }, { status: 400 });
  }

  const items = lineas.map(interpretarLinea).filter(Boolean).slice(0, MAX_LINEAS);
  const filas = await Promise.all(items.map(resolver));
  return NextResponse.json({ ok: true, filas, recortado: lineas.filter(l => String(l).trim()).length > MAX_LINEAS });
}
