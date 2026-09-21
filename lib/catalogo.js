import fs from 'fs';
import path from 'path';
import { db, usandoDB } from './db';
import { unstable_noStore as sinCacheEstatica } from 'next/cache';
import { temporadaVigente } from './ajustes';
import { ordenarFamilias } from './temporada';
import { slugify } from './slug';

/**
 * Acceso a los datos del catálogo.
 * - Si CATALOGO_USA_DB=1 y hay credenciales: lee de Supabase (cat_productos).
 * - Si no: lee de data/productos.json (modo local).
 * La interfaz pública no cambia; sólo que ahora las funciones son async.
 */

const FILE = path.join(process.cwd(), 'data', 'productos.json');
const TTL = 20 * 1000; // 20 s de caché del snapshot completo

let _raw = null;
let _rawAt = 0;
let _rawMtime = 0;
let _index = null;
let _indexKey = '';

// slugify vive en lib/slug.js (sin dependencias, lo pueden usar los componentes)
export { slugify };

function norm(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
/**
 * "Clave" de comparación de códigos: minúsculas, sin tildes y SIN separadores.
 * Así "MS-250", "ms 250", "MS250" y "ms.250" son todos "ms250".
 */
function clave(s) {
  return norm(s).replace(/[^a-z0-9]+/g, '');
}
function cap(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Lee TODOS los productos (con ocultos), cacheado. Fuente: DB o archivo. */
export async function leerTodosRaw() {
  if (usandoDB) {
    // Con base de datos los datos cambian en vivo: la página que los usa no se arma fija al publicar
    sinCacheEstatica();
    if (_raw && Date.now() - _rawAt < TTL) return _raw;
    let all = [];
    let desde = 0;
    // paginar de a 1000 (límite por defecto de PostgREST)
    while (true) {
      const { data, error } = await db.from('cat_productos').select('*').range(desde, desde + 999);
      if (error) throw new Error('Supabase: ' + error.message);
      all = all.concat(data || []);
      if (!data || data.length < 1000) break;
      desde += 1000;
    }
    _raw = all;
    _rawAt = Date.now();
    return all;
  }
  // modo archivo
  let mt = 0;
  try {
    mt = fs.statSync(FILE).mtimeMs;
  } catch {}
  if (_raw && mt === _rawMtime) return _raw;
  _rawMtime = mt;
  _raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  return _raw;
}

async function index() {
  const raw = await leerTodosRaw();
  const key = usandoDB ? String(_rawAt) : String(_rawMtime);
  if (_index && _indexKey === key) return _index;
  _indexKey = key;

  // copias: NO mutar los objetos crudos (se persisten tal cual en modo archivo)
  const productos = raw.filter((p) => !p.oculto).map((p) => ({ ...p }));
  const porCodigo = new Map();
  const familiasMap = new Map();
  const marcasSet = new Set();

  for (const p of productos) {
    p.familiaSlug = slugify(p.familia || 'sin-familia');
    p.subSlug = slugify(p.subcategoria || 'general');
    p.subLabel = p.subcategoria ? cap(p.subcategoria) : 'General';
    porCodigo.set(p.codigo, p);
    for (const m of p.marcas || []) marcasSet.add(m);

    if (!familiasMap.has(p.familiaSlug)) {
      familiasMap.set(p.familiaSlug, { slug: p.familiaSlug, nombre: p.familia || 'Sin familia', subcats: new Map(), count: 0 });
    }
    const fam = familiasMap.get(p.familiaSlug);
    fam.count++;
    if (!fam.subcats.has(p.subSlug)) fam.subcats.set(p.subSlug, { slug: p.subSlug, nombre: p.subLabel, count: 0 });
    fam.subcats.get(p.subSlug).count++;
  }

  // --- Estructuras de búsqueda: se arman UNA vez por snapshot del catálogo ---
  // (2466 productos: precalcular el texto normalizado y las claves sin separadores
  //  evita rehacerlo en cada tecla del buscador.)
  const busqueda = new Array(productos.length);
  const vocabSet = new Set();
  for (let i = 0; i < productos.length; i++) {
    const p = productos[i];
    const hay = norm(
      [p.codigo, p.nombre, (p.marcas || []).join(' '), (p.despiece || []).join(' '), p.compatibilidad, (p.codigo_original || []).join(' '), p.descripcion, p.subcategoria, p.familia]
        .filter(Boolean)
        .join(' ')
    );
    const palabras = new Set();
    for (const w of hay.split(/[^a-z0-9]+/)) {
      if (w.length >= 3) {
        palabras.add(w);
        vocabSet.add(w);
      }
    }
    busqueda[i] = {
      p,
      codeKey: clave(p.codigo),
      oemKeys: (p.codigo_original || []).map(clave).filter(Boolean),
      nombre: norm(p.nombre || ''),
      nombreKey: clave(p.nombre || ''),
      hay,
      key: hay.replace(/[^a-z0-9]+/g, ''),
      palabras,
      marcas: (p.marcas || []).map((m) => ({ o: m, n: norm(m), k: clave(m) })),
      foto: !!p.foto,
    };
  }

  const familias = [...familiasMap.values()]
    .map((f) => ({
      slug: f.slug,
      nombre: f.nombre,
      count: f.count,
      subcats: [...f.subcats.values()].sort((a, b) => b.count - a.count || a.nombre.localeCompare(b.nombre)),
    }))
    .sort((a, b) => b.count - a.count);

  _index = {
    productos,
    familias,
    busqueda,
    vocab: [...vocabSet],
    porCodigo,
    marcas: [...marcasSet].sort((a, b) => a.localeCompare(b)),
    total: productos.length,
    conFoto: productos.filter((p) => p.foto).length,
  };
  return _index;
}

export function invalidarCache() {
  _raw = null;
  _rawAt = 0;
  _rawMtime = 0;
  _index = null;
  _indexKey = '';
}

export async function getCatalogoResumen() {
  const c = await index();
  return { total: c.total, conFoto: c.conFoto, familias: c.familias.map((f) => ({ slug: f.slug, nombre: f.nombre, count: f.count })) };
}

export async function getFamilias() {
  return (await index()).familias;
}

/** Todas las marcas con las que trabajamos (con repuestos en el catálogo) + conteo. */
export async function getMarcasConteo() {
  const c = await index();
  const cont = new Map();
  for (const p of c.productos) for (const m of p.marcas || []) cont.set(m, (cont.get(m) || 0) + 1);
  return [...cont.entries()]
    .map(([nombre, count]) => ({ nombre, slug: slugify(nombre), count }))
    .sort((a, b) => b.count - a.count || a.nombre.localeCompare(b.nombre));
}

/**
 * Familias en el orden en que se muestran y se recorren: primero las fijas de inicio
 * (desmalezadoras, minitractores, motosierras), después las de la temporada en foco y el resto.
 */
export async function getFamiliasOrdenadas() {
  const [familias, estado] = await Promise.all([getFamilias(), temporadaVigente()]);
  return ordenarFamilias(familias, estado);
}

/**
 * Categoría anterior y siguiente para recorrer el catálogo sin volver al menú.
 * Sigue el orden de las familias y, dentro de cada una, el de sus subcategorías.
 * Con subSlug: navega entre subcategorías (al terminar una familia pasa a la siguiente).
 * Sin subSlug: navega entre familias.
 */
export async function getNavegacionCategorias(famSlug, subSlug = null) {
  const familias = await getFamiliasOrdenadas();
  const item = (f, s) => (s
    ? { href: `/c/${f.slug}/${s.slug}`, nombre: s.nombre, familia: f.nombre, familiaSlug: f.slug }
    : { href: `/f/${f.slug}`, nombre: f.nombre, familia: f.nombre, familiaSlug: f.slug });

  if (!subSlug) {
    const i = familias.findIndex((f) => f.slug === famSlug);
    if (i === -1) return { anterior: null, siguiente: null };
    return {
      anterior: i > 0 ? item(familias[i - 1]) : null,
      siguiente: i < familias.length - 1 ? item(familias[i + 1]) : null,
    };
  }

  const secuencia = familias.flatMap((f) => f.subcats.map((s) => item(f, s)));
  const i = secuencia.findIndex((x) => x.familiaSlug === famSlug && x.href.endsWith(`/${subSlug}`));
  if (i === -1) return { anterior: null, siguiente: null };
  return { anterior: i > 0 ? secuencia[i - 1] : null, siguiente: i < secuencia.length - 1 ? secuencia[i + 1] : null };
}

export async function getFamilia(famSlug) {
  return (await index()).familias.find((f) => f.slug === famSlug) || null;
}

/** Todos los productos de una familia, de todas sus subcategorías ("Ver todo en [familia]"). */
export async function getProductosDeFamilia(famSlug) {
  const c = await index();
  return c.productos.filter((p) => p.familiaSlug === famSlug);
}

export async function getProductosDeSubcategoria(famSlug, subSlug) {
  const c = await index();
  return c.productos.filter((p) => p.familiaSlug === famSlug && p.subSlug === subSlug);
}

export async function getProducto(codigo) {
  return (await index()).porCodigo.get(codigo) || null;
}

export async function getRelacionados(codigo, n = 4) {
  const c = await index();
  const p = c.porCodigo.get(codigo);
  if (!p) return [];
  return c.productos.filter((x) => x.codigo !== codigo && x.familiaSlug === p.familiaSlug && x.subSlug === p.subSlug).slice(0, n);
}

export async function getVecinos(codigo) {
  const c = await index();
  const p = c.porCodigo.get(codigo);
  if (!p) return { prev: null, next: null };
  const sibs = c.productos
    .filter((x) => x.familiaSlug === p.familiaSlug && x.subSlug === p.subSlug)
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
  const i = sibs.findIndex((x) => x.codigo === codigo);
  return { prev: i > 0 ? sibs[i - 1] : null, next: i >= 0 && i < sibs.length - 1 ? sibs[i + 1] : null };
}

export async function getPorMarca(marcaSlug) {
  const c = await index();
  const list = c.productos.filter(
    (p) =>
      (p.marcas || []).some((m) => slugify(m) === marcaSlug) ||
      (p.compatibilidad && slugify(p.compatibilidad).includes(marcaSlug))
  );
  const nombre = c.marcas.find((m) => slugify(m) === marcaSlug) || marcaSlug;
  return { nombre, productos: list };
}

/* ------------------------------------------------------------------ *
 * BUSCADOR
 * ------------------------------------------------------------------ *
 * Objetivo: que el comercio encuentre el repuesto aunque escriba el
 * código "como le sale" ("ms250", "MS-250", "ms 250") o con un error de
 * tipeo ("motosiera", "husquvarna"). Sin librerías: todo a mano.
 *
 * Orden de prioridad (de mayor a menor):
 *   1. Código propio exacto              (1000)
 *   2. Código original exacto             (900)
 *   3. Código propio que empieza con…     (~820)
 *   4. Código original (empieza/contiene) (720 / 700)
 *   5. Código propio que contiene…        (640)
 *   6. Marca + modelo                     (600)
 *   7. En el nombre                       (560 / 520)
 *   8. Texto (todas las palabras)         (460 / 400)
 *   9. Coincidencia aproximada (typos)    (200)
 * Bonus: +90 si además la frase entera aparece junta, +2 si tiene foto.
 */

/**
 * Puntajes de referencia, para quien necesite decidir "¿esto es seguro o es una pista?"
 * (los usa el pedido rápido para aceptar un código o sólo sugerir opciones).
 */
export const PUNTAJE = {
  EXACTO: 1000, // código propio idéntico
  ORIGINAL: 900, // código original del fabricante idéntico
  CODIGO: 640, // el código contiene lo buscado
  MARCA_MODELO: 600,
  TEXTO: 400, // aparecen todas las palabras
  APROXIMADO: 200, // hubo que corregir la ortografía
  PARCIAL: 100, // faltó alguna palabra
};

/** Largo mínimo de una palabra para tolerarle errores de tipeo. */
const LARGO_TYPO = 5;
/** Distancia de edición permitida según el largo de la palabra tipeada. */
function umbralTypo(n) {
  return n >= 8 ? 2 : 1;
}

/** Distancia de edición (Levenshtein) entre dos strings cortos, con corte temprano. */
function distancia(a, b, max = Infinity) {
  if (a === b) return 0;
  const al = a.length, bl = b.length;
  if (!al) return bl;
  if (!bl) return al;
  if (Math.abs(al - bl) > max) return max + 1;
  const dp = new Array(bl + 1);
  for (let j = 0; j <= bl; j++) dp[j] = j;
  for (let i = 1; i <= al; i++) {
    let prev = dp[0];
    dp[0] = i;
    let mejor = dp[0];
    for (let j = 1; j <= bl; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
      if (dp[j] < mejor) mejor = dp[j];
    }
    if (mejor > max) return max + 1; // ya no puede bajar de "max"
  }
  return dp[bl];
}

/**
 * Palabras reales del catálogo que podrían ser lo que se quiso escribir.
 * Se resuelve UNA vez por término (no por producto): el vocabulario son ~4.900
 * palabras y el filtro por largo deja muy pocas comparaciones.
 */
function palabrasParecidas(term, vocab) {
  const umbral = umbralTypo(term.length);
  const min = term.length - umbral;
  const max = term.length + umbral;
  const out = new Set();
  for (let i = 0; i < vocab.length; i++) {
    const w = vocab[i];
    if (w.length < min || w.length > max) continue;
    // Atajo barato: casi ningún typo cambia las dos primeras letras a la vez.
    if (w[0] !== term[0] && w[1] !== term[1]) continue;
    if (distancia(w, term, umbral) <= umbral) out.add(w);
  }
  return out;
}

/** ¿El producto contiene este término? 'exacta' | 'aprox' | null */
function coincideTermino(e, t) {
  if (e.hay.includes(t.raw)) return 'exacta';
  if (t.key.length >= 3 && e.key.includes(t.key)) return 'exacta'; // "ms250" dentro de "MS 250 / 025"
  if (t.fuzzy) {
    for (const w of t.fuzzy) if (e.palabras.has(w)) return 'aprox';
  }
  return null;
}

/** ¿La consulta parece un código y no una frase? (para no disparar "código que empieza con…") */
function pareceCodigo(qKey, terms) {
  if (qKey.length < 3 || terms.length > 4) return false;
  if (!/[0-9]/.test(qKey)) return false;
  return terms.every((t) => t.length <= 14 && !/^[a-z]{5,}$/.test(t));
}

/** Palabras de relleno: no aportan nada y hacen fallar la búsqueda ("kit DE reparación"). */
const VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'para', 'con', 'por', 'en', 'al', 'y', 'o', 'tipo']);

function rankear(c, raw) {
  const todosLosTerminos = raw.split(/\s+/).filter(Boolean);
  const utiles = todosLosTerminos.filter((t) => !VACIAS.has(t));
  const terms = utiles.length ? utiles : todosLosTerminos;
  const qKey = clave(raw);
  const codigoish = pareceCodigo(qKey, terms);
  const tokens = terms.map((t) => ({
    raw: t,
    key: clave(t),
    // Los typos son de palabras, no de códigos: si tiene números, no se corrige.
    fuzzy: t.length >= LARGO_TYPO && !/[0-9]/.test(t) ? palabrasParecidas(t, c.vocab) : null,
  }));
  const out = [];

  for (let i = 0; i < c.busqueda.length; i++) {
    const e = c.busqueda[i];
    let score = 0;
    let motivo = '';

    if (qKey && e.codeKey === qKey) {
      score = 1000;
      motivo = 'Código exacto';
    } else if (qKey.length >= 3 && e.oemKeys.includes(qKey)) {
      score = 900;
      motivo = 'Código original';
    } else if (codigoish && e.codeKey.startsWith(qKey)) {
      // entre los que empiezan igual, primero el más parecido en largo
      score = 820 - Math.min(e.codeKey.length - qKey.length, 9);
      motivo = 'Código que empieza con "' + qKey + '"';
    } else if (qKey.length >= 3 && e.oemKeys.some((o) => o.startsWith(qKey))) {
      score = 720;
      motivo = 'Código original';
    } else if (qKey.length >= 4 && e.oemKeys.some((o) => o.includes(qKey))) {
      score = 700;
      motivo = 'Código original';
    } else if (codigoish && qKey.length >= 4 && e.codeKey.includes(qKey)) {
      score = 640;
      motivo = 'Código que contiene "' + qKey + '"';
    }

    if (!score) {
      // Todas las palabras sueltas, en cualquier orden.
      let todas = true;
      let aprox = false;
      for (const t of tokens) {
        const r = coincideTermino(e, t);
        if (!r) {
          todas = false;
          break;
        }
        if (r === 'aprox') aprox = true;
      }
      if (todas) {
        if (aprox) {
          score = 200;
          motivo = 'Coincidencia aproximada (revisá la ortografía)';
          // Dentro de las aproximadas, primero aquellas donde la palabra corregida
          // es la marca o está en el nombre (ej. "husquvarna" -> productos Husqvarna).
          for (const t of tokens) {
            if (!t.fuzzy) continue;
            for (const w of t.fuzzy) {
              if (e.marcas.some((m) => m.n.includes(w))) { score += 40; break; }
              if (e.nombre.includes(w)) { score += 20; break; }
            }
          }
        } else {
          const marca = e.marcas.find((m) =>
            tokens.some((t) => m.n.includes(t.raw) || (t.key.length >= 3 && m.k.includes(t.key)))
          );
          const resto = marca ? tokens.filter((t) => !marca.n.includes(t.raw) && !marca.k.includes(t.key)) : tokens;
          if (marca && resto.some((t) => /[0-9]/.test(t.key))) {
            score = 600; // marca + modelo: "carburador stihl 250"
            motivo = 'Marca ' + marca.o;
            // el modelo escrito en el nombre del producto vale más que en la compatibilidad
            if (resto.every((t) => e.nombre.includes(t.raw) || (t.key.length >= 3 && e.nombreKey.includes(t.key)))) score += 40;
          } else if (e.nombre.includes(raw)) {
            score = 560;
            motivo = 'En el nombre';
          } else if (tokens.every((t) => e.nombre.includes(t.raw) || (t.key.length >= 3 && e.nombreKey.includes(t.key)))) {
            score = 520;
            motivo = 'En el nombre';
          } else if (marca) {
            score = 460;
            motivo = 'Marca ' + marca.o;
          } else {
            score = 400;
            motivo = 'Coincide con la búsqueda';
          }
        }
        // La frase entera junta (ej. "ms250" dentro de "MS 250"): sube dentro de su tramo.
        if (terms.length > 1 && qKey.length >= 4 && e.key.includes(qKey)) score += 90;
      }
    }

    if (score > 0) {
      if (e.foto) score += 2;
      out.push({ p: e.p, score, motivo });
    }
  }

  // Si pidiendo TODAS las palabras no quedó nada, aflojamos: alcanza con casi todas.
  // (El comercio suele escribir de más: "kit de reparación carburador walbro 33cc".)
  if (!out.length && tokens.length >= 2) {
    const minimo = Math.max(1, tokens.length - 1);
    const total = c.busqueda.length;
    const df = new Array(tokens.length).fill(0);
    const marcados = new Array(total);
    for (let i = 0; i < total; i++) {
      const e = c.busqueda[i];
      const m = [];
      for (let j = 0; j < tokens.length; j++) {
        if (coincideTermino(e, tokens[j])) {
          m.push(j);
          df[j]++;
        }
      }
      marcados[i] = m;
    }
    // Las palabras raras ("walbro") pesan más que las comunes ("kit").
    const peso = df.map((d) => 1 + Math.round(30 * (1 - d / total)));
    for (let i = 0; i < total; i++) {
      const m = marcados[i];
      if (m.length < minimo) continue;
      let s = 0;
      for (const j of m) s += peso[j];
      // el tramo "parcial" nunca pisa al de "aproximada" (200)
      const score = PUNTAJE.PARCIAL + Math.min(s, 95) + (c.busqueda[i].foto ? 2 : 0);
      out.push({ p: c.busqueda[i].p, score, motivo: 'Coincide en parte con la búsqueda' });
    }
  }

  out.sort((a, b) => b.score - a.score || a.p.codigo.localeCompare(b.p.codigo));
  return out;
}

// Caché chica de consultas: el buscador con sugerencias dispara una por tecla.
const _cacheBusq = new Map();
const CACHE_MAX = 120;

/** Búsqueda rankeada por código / OEM / marca+modelo / nombre / texto / aproximada. */
export async function buscar(q, limite = 0) {
  const c = await index();
  const raw = norm(q).trim().replace(/\s+/g, ' ');
  if (!raw) return [];
  const ck = _indexKey + '|' + raw;
  let out = _cacheBusq.get(ck);
  if (!out) {
    out = rankear(c, raw);
    if (_cacheBusq.size >= CACHE_MAX) _cacheBusq.delete(_cacheBusq.keys().next().value);
    _cacheBusq.set(ck, out);
  }
  return limite ? out.slice(0, limite) : out;
}

/**
 * Alternativas reales del catálogo cuando la búsqueda no trae nada:
 * marcas y familias parecidas a lo escrito (o las más grandes, si no hay nada parecido).
 */
export async function sugerenciasBusqueda(q, n = 6) {
  const c = await index();
  const raw = norm(q).trim();
  const terms = raw.split(/\s+/).filter(Boolean);

  const puntaje = (nombre) => {
    const nn = norm(nombre);
    const nk = clave(nombre);
    let mejor = 0;
    for (const t of terms) {
      const tk = clave(t);
      if (!tk) continue;
      if (nn === t || nk === tk) mejor = Math.max(mejor, 10);
      else if (tk.length >= 3 && (nk.startsWith(tk) || tk.startsWith(nk))) mejor = Math.max(mejor, 7);
      else if (tk.length >= 3 && (nk.includes(tk) || tk.includes(nk))) mejor = Math.max(mejor, 5);
      else if (t.length >= 4) {
        const u = umbralTypo(t.length);
        for (const pal of nn.split(/\s+/)) {
          if (pal.length < 3) continue;
          const d = distancia(pal, t, u);
          if (d <= u) mejor = Math.max(mejor, 4 - d * 0.5);
        }
      }
    }
    return mejor;
  };

  const marcas = (await getMarcasConteo())
    .map((m) => ({ tipo: 'marca', nombre: m.nombre, href: '/m/' + m.slug, count: m.count, s: puntaje(m.nombre) }))
    .filter((m) => m.s > 0)
    .sort((a, b) => b.s - a.s || b.count - a.count)
    .slice(0, 4);

  let familias = c.familias
    .map((f) => ({ tipo: 'familia', nombre: f.nombre, href: '/f/' + f.slug, count: f.count, s: puntaje(f.nombre) }))
    .filter((f) => f.s > 0)
    .sort((a, b) => b.s - a.s || b.count - a.count)
    .slice(0, 4);

  // Si no se parece a nada, ofrecemos las familias más grandes del catálogo.
  if (!marcas.length && !familias.length) {
    familias = c.familias
      .slice(0, 4)
      .map((f) => ({ tipo: 'familia', nombre: f.nombre, href: '/f/' + f.slug, count: f.count, s: 0 }));
  }

  return [...marcas, ...familias].slice(0, n).map(({ s, ...r }) => r);
}
