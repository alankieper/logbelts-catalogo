import '../sitio.css';
import Header from '../components/sitio/Header';
import Pie from '../components/sitio/Pie';
import PopupBienvenida from '../components/sitio/PopupBienvenida';
import WhatsApp from '../components/sitio/WhatsApp';
import Asistente from '../components/Asistente';

// Web institucional (portada, nosotros, contacto…). El catálogo y el admin tienen su propio diseño.
export const metadata = {
  // absolute: que no le agregue el "· Catálogo Logbelts" del layout raíz
  title: {
    absolute: 'Logbelts | Repuestos para bosque y jardín · Venta mayorista',
    template: '%s | Logbelts',
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
      <Asistente />
      <PopupBienvenida />
    </div>
  );
}
