import { SITE_URL } from './seo';
import { MARCA } from './marca';

/** Mensaje de WhatsApp para consultar por un producto (con link a la ficha). Sin precios ni stock. */
export function textoConsulta({ codigo, nombre, pagina }) {
  const ref = `Catálogo ${MARCA.nombre}${pagina ? `, pág. ${pagina}` : ''}`;
  const titulo = `Hola, consulto por el producto ${codigo}${nombre ? ` — ${nombre}` : ''} (${ref})`;
  return `${titulo}\n${SITE_URL}/p/${encodeURIComponent(codigo)}`;
}
