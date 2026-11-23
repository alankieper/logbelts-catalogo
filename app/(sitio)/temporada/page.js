import { notFound } from 'next/navigation';
import Image from 'next/image';
import ProductoCard from '../../components/ProductoCard';
import ListaPedido from '../../components/ListaPedido';
import { MARCA, modulo } from '../../../lib/marca';
import { img } from '../../../lib/sitio';
import { getProductosDeFamilia } from '../../../lib/catalogo';
import { temporadaVigente } from '../../../lib/ajustes';
import { leerEventos } from '../../../lib/eventos';

export const revalidate = 3600;

export const metadata = {
  title: 'Temporada',
  description: `Los repuestos ${MARCA.nombre} que más se mueven en la temporada: desmalezadoras, tanzas, cabezales, sopladoras, cortacésped y minitractores. Venta mayorista.`,
};

const POR_GRUPO = 8;

/**
 * Página de temporada: los mejores productos de la temporada en foco (césped o poda).
 * "Mejores" = los más vistos y consultados en la web en los últimos 90 días; los nuevos y los
 * que tienen foto van primero cuando hay empate. La temporada se elige en /admin/temporada.
 */
export default async function Temporada() {
  if (!modulo('lanzamientos')) notFound();

  const estado = await temporadaVigente();
  const t = estado.temporada;
  const pagina = t.pagina;

  const interes = new Map();
  for (const e of await leerEventos(90).catch(() => [])) {
    if ((e.tipo === 'ver' || e.tipo === 'consulta' || e.tipo === 'agregar') && e.codigo) {
      interes.set(e.codigo, (interes.get(e.codigo) || 0) + (e.tipo === 'ver' ? 1 : 3));
    }
  }
  const puntaje = (p) =>
    (interes.get(p.codigo) || 0) * 10 + ((p.flags || []).includes('NUEVO') ? 5 : 0) + (p.foto ? 2 : 0);

  const usados = new Set();
  const grupos = [];
  for (const g of pagina.grupos) {
    const deFamilia = await getProductosDeFamilia(g.familia);
    const lista = deFamilia
      .filter((p) => !usados.has(p.codigo) && (!g.sub || g.sub.test(p.subcategoria || '')) && (!g.nombre || g.nombre.test(p.nombre || '')) && (!g.sin || !g.sin.test(p.nombre || '')))
      .sort((a, b) => puntaje(b) - puntaje(a) || a.codigo.localeCompare(b.codigo))
      .slice(0, POR_GRUPO);
    if (!lista.length) continue;
    lista.forEach((p) => usados.add(p.codigo));
    const sub = g.sub ? lista[0] : null;
    const href = g.nombre && !g.buscar
      ? `/buscar?q=${encodeURIComponent(g.titulo.split(' ')[0])}`
      : g.buscar
      ? `/buscar?q=${encodeURIComponent(g.buscar)}`
      : sub && lista.every((p) => p.subSlug === sub.subSlug)
        ? `/c/${g.familia}/${sub.subSlug}`
        : `/f/${g.familia}`;
    grupos.push({ ...g, lista, href });
  }

  return (
    <>
      <section className="fondo-foto fondo-foto--oscuro lanzamientos temporada-cabecera oscuro">
        <Image className="fondo-foto__img" src={img('dd35f656ce4946e29a1665bc3bdf1413f000')} alt="" fill sizes="100vw" priority />
        <div className="contenedor">
          <p className="antetitulo">{t.antetitulo}</p>
          <h1 className="titulo-seccion">{pagina.titulo}</h1>
          <p className="bajada">{pagina.bajada}</p>
          <nav className="temporada-indice" aria-label="Grupos de la temporada">
            {grupos.map((g) => (
              <a key={g.titulo} href={`#${g.familia}-${g.titulo.length}`}>{g.titulo}</a>
            ))}
          </nav>
        </div>
      </section>

      <section className="seccion seccion--suelo temporada">
        <div className="contenedor">
          {grupos.map((g) => (
            <div key={g.titulo} id={`${g.familia}-${g.titulo.length}`} className="temporada-grupo">
              <div className="temporada-grupo__cab">
                <h2>{g.titulo}</h2>
                <a href={g.href}>Ver todos →</a>
              </div>
              <div className="pgrid">
                {g.lista.map((p) => (
                  <ProductoCard key={p.codigo} p={p} />
                ))}
              </div>
            </div>
          ))}
          <p className="nota-sitio">Venta mayorista: precios y disponibilidad te los confirma tu vendedor.</p>
        </div>
      </section>
      <ListaPedido />
    </>
  );
}
