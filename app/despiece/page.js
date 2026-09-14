import CatalogoHeader from '../components/CatalogoHeader';
import { catalogoModelos, leerCurados } from '../../lib/despieces';
import { linkDespiece } from '../../lib/despieceLinks';
import { slugify } from '../../lib/catalogo';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Despiece por modelo',
  description: 'Despieces y diagramas de partes por marca y modelo de máquina, con acceso directo a cada modelo y a los repuestos Logbelts compatibles.',
};

const plano = (s) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

export default async function DespiecePage({ searchParams }) {
  const grupos = catalogoModelos();
  const curados = (await leerCurados()).filter((c) => c.publico);
  const marcaF = searchParams?.marca || '';
  const q = (searchParams?.q || '').toLowerCase().trim();

  let vista = grupos;
  if (marcaF) vista = vista.filter((g) => g.marca === marcaF);
  if (q) {
    vista = vista
      .map((g) => ({ ...g, modelos: g.modelos.filter((m) => (g.marca + ' ' + m.modelo).toLowerCase().includes(q)) }))
      .filter((g) => g.modelos.length);
  }

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/productos">Catálogo</a><span className="sep">/</span>
            <span aria-current="page">Despiece</span>
          </nav>
          <h1 className="page">Despiece por modelo</h1>
          <p className="lead">
            Elegí el modelo de la máquina y abrí directo su despiece (diagramas de partes). Desde cada modelo también
            ves los repuestos Logbelts compatibles.
          </p>

          <form method="get" className="admbar" style={{ marginBottom: 18 }}>
            <input name="q" defaultValue={q} placeholder="Buscar modelo (MS 250, FS 160, GX160…)" style={{ minWidth: 260, border: '1px solid var(--rule-strong)', borderRadius: 8, padding: '9px 12px', fontFamily: 'inherit', fontSize: 13 }} />
            {marcaF ? <input type="hidden" name="marca" value={marcaF} /> : null}
            <button className="btn" type="submit" style={{ background: 'var(--brand)', color: '#fff', border: 0, borderRadius: 8, padding: '9px 14px', fontWeight: 700, cursor: 'pointer' }}>Buscar</button>
          </form>

          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 20 }}>
            <a href="/despiece" className="chip-lnk" data-on={!marcaF}>Todas</a>
            {grupos.map((g) => (
              <a key={g.marca} href={`/despiece?marca=${encodeURIComponent(g.marca)}`} className="chip-lnk" data-on={marcaF === g.marca}>
                {g.marca} <span style={{ opacity: .6 }}>{g.modelos.length}</span>
              </a>
            ))}
          </div>

          {vista.map((g) => (
            <section key={g.marca} style={{ marginBottom: 28 }}>
              <h2 className="page" style={{ fontSize: '1.15rem', margin: '0 0 10px' }}>{g.marca}</h2>
              <div className="despiece-grilla">
                {g.modelos.map((m) => {
                  const cur = curados.find((c) => c.marca === g.marca && plano(c.modelo) === plano(m.modelo));
                  const propio = cur ? { url: cur.archivo ? `/despieces/${cur.archivo}` : cur.url, label: cur.titulo, directo: true } : null;
                  const link = propio || linkDespiece(g.marca, m.modelo);
                  return (
                    <div key={m.modelo} className="despiece-tile">
                      <h3>{m.modelo}</h3>
                      {link ? (
                        <a href={link.url} target="_blank" rel="noreferrer" className={link.directo ? 'directo' : ''}>
                          {link.directo ? 'Ver despiece ↗' : `Buscar en despieces ${g.marca} ↗`}
                        </a>
                      ) : (
                        <span className="sin">Sin despiece online</span>
                      )}
                      <a href={`/maquinas/${slugify(g.marca)}/${slugify(m.modelo)}`} className="repuestos">
                        {m.n} repuesto{m.n === 1 ? '' : 's'} compatible{m.n === 1 ? '' : 's'}
                      </a>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          {!vista.length ? <div className="empty">Sin resultados.</div> : null}
          <p className="note">
            Los despieces se abren en diyspareparts.com, un sitio externo con diagramas de partes por modelo. Los PDF propios
            de Logbelts se cargan desde Administración y aparecen primero.
          </p>
        </div>
      </main>
      <footer className="cat"><div className="wrap">Logbelts · Catálogo · versión de trabajo</div></footer>
    </>
  );
}
