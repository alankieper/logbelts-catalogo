import { notFound } from 'next/navigation';
import AdminHeader from '../../AdminHeader';
import { getRun, leerCambios } from '../../../../lib/importador';
import { decidirCambio, decidirLote, aplicarImport, revertirImport } from './actions';

export const dynamic = 'force-dynamic';

const PAGE = 25;
const val = (v) => (Array.isArray(v) ? v.join(' | ') : v == null || v === '' ? '—' : String(v));

export default function RevisarImport({ params, searchParams }) {
  const id = params.id;
  const run = getRun(id);
  if (!run) notFound();
  const cambios = leerCambios(id) || [];

  const tipoF = searchParams?.tipo || '';
  const estadoF = searchParams?.estado || '';
  const p = Math.max(1, parseInt(searchParams?.p || '1', 10) || 1);

  const cont = {
    nuevo: cambios.filter((c) => c.tipo === 'nuevo').length,
    modificado: cambios.filter((c) => c.tipo === 'modificado').length,
    eliminado: cambios.filter((c) => c.tipo === 'eliminado').length,
    aprobado: cambios.filter((c) => c.decision === 'aprobado').length,
    rechazado: cambios.filter((c) => c.decision === 'rechazado').length,
    pendiente: cambios.filter((c) => c.decision === 'pendiente').length,
  };

  let lista = cambios;
  if (tipoF) lista = lista.filter((c) => c.tipo === tipoF);
  if (estadoF) lista = lista.filter((c) => c.decision === estadoF);
  const paginas = Math.max(1, Math.ceil(lista.length / PAGE));
  const pg = Math.min(p, paginas);
  const slice = lista.slice((pg - 1) * PAGE, pg * PAGE);

  const qs = (over) => {
    const sp = new URLSearchParams();
    const t = 'tipo' in over ? over.tipo : tipoF;
    const e = 'estado' in over ? over.estado : estadoF;
    if (t) sp.set('tipo', t);
    if (e) sp.set('estado', e);
    if (over.p && over.p > 1) sp.set('p', String(over.p));
    const s = sp.toString();
    return `/admin/importar/${id}` + (s ? `?${s}` : '');
  };

  const aplicado = searchParams?.aplicado === '1';
  const revertido = searchParams?.revertido === '1';
  const err = searchParams?.err;

  return (
    <>
      <AdminHeader activo="importar" />
      <main className="adm">
        <div className="wrap">
          <a className="backlink" href="/admin/importar">← Volver a importaciones</a>
          <h1>Revisión de importación</h1>
          <p className="sub">{run.archivo} · {new Date(run.created_at).toLocaleString('es-AR')} · estado: {run.estado}</p>

          {run.estado === 'error' ? <div className="err-msg">Error en el análisis: {run.error}</div> : null}
          {run.ia ? (
            run.ia.ok ? (
              <div className="ok-msg">IA: {run.ia.mejorados} descripciones mejoradas de {run.ia.revisados} revisadas{run.ia.errores ? ` (${run.ia.errores} lotes con error)` : ''}.</div>
            ) : (
              <div className="err-msg">IA no disponible: {run.ia.error}</div>
            )
          ) : null}
          {aplicado ? <div className="ok-msg">Cambios aplicados. El catálogo público ya está actualizado.</div> : null}
          {revertido ? <div className="ok-msg">Se volvió atrás. El catálogo quedó como antes de esta importación.</div> : null}
          {err ? <div className="err-msg">{err}</div> : null}

          {run.estado !== 'error' ? (
            <>
              <div className="kpis">
                <div className="kpi"><div className="n" style={{ color: 'var(--ok)' }}>+{cont.nuevo}</div><div className="l">Nuevos</div></div>
                <div className="kpi"><div className="n" style={{ color: 'var(--warn)' }}>~{cont.modificado}</div><div className="l">Modificados</div></div>
                <div className="kpi"><div className="n" style={{ color: '#b3261e' }}>−{cont.eliminado}</div><div className="l">Eliminados</div></div>
                <div className="kpi"><div className="n">{cont.aprobado}</div><div className="l">Aprobados</div></div>
                <div className="kpi"><div className="n">{cont.rechazado}</div><div className="l">Rechazados</div></div>
                <div className="kpi"><div className="n">{cont.pendiente}</div><div className="l">Pendientes</div></div>
              </div>

              {cambios.length === 0 ? (
                <div className="empty">Sin diferencias: el PDF nuevo coincide con lo que ya está cargado.</div>
              ) : (
                <>
                  {/* aprobar/rechazar en lote */}
                  <div className="admbar">
                    <span style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>En lote:</span>
                    {['nuevo', 'modificado', 'eliminado'].map((t) => (
                      <form key={t} action={decidirLote} style={{ display: 'inline-flex', gap: 4 }}>
                        <input type="hidden" name="id" value={id} />
                        <input type="hidden" name="tipo" value={t} />
                        <input type="hidden" name="decision" value="aprobado" />
                        <button className="btn ghost" type="submit">Aprobar {t}s</button>
                      </form>
                    ))}
                    <form action={decidirLote} style={{ display: 'inline-flex', gap: 4 }}>
                      <input type="hidden" name="id" value={id} />
                      <input type="hidden" name="tipo" value="todos" />
                      <input type="hidden" name="decision" value="pendiente" />
                      <button className="btn ghost" type="submit">Marcar todo pendiente</button>
                    </form>
                  </div>

                  {/* filtros */}
                  <div className="admbar" style={{ fontSize: 12.5 }}>
                    <a className="btn ghost" href={qs({ tipo: '' })} data-on={!tipoF}>Todos</a>
                    <a className="btn ghost" href={qs({ tipo: 'nuevo' })} data-on={tipoF === 'nuevo'}>Nuevos</a>
                    <a className="btn ghost" href={qs({ tipo: 'modificado' })} data-on={tipoF === 'modificado'}>Modificados</a>
                    <a className="btn ghost" href={qs({ tipo: 'eliminado' })} data-on={tipoF === 'eliminado'}>Eliminados</a>
                    <span style={{ marginLeft: 12 }}>·</span>
                    <a className="btn ghost" href={qs({ estado: '' })} data-on={!estadoF}>Cualquiera</a>
                    <a className="btn ghost" href={qs({ estado: 'pendiente' })} data-on={estadoF === 'pendiente'}>Pendientes</a>
                    <a className="btn ghost" href={qs({ estado: 'aprobado' })} data-on={estadoF === 'aprobado'}>Aprobados</a>
                  </div>

                  {slice.map((c) => (
                    <div key={c.key} style={{ background: 'var(--surface)', border: '1px solid var(--rule)', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`tag ${c.tipo === 'nuevo' ? 'ok' : c.tipo === 'eliminado' ? 'off' : 'warn'}`}>{c.tipo}</span>
                        <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{c.codigo}</strong>
                        {c.pagina ? <span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>pág. {c.pagina}</span> : null}
                        <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 700, color: c.decision === 'aprobado' ? 'var(--ok)' : c.decision === 'rechazado' ? '#b3261e' : 'var(--ink-faint)' }}>
                          {c.decision}
                        </span>
                      </div>

                      {c.tipo === 'nuevo' ? (
                        <p style={{ fontSize: 13, margin: '8px 0 0', color: 'var(--ink-soft)' }}>
                          <strong>{c.propuesto.nombre || c.propuesto.clave_producto}</strong> — {c.propuesto.familia} › {c.propuesto.subcategoria}
                          {c.propuesto.descripcion ? <><br />{c.propuesto.descripcion}</> : null}
                        </p>
                      ) : null}

                      {c.tipo === 'eliminado' ? (
                        <p style={{ fontSize: 13, margin: '8px 0 0', color: 'var(--ink-soft)' }}>
                          Ya no aparece en el PDF nuevo: <strong>{c.actual.nombre || c.actual.clave_producto}</strong> ({c.actual.familia} › {c.actual.subcategoria}).
                          Al aplicar queda marcado como <em>descontinuado</em> y oculto (no se borra).
                        </p>
                      ) : null}

                      {c.tipo === 'modificado' ? (
                        <table className="admtable" style={{ marginTop: 8, fontSize: 12 }}>
                          <thead><tr><th style={{ width: 130 }}>Campo</th><th>Antes</th><th>Después (PDF nuevo)</th></tr></thead>
                          <tbody>
                            {c.dif.map((d, i) => (
                              <tr key={i}>
                                <td style={{ textTransform: 'capitalize' }}>{d.campo}</td>
                                <td style={{ color: 'var(--ink-faint)' }}>{val(d.antes)}</td>
                                <td>{val(d.despues)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : null}

                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        {['aprobado', 'rechazado', 'pendiente'].map((d) => (
                          <form key={d} action={decidirCambio}>
                            <input type="hidden" name="id" value={id} />
                            <input type="hidden" name="key" value={c.key} />
                            <input type="hidden" name="decision" value={d} />
                            <button
                              type="submit"
                              style={{
                                border: '1px solid var(--rule-strong)', borderRadius: 8, padding: '6px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                                background: c.decision === d ? (d === 'aprobado' ? 'var(--ok)' : d === 'rechazado' ? '#b3261e' : 'var(--ink-faint)') : 'var(--surface)',
                                color: c.decision === d ? '#fff' : 'var(--ink-soft)',
                              }}
                            >
                              {d === 'aprobado' ? 'Aprobar' : d === 'rechazado' ? 'Rechazar' : 'Pendiente'}
                            </button>
                          </form>
                        ))}
                        <a href={`/admin/productos/${encodeURIComponent(c.codigo)}`} target="_blank" style={{ fontSize: 12.5, alignSelf: 'center', marginLeft: 4 }}>
                          Ver producto
                        </a>
                      </div>
                    </div>
                  ))}

                  {paginas > 1 ? (
                    <div className="pager">
                      {pg > 1 ? <a href={qs({ p: pg - 1 })}>← Anterior</a> : null}
                      <span>Página {pg} de {paginas}</span>
                      {pg < paginas ? <a href={qs({ p: pg + 1 })}>Siguiente →</a> : null}
                    </div>
                  ) : null}
                </>
              )}

              {/* aplicar / revertir */}
              <div style={{ marginTop: 26, borderTop: '2px solid var(--ink)', paddingTop: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                {run.estado === 'aplicado' ? (
                  <>
                    <span className="tag ok">Aplicado</span>
                    <form action={revertirImport}>
                      <input type="hidden" name="id" value={id} />
                      <button className="danger" type="submit" style={{ border: '1px solid #f0d3d3', borderRadius: 9, padding: '10px 16px', background: '#fff', color: '#b3261e', fontWeight: 700, cursor: 'pointer' }}>
                        Volver atrás esta importación
                      </button>
                    </form>
                  </>
                ) : (
                  <form action={aplicarImport}>
                    <input type="hidden" name="id" value={id} />
                    <button className="save" type="submit" style={{ background: 'var(--brand)', color: '#fff', border: 0, borderRadius: 9, padding: '12px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                      Aplicar los {cont.aprobado} cambios aprobados
                    </button>
                  </form>
                )}
                <span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>
                  Antes de aplicar se guarda una copia para poder volver atrás.
                </span>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
