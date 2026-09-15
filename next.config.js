/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // subir el Excel del catálogo (carga masiva) desde el admin
    serverActions: { bodySizeLimit: '12mb' },
  },
  async redirects() {
    // "Manuales" ahora se llama "Despiece"; los links viejos siguen funcionando
    return [
      { source: '/manuales', destination: '/despiece', permanent: true },
      // el catálogo ahora es parte de la portada
      { source: '/productos', destination: '/#catalogo', permanent: false },
    ];
  },
};

module.exports = nextConfig;
