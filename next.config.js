/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // subir el Excel del catálogo (carga masiva) desde el admin
    serverActions: { bodySizeLimit: '12mb' },
  },
};

module.exports = nextConfig;
