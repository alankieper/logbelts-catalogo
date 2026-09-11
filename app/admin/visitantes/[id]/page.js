import { notFound } from 'next/navigation';
import AdminHeader from '../../AdminHeader';
import { obtenerVisitante } from '../../../../lib/visitantes';
import { leerEventosDeVisitante, leerVisitasDeVisitante } from '../../../../lib/eventos';
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
  const [visitante, eventos, visitas, productos] = await Promise.all([
    obtenerVisitante(id),
    leerEventosDeVisitante(id),
    leerVisitasDeVisitante(id),
    leerTodosRaw(),
  ]);
  if (!visitante) notFound();

  const prodInfo = new Map(
    productos.map((p) => [p.codigo, { nombre: p.nombre || p.clave_producto || p.codigo, familia: p.familia, subcategoria: p.subcategoria }])
  );

  const detalle = (e) => {
    if (e.tipo === 'busqueda') return `"${e.q || ''}"${Number.isFinite(e.n) ? ` (${e.n} resultado${e.n === 1 ? '' : 's'})` : ''}`;
    if (e.tipo === 'lista_envio') return `${e.n || 0} producto${e.n === 1 ? '' : 's'}`;
    if (e.codigo) return `${e.codigo} · ${prodInfo.get(e.codigo)?.nombre || 'producto'}`;
    return '—';
  };

  // Días que entró (sesiones registradas en cat_visitas).
  const dias = [...new Set(visitas.map((v) => new Date(v.creado).toLocaleDateString('es-AR')))];

  // Patrón: categorías (familia · subcategoría) más repetidas entre lo que vio/consultó/pidió.
  const catCount = new Map();
  for (const e of eventos) {
    if (!['ver', 'consulta', 'lista_add'].includes(e.tipo) || !e.codigo) continue;
    const info = prodInfo.get(e.codigo);
    if (!info?.familia) continue;
    const clave = info.subcategoria ? `${info.familia} · ${info.subcategoria}` : info.familia;
    catCount.set(clave, (catCount.get(clave) || 0) + 1);
  }
  const patronCategorias = [...catCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Patrón: qué palabras busca más seguido.
  const qCount = new Map();
  for (const e of eventos) {
    if (e.tipo !== 'busqueda' || !e.q) continue;
    const clave = e.q.trim().toLowerCase();
    if (!clave) continue;
    qCount.set(clave, (qCount.get(clave) || 0) + 1);
  }
  const patronBusquedas = [...qCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  const conteoPorTipo = { ver: 0, consulta: 0, lista_add: 0, lista_envio: 0, busqueda: 0 };
  for (const e of eventos) if (e.tipo in conteoPorTipo) conteoPorTipo[e.tipo]++;

  return (
    <>
      <AdminHeader activo="metricas" />
      <main className="adm">
        <div className="wrap">
          <a className="backlink" href="/admin/metricas">← Volver a métricas</a>
          <h1>{visitante.empresa_nombre}</h1>
          <p className="sub">
            Teléfono: {visitante.telefono} · registrado el {new Date(visitante.creado).toLocaleDateString('es-AR')}
          </p>

          <p className="sub" style={{ marginTop: -12 }}>
            <b>Entró:</b> {dias.length ? dias.join(', ') : '—'}
          </p>

          <div className="mkpis" style={{ marginBottom: 18 }}>
            <div className="mkpi"><span className="mkpi-t">Búsquedas</span><span className="mkpi-v">{conteoPorTipo.busqueda}</span></div>
            <div className="mkpi"><span className="mkpi-t">Productos vistos</span><span className="mkpi-v">{conteoPorTipo.ver}</span></div>
            <div className="mkpi"><span className="mkpi-t">Consultas por WhatsApp</span><span className="mkpi-v">{conteoPorTipo.consulta}</span></div>
            <div className="mkpi"><span className="mkpi-t">Agregados al pedido</span><span className="mkpi-v">{conteoPorTipo.lista_add}</span></div>
            <div className="mkpi"><span className="mkpi-t">Pedidos enviados</span><span className="mkpi-v">{conteoPorTipo.lista_envio}</span></div>
          </div>

          <div className="mcols">
            <section className="mcard">
              <h2>Lo que siempre busca</h2>
              <p className="mut">Categorías de los productos que vio, consultó o agregó al pedido, de más a menos repetidas.</p>
              {patronCategorias.length ? (
                <ul className="mrank">
                  {patronCategorias.map(([clave, n]) => {
                    const max = patronCategorias[0][1];
                    return (
                      <li key={clave}>
                        <span className="mrank-lbl">{clave}</span>
                        <span className="mrank-bar"><span style={{ width: `${(n / max) * 100}%`, background: 'var(--ok)' }} /></span>
                        <span className="mrank-n">{n}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="mut">Todavía no hay suficiente actividad para ver un patrón.</p>}
            </section>

            <section className="mcard">
              <h2>Palabras que más repite al buscar</h2>
              {patronBusquedas.length ? (
                <ul className="mrank">
                  {patronBusquedas.map(([q, n]) => {
                    const max = patronBusquedas[0][1];
                    return (
                      <li key={q}>
                        <span className="mrank-lbl"><a href={`/buscar?q=${encodeURIComponent(q)}`} target="_blank" rel="noreferrer">{q}</a></span>
                        <span className="mrank-bar"><span style={{ width: `${(n / max) * 100}%`, background: 'var(--brand-ink)' }} /></span>
                        <span className="mrank-n">{n}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="mut">Todavía no buscó nada.</p>}
            </section>
          </div>

          <section className="mcard">
            <h2>Actividad completa ({eventos.length})</h2>
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
