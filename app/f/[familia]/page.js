import { notFound } from 'next/navigation';
import CatalogoHeader from '../../components/CatalogoHeader';
import CatalogoPie from '../../components/CatalogoPie';
import Icono from '../../components/Icono';
import { MarcaDeAgua, DibujoTile, hayDibujos } from '../../components/DibujoCatalogo';
import '../../navegacion-catalogo.css';
import NavCategorias from '../../components/NavCategorias';
import { getFamilia, getNavegacionCategorias } from '../../../lib/catalogo';
import { MARCA } from '../../../lib/marca';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const fam = await getFamilia(params.familia);
  if (!fam) return { title: 'Familia no encontrada' };
  const title = `Repuestos para ${fam.nombre.toLowerCase()}`;
  const description = `${fam.count} repuestos ${MARCA.nombre} para ${fam.nombre.toLowerCase()} en ${fam.subcats.length} categorías. Buscá por código, código original o marca. Venta mayorista.`;
  const og = `/og/${fam.slug}.png`;
  return { title, description, openGraph: { title: `${title} · ${MARCA.nombre}`, description, images: [og] } };
}

export default async function FamiliaPage({ params }) {
  const fam = await getFamilia(params.familia);
  if (!fam) notFound();
  const nav = await getNavegacionCategorias(fam.slug);
  // Sin dibujos de línea: tarjetas compactas con ícono, como antes de la versión ilustrada.
  const dib = hayDibujos();

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

          <a className="ver-todo" href={`/f/${fam.slug}/todo`}>
            <span className="ver-todo__t">Ver todo en {fam.nombre}</span>
            <span className="ver-todo__d">Los {fam.count.toLocaleString('es-AR')} repuestos de las {fam.subcats.length} categorías juntos, con filtros por subcategoría y marca</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>

          <NavCategorias anterior={nav.anterior} siguiente={nav.siguiente} tipo="familia" />

          <div className={dib ? 'tiles tiles--dib' : 'tiles'}>
            {fam.subcats.map((s) => (
              <a className={dib ? 'tile tile--dib' : 'tile'} key={s.slug} href={`/c/${fam.slug}/${s.slug}`}>
                {dib ? (
                  <DibujoTile nombre={s.nombre} familia={fam.nombre} />
                ) : (
                  <span className="ic"><Icono nombre={s.nombre} size={22} /></span>
                )}
                <span className="txt">
                  <h3>{s.nombre}</h3>
                  <span className="count">{s.count.toLocaleString('es-AR')} productos</span>
                </span>
                {dib ? (
                  <span className="ver">
                    Ver repuestos
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                ) : null}
              </a>
            ))}
          </div>

          <NavCategorias variante="final" anterior={nav.anterior} siguiente={nav.siguiente} tipo="familia" />
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
