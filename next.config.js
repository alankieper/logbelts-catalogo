/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // subir el Excel del catálogo (carga masiva) desde el admin
    serverActions: { bodySizeLimit: '12mb' },
  },
  async headers() {
    // Sin esto el navegador vuelve a pedir CADA foto y tipografía en cada página que se abre.
    // Las tipografías y las imágenes del sitio no cambian nunca (si cambian, cambia el nombre).
    // Las fotos de producto sí se pueden reemplazar: se guardan por un día y se revisan en segundo plano.
    const unAno = 'public, max-age=31536000, immutable';
    return [
      { source: '/fonts/:archivo*', headers: [{ key: 'Cache-Control', value: unAno }] },
      { source: '/img/:archivo*', headers: [{ key: 'Cache-Control', value: unAno }] },
      { source: '/marcas/:archivo*', headers: [{ key: 'Cache-Control', value: unAno }] },
      { source: '/fotos/:archivo*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=2592000' }] },
      { source: '/despieces/:archivo*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=2592000' }] },
    ];
  },
  async redirects() {
    // "Manuales" ahora se llama "Despiece"; los links viejos siguen funcionando
    return [
      { source: '/manuales', destination: '/despiece', permanent: true },
      // el catálogo ahora es parte de la portada
      { source: '/productos', destination: '/#catalogo', permanent: false },
      // "/catalogo" era el visor del catálogo en PDF; el catálogo de productos vive en la portada
      { source: '/catalogo', destination: '/#catalogo', permanent: false },
    ];
  },
};

module.exports = nextConfig;
