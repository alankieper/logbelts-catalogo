import './globals.css';
import { SITE_URL, robotsMeta } from '../lib/seo';
import { MARCA, enFrase } from '../lib/marca';

const TITULO_CATALOGO = `Catálogo ${MARCA.nombre}`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${TITULO_CATALOGO} — ${enFrase(MARCA.rubro)}`,
    template: `%s · ${TITULO_CATALOGO}`,
  },
  description: `${MARCA.descripcionCorta} Buscá por ${enFrase(MARCA.codigo.etiqueta)}, código original del fabricante, o marca y modelo.`,
  applicationName: TITULO_CATALOGO,
  robots: robotsMeta,
  openGraph: {
    siteName: MARCA.nombre,
    locale: 'es_AR',
    type: 'website',
    title: `${MARCA.nombre} — ${MARCA.rubro}`,
    description: `${MARCA.descripcionCorta} Buscá por código, código original o modelo de ${MARCA.maquinas.singular}.`,
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
