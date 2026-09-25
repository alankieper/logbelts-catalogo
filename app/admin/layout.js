import { MARCA } from '../../lib/marca';

/**
 * El panel de administración usa un ícono DISTINTO al del sitio: logo azul sobre fondo blanco.
 * Así, con varias pestañas abiertas, se distingue de un vistazo cuál es el admin y cuál el catálogo.
 */
export const metadata = {
  title: { absolute: `Administración · ${MARCA.nombre}` },
  icons: {
    icon: [
      { url: '/icons/admin.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icons/admin-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/admin-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/admin-apple.png', sizes: '180x180', type: 'image/png' }],
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return children;
}
