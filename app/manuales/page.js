import CatalogoHeader from '../components/CatalogoHeader';
import { catalogoModelos, leerCurados } from '../../lib/despieces';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Manuales y despieces — Catálogo Logbelts',
  description: 'Despieces y manuales por marca y modelo de máquina, con enlaces a los sitios oficiales.',
};

const OFICIAL = {
  Husqvarna: 'https://www.husqvarna.com/us/support/',
  Honda: 'https://peparts.honda.com/engines',
  Stihl: 'https://www.stihlusa.com/products/',
};

export default async function ManualesPage({ searchParams }) {
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
            <a href="/">Inicio</a><span className="sep">/</span>
            <span aria-current="page">Manuales y despieces</span>
          </nav>
          <p className="eyebrow">Nuevo</p>
          <h1 className="page">Manuales y despieces</h1>
          <p className="lead">
            Despieces y manuales por modelo de máquina. Los enlaces van a los buscadores
            oficiales de cada marca. Logbelts va sumando acá los PDF propios.
          </p>

          <form method="get" className="admbar" style={{ marginBottom: 18 }}>
            <input name="q" defaultValue={q} placeholder="Buscar modelo (MS 250, 143R, GX160…)" style={{ minWidth: 260, border: '1px solid var(--rule-strong)', borderRadius: 8, padding: '9px 12px', fontFamily: 'inherit', fontSize: 13 }} />
            <button className="btn" type="submit" style={{ background: 'var(--brand)', color: '#fff', border: 0, borderRadius: 8, padding: '9px 14px', fontWeight: 700, cursor: 'pointer' }}>Buscar</button>
          </form>

          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 20 }}>
            <a href="/manuales" className="chip-lnk" data-on={!marcaF}>Todas</a>
            {grupos.map((g) => (
              <a key={g.marca} href={`/manuales?marca=${encodeURIComponent(g.marca)}`} className="chip-lnk" data-on={marcaF === g.marca}>
                {g.marca} <span style={{ opacity: .6 }}>{g.modelos.length}</span>
              </a>
            ))}
          </div>

          {vista.map((g) => (
            <section key={g.marca} style={{ marginBottom: 28 }}>
              <h2 className="page" style={{ fontSize: '1.15rem', margin: '0 0 6px' }}>{g.marca}</h2>
              {OFICIAL[g.marca] ? (
                <p style={{ fontSize: 12.5, margin: '0 0 10px' }}>
                  <a href={OFICIAL[g.marca]} target="_blank" rel="noreferrer">Buscador oficial {g.marca} ↗</a>
                </p>
              ) : null}
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
                {g.modelos.map((m) => {
                  const cur = curados.find((c) => c.marca === g.marca && c.modelo.toUpperCase().replace(/[^A-Z0-9]/g, '') === m.modelo.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                  const url = cur && cur.archivo ? `/despieces/${cur.archivo}` : cur ? cur.url : 'https://www.google.com/search?q=' + encodeURIComponent(g.marca + ' ' + m.modelo + ' despiece IPL parts diagram');
                  return (
                    <a key={m.modelo} href={url} target="_blank" rel="noreferrer" className="tile" style={{ minHeight: 0 }}>
                      <span className="txt">
                        <h3 style={{ fontSize: 13 }}>{m.modelo}</h3>
                        <span className="count">{cur ? cur.titulo : `Diagramas · ${m.n} producto${m.n === 1 ? '' : 's'}`}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
          {!vista.length ? <div className="empty">Sin resultados.</div> : null}
        </div>
      </main>
      <footer className="cat"><div className="wrap">Logbelts · Catálogo · versión de trabajo</div></footer>
    </>
  );
}
