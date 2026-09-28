import { notFound } from 'next/navigation';
import CatalogoHeader from '../../components/CatalogoHeader';
import CatalogoPie from '../../components/CatalogoPie';
import ListaModelos from '../../components/ListaModelos';
import { listarMarcas, listarModelos } from '../../../lib/maquinas';
import { SITE_URL } from '../../../lib/seo';
import { MARCA, modulo } from '../../../lib/marca';

// La página se guarda armada en la red de Vercel y se rehace cada hora.
// Cuando se edita algo en el panel, `refrescarCatalogo()` la borra al instante,
// así un cambio se ve enseguida sin esperar la hora.
export const revalidate = 3600;
/**
 * Lista vacía a propósito: no se arma ninguna página al publicar, pero Next.js guarda cada una
 * la primera vez que alguien la abre y las siguientes visitas la reciben ya lista.
 */
export function generateStaticParams() {
  return [];
}


const plural = (n, uno, varios) => (n === 1 ? uno : varios);
const ld = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

/** Modelos de la marca + total de repuestos distintos (datos reales de lib/maquinas). */
async function datosMarca(marcaSlug) {
  const datos = await listarModelos(marcaSlug);
  if (!datos) return null;
  const resumen = (await listarMarcas()).find((m) => m.slug === marcaSlug);
  const destacados = [...datos.modelos]
    .sort((a, b) => b.n - a.n || a.modelo.localeCompare(b.modelo, 'es', { numeric: true }))
    .slice(0, 5);
  return { ...datos, nProductos: resumen ? resumen.nProductos : 0, destacados };
}

export async function generateMetadata({ params }) {
  const datos = await datosMarca(params.marca);
  if (!datos) return { title: 'Marca no encontrada', robots: { index: false, follow: true } };
  const nm = datos.modelos.length;
  const title = `Repuestos para ${datos.marca} por modelo`;
  const description =
    `${datos.nProductos} ${plural(datos.nProductos, `repuesto ${MARCA.nombre} compatible`, `repuestos ${MARCA.nombre} compatibles`)} con ` +
    `${nm} ${plural(nm, 'modelo', 'modelos')} de ${datos.marca}` +
    (datos.destacados.length ? `, como ${datos.destacados.slice(0, 3).map((m) => m.modelo).join(', ')}` : '') +
    '. Venta mayorista.';
  const url = `${SITE_URL}/maquinas/${datos.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: ['/opengraph-image.png'] },
  };
}

export default async function MarcaMaquinaPage({ params }) {
  if (!modulo('maquinas')) notFound();
  const datos = await datosMarca(params.marca);
  if (!datos) notFound();

  const nm = datos.modelos.length;
  const url = `${SITE_URL}/maquinas/${datos.slug}`;
  const ldBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Catálogo', item: `${SITE_URL}/#catalogo` },
      { '@type': 'ListItem', position: 2, name: `Por ${MARCA.maquinas.singular}`, item: `${SITE_URL}/maquinas` },
      { '@type': 'ListItem', position: 3, name: datos.marca, item: url },
    ],
  };
  const ldColeccion = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Repuestos para ${datos.marca} por modelo`,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: nm,
      itemListElement: datos.modelos.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${url}/${m.slug}`,
        name: `${datos.marca} ${m.modelo}`,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(ldBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(ldColeccion) }} />
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/#catalogo">Catálogo</a>
            <span className="sep">/</span>
            <a href="/maquinas">Por {MARCA.maquinas.singular}</a>
            <span className="sep">/</span>
            <span aria-current="page">{datos.marca}</span>
          </nav>
          <h1 className="page">Repuestos para {datos.marca}</h1>
          <p className="lead">
            El catálogo {MARCA.nombre} tiene {datos.nProductos}{' '}
            {plural(datos.nProductos, 'repuesto compatible', 'repuestos compatibles')} con {nm}{' '}
            {plural(nm, 'modelo', 'modelos')} de {datos.marca}.
            {datos.destacados.length ? (
              <>
                {' '}{plural(datos.destacados.length, 'El modelo con más repuestos es', 'Los modelos con más repuestos son')}{' '}
                {datos.destacados.map((m, i) => (
                  <span key={m.slug}>
                    <a href={`/maquinas/${datos.slug}/${m.slug}`}>
                      {datos.marca} {m.modelo}
                    </a>{' '}
                    ({m.n})
                    {i < datos.destacados.length - 2 ? ', ' : i === datos.destacados.length - 2 ? ' y ' : '.'}
                  </span>
                ))}
              </>
            ) : null}
            {' '}Elegí el tuyo. Venta mayorista: consultá disponibilidad con tu vendedor.
          </p>
          <ListaModelos marcaSlug={datos.slug} modelos={datos.modelos} />
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
