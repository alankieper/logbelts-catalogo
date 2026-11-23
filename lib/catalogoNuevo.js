import * as store from './catalogoStore';

/**
 * Fotos del catálogo PDF 2026.04.32.
 * Al cargar ese catálogo, la foto de cada producto en el PDF se agregó como segunda foto
 * (galería) al lado de la principal, para que el admin elija cuál queda. Esas fotos se
 * reconocen por el final del nombre del archivo.
 */
export const MARCA_PDF = '-catalogo-2026-04-32.jpg';
export const esFotoPdf = (url) => typeof url === 'string' && url.endsWith(MARCA_PDF);

/** Productos que tienen la foto del PDF esperando decisión, y los que la recibieron como única foto. */
export async function listarCatalogoNuevo() {
  const todos = await store.leerTodos();
  const aElegir = [];
  const soloPdf = [];
  for (const p of todos) {
    if (p.oculto) continue;
    const pdf = (p.galeria || []).find(esFotoPdf);
    if (pdf && p.foto && !esFotoPdf(p.foto)) aElegir.push({ codigo: p.codigo, nombre: p.nombre || '', actual: p.foto, pdf });
    else if (esFotoPdf(p.foto) && !(p.flags || []).includes('NUEVO')) soloPdf.push({ codigo: p.codigo, nombre: p.nombre || '', pdf: p.foto });
  }
  const orden = (a, b) => a.codigo.localeCompare(b.codigo);
  return { aElegir: aElegir.sort(orden), soloPdf: soloPdf.sort(orden) };
}

/**
 * Deja UNA sola foto: cual = 'pdf' (la del catálogo nuevo pasa a principal y la anterior se quita)
 * o 'actual' (se queda la de siempre y se quita la del PDF).
 */
export async function elegirFoto(codigo, cual) {
  const p = await store.obtener(codigo);
  if (!p) throw new Error('No existe el producto ' + codigo);
  const pdf = (p.galeria || []).find(esFotoPdf);
  if (!pdf) return { ok: true }; // ya estaba resuelto
  if (cual === 'pdf') {
    const anterior = p.foto;
    const r = await store.usarComoPortada(codigo, pdf);
    if (!r.ok) throw new Error(r.error);
    if (anterior && anterior !== pdf) {
      const r2 = await store.quitarDeGaleria(codigo, 'galeria', anterior);
      if (!r2.ok) throw new Error(r2.error);
    }
  } else {
    const r = await store.quitarDeGaleria(codigo, 'galeria', pdf);
    if (!r.ok) throw new Error(r.error);
  }
  return { ok: true };
}

/** Saca la foto del PDF de un producto que la tenía como única foto (queda sin foto). */
export async function sacarFotoPdf(codigo) {
  const p = await store.obtener(codigo);
  if (!p) throw new Error('No existe el producto ' + codigo);
  if (!esFotoPdf(p.foto)) return { ok: true };
  const r = await store.setFotoPortada(codigo, null);
  if (!r.ok) throw new Error(r.error);
  return { ok: true };
}
