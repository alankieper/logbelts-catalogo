import { notFound } from 'next/navigation';
import CatalogoHeader from '../../../components/CatalogoHeader';
import CatalogoPie from '../../../components/CatalogoPie';
import ProductoCard from '../../../components/ProductoCard';
import FiltrosMovil from '../../../components/FiltrosMovil';
import { MarcaDeAgua } from '../../../components/DibujoCatalogo';
import { getFamilia, getProductosDeSubcategoria, slugify } from '../../../../lib/catalogo';
import { MARCA } from '../../../../lib/marca';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const fam = await getFamilia(params.familia);
  const sub = fam?.subcats.find((s) => s.slug === params.sub);
  if (!sub) return { title: 'Categoría no encontrada' };
  const n = (await getProductosDeSubcategoria(fam.slug, sub.slug)).length;
  const title = `${sub.nombre} para ${fam.nombre.toLowerCase()}`;
  const description = `${n} repuestos ${MARCA.nombre} de ${sub.nombre.toLowerCase()} para ${fam.nombre.toLowerCase()}. Buscá por código, código original o marca. Venta mayorista.`;
  return { title, description, openGraph: { title: `${title} · ${MARCA.nombre}`, description, images: ['/opengraph-image.png'] } };
}

export default async function SubcategoriaPage({ params, searchParams }) {
  const fam = await getFamilia(params.familia);
  if (!fam) notFound();
  const sub = fam.subcats.find((s) => s.slug === params.sub);
  if (!sub) notFound();

  const todos = await getProductosDeSubcategoria(fam.slug, sub.slug);

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

  const filtrosActivos = (marcaSel ? 1 : 0) + (soloFoto ? 1 : 0);
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
          <div className="pghead">
            <nav className="crumb">
              <a href="/#catalogo">Catálogo</a>
              <span className="sep">/</span>
              <a href={`/f/${fam.slug}`}>{fam.nombre}</a>
              <span className="sep">/</span>
              <span aria-current="page">{sub.nombre}</span>
            </nav>
            <h1 className="page">{sub.nombre}</h1>
            <p className="lead">
              {todos.length.toLocaleString('es-AR')} repuestos de {sub.nombre.toLowerCase()} para {fam.nombre.toLowerCase()}.
            </p>
            <MarcaDeAgua nombre={sub.nombre} familia={fam.nombre} />
          </div>

          {/* En celular: subcategorías hermanas y marcas como chips deslizables */}
          <div className="chiprow" aria-label="Otras categorías">
            <span className="chiprow__k">Categorías</span>
            {fam.subcats.map((s) => (
              <a
                className="chip-lnk"
                key={s.slug}
                href={`/c/${fam.slug}/${s.slug}`}
                data-on={s.slug === sub.slug ? 'true' : undefined}
                aria-current={s.slug === sub.slug ? 'page' : undefined}
              >
                {s.nombre}
              </a>
            ))}
          </div>
          {marcasDisp.length ? (
            <div className="chiprow" aria-label="Marcas">
              <span className="chiprow__k">Marcas</span>
              <a className="chip-lnk" href={qp({ marca: '' })} data-on={marcaSel ? undefined : 'true'}>Todas</a>
              {marcasDisp.map((m) => {
                const sm = slugify(m);
                return (
                  <a className="chip-lnk" key={sm} href={qp({ marca: marcaSel === sm ? '' : sm })} data-on={marcaSel === sm ? 'true' : undefined}>
                    {m}
                  </a>
                );
              })}
            </div>
          ) : null}

          <div className="catgrid">
            <div className="filters">
              <FiltrosMovil activos={filtrosActivos} resultados={lista.length}>
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
              </FiltrosMovil>
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
      <CatalogoPie />
    </>
  );
}
