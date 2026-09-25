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
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  // iPhone: al agregarlo a la pantalla de inicio se abre como app, sin barra del navegador
  appleWebApp: { capable: true, title: MARCA.nombre, statusBarStyle: 'black-translucent' },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#12213f' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1224' },
  ],
  // viewportFit: el contenido puede ocupar toda la pantalla; el encabezado deja lugar para la
  // barra de estado y el notch con env(safe-area-inset-top) (ver app/sitio.css).
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Tema: claro (identidad Logbelts) por defecto; el visitante puede pasar a oscuro con el botón del
// encabezado (components/BotonTema.js). La elección se guarda en localStorage ('lb_tema') y este
// script la aplica antes del primer pintado para que la página no parpadee en claro.
const SCRIPT_TEMA = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('lb_tema')==='oscuro'?'oscuro':'claro';d.setAttribute('data-theme',t);d.style.colorScheme=t==='oscuro'?'dark':'light';var v=localStorage.getItem('lb_vista');d.setAttribute('data-vista',v==='1'||v==='3'?v:'2');}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="claro" suppressHydrationWarning>
      <head>
        {/* las dos fuentes que se ven apenas abre la página: se piden antes que el resto */}
        <link rel="preload" href="/fonts/AktivGrotesk-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Dunk95TRIALVERSION-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
