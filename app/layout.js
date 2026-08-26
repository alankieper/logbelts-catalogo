import './globals.css';
import Nav from './components/Nav';

export const metadata = {
  title: 'Logbelts - Mejoras de Catálogo',
  description: 'Aplicación interna de mejoras de catálogo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
