import '../sitio.css';
import '../catalogo-extra.css';
import Header from './sitio/Header';
import ListaPedido from './ListaPedido';
import RegistrarVisita from './RegistrarVisita';

/** Encabezado de las páginas del catálogo: el mismo de la web (menú + buscador + herramientas). */
export default function CatalogoHeader({ q = '' }) {
  return (
    <>
      <div className="sitio sitio-fijo">
        <Header q={q} />
      </div>
      <RegistrarVisita />
      <ListaPedido />
    </>
  );
}
