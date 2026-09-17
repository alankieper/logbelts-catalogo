import { leerTodos } from '../../../../lib/catalogoStore';
import { exportarXlsx } from '../../../../lib/excel';
import { MARCA } from '../../../../lib/marca';

const ARCHIVO = MARCA.nombre.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'catalogo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const productos = await leerTodos();
  const buf = exportarXlsx(productos);
  const fecha = new Date().toISOString().slice(0, 10);
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="catalogo-${ARCHIVO}-${fecha}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
