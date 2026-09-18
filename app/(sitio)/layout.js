import '../sitio.css';
import Header from '../components/sitio/Header';
import Pie from '../components/sitio/Pie';
import PopupBienvenida from '../components/sitio/PopupBienvenida';
import WhatsApp from '../components/sitio/WhatsApp';
import Asistente from '../components/Asistente';
import { MARCA } from '../../lib/marca';

// El asistente solo aparece si el servidor tiene ANTHROPIC_API_KEY (sin clave respondería "no disponible").
// Web institucional (portada, nosotros, contacto…). El catálogo y el admin tienen su propio diseño.
export const metadata = {
  // absolute: que no le agregue el "· Catálogo <marca>" del layout raíz
  title: {
    absolute: `${MARCA.nombre} | ${MARCA.rubro} · Venta mayorista`,
    template: `%s | ${MARCA.nombre}`,
  },
  description: 'Importadores y distribuidores de repuestos para motosierras, desmalezadoras, minitractores y motores. Venta mayorista a comercios y talleres.',
};

export default function SitioLayout({ children }) {
  return (
    <div className="sitio">
      <Header />
      <main>{children}</main>
      <Pie />
      <WhatsApp />
      {process.env.ANTHROPIC_API_KEY && <Asistente />}
      <PopupBienvenida />
    </div>
  );
}
