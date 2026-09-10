import { notFound } from 'next/navigation';
import AdminHeader from '../../AdminHeader';
import { obtenerVisitante } from '../../../../lib/visitantes';
import { leerEventosDeVisitante } from '../../../../lib/eventos';
import { leerTodosRaw } from '../../../../lib/catalogo';

export const dynamic = 'force-dynamic';

const ETIQUETA_TIPO = {
  busqueda: 'Buscó',
  ver: 'Vio el producto',
  consulta: 'Consultó por WhatsApp',
  lista_add: 'Agregó al pedido',
  lista_envio: 'Envió un pedido',
};

export default async function DetalleVisitante({ params }) {
  const id = decodeURIComponent(params.id);
  const [visitante, eventos, productos] = await Promise.all([
    obtenerVisitante(id),
    leerEventosDeVisitante(id),
    leerTodosRaw(),
  ]);
  if (!visitante) notFound();

  const nombreProd = new Map(productos.map((p) => [p.codigo, p.nombre || p.clave_producto || p.codigo]));

  const detalle = (e) => {
    if (e.tipo === 'busqueda') return `"${e.q || ''}"${Number.isFinite(e.n) ? ` (${e.n} resultado${e.n === 1 ? '' : 's'})` : ''}`;
    if (e.tipo === 'lista_envio') return `${e.n || 0} producto${e.n === 1 ? '' : 's'}`;
    if (e.codigo) return `${e.codigo} · ${nombreProd.get(e.codigo) || 'producto'}`;
    return '—';
  };

  return (
    <>
      <AdminHeader activo="metricas" />
      <main className="adm">
        <div className="wrap">
          <a className="backlink" href="/admin/metricas">← Volver a métricas</a>
          <h1>{visitante.empresa_nombre}</h1>
          <p className="sub">
            Teléfono: {visitante.telefono} · registrado el {new Date(visitante.creado).toLocaleString('es-AR')}
          </p>

          <section className="mcard">
            <h2>Actividad ({eventos.length})</h2>
            {eventos.length ? (
              <table className="admtable">
                <thead><tr><th>Cuándo</th><th>Qué hizo</th><th>Detalle</th></tr></thead>
                <tbody>
                  {eventos.map((e, i) => (
                    <tr key={i}>
                      <td className="mut">{new Date(e.creado).toLocaleString('es-AR')}</td>
                      <td>{ETIQUETA_TIPO[e.tipo] || e.tipo}</td>
                      <td>
                        {e.codigo ? <a href={`/admin/productos/${encodeURIComponent(e.codigo)}`}>{detalle(e)}</a> : detalle(e)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="mut">Todavía no hay actividad registrada para este cliente.</p>}
          </section>
        </div>
      </main>
    </>
  );
}
