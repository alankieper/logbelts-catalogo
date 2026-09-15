import { notFound } from 'next/navigation';
import CatalogoHeader from '../../../components/CatalogoHeader';
import CatalogoPie from '../../../components/CatalogoPie';
import ProductoCard from '../../../components/ProductoCard';
import NoEncontrado from '../../../components/NoEncontrado';
import Registrar from '../../../components/Registrar';
import { productosDeMaquina } from '../../../../lib/maquinas';
import { linkDespiece } from '../../../../lib/despieceLinks';
import { SITE_URL } from '../../../../lib/seo';

export const dynamic = 'force-dynamic';

const plural = (n, uno, varios) => (n === 1 ? uno : varios);

// JSON dentro de <script>: se escapa "<" para que ningún texto del catálogo cierre la etiqueta.
const ld = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

/** Agrupa por familia (datos reales del producto), de la familia con más repuestos a la de menos. */
function agruparPorFamilia(productos) {
  const mapa = new Map();
  for (const p of productos) {
    const clave = p.familia ? p.familiaSlug : 'otros';
    if (!mapa.has(clave)) {
      mapa.set(clave, { nombre: p.familia || 'Otros', slug: p.familia ? p.familiaSlug : null, productos: [] });
    }
    mapa.get(clave).productos.push(p);
  }
  return [...mapa.values()].sort(
    (a, b) => b.productos.length - a.productos.length || a.nombre.localeCompare(b.nombre, 'es')
  );
}

export async function generateMetadata({ params }) {
  const d = await productosDeMaquina(params.marca, params.modelo);
  if (!d) return { title: 'Máquina no encontrada' };
  const n = d.productos.length;
  const familias = agruparPorFamilia(d.productos).filter((f) => f.slug).slice(0, 3);
  const title = `Repuestos para ${d.marca} ${d.modelo}`;
  const description =
    `${n} ${plural(n, 'repuesto Logbelts compatible', 'repuestos Logbelts compatibles')} con ${d.marca} ${d.modelo}` +
    (familias.length ? `: ${familias.map((f) => `${f.productos.length} en ${f.nombre}`).join(', ')}` : '') +
    '. Venta mayorista.';
  const url = `${SITE_URL}/maquinas/${d.marcaSlug}/${d.modeloSlug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: ['/opengraph-image.png'] },
  };
}

export default async function ModeloMaquinaPage({ params }) {
  const d = await productosDeMaquina(params.marca, params.modelo);
  if (!d) notFound();

  const n = d.productos.length;
  const familias = agruparPorFamilia(d.productos);
  const conOem = d.productos.filter((p) => p.codigo_original && p.codigo_original.length).length;
  const despiece = linkDespiece(d.marca, d.modelo);
  const despieceDirecto = despiece && despiece.directo ? despiece : null;
  const idFamilia = (f) => `fam-${f.slug || 'otros'}`;

  const urlMarca = `${SITE_URL}/maquinas/${d.marcaSlug}`;
  const urlModelo = `${urlMarca}/${d.modeloSlug}`;
  const ldBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Catálogo', item: `${SITE_URL}/#catalogo` },
      { '@type': 'ListItem', position: 2, name: 'Por máquina', item: `${SITE_URL}/maquinas` },
      { '@type': 'ListItem', position: 3, name: d.marca, item: urlMarca },
      { '@type': 'ListItem', position: 4, name: d.modelo, item: urlModelo },
    ],
  };
  const ldColeccion = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Repuestos para ${d.marca} ${d.modelo}`,
    url: urlModelo,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: n,
      itemListElement: familias
        .flatMap((f) => f.productos)
        .map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/p/${encodeURIComponent(p.codigo)}`,
          name: p.nombre || p.clave_producto || p.codigo,
        })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(ldBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(ldColeccion) }} />
      <CatalogoHeader />
      <Registrar tipo="maquina" q={`${d.marca} ${d.modelo}`} n={n} />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/#catalogo">Catálogo</a>
            <span className="sep">/</span>
            <a href="/maquinas">Por máquina</a>
            <span className="sep">/</span>
            <a href={`/maquinas/${d.marcaSlug}`}>{d.marca}</a>
            <span className="sep">/</span>
            <span aria-current="page">{d.modelo}</span>
          </nav>
          <p className="eyebrow">Repuestos compatibles</p>
          <h1 className="page">{d.marca} {d.modelo}</h1>
          <p className="lead">
            Encontrá {n} {plural(n, 'repuesto Logbelts compatible', 'repuestos Logbelts compatibles')} con la {d.marca}{' '}
            {d.modelo}
            {familias.length ? ': ' : '.'}
            {familias.map((f, i) => (
              <span key={idFamilia(f)}>
                {f.productos.length} en{' '}
                {f.slug ? <a href={`/f/${f.slug}`}>{f.nombre}</a> : f.nombre}
                {i < familias.length - 1 ? ', ' : '.'}
              </span>
            ))}
            {conOem ? ' Incluye equivalencias de códigos originales.' : ''}
            {despieceDirecto ? (
              <>
                {' '}Si necesitás ubicar la pieza, mirá el{' '}
                <a href={despieceDirecto.url} target="_blank" rel="noreferrer">
                  despiece de la {d.marca} {d.modelo} ↗
                </a>
                .
              </>
            ) : null}
            {' '}Venta mayorista: consultá disponibilidad con tu vendedor.
          </p>

          {familias.length > 1 ? (
            <nav className="crumb" aria-label="Familias de repuestos" style={{ marginBottom: 22 }}>
              {familias.map((f, i) => (
                <span key={idFamilia(f)}>
                  {i ? <span className="sep">·</span> : null}
                  <a href={`#${idFamilia(f)}`}>
                    {f.nombre} ({f.productos.length})
                  </a>
                </span>
              ))}
            </nav>
          ) : null}

          {familias.map((f) => (
            <section key={idFamilia(f)} id={idFamilia(f)} style={{ marginBottom: 26, scrollMarginTop: 90 }}>
              <h2 className="page" style={{ fontSize: '1.1rem' }}>{f.nombre}</h2>
              <div className="pgrid">
                {f.productos.map((p) => <ProductoCard key={p.codigo} p={p} />)}
              </div>
            </section>
          ))}

          <NoEncontrado
            origen="maquina"
            q={`${d.marca} ${d.modelo}`}
            titulo={`¿Buscás otro repuesto para ${d.marca} ${d.modelo}?`}
            prefijo={`Busco repuestos para ${d.marca} ${d.modelo}: `}
          />
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
