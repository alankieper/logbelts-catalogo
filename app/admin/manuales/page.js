import AdminHeader from '../AdminHeader';
import { guardarDespiece, borrarDespiece } from './actions';
import { leerCurados, catalogoModelos } from '../../../lib/despieces';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export default async function AdminManuales({ searchParams }) {
  const lista = await leerCurados();
  const marcas = catalogoModelos().map((g) => g.marca);
  const ok = searchParams?.ok === '1';
  const err = searchParams?.err;

  return (
    <>
      <AdminHeader activo="manuales" />
      <main className="adm">
        <div className="wrap">
          <h1>Manuales y despieces</h1>
          <p className="sub">
            Cargá acá los PDF de despieces / manuales que Logbelts obtiene por canales propios
            (proveedor, portal de concesionario) o el enlace oficial de la marca. Se enganchan
            solos a los productos por marca + modelo. <b>No cargar material de otras webs sin permiso.</b>
          </p>

          {ok ? <div className="ok-msg">Guardado.</div> : null}
          {err ? <div className="err-msg">{err}</div> : null}

          <form action={guardarDespiece} className="form-grid" encType="multipart/form-data" style={{ background: 'var(--surface)', border: '1px solid var(--rule)', borderRadius: 12, padding: 20, marginBottom: 26 }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Agregar</h2>
            <div className="row2">
              <div>
                <label>Marca</label>
                <input name="marca" list="marcas" required />
                <datalist id="marcas">{marcas.map((m) => <option key={m} value={m} />)}</datalist>
              </div>
              <div>
                <label>Modelo</label>
                <input name="modelo" placeholder="Ej: MS 250, 143R, GX160" required />
              </div>
            </div>
            <div>
              <label>Título</label>
              <input name="titulo" placeholder="Ej: Despiece Stihl MS 250 (IPL)" required />
            </div>
            <div className="row2">
              <div>
                <label>Tipo</label>
                <select name="tipo">
                  <option value="despiece">Despiece / IPL</option>
                  <option value="manual">Manual de usuario</option>
                  <option value="servicio">Manual de servicio</option>
                </select>
              </div>
              <div>
                <label>Fuente</label>
                <input name="fuente" placeholder="Ej: Proveedor XX / Husqvarna oficial" />
              </div>
            </div>
            <div className="row2">
              <div>
                <label>Enlace (si es a un sitio oficial)</label>
                <input name="url" placeholder="https://…" />
              </div>
              <div>
                <label>o subir PDF propio</label>
                <input type="file" name="archivo" accept="application/pdf" />
              </div>
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', textTransform: 'none', letterSpacing: 0, fontWeight: 400, fontSize: 13 }}>
              <input type="checkbox" name="publico" defaultChecked style={{ width: 15, height: 15 }} /> Visible en el catálogo público
            </label>
            <div className="form-actions">
              <button className="save" type="submit">Guardar</button>
            </div>
          </form>

          <table className="admtable">
            <thead><tr><th>Marca / modelo</th><th>Título</th><th>Fuente</th><th>Visible</th><th></th></tr></thead>
            <tbody>
              {lista.map((d) => (
                <tr key={d.id}>
                  <td className="cod">{d.marca} {d.modelo}</td>
                  <td>
                    <a href={d.archivo ? `/despieces/${d.archivo}` : d.url} target="_blank" rel="noreferrer">{d.titulo}</a>
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{d.tipo}{d.archivo ? ' · PDF' : ' · enlace'}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{d.fuente}</td>
                  <td>{d.publico ? <span className="tag ok">Sí</span> : <span className="tag off">No</span>}</td>
                  <td>
                    <form action={borrarDespiece} style={{ display: 'inline' }}>
                      <input type="hidden" name="id" value={d.id} />
                      <button type="submit" style={{ background: 'none', border: 0, color: '#b3261e', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Borrar</button>
                    </form>
                  </td>
                </tr>
              ))}
              {!lista.length ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: 24 }}>Todavía no cargaste ninguno. Los productos igual muestran los enlaces oficiales por marca.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
