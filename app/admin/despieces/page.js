import '../admin-extra.css';
import './despieces-admin.css';
import AdminHeader from '../AdminHeader';
import { listarMaquinas } from '../../../lib/maquinas';
import { leerDiagramas } from '../../../lib/despieceDiagramas';
import NuevoDespiece from './NuevoDespiece';

export const dynamic = 'force-dynamic';

export default async function AdminDespieces({ searchParams }) {
  const [maquinas, diagramas] = await Promise.all([listarMaquinas(), leerDiagramas()]);
  const porClave = new Map(maquinas.map((m) => [m.clave, m]));

  // agrupados por máquina, la máquina más reciente primero
  const grupos = new Map();
  for (const d of [...diagramas].sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))) {
    if (!grupos.has(d.clave)) grupos.set(d.clave, { maquina: porClave.get(d.clave), texto: `${d.marca} ${d.modelo}`, diagramas: [] });
    grupos.get(d.clave).diagramas.push(d);
  }
  for (const g of grupos.values()) {
    g.diagramas.sort((a, b) => (a.orden || 0) - (b.orden || 0) || String(a.variante).localeCompare(String(b.variante), 'es', { numeric: true }));
  }

  return (
    <>
      <AdminHeader activo="despieces" />
      <main className="adm">
        <div className="wrap">
          <h1>Despieces</h1>
          <p className="sub">
            Cada máquina puede tener varios despieces (uno por variante: FS 55, FS 55 R, FS 55 T). Los repuestos de cada
            máquina se vinculan solos por el campo <b>Despiece</b> de cada producto; acá sólo cargás la imagen y, si querés,
            el número de cada pieza en el dibujo.
          </p>
          {searchParams?.error ? <div className="err-msg">{searchParams.error}</div> : null}
          {searchParams?.borrado ? <div className="ok-msg">Despiece borrado.</div> : null}

          <section className="dsp-card">
            <h2>Cargar un despiece nuevo</h2>
            <NuevoDespiece maquinas={maquinas.map((m) => ({ t: m.texto, n: m.n }))} />
          </section>

          <h2 className="dsp-h2">Despieces cargados ({diagramas.length})</h2>
          {!grupos.size ? (
            <p className="mut">Todavía no hay despieces cargados.</p>
          ) : (
            <div className="dsp-lista">
              {[...grupos.entries()].map(([clave, g]) => (
                <article key={clave} className="dsp-maq">
                  <header>
                    <h3>{g.texto}</h3>
                    {g.maquina ? (
                      <a href={`/maquinas/${g.maquina.marcaSlug}/${g.maquina.modeloSlug}#despiece`} target="_blank">Ver en el sitio ↗</a>
                    ) : (
                      <span className="dsp-alerta">Ningún producto nombra esta máquina en su campo Despiece</span>
                    )}
                  </header>
                  <ul>
                    {g.diagramas.map((d) => (
                      <li key={d.id}>
                        <a href={`/admin/despieces/${encodeURIComponent(d.id)}`} className="dsp-item">
                          {d.imagen ? <img src={d.imagen} alt="" loading="lazy" /> : <span className="dsp-sinimg" />}
                          <span className="dsp-item-txt">
                            <b>{d.variante}</b>
                            <small>
                              {(d.piezas || []).length} {(d.piezas || []).length === 1 ? 'pieza numerada' : 'piezas numeradas'}
                              {d.publico === false ? ' · oculto' : ''}
                            </small>
                          </span>
                          <span className="dsp-ir" aria-hidden="true">Editar ›</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
