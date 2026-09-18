import AdminHeader from '../AdminHeader';
import { listarPendientes } from '../../../lib/fotosPendientes';
import { leerTodos } from '../../../lib/catalogoStore';
import { aprobarFoto, rechazarFoto, aprobarTodas } from './actions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const fotoActual = (foto) => (!foto ? null : /^https?:\/\//.test(foto) ? foto : `/fotos/${foto}`);
const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const S = {
  grilla: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginTop: 18 },
  tarjeta: { background: 'var(--surface)', border: '1px solid var(--rule)', borderRadius: 12, padding: 14, display: 'grid', gap: 10 },
  fotos: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  caja: { display: 'grid', gap: 4, fontSize: 12, color: 'var(--muted, #667085)' },
  img: { width: '100%', aspectRatio: '1 / 1', objectFit: 'contain', background: '#fff', borderRadius: 8, border: '1px solid var(--rule)' },
  vacia: { width: '100%', aspectRatio: '1 / 1', display: 'grid', placeItems: 'center', background: 'var(--rule)', borderRadius: 8 },
  botones: { display: 'flex', gap: 8 },
  btn: {
    width: '100%', background: 'var(--brand)', color: '#fff', border: 0, borderRadius: 8, padding: '9px 14px',
    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
  btnGhost: {
    width: '100%', background: 'var(--surface)', color: 'var(--brand-ink)', border: '1px solid var(--rule-strong, var(--rule))',
    borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
};

export default async function FotosPendientes({ searchParams }) {
  let pendientes = [];
  let errorCarga = null;
  try {
    pendientes = await listarPendientes();
  } catch (e) {
    errorCarga = e.message;
  }
  const productos = new Map((await leerTodos()).map((p) => [p.codigo, p]));
  const ok = searchParams?.ok === '1';
  const n = Number(searchParams?.n || 0);
  const err = searchParams?.err || errorCarga;

  return (
    <>
      <AdminHeader activo="fotos" />
      <main className="adm">
        <div className="wrap">
          <h1>Fotos pendientes</h1>
          <p className="sub">
            Fotos que mandó la extensión de Chrome &ldquo;Logbelts · Fotos del catálogo&rdquo;. Al aprobar, la foto nueva
            reemplaza a la actual y se ve en la web al instante. Al rechazar, se borra.
          </p>

          {ok ? <div className="ok-msg">{n === 1 ? 'Foto aprobada y publicada.' : `${n} fotos aprobadas y publicadas.`}</div> : null}
          {searchParams?.rechazada ? <div className="ok-msg">Foto rechazada.</div> : null}
          {err ? <div className="err-msg">{err}</div> : null}

          {pendientes.length ? (
            <form action={aprobarTodas} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {pendientes.map((f) => (
                <input key={f.nombre} type="hidden" name="nombre" value={f.nombre} />
              ))}
              <strong>{pendientes.length} {pendientes.length === 1 ? 'foto esperando' : 'fotos esperando'} aprobación</strong>
              <button type="submit" style={{ ...S.btn, width: 'auto' }}>Aprobar todas</button>
            </form>
          ) : (
            <p style={{ marginTop: 18 }}>No hay fotos pendientes. Las que guardes con la extensión van a aparecer acá.</p>
          )}

          <div style={S.grilla}>
            {pendientes.map((f) => {
              const p = productos.get(f.codigo);
              const actual = fotoActual(p?.foto);
              return (
                <article key={f.nombre} style={S.tarjeta}>
                  <div>
                    <a href={`/admin/productos/${encodeURIComponent(f.codigo)}`}><code>{f.codigo}</code></a>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{p?.nombre || 'Producto no encontrado'}</div>
                  </div>
                  <div style={S.fotos}>
                    <div style={S.caja}>
                      <span>Actual</span>
                      {actual ? <img src={actual} alt="Foto actual" style={S.img} /> : <div style={S.vacia}>Sin foto</div>}
                    </div>
                    <div style={S.caja}>
                      <span>Nueva{f.lado ? ` · ${f.lado}px` : ''}</span>
                      <a href={f.url} target="_blank" rel="noopener"><img src={f.url} alt="Foto nueva" style={S.img} /></a>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted, #667085)' }}>
                    {new Date(f.fecha).toLocaleString('es-AR')}
                    {f.pagina ? (
                      <>
                        {' · '}
                        <a href={f.pagina} target="_blank" rel="noopener">de {host(f.pagina) || 'la página de origen'}</a>
                      </>
                    ) : null}
                  </div>
                  <div style={S.botones}>
                    <form action={aprobarFoto} style={{ flex: 1 }}>
                      <input type="hidden" name="nombre" value={f.nombre} />
                      <button type="submit" style={S.btn}>Aprobar</button>
                    </form>
                    <form action={rechazarFoto} style={{ flex: 1 }}>
                      <input type="hidden" name="nombre" value={f.nombre} />
                      <button type="submit" style={S.btnGhost}>Rechazar</button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
