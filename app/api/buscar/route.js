import { NextResponse } from 'next/server';
import { buscar, sugerenciasBusqueda } from '../../../lib/catalogo';

/**
 * Sugerencias del buscador (se dispara a medida que se escribe).
 * Devuelve SÓLO lo que se muestra en la lista: código, nombre, marca, foto y motivo.
 * Nunca precios ni stock (el catálogo no los publica).
 */
export const dynamic = 'force-dynamic';

const MAX = 12;

function fotoDe(p) {
  if (!p.foto) return null;
  return /^https?:\/\//.test(p.foto) ? p.foto : `/fotos/${p.foto}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').toString().slice(0, 80).trim();
  const pedidos = parseInt(searchParams.get('n') || '8', 10);
  const n = Math.min(Math.max(Number.isFinite(pedidos) ? pedidos : 8, 1), MAX);

  const vacia = { q, total: 0, resultados: [], sugerencias: [] };
  if (q.length < 2) return NextResponse.json(vacia, { headers: { 'Cache-Control': 'no-store' } });

  const t0 = Date.now();
  const todos = await buscar(q);
  const resultados = todos.slice(0, n).map(({ p, motivo }) => ({
    codigo: p.codigo,
    nombre: p.nombre || p.clave_producto || p.codigo,
    marca: (p.marcas && p.marcas[0]) || '',
    foto: fotoDe(p),
    motivo,
    href: `/p/${encodeURIComponent(p.codigo)}`,
  }));
  const sugerencias = todos.length ? [] : await sugerenciasBusqueda(q, 6);

  return NextResponse.json(
    { q, total: todos.length, resultados, sugerencias, ms: Date.now() - t0 },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
