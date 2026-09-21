/**
 * Achica la imagen del diagrama en el navegador antes de subirla (máximo 2400 px de lado),
 * para que suba rápido y no pase el límite del servidor. Los diagramas son dibujos de líneas:
 * se guarda en PNG si queda liviano (sin manchas de compresión) o en JPG de alta calidad.
 */
const LADO = 2400;
const LIMITE_PNG = 2.5 * 1024 * 1024;

const aBlob = (canvas, tipo, calidad) => new Promise((ok) => canvas.toBlob(ok, tipo, calidad));

export async function achicarImagen(archivo) {
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => mal(new Error('No se pudo leer la imagen. Probá con un PNG o JPG.'));
      i.src = url;
    });
    const e = Math.min(1, LADO / Math.max(img.width, img.height));
    if (e === 1 && archivo.size < LIMITE_PNG) return archivo;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * e);
    canvas.height = Math.round(img.height * e);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // fondo blanco si el PNG era transparente
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const png = await aBlob(canvas, 'image/png');
    if (png && png.size < LIMITE_PNG) return new File([png], 'diagrama.png', { type: 'image/png' });
    const jpg = await aBlob(canvas, 'image/jpeg', 0.9);
    return new File([jpg], 'diagrama.jpg', { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(url);
  }
}
