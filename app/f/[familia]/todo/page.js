import { notFound } from 'next/navigation';
import CatalogoHeader from '../../../components/CatalogoHeader';
import CatalogoPie from '../../../components/CatalogoPie';
import ListadoProductos from '../../../components/ListadoProductos';
import NavCategorias from '../../../components/NavCategorias';
import { MarcaDeAgua } from '../../../components/DibujoCatalogo';
import { getFamilia, getProductosDeFamilia, getNavegacionCategorias } from '../../../../lib/catalogo';
import { MARCA } from '../../../../lib/marca';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const fam = await getFamilia(params.familia);
  if (!fam) return { title: 'Familia no encontrada' };
  const title = `Todos los repuestos para ${fam.nombre.toLowerCase()}`;
  const description = `Los ${fam.count} repuestos ${MARCA.nombre} para ${fam.nombre.toLowerCase()} juntos, de todas las categorías. Venta mayorista.`;
  return { title, description, openGraph: { title: `${title} · ${MARCA.nombre}`, description, images: [`/og/${fam.slug}.png`] } };
}

/** "Ver todo en [familia]": todos los productos de la familia, de todas sus subcategorías. */
export default async function TodoFamiliaPage({ params, searchParams }) {
  const fam = await getFamilia(params.familia);
  if (!fam) notFound();
  const [todos, navFamilias] = await Promise.all([getProductosDeFamilia(fam.slug), getNavegacionCategorias(fam.slug)]);

  // Al terminar, la familia siguiente también se abre en su vista completa
  const aTodo = (x) => (x ? { ...x, href: `${x.href}/todo` } : null);
  const nav = { anterior: aTodo(navFamilias.anterior), siguiente: aTodo(navFamilias.siguiente) };

  const categorias = [
    { href: `/f/${fam.slug}/todo`, nombre: `Ver todo en ${fam.nombre}`, on: true },
    ...fam.subcats.map((s) => ({ href: `/c/${fam.slug}/${s.slug}`, nombre: s.nombre, on: false })),
  ];

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
              <span aria-current="page">Ver todo</span>
            </nav>
            <h1 className="page">Todo en {fam.nombre}</h1>
            <p className="lead">
              {fam.count.toLocaleString('es-AR')} repuestos de las {fam.subcats.length} categorías juntos.
              Filtrá por subcategoría o marca, o <a className="lead-todo" href={`/f/${fam.slug}`}>elegí una categoría</a>.
            </p>
            <MarcaDeAgua nombre={fam.nombre} />
          </div>

          <NavCategorias anterior={nav.anterior} siguiente={nav.siguiente} tipo="familia" />

          <ListadoProductos
            todos={todos}
            base={`/f/${fam.slug}/todo`}
            searchParams={searchParams}
            categorias={categorias}
            subcats={fam.subcats}
            nav={nav}
            tipoNav="familia"
          />
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
