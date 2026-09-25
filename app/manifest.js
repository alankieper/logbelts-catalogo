import { MARCA } from '../lib/marca';

/**
 * Datos para cuando alguien agrega el sitio a la pantalla de inicio del celular
 * (Android/Samsung e iPhone): nombre, ícono y colores. Se sirve en /manifest.webmanifest.
 */
export default function manifest() {
  return {
    name: `${MARCA.nombre} — ${MARCA.rubro}`,
    short_name: MARCA.nombre,
    description: MARCA.descripcionCorta,
    start_url: '/?app=1',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#12213f',
    theme_color: '#12213f',
    lang: 'es-AR',
    categories: ['shopping', 'business'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
