import './globals.css';
import { SITE_URL, robotsMeta } from '../lib/seo';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Catálogo Logbelts — repuestos para bosque y jardín',
    template: '%s · Catálogo Logbelts',
  },
  description: 'Repuestos Logbelts para motosierras, desmalezadoras, cortadoras de césped y motores. Buscá por código Logbelts, código original del fabricante, o marca y modelo.',
  applicationName: 'Catálogo Logbelts',
  robots: robotsMeta,
  openGraph: { siteName: 'Catálogo Logbelts', locale: 'es_AR', type: 'website' },
};

// Web y catálogo son un solo sitio con un solo aspecto (claro); ya no hay modo oscuro aparte.
export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="claro">
      <body>{children}</body>
    </html>
  );
}
