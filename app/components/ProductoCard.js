import BotonAgregar from './BotonAgregar';

export default function ProductoCard({ p, motivo }) {
  const meta =
    (p.medidas && p.medidas.length ? p.medidas.slice(0, 2).join(' · ') : '') ||
    (p.ubicacion || '') ||
    (p.marcas && p.marcas.length ? p.marcas.slice(0, 2).join(' · ') : '');
  const derivada = p.fuente_desc && p.fuente_desc.startsWith('derivada');
  return (
    <a className="card" href={`/p/${encodeURIComponent(p.codigo)}`}>
      <div className="thumb">
        {p.foto ? (
          <img
            src={/^https?:\/\//.test(p.foto) ? p.foto : `/fotos/${p.foto}`}
            alt={p.nombre || p.codigo}
            loading="lazy"
          />
        ) : (
          <span className="noimg">sin foto</span>
        )}
        {p.videos && p.videos.length ? <span className="hasvideo" aria-label="con video">▶</span> : null}
      </div>
      <div className="body">
        <span className="code">{p.codigo}</span>
        <span className="nm">{p.nombre || p.clave_producto || 'Producto'}</span>
        {meta ? <span className="meta">{meta}</span> : <span className="meta" />}
        {motivo ? <span className="why">{motivo}</span> : null}
        {!motivo && derivada ? <span className="deriv">descripción a confirmar</span> : null}
        <BotonAgregar codigo={p.codigo} nombre={p.nombre || p.clave_producto || p.codigo} chico />
      </div>
    </a>
  );
}
