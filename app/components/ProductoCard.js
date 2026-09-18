import BotonAgregar from './BotonAgregar';
import BotonFavorito from './BotonFavorito';
import ConsultaChip from './ConsultaChip';
import { DibujoSinFoto } from './DibujoCatalogo';

// `subcategoria`: se muestra en las vistas que mezclan categorías ("Ver todo en [familia]")
export default function ProductoCard({ p, motivo, subcategoria }) {
  const meta =
    (p.medidas && p.medidas.length ? p.medidas.slice(0, 2).join(' · ') : '') || (p.ubicacion || '');
  const marca = p.marcas && p.marcas.length ? p.marcas[0] : '';
  const derivada = p.fuente_desc && p.fuente_desc.startsWith('derivada');
  const nombre = p.nombre || p.clave_producto || p.codigo;
  // El botón de WhatsApp va como hermano del link de la tarjeta (no se pueden anidar <a>)
  return (
    <div className="lbwa-card">
      <a className="card" href={`/p/${encodeURIComponent(p.codigo)}`}>
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
          {subcategoria ? <span className="subcat">{subcategoria}</span> : null}
          <span className="code">{p.codigo}</span>
          <span className="nm">{p.nombre || p.clave_producto || 'Producto'}</span>
          {/* Renglón fijo de etiquetas: reserva el lugar aunque el producto no tenga marca
              ni medidas, para que todas las tarjetas midan lo mismo. */}
          <span className="tags">
            {marca ? <span className="chipmarca">{marca}</span> : null}
            {meta ? <span className="meta">{meta}</span> : null}
            {!motivo && derivada ? <span className="deriv">descripción a confirmar</span> : null}
          </span>
          {motivo ? <span className="why">{motivo}</span> : null}
          <span className="acts">
            <BotonAgregar codigo={p.codigo} nombre={nombre} chico />
          </span>
        </div>
      </a>
      <ConsultaChip codigo={p.codigo} nombre={p.nombre || p.clave_producto || ''} />
    </div>
  );
}
