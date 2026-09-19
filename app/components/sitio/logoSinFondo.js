/**
 * Prepara el logo que sube un comercio para la placa: si tiene fondo blanco (o casi blanco),
 * se lo saca rellenando desde los bordes, así los blancos DENTRO del logo se conservan.
 * Devuelve { canvas (sin fondo, recortado), original (con su fondo, recortado),
 *            luminancia (0 = negro, 1 = blanco, promedio de lo que queda), sinFondo }.
 * Todo corre en el navegador: la imagen no se sube a ningún lado.
 */

const MAX = 900;       // lado máximo con el que se trabaja
const TOL_LOGO = 48;   // qué tan lejos del blanco se considera "fondo" (logos)
const SUAVE_LOGO = 90; // borde suavizado entre el fondo y el logo

function leer(archivo) {
  return new Promise((ok, mal) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); ok(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); mal(e); };
    img.src = url;
  });
}

const distBlanco = (d, i) => Math.max(255 - d[i], 255 - d[i + 1], 255 - d[i + 2]);

/**
 * opciones.soloPrincipal: para fotos de producto. Después de sacar el fondo, descarta manchas
 * sueltas chicas (sombras, rayitas del borde de la foto) y deja sólo la pieza.
 */
export async function procesarLogo(archivo, opciones = {}) {
  // Las fotos de producto del catálogo tienen fondo blanco puro: se borra sólo el blanco casi
  // perfecto, para no comerse los brillos del metal que tocan el borde.
  const TOL = opciones.soloPrincipal ? 14 : TOL_LOGO;
  const SUAVE = opciones.soloPrincipal ? 34 : SUAVE_LOGO;
  const img = await leer(archivo);
  const e = Math.min(1, MAX / Math.max(img.width, img.height));
  const W = Math.max(1, Math.round(img.width * e));
  const H = Math.max(1, Math.round(img.height * e));

  const base = document.createElement('canvas');
  base.width = W; base.height = H;
  const bctx = base.getContext('2d', { willReadFrequently: true });
  bctx.drawImage(img, 0, 0, W, H);
  const datos = bctx.getImageData(0, 0, W, H);
  const d = datos.data;

  // ¿El borde es blanco? (si ya es PNG transparente o tiene fondo de color, no se toca)
  let borde = 0, blancos = 0;
  const mirar = (x, y) => {
    const i = (y * W + x) * 4;
    borde++;
    if (d[i + 3] > 200 && distBlanco(d, i) < TOL) blancos++;
  };
  for (let x = 0; x < W; x++) { mirar(x, 0); mirar(x, H - 1); }
  for (let y = 0; y < H; y++) { mirar(0, y); mirar(W - 1, y); }
  const sinFondo = blancos / borde > 0.6;

  if (sinFondo) {
    // Relleno desde los bordes: sólo se borra el blanco conectado con el exterior
    const visto = new Uint8Array(W * H);
    const cola = new Int32Array(W * H);
    let ini = 0, fin = 0;
    const encolar = (p) => {
      if (visto[p]) return;
      const i = p * 4;
      if (distBlanco(d, i) >= SUAVE) return;
      visto[p] = 1;
      cola[fin++] = p;
    };
    for (let x = 0; x < W; x++) { encolar(x); encolar((H - 1) * W + x); }
    for (let y = 0; y < H; y++) { encolar(y * W); encolar(y * W + W - 1); }
    while (ini < fin) {
      const p = cola[ini++];
      const i = p * 4;
      const dist = distBlanco(d, i);
      if (dist < TOL) {
        d[i + 3] = 0;
      } else {
        // borde: se deja semitransparente para que no quede un halo blanco
        d[i + 3] = Math.round(d[i + 3] * ((dist - TOL) / (SUAVE - TOL)));
        continue; // no se sigue avanzando más allá del borde del logo
      }
      const x = p % W, y = (p / W) | 0;
      if (x > 0) encolar(p - 1);
      if (x < W - 1) encolar(p + 1);
      if (y > 0) encolar(p - W);
      if (y < H - 1) encolar(p + W);
    }
  }

  if (sinFondo && opciones.soloPrincipal) {
    // Grupos de píxeles visibles conectados: se quedan los grandes, se borran las manchitas
    const grupo = new Int32Array(W * H).fill(-1);
    const tam = [];
    const caja = []; // [x0, y0, x1, y1] de cada grupo
    const pila = new Int32Array(W * H);
    for (let p0 = 0; p0 < W * H; p0++) {
      if (grupo[p0] !== -1 || d[p0 * 4 + 3] <= 16) continue;
      const g = tam.length;
      let n = 0, sp = 0, bx0 = W, by0 = H, bx1 = 0, by1 = 0;
      pila[sp++] = p0; grupo[p0] = g;
      while (sp) {
        const p = pila[--sp];
        n++;
        const x = p % W, y = (p / W) | 0;
        if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
        const vec = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1];
        for (const q of vec) {
          if (q >= 0 && grupo[q] === -1 && d[q * 4 + 3] > 16) { grupo[q] = g; pila[sp++] = q; }
        }
      }
      tam.push(n);
      caja.push([bx0, by0, bx1, by1]);
    }
    let mayor = 0;
    for (const n of tam) if (n > mayor) mayor = n;
    for (let p = 0; p < W * H; p++) {
      const g = grupo[p];
      if (g < 0) continue;
      const [a0, b0, a1, b1] = caja[g];
      const w = a1 - a0 + 1, h = b1 - b0 + 1;
      // rayitas: sombras o bordes de la foto, muy finas y alargadas
      const raya = (h <= Math.max(6, H * 0.06) && w > h * 6) || (w <= Math.max(6, W * 0.06) && h > w * 6);
      if (tam[g] < mayor * 0.06 || (raya && tam[g] < mayor * 0.5)) d[p * 4 + 3] = 0;
    }
  }

  // Recorte a lo que queda visible + luminancia promedio del logo
  let x0 = W, y0 = H, x1 = -1, y1 = -1, lum = 0, peso = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const a = d[i + 3];
      if (a > 16) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
        const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
        lum += l * a; peso += a;
      }
    }
  }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;

  const sin = document.createElement('canvas');
  sin.width = cw; sin.height = ch;
  const tmp = document.createElement('canvas');
  tmp.width = W; tmp.height = H;
  tmp.getContext('2d').putImageData(datos, 0, 0);
  sin.getContext('2d').drawImage(tmp, x0, y0, cw, ch, 0, 0, cw, ch);

  const original = document.createElement('canvas');
  original.width = cw; original.height = ch;
  original.getContext('2d').drawImage(base, x0, y0, cw, ch, 0, 0, cw, ch);

  return { canvas: sin, original, luminancia: peso ? lum / peso : 0.5, sinFondo };
}
