import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Avisa que el catálogo cambió.
 *
 * Las páginas del sitio se guardan ya armadas en la red de Vercel para que carguen rápido
 * (ver lib/db.js). Esta función borra esa copia guardada, así un cambio hecho en el panel
 * se ve enseguida en la web y no hay que esperar a que la copia se renueve sola.
 *
 * Se llama desde las acciones del panel que tocan productos: editar, importar, Excel,
 * fotos, categorías.
 */
export function refrescarCatalogo() {
  revalidateTag('catalogo');
  revalidatePath('/', 'layout');
}
