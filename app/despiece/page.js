import { notFound } from 'next/navigation';
import '../despiece-visor.css';
import CatalogoHeader from '../components/CatalogoHeader';
import CatalogoPie from '../components/CatalogoPie';
import { catalogoModelos, leerCurados } from '../../lib/despieces';
import { linkDespiece } from '../../lib/despieceLinks';
import { resumenDiagramas } from '../../lib/despieceDiagramas';
import { maquinaPorClave } from '../../lib/maquinas';
import { MARCA, modulo } from '../../lib/marca';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Despieces por máquina',
  description: `Despieces y diagramas de partes por marca y modelo de ${MARCA.maquinas.singular}, con acceso directo a cada modelo y a los repuestos ${MARCA.nombre} compatibles.`,
};

const plano = (s) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

export default async function DespiecePage({ searchParams }) {
  if (!modulo('despiece')) notFound();
  const grupos = await catalogoModelos();
  // máquinas con despiece propio (imagen + lista de piezas), cargados desde el admin
  const propios = (
    await Promise.all(
      [...(await resumenDiagramas()).entries()].map(async ([clave, lista]) => {
        const m = await maquinaPorClave(clave);
        return m ? { ...m, n: m.codigos.length, diagramas: lista } : null;
      })
    )
  )
    .filter(Boolean)
    .sort((a, b) => a.texto.localeCompare(b.texto, 'es', { numeric: true }));
  const clavesPropias = new Set(propios.map((m) => m.clave));
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
            <a href="/#catalogo">Catálogo</a><span className="sep">/</span>
            <span aria-current="page">Despieces</span>
          </nav>
          <h1 className="page">Despieces</h1>
          <p className="lead">
            Elegí el modelo de la {MARCA.maquinas.singular} y mirá su despiece (diagrama de partes). Desde cada modelo también
            ves los repuestos {MARCA.nombre} compatibles.
          </p>

          {propios.length && !q && !marcaF ? (
            <section aria-labelledby="dsp-propios-titulo" style={{ marginBottom: 8 }}>
              <h2 id="dsp-propios-titulo" className="page" style={{ fontSize: '1.15rem', margin: '0 0 10px' }}>
                Despieces con lista de piezas
              </h2>
              <ul className="dsp-propios">
                {propios.map((m) => (
                  <li key={m.clave} className="dsp-propio">
                    <a href={`/maquinas/${m.marcaSlug}/${m.modeloSlug}#despiece`}>
                      {m.diagramas[0].imagen ? <img src={m.diagramas[0].imagen} alt="" loading="lazy" /> : null}
                      <span className="dsp-propio-txt">
                        <b>{m.texto}</b>
                        <small>{m.n} {m.n === 1 ? 'repuesto compatible' : 'repuestos compatibles'}</small>
                        {m.diagramas.length > 1 ? (
                          <span className="dsp-chips">
                            {m.diagramas.map((x) => <span key={x.id}>{x.variante}</span>)}
                          </span>
                        ) : null}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

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
                  const conDespiece = clavesPropias.has(m.clave);
                  const cur = curados.find((c) => c.marca === g.marca && plano(c.modelo) === plano(m.modelo));
                  const propio = conDespiece
                    ? { url: `/maquinas/${g.marcaSlug}/${m.slug}#despiece`, directo: true, interno: true }
                    : cur ? { url: cur.archivo ? `/despieces/${cur.archivo}` : cur.url, label: cur.titulo, directo: true } : null;
                  const link = propio || linkDespiece(g.marca, m.modelo);
                  return (
                    <div key={m.modelo} className="despiece-tile">
                      <h3>{m.modelo}</h3>
                      {link ? (
                        link.interno ? (
                          <a href={link.url} className="directo">Ver despiece</a>
                        ) : (
                          <a href={link.url} target="_blank" rel="noreferrer" className={link.directo ? 'directo' : ''}>
                            {link.directo ? 'Ver despiece ↗' : `Buscar en despieces ${g.marca} ↗`}
                          </a>
                        )
                      ) : (
                        <span className="sin">Sin despiece online</span>
                      )}
                      <a href={`/maquinas/${g.marcaSlug}/${m.slug}`} className="repuestos">
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
            Los despieces con lista de piezas son propios de {MARCA.nombre}. El resto se abre en diyspareparts.com, un sitio
            externo con diagramas de partes por modelo.
          </p>
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
