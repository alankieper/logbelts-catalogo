import { notFound } from 'next/navigation';
import CatalogoHeader from '../components/CatalogoHeader';
import CatalogoPie from '../components/CatalogoPie';
import SelectorMaquina from '../components/SelectorMaquina';
import { datosSelector, listarMarcas } from '../../lib/maquinas';
import { SITE_URL } from '../../lib/seo';
import { MARCA, modulo } from '../../lib/marca';

export const dynamic = 'force-dynamic';

const plural = (n, uno, varios) => (n === 1 ? uno : varios);
const ld = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

const TITLE = `Repuestos por ${MARCA.maquinas.singular}`;
const DESCRIPTION = `Elegí la marca y el modelo de la ${MARCA.maquinas.singular} y encontrá los repuestos compatibles del catálogo ${MARCA.nombre}.`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/maquinas` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/maquinas`, images: ['/opengraph-image.png'] },
};

export default function MaquinasPage() {
  if (!modulo('maquinas')) notFound();
  const marcas = listarMarcas();
  const nMarcas = marcas.length;
  const nModelos = marcas.reduce((s, m) => s + m.nModelos, 0);

  const ldBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Catálogo', item: `${SITE_URL}/#catalogo` },
      { '@type': 'ListItem', position: 2, name: `Por ${MARCA.maquinas.singular}`, item: `${SITE_URL}/maquinas` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(ldBreadcrumb) }} />
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/#catalogo">Catálogo</a>
            <span className="sep">/</span>
            <span aria-current="page">Por {MARCA.maquinas.singular}</span>
          </nav>
          <p className="eyebrow">{MARCA.maquinas.etiquetaBusqueda}</p>
          <h1 className="page">¿Para qué {MARCA.maquinas.singular} es el repuesto?</h1>
          <p className="lead">
            Elegí la marca y el modelo, y te mostramos los repuestos del catálogo que le sirven.
            {nMarcas ? (
              <>
                {' '}Hay {nModelos} {plural(nModelos, 'modelo', 'modelos')} de {nMarcas}{' '}
                {plural(nMarcas, 'marca', 'marcas')} con repuestos {MARCA.nombre} compatibles.
              </>
            ) : null}
          </p>

          <div className="banda-maquina">
            <SelectorMaquina datos={datosSelector()} />
          </div>

          <div className="tiles">
            {marcas.map((m) => (
              <a className="tile" key={m.slug} href={`/maquinas/${m.slug}`}>
                <span className="txt">
                  <h3>{m.marca}</h3>
                  <span className="count">
                    {m.nModelos} modelo{m.nModelos === 1 ? '' : 's'} · {m.nProductos} repuesto{m.nProductos === 1 ? '' : 's'}
                  </span>
                </span>
              </a>
            ))}
          </div>

          <p className="note">
            <b>¿No está tu {MARCA.maquinas.singular}?</b> La compatibilidad sale del catálogo y se sigue completando. Buscá por código
            original o <a href="/buscar">escribí la marca y el modelo en el buscador</a>; si no aparece, pedilo y te lo buscamos.
          </p>
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
