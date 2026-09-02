import { leerTodos } from '../../../../lib/catalogoStore';
import { exportarXlsx } from '../../../../lib/excel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const productos = await leerTodos();
  const buf = exportarXlsx(productos);
  const fecha = new Date().toISOString().slice(0, 10);
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="catalogo-logbelts-${fecha}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
