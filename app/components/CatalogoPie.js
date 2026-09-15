import Pie from './sitio/Pie';
import WhatsApp from './sitio/WhatsApp';

/** Pie del catálogo: el mismo de la web, para que todo el sitio sea uno solo. */
export default function CatalogoPie() {
  return (
    <div className="sitio">
      <Pie />
      <WhatsApp />
    </div>
  );
}
