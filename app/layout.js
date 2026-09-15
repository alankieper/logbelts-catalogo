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
  openGraph: {
    siteName: 'Logbelts',
    locale: 'es_AR',
    type: 'website',
    title: 'Logbelts — Repuestos para bosque y jardín',
    description: 'Venta mayorista de repuestos para motosierras, desmalezadoras, minitractores y motores. Buscá por código, código original o modelo de máquina.',
  },
  twitter: { card: 'summary_large_image' },
};

// Web y catálogo son un solo sitio con un solo aspecto (claro); ya no hay modo oscuro aparte.
export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="claro">
      <body>{children}</body>
    </html>
  );
}
