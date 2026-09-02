import { SITE_URL, SITIO_PUBLICO } from '../lib/seo';

export default function robots() {
  if (!SITIO_PUBLICO) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/login', '/nueva'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
