import './globals.css';

export const metadata = {
  title: 'Catálogo Logbelts — encontrá todos nuestros repuestos',
  description: 'Catálogo de repuestos Logbelts para máquinas de bosque y jardín. Buscá por código, código original o marca y modelo.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
