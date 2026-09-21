import { SITE_URL, SITIO_PUBLICO } from '../lib/seo';
import { modulo } from '../lib/marca';
import { getFamilias, getMarcasConteo, leerTodosRaw } from '../lib/catalogo';
import { listarMarcas, listarModelos } from '../lib/maquinas';

// Páginas fijas: sólo las de los módulos prendidos en lib/marca.js
const si = (nombre, rutas) => (modulo(nombre) ? rutas : []);

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
    ...['/contacto', '/descargas', '/acerca-de', '/condiciones',
      ...si('distribuidores', ['/distribuidores', '/donde-comprar']),
      ...si('lanzamientos', ['/lanzamientos']),
      ...si('tutoriales', ['/tutoriales']),
      ...si('material', ['/material']),
      ...si('guias', ['/guias', '/guias/correas', '/guias/espadas-y-cadenas', '/guias/tanza-o-cuchilla']),
      ...si('pedidoRapido', ['/pedido-rapido']),
      ...si('maquinas', ['/maquinas'])].map(p => ({
      url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: 'monthly', priority: 0.5,
    })),
    ...(modulo('maquinas') ? (await Promise.all((await listarMarcas()).map(async m => [m, await listarModelos(m.slug)]))).flatMap(([m, lm]) => [
      { url: `${SITE_URL}/maquinas/${m.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
      ...lm.modelos.map(mo => ({
        url: `${SITE_URL}/maquinas/${m.slug}/${mo.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6,
      })),
    ]) : []),
    { url: `${SITE_URL}/buscar`, lastModified: now, changeFrequency: 'weekly', priority: 0.3 },
    ...(modulo('despiece') ? [{ url: `${SITE_URL}/despiece`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 }] : []),
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
