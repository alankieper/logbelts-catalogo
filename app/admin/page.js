import AdminHeader from './AdminHeader';
import { estadisticas } from '../../lib/catalogoStore';
import { PASSWORD_SIN_CONFIGURAR } from '../../lib/adminPassword';
import { contarPendientes } from '../../lib/fotosPendientes';
import { contarContactosPorEstado } from '../../lib/contactos';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const [s, fotosPorRevisar, contactos] = await Promise.all([
    estadisticas(),
    contarPendientes().catch(() => 0),
    contarContactosPorEstado().catch(() => ({})),
  ]);
  const fams = Object.entries(s.porFamilia)
    .filter(([k]) => k !== '(sin)')
    .sort((a, b) => b[1] - a[1]);

  // Tarjetas de "¿Qué hago hoy?": cada una dice en palabras simples qué hay para hacer y lleva directo ahí.
  const tareas = [
    {
      n: contactos.nuevo || 0,
      titulo: 'Consultas de clientes sin responder',
      ok: 'No hay consultas esperando.',
      pendiente: 'Clientes que escribieron desde la web y todavía no fueron atendidos.',
      href: '/admin/contactos?estado=nuevo',
      boton: 'Ver consultas',
    },
    {
      n: fotosPorRevisar,
      titulo: 'Fotos para revisar',
      ok: 'No hay fotos esperando.',
      pendiente: 'Fotos nuevas que hay que mirar y aprobar para que se vean en el catálogo.',
      href: '/admin/fotos-pendientes',
      boton: 'Revisar fotos',
    },
    {
      n: s.sinFoto,
      titulo: 'Productos sin foto',
      ok: 'Todos los productos tienen foto.',
      pendiente: 'Repuestos que todavía no tienen foto. Un producto con foto se consulta más.',
      href: '/admin/productos?sinfoto=1',
      boton: 'Ver productos',
    },
    {
      n: s.derivadas,
      titulo: 'Descripciones a confirmar',
      ok: 'Todas las descripciones están confirmadas.',
      pendiente: 'Descripciones que salieron de una lectura automática y conviene revisar.',
      href: '/admin/productos?deriv=1',
      boton: 'Revisar descripciones',
    },
  ];

  return (
    <>
      <AdminHeader activo="home" />
      <main className="adm">
        <div className="wrap">
          <h1>¿Qué hago hoy?</h1>
          {PASSWORD_SIN_CONFIGURAR ? (
            <div className="err-msg" style={{ lineHeight: 1.5 }}>
              <b>Falta poner una contraseña propia.</b> El panel está usando la contraseña de fábrica.
              Entrá a Vercel → el proyecto → Settings → Environment Variables y agregá <code>ADMIN_PASSWORD</code>
              {' '}con la contraseña que quieras (y <code>AUTH_SECRET</code> con un texto largo al azar). Después volvé a publicar.
            </div>
          ) : null}
          <p className="sub">Lo que conviene hacer hoy, de lo más importante a lo menos. Tocá una tarjeta y vas directo. Los cambios se ven enseguida en el catálogo.</p>

          <div className="hoy">
            {tareas.map((t) => (
              <a key={t.titulo} className="hoy-card" data-ok={t.n === 0 ? 'true' : undefined} href={t.href}>
                <span className="hoy-n" aria-hidden="true">{t.n === 0 ? '✓' : t.n.toLocaleString('es-AR')}</span>
                <span className="hoy-txt">
                  <b>{t.n === 0 ? t.titulo : `${t.n.toLocaleString('es-AR')} · ${t.titulo}`}</b>
                  <small>{t.n === 0 ? t.ok : t.pendiente}</small>
                </span>
                <span className="hoy-ir">{t.n === 0 ? 'Ver igual' : t.boton} →</span>
              </a>
            ))}
          </div>

          <h2 className="hoy-sec">El catálogo en números</h2>
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
