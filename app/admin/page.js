import AdminHeader from './AdminHeader';
import { estadisticas } from '../../lib/catalogoStore';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const s = await estadisticas();
  const fams = Object.entries(s.porFamilia)
    .filter(([k]) => k !== '(sin)')
    .sort((a, b) => b[1] - a[1]);

  return (
    <>
      <AdminHeader activo="home" />
      <main className="adm">
        <div className="wrap">
          <h1>Tablero</h1>
          <p className="sub">Catálogo cargado desde la primera extracción. Editá acá; los cambios se ven al toque en el catálogo público.</p>

          <div className="kpis">
            <div className="kpi"><div className="n">{s.total.toLocaleString('es-AR')}</div><div className="l">Productos</div></div>
            <div className="kpi"><div className="n">{s.editados.toLocaleString('es-AR')}</div><div className="l">Editados</div></div>
            <div className="kpi"><div className="n">{s.derivadas.toLocaleString('es-AR')}</div><div className="l">Descripción a confirmar</div></div>
            <div className="kpi"><div className="n">{s.sinFoto.toLocaleString('es-AR')}</div><div className="l">Sin foto</div></div>
            <div className="kpi"><div className="n">{s.ocultos.toLocaleString('es-AR')}</div><div className="l">Ocultos</div></div>
            <div className="kpi"><div className="n">{s.sinCategoria.toLocaleString('es-AR')}</div><div className="l">Sin categoría</div></div>
          </div>

          <div className="admbar">
            <a className="btn" href="/admin/productos">Ver productos</a>
            <a className="btn ghost" href="/admin/productos/nuevo">+ Agregar producto</a>
            <a className="btn ghost" href="/admin/productos?deriv=1">Revisar descripciones a confirmar</a>
            <a className="btn ghost" href="/admin/categorias">Categorías</a>
          </div>

          <h2 style={{ fontSize: '1rem', margin: '26px 0 10px', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-faint)' }}>
            Por familia
          </h2>
          <table className="admtable">
            <thead><tr><th>Familia</th><th style={{ width: 90, textAlign: 'right' }}>Productos</th></tr></thead>
            <tbody>
              {fams.map(([f, n]) => (
                <tr key={f}>
                  <td><a href={`/admin/productos?familia=${encodeURIComponent(f)}`}>{f}</a></td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{n.toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
