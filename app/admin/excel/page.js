import AdminHeader from '../AdminHeader';
import { importarExcel } from './actions';
import { estadisticas } from '../../../lib/catalogoStore';

export const dynamic = 'force-dynamic';

export default async function AdminExcel({ searchParams }) {
  const st = await estadisticas().catch(() => null);
  const ok = searchParams?.ok != null ? Number(searchParams.ok) : null;
  const sin = searchParams?.sin != null ? Number(searchParams.sin) : null;
  const nf = (searchParams?.nf || '').toString().split(',').filter(Boolean);
  const ch = (searchParams?.ch || '').toString().split(',').filter(Boolean);
  const err = searchParams?.err;

  return (
    <>
      <AdminHeader activo="excel" />
      <main className="adm">
        <div className="wrap">
          <h1>Cargar datos por Excel</h1>
          <p className="sub">
            Bajás el catálogo a una planilla, completás descripciones / códigos originales / categorías,
            y la volvés a subir. Se aplican sólo los cambios.
          </p>

          {ok != null ? (
            <div className="ok-msg">
              Listo: <b>{ok.toLocaleString('es-AR')}</b> productos actualizados
              {sin != null ? <> · {sin.toLocaleString('es-AR')} sin cambios</> : null}
              {nf.length ? <> · {nf.length} códigos no encontrados</> : null}.
              {nf.length ? (
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 400 }}>No encontrados: {nf.join(', ')}</div>
              ) : null}
              {ch.length ? (
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 400 }}>
                  Cambiados (código:campos): {ch.join('  ·  ')}
                  {ok > ch.length ? ` … y ${ok - ch.length} más` : ''}
                </div>
              ) : null}
            </div>
          ) : null}
          {err ? <div className="err-msg">{err}</div> : null}

          <div className="xls-cards">
            <section className="xls-card">
              <div className="xls-n">1</div>
              <h2>Bajar</h2>
              <p>Descargá el Excel con todos los productos (2.400+ filas).</p>
              <a className="btn" href="/admin/excel/descargar">⬇ Bajar Excel del catálogo</a>
            </section>

            <section className="xls-card">
              <div className="xls-n">2</div>
              <h2>Editar</h2>
              <p>
                Abrilo con Excel. Editá sólo estas columnas:
                <b> nombre, descripcion, familia, subcategoria, marcas, codigo_original, compatibilidad, ubicacion</b>.
                En <b>marcas</b> y <b>codigo_original</b>, si hay varios, separalos con <code>|</code> (barra).
                Las columnas <b>medidas, estado, pagina</b> son de referencia (no se guardan).
                <b> No borres ni cambies la columna “codigo”</b> — es la que identifica cada producto.
              </p>
            </section>

            <section className="xls-card">
              <div className="xls-n">3</div>
              <h2>Subir</h2>
              <p>Subí el mismo archivo. Se comparan las filas y se guardan sólo las que cambiaste.</p>
              <form action={importarExcel} encType="multipart/form-data" className="xls-up">
                <input type="file" name="archivo" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required />
                <button className="btn" type="submit">⬆ Subir y aplicar</button>
              </form>
            </section>
          </div>

          {st ? (
            <p className="mut" style={{ marginTop: 18, fontSize: 12, color: 'var(--ink-faint)' }}>
              Estado actual: {Object.entries(st.estado || {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}
            </p>
          ) : null}

          <p className="mut" style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
            Tip: si sólo querés cargar códigos originales, filtrá en Excel por la columna <code>codigo_original</code> vacía.
            Las fotos, la página del PDF y el estado no se tocan desde acá.
          </p>
        </div>
      </main>
    </>
  );
}
