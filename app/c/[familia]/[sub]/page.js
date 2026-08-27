import { notFound } from 'next/navigation';
import CatalogoHeader from '../../../components/CatalogoHeader';
import ProductoCard from '../../../components/ProductoCard';
import { getFamilia, getProductosDeSubcategoria, slugify } from '../../../../lib/catalogo';

export const dynamic = 'force-dynamic';

export default function SubcategoriaPage({ params, searchParams }) {
  const fam = getFamilia(params.familia);
  if (!fam) notFound();
  const sub = fam.subcats.find((s) => s.slug === params.sub);
  if (!sub) notFound();

  const todos = getProductosDeSubcategoria(fam.slug, sub.slug);

  // marcas disponibles en esta subcategoría (con conteo)
  const marcaCount = {};
  for (const p of todos) for (const m of p.marcas || []) marcaCount[m] = (marcaCount[m] || 0) + 1;
  const marcasDisp = Object.keys(marcaCount).sort((a, b) => marcaCount[b] - marcaCount[a] || a.localeCompare(b));

  const marcaSel = searchParams?.marca || '';
  const soloFoto = searchParams?.foto === '1';
  const orden = searchParams?.orden || 'codigo';

  let lista = todos.filter((p) => {
    if (marcaSel && !(p.marcas || []).some((m) => slugify(m) === marcaSel)) return false;
    if (soloFoto && !p.foto) return false;
    return true;
  });
  lista = lista.slice().sort((a, b) =>
    orden === 'nombre' ? (a.nombre || '').localeCompare(b.nombre || '') : a.codigo.localeCompare(b.codigo)
  );

  const base = `/c/${fam.slug}/${sub.slug}`;
  const qp = (over) => {
    const sp = new URLSearchParams();
    const marca = 'marca' in over ? over.marca : marcaSel;
    const foto = 'foto' in over ? over.foto : soloFoto ? '1' : '';
    const o = 'orden' in over ? over.orden : orden;
    if (marca) sp.set('marca', marca);
    if (foto) sp.set('foto', foto);
    if (o && o !== 'codigo') sp.set('orden', o);
    const s = sp.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/">Inicio</a>
            <span className="sep">/</span>
            <a href={`/f/${fam.slug}`}>{fam.nombre}</a>
            <span className="sep">/</span>
            <span aria-current="page">{sub.nombre}</span>
          </nav>
          <h1 className="page">{sub.nombre}</h1>

          <div className="catgrid">
            <div className="filters">
              <div className="fpanel">
                <div className="fgroup">
                  <h4>Marca</h4>
                  <a className="fopt" href={qp({ marca: '' })} style={{ fontWeight: marcaSel ? 400 : 700 }}>
                    Todas <span className="n">{todos.length}</span>
                  </a>
                  {marcasDisp.map((m) => {
                    const s = slugify(m);
                    return (
                      <a
                        className="fopt"
                        key={s}
                        href={qp({ marca: marcaSel === s ? '' : s })}
                        style={{ fontWeight: marcaSel === s ? 700 : 400, color: marcaSel === s ? 'var(--brand-ink)' : undefined }}
                      >
                        {m} <span className="n">{marcaCount[m]}</span>
                      </a>
                    );
                  })}
                </div>
                <div className="fgroup">
                  <h4>Foto</h4>
                  <a className="fopt" href={qp({ foto: soloFoto ? '' : '1' })} style={{ fontWeight: soloFoto ? 700 : 400 }}>
                    {soloFoto ? '☑' : '☐'} Sólo con foto
                  </a>
                </div>
              </div>
            </div>

            <div>
              <div className="toolbar">
                <span className="res">
                  {lista.length.toLocaleString('es-AR')}
                  {lista.length !== todos.length ? ` de ${todos.length.toLocaleString('es-AR')}` : ''} productos
                </span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <a className="fmini" style={{ width: 'auto', padding: '6px 10px' }} href={qp({ orden: 'codigo' })}
                     data-on={orden === 'codigo'}>Código</a>
                  <a className="fmini" style={{ width: 'auto', padding: '6px 10px' }} href={qp({ orden: 'nombre' })}
                     data-on={orden === 'nombre'}>Nombre</a>
                </span>
              </div>

              {lista.length ? (
                <div className="pgrid">
                  {lista.map((p) => (
                    <ProductoCard key={p.codigo} p={p} />
                  ))}
                </div>
              ) : (
                <div className="empty">Ningún producto coincide con los filtros.</div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="cat">
        <div className="wrap">Logbelts · Catálogo · versión de trabajo</div>
      </footer>
    </>
  );
}
