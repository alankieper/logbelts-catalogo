import { SITE_URL, SITIO_PUBLICO } from '../lib/seo';
import { getFamilias, getMarcasConteo, leerTodosRaw } from '../lib/catalogo';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap() {
  if (!SITIO_PUBLICO) return [{ url: SITE_URL, lastModified: new Date() }];

  const [familias, marcas, productos] = await Promise.all([
    getFamilias(),
    getMarcasConteo(),
    leerTodosRaw(),
  ]);

  const now = new Date();
  const urls = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/buscar`, lastModified: now, changeFrequency: 'weekly', priority: 0.3 },
    { url: `${SITE_URL}/manuales`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  for (const f of familias) {
    urls.push({ url: `${SITE_URL}/f/${f.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 });
    for (const s of f.subcats || []) {
      urls.push({ url: `${SITE_URL}/c/${f.slug}/${s.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 });
    }
  }
  for (const m of marcas) {
    urls.push({ url: `${SITE_URL}/m/${m.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 });
  }
  for (const p of productos) {
    if (p.oculto) continue;
    urls.push({
      url: `${SITE_URL}/p/${encodeURIComponent(p.codigo)}`,
      lastModified: p.editado_en ? new Date(p.editado_en) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }
  return urls;
}
