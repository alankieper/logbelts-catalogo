import BotonAgregar from './BotonAgregar';
import BotonFavorito from './BotonFavorito';
import ConsultaChip from './ConsultaChip';
import { DibujoSinFoto } from './DibujoCatalogo';
import { slugify } from '../../lib/slug';

/**
 * Tarjeta de producto. Toda la tarjeta abre el producto (link "estirado" sobre el nombre),
 * y las etiquetas son links propios encima: la subcategoría lleva a su categoría y la marca
 * a "Todo para [marca]". Así, desde cualquier listado se puede saltar a la categoría o marca.
 * `subcategoria`: se muestra en las vistas que mezclan categorías ("Ver todo en [familia]").
 */
export default function ProductoCard({ p, motivo, subcategoria }) {
  const meta =
    (p.medidas && p.medidas.length ? p.medidas.slice(0, 2).join(' · ') : '') || (p.ubicacion || '');
  const marca = p.marcas && p.marcas.length ? p.marcas[0] : '';
  const derivada = p.fuente_desc && p.fuente_desc.startsWith('derivada');
  const nombre = p.nombre || p.clave_producto || p.codigo;
  const hrefSub = p.familiaSlug && p.subSlug ? `/c/${p.familiaSlug}/${p.subSlug}` : null;
  const hrefMarca = marca ? `/m/${slugify(marca)}` : null;
  // El botón de WhatsApp va como hermano de la tarjeta (no se pueden anidar <a>)
  return (
    <div className="lbwa-card">
      <div className="card card--enlazada">
        <div className="thumb">
          {p.foto ? (
            <img
              src={/^https?:\/\//.test(p.foto) ? p.foto : `/fotos/${p.foto}`}
              alt={p.nombre || p.codigo}
              loading="lazy"
            />
          ) : (
            <span className="noimg">
              <DibujoSinFoto subcategoria={p.subcategoria} familia={p.familia} />
              <span className="noimg__t">sin foto</span>
            </span>
          )}
          {p.videos && p.videos.length ? <span className="hasvideo" aria-label="con video">▶</span> : null}
          <BotonFavorito codigo={p.codigo} nombre={nombre} chico />
        </div>
        <div className="body">
          {subcategoria ? (
            hrefSub ? (
              <a className="subcat" href={hrefSub} title={`Ver toda la categoría ${subcategoria}`}>{subcategoria}</a>
            ) : (
              <span className="subcat">{subcategoria}</span>
            )
          ) : null}
          <span className="code">{p.codigo}</span>
          <a className="nm card__enlace" href={`/p/${encodeURIComponent(p.codigo)}`}>{p.nombre || p.clave_producto || 'Producto'}</a>
          {/* Renglón fijo de etiquetas: reserva el lugar aunque el producto no tenga marca
              ni medidas, para que todas las tarjetas midan lo mismo. */}
          <span className="tags">
            {marca ? (
              <a className="chipmarca" href={hrefMarca} title={`Ver todo para ${marca}`}>{marca}</a>
            ) : null}
            {meta ? <span className="meta">{meta}</span> : null}
            {!motivo && derivada ? <span className="deriv">descripción a confirmar</span> : null}
          </span>
          {motivo ? <span className="why">{motivo}</span> : null}
          <span className="acts">
            <BotonAgregar codigo={p.codigo} nombre={nombre} chico />
          </span>
        </div>
      </div>
      <ConsultaChip codigo={p.codigo} nombre={p.nombre || p.clave_producto || ''} />
    </div>
  );
}
