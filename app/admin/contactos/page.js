import AdminHeader from '../AdminHeader';
import { guardarSeguimiento } from './actions';
import { supabase } from '../../../lib/supabase';
import { ESTADOS, ORIGENES, contarContactosPorEstado, gestionDisponible, leerContactos } from '../../../lib/contactos';
import { leerPedidos } from '../../../lib/pedidos';
import { waLink } from '../../../lib/telefono';

export const dynamic = 'force-dynamic';

const fecha = (iso) => new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' });

export default async function ContactosAdmin({ searchParams }) {
  const estado = (searchParams?.estado || '').toString();
  const vendedor = (searchParams?.vendedor || '').toString();
  const q = (searchParams?.q || '').toString();
  const ver = searchParams?.ver === 'pedidos' ? 'pedidos' : 'contactos';

  const [{ data: vendedoresData }, lectura, cuenta, pedidos] = await Promise.all([
    supabase.from('vendedores').select('*').order('nombre'),
    ver === 'contactos' ? leerContactos({ estado, vendedor, q }) : Promise.resolve({ disponible: gestionDisponible, filas: [] }),
    contarContactosPorEstado(),
    ver === 'pedidos' ? leerPedidos(200) : Promise.resolve([]),
  ]);
  const vendedores = vendedoresData || [];
  const porId = Object.fromEntries(vendedores.map((v) => [v.id, v]));
  const volver = `/admin/contactos?${new URLSearchParams({ ...(estado && { estado }), ...(vendedor && { vendedor }), ...(q && { q }) })}`;

  return (
    <>
      <AdminHeader activo="contactos" />
      <main className="adm">
        <div className="wrap">
          <h1>Contactos</h1>
          <p className="sub">Todo lo que llega desde la web: popup, formulario, búsquedas sin resultado y consultas por máquina. Cada contacto se asigna al vendedor de su provincia.</p>

          {searchParams?.ok ? <p className="ok-msg">Seguimiento guardado.</p> : null}
          {searchParams?.err ? <p className="err-msg">No se pudo guardar el cambio.</p> : null}

          {!gestionDisponible ? (
            <div className="adm-aviso">
              <b>Falta configurar el seguimiento de contactos.</b> Los contactos ya se guardan, pero para verlos acá:
              <ol>
                <li>Correr <code>supabase/migrations/0011_web_contactos.sql</code> en el SQL Editor de Supabase.</li>
                <li>En Vercel, agregar la variable <code>SUPABASE_SERVICE_ROLE_KEY</code> (Supabase → Project Settings → API → service_role) y volver a publicar.</li>
                <li>Opcional: <code>RESEND_API_KEY</code> y <code>AVISOS_FROM</code> para que cada vendedor reciba un email al instante.</li>
              </ol>
            </div>
          ) : null}

          <div className="kpis">
            {ESTADOS.map((e) => (
              <a key={e.id} className="kpi" href={`/admin/contactos?estado=${e.id}`} style={{ textDecoration: 'none' }}>
                <div className="n">{(cuenta[e.id] || 0).toLocaleString('es-AR')}</div>
                <div className="l">{e.label}</div>
              </a>
            ))}
          </div>

          <div className="adm-tabs">
            <a href="/admin/contactos" data-on={ver === 'contactos'}>Contactos</a>
            <a href="/admin/contactos?ver=pedidos" data-on={ver === 'pedidos'}>Pedidos enviados</a>
          </div>

          {ver === 'contactos' ? (
            <>
              <form className="admbar" method="get">
                <input name="q" defaultValue={q} placeholder="Buscar empresa, nombre, teléfono, zona…" />
                <select name="estado" defaultValue={estado}>
                  <option value="">Todos los estados</option>
                  {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
                </select>
                <select name="vendedor" defaultValue={vendedor}>
                  <option value="">Todos los vendedores</option>
                  <option value="sin">Sin asignar</option>
                  {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                </select>
                <button className="btn" type="submit">Filtrar</button>
                {estado || vendedor || q ? <a className="btn ghost" href="/admin/contactos">Limpiar</a> : null}
              </form>

              {lectura.error ? <p className="err-msg">{lectura.error}</p> : null}

              {lectura.filas.length ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admtable adm-contacto">
                    <thead>
                      <tr><th>Fecha</th><th>Contacto</th><th>Zona</th><th>Consulta</th><th>Seguimiento</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                      {lectura.filas.map((c) => {
                        const asignado = porId[c.vendedor_id];
                        const saludo = `Hola ${c.nombre || ''}, te escribo de Logbelts por tu consulta en la web.`;
                        const aviso = `Nuevo contacto web para vos:\n${[c.empresa, c.nombre].filter(Boolean).join(' · ')}\nTel: ${c.telefono || '—'}\nZona: ${[c.localidad, c.provincia].filter(Boolean).join(', ') || '—'}${c.consulta ? `\nConsulta: ${c.consulta}` : ''}`;
                        return (
                          <tr key={c.id}>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              {fecha(c.creado)}
                              <div><span className={`est estado-${c.estado}`}>{ESTADOS.find((e) => e.id === c.estado)?.label || c.estado}</span></div>
                            </td>
                            <td className="quien">
                              <b>{c.empresa || c.nombre || '—'}</b>
                              {c.empresa && c.nombre ? <span>{c.nombre}</span> : null}
                              <span>{c.telefono}</span>
                              {c.email ? <span>{c.email}</span> : null}
                              <span>{ORIGENES[c.origen] || c.origen}</span>
                            </td>
                            <td>{[c.localidad, c.provincia].filter(Boolean).join(', ') || '—'}</td>
                            <td className="consulta" title={c.consulta || ''}>
                              {c.consulta ? (c.consulta.length > 160 ? `${c.consulta.slice(0, 160)}…` : c.consulta) : '—'}
                            </td>
                            <td>
                              <form action={guardarSeguimiento}>
                                <input type="hidden" name="id" value={c.id} />
                                <input type="hidden" name="volver" value={volver} />
                                <select name="estado" defaultValue={c.estado} aria-label="Estado">
                                  {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
                                </select>
                                <select name="vendedor_id" defaultValue={c.vendedor_id || ''} aria-label="Vendedor">
                                  <option value="">Sin asignar</option>
                                  {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                                </select>
                                <input name="notas" defaultValue={c.notas || ''} placeholder="Notas" aria-label="Notas" />
                                <button type="submit">Guardar</button>
                              </form>
                            </td>
                            <td>
                              <div className="adm-links">
                                {waLink(c.telefono) ? <a className="wa" href={waLink(c.telefono, saludo)} target="_blank" rel="noreferrer">WhatsApp al cliente</a> : null}
                                {asignado?.telefono ? <a href={waLink(asignado.telefono, aviso)} target="_blank" rel="noreferrer">Avisar a {asignado.nombre}</a> : null}
                                {c.visitante_id ? <a href={`/admin/visitantes/${c.visitante_id}`}>Ver actividad</a> : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : gestionDisponible ? (
                <p className="empty">No hay contactos con esos filtros.</p>
              ) : null}
            </>
          ) : pedidos.length ? (
            <table className="admtable">
              <thead><tr><th>Fecha</th><th>Origen</th><th>Productos</th><th>Cliente</th></tr></thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{fecha(p.creado)}</td>
                    <td>{p.origen === 'rapido' ? 'Pedido rápido' : 'Lista de pedido'}</td>
                    <td style={{ fontSize: 12.5 }}>
                      {(p.items || []).slice(0, 12).map((x) => (
                        <div key={x.codigo}><a href={`/p/${encodeURIComponent(x.codigo)}`} className="cod">{x.codigo}</a> × {x.cant} · {x.nombre}</div>
                      ))}
                      {(p.items || []).length > 12 ? <div className="mut">y {p.items.length - 12} más</div> : null}
                    </td>
                    <td>{p.visitante_id ? <a href={`/admin/visitantes/${p.visitante_id}`}>Ver cliente</a> : <span className="mut">Anónimo</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty">{gestionDisponible ? 'Todavía no hay pedidos enviados desde la web.' : 'Se ven cuando esté configurado el seguimiento (ver arriba).'}</p>
          )}
        </div>
      </main>
    </>
  );
}
