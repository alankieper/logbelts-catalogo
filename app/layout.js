import './globals.css';

export const metadata = {
  title: 'Catálogo Logbelts',
  description: 'Catálogo de repuestos Logbelts para bosque, jardín e industria.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
