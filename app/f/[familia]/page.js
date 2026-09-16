import { notFound } from 'next/navigation';
import CatalogoHeader from '../../components/CatalogoHeader';
import CatalogoPie from '../../components/CatalogoPie';
import { MarcaDeAgua, DibujoTile } from '../../components/DibujoCatalogo';
import { getFamilia } from '../../../lib/catalogo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const fam = await getFamilia(params.familia);
  if (!fam) return { title: 'Familia no encontrada' };
  const title = `Repuestos para ${fam.nombre.toLowerCase()}`;
  const description = `${fam.count} repuestos Logbelts para ${fam.nombre.toLowerCase()} en ${fam.subcats.length} categorías. Buscá por código, código original o marca. Venta mayorista.`;
  const og = `/og/${fam.slug}.png`;
  return { title, description, openGraph: { title: `${title} · Logbelts`, description, images: [og] } };
}

export default async function FamiliaPage({ params }) {
  const fam = await getFamilia(params.familia);
  if (!fam) notFound();

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <div className="pghead">
            <nav className="crumb">
              <a href="/#catalogo">Catálogo</a>
              <span className="sep">/</span>
              <span aria-current="page">{fam.nombre}</span>
            </nav>
            <h1 className="page">{fam.nombre}</h1>
            <p className="lead">{fam.count.toLocaleString('es-AR')} productos en {fam.subcats.length} subcategorías.</p>
            <MarcaDeAgua nombre={fam.nombre} />
          </div>

          <div className="tiles tiles--dib">
            {fam.subcats.map((s) => (
              <a className="tile tile--dib" key={s.slug} href={`/c/${fam.slug}/${s.slug}`}>
                <DibujoTile nombre={s.nombre} familia={fam.nombre} />
                <span className="txt">
                  <h3>{s.nombre}</h3>
                  <span className="count">{s.count.toLocaleString('es-AR')} productos</span>
                </span>
                <span className="ver">
                  Ver repuestos
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
