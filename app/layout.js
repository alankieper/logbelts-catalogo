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

// Tema: claro (identidad Logbelts) por defecto; el visitante puede pasar a oscuro con el botón del
// encabezado (components/BotonTema.js). La elección se guarda en localStorage ('lb_tema') y este
// script la aplica antes del primer pintado para que la página no parpadee en claro.
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem('lb_tema')==='oscuro'?'oscuro':'claro';var d=document.documentElement;d.setAttribute('data-theme',t);d.style.colorScheme=t==='oscuro'?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="claro" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
