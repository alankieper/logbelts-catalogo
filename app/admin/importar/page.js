import AdminHeader from '../AdminHeader';
import { subirCatalogo } from './actions';
import { listarRuns } from '../../../lib/importador';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function fmtMB(n) {
  return n ? (n / 1024 / 1024).toFixed(1) + ' MB' : '—';
}

export default function Importar({ searchParams }) {
  const runs = listarRuns();
  const err = searchParams?.err;

  return (
    <>
      <AdminHeader activo="importar" />
      <main className="adm">
        <div className="wrap">
          <h1>Importar catálogo</h1>
          <p className="sub">
            Subí una versión nueva del catálogo en PDF. El sistema extrae los productos, los
            compara con lo que hay cargado y te muestra los cambios para que apruebes.
          </p>

          {err ? <div className="err-msg">{err}</div> : null}

          <form action={subirCatalogo} className="form-grid" encType="multipart/form-data" style={{ background: 'var(--surface)', border: '1px solid var(--rule)', borderRadius: 12, padding: 20, maxWidth: 560 }}>
            <div>
              <label>Archivo PDF del catálogo</label>
              <input type="file" name="pdf" accept="application/pdf" required />
            </div>
            <label style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink-soft)' }}>
              <input type="checkbox" name="con_ia" style={{ width: 16, height: 16, marginTop: 2 }} />
              <span>
                Mejorar con IA las descripciones de los productos nuevos (usa la API de Claude).
                Sólo redacta a partir de datos del catálogo, no inventa modelos.
              </span>
            </label>
            <div className="form-actions">
              <button className="save" type="submit">Subir y analizar</button>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--ink-faint)', margin: 0 }}>
              El análisis tarda entre 20 segundos y 2 minutos según el tamaño. No cierres la pestaña.
            </p>
          </form>

          <h2 style={{ fontSize: '1rem', margin: '30px 0 10px', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-faint)' }}>
            Importaciones anteriores
          </h2>
          {runs.length ? (
            <table className="admtable">
              <thead>
                <tr><th>Fecha</th><th>Archivo</th><th>Estado</th><th>Cambios</th><th></th></tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 12 }}>{new Date(r.created_at).toLocaleString('es-AR')}</td>
                    <td style={{ fontSize: 12 }}>{r.archivo}<div style={{ color: 'var(--ink-faint)' }}>{fmtMB(r.tamano)}</div></td>
                    <td>
                      {r.estado === 'procesando' ? <span className="tag warn">Procesando</span> : null}
                      {r.estado === 'revision' ? <span className="tag warn">En revisión</span> : null}
                      {r.estado === 'aplicado' ? <span className="tag ok">Aplicado</span> : null}
                      {r.estado === 'revertido' ? <span className="tag off">Revertido</span> : null}
                      {r.estado === 'error' ? <span className="tag off">Error</span> : null}
                    </td>
                    <td style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                      {r.stats ? `+${r.stats.nuevos} · ~${r.stats.modificados} · −${r.stats.eliminados}` : (r.error ? <span title={r.error}>{r.error.slice(0, 40)}…</span> : '—')}
                    </td>
                    <td><a href={`/admin/importar/${r.id}`}>Abrir</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">Todavía no importaste ningún catálogo.</div>
          )}
        </div>
      </main>
    </>
  );
}
