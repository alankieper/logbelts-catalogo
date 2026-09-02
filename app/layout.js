import './globals.css';

export const metadata = {
  title: 'Catálogo Logbelts — encontrá todos nuestros repuestos',
  description: 'Catálogo de repuestos Logbelts para máquinas de bosque y jardín. Buscá por código, código original o marca y modelo.',
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
