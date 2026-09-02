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

const temaScript = `(function(){try{var t=localStorage.getItem('tema');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
