import fs from 'fs';
import path from 'path';

/**
 * Despieces publicados en internet (diyspareparts.com), por máquina.
 *
 * data/despiece-online.json se arma con data/scripts/despiece-online.mjs (recorre el sitio con curl,
 * despacio): para cada máquina del campo "Despiece" de los productos guarda sus variantes
 * (FS 38, FS 38 Z…) y los dibujos de cada una (cilindro, arranque, carburador…).
 * No se copian las imágenes: se enlaza a cada dibujo en el sitio original.
 *
 * { "stihl|fs55": { "variantes": [ { "nombre": "FS 55", "url": "https://…/fs-55/", "dibujos": [["CARBURETOR C1Q-S71", "<id>"], …] } ] } }
 */

const ARCHIVO = path.join(process.cwd(), 'data', 'despiece-online.json');
export const FUENTE = { nombre: 'diyspareparts.com', url: 'https://www.diyspareparts.com' };

let _datos = null;
function datos() {
  if (_datos) return _datos;
  try {
    _datos = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
  } catch {
    _datos = {};
  }
  return _datos;
}

// Nombres de los dibujos en castellano (el sitio los tiene en inglés)
const PALABRAS = [
  [/\bcrankcase\b/gi, 'Cárter'], [/\bcylinder\b/gi, 'Cilindro'], [/\bpiston\b/gi, 'Pistón'], [/\bcrankshaft\b/gi, 'Cigüeñal'],
  [/\brewind starter\b/gi, 'Arranque'], [/\bstarter\b/gi, 'Arranque'], [/\bmuffler\b/gi, 'Escape'], [/\bexhaust\b/gi, 'Escape'],
  [/\bignition system\b/gi, 'Encendido'], [/\bignition\b/gi, 'Encendido'], [/\bclutch drum\b/gi, 'Campana de embrague'], [/\bclutch\b/gi, 'Embrague'],
  [/\bengine housing\b/gi, 'Carcasa del motor'], [/\bshroud\b/gi, 'Tapa'], [/\bair filter\b/gi, 'Filtro de aire'], [/\bfuel tank\b/gi, 'Tanque de combustible'],
  [/\bfuel system\b/gi, 'Sistema de combustible'], [/\btank housing\b/gi, 'Carcasa del tanque'], [/\bcarburetor\b/gi, 'Carburador'], [/\bcarburettor\b/gi, 'Carburador'],
  [/\bdrive tube assembly\b/gi, 'Tubo de transmisión'], [/\bdrive tube\b/gi, 'Tubo de transmisión'], [/\bdrive shaft\b/gi, 'Eje de transmisión'],
  [/\bgear head\b/gi, 'Cabezal de engranajes'], [/\bgearbox\b/gi, 'Caja de engranajes'], [/\bdeflector\b/gi, 'Protector'],
  [/\btwo-handed handle bar\b/gi, 'Manillar de dos manos'], [/\bhandle bar\b/gi, 'Manillar'], [/\bhandlebar\b/gi, 'Manillar'], [/\bhandle\b/gi, 'Manija'],
  [/\bthrottle trigger\b/gi, 'Gatillo del acelerador'], [/\bthrottle cable\b/gi, 'Cable del acelerador'], [/\bthrottle\b/gi, 'Acelerador'],
  [/\boil pump\b/gi, 'Bomba de aceite'], [/\bchain brake\b/gi, 'Freno de cadena'], [/\bchain sprocket cover\b/gi, 'Tapa del piñón'],
  [/\bchain sprocket\b/gi, 'Piñón'], [/\bguide bar\b/gi, 'Espada'], [/\bsaw chain\b/gi, 'Cadena'], [/\bchain\b/gi, 'Cadena'],
  [/\bblower housing\b/gi, 'Carcasa del soplador'], [/\bblower\b/gi, 'Soplador'], [/\bfan housing\b/gi, 'Carcasa del ventilador'], [/\bfan\b/gi, 'Ventilador'],
  [/\bspray attachment\b/gi, 'Pulverizador'], [/\bcutting attachment\b/gi, 'Accesorio de corte'], [/\bcutter bar\b/gi, 'Barra de corte'],
  [/\bbackplate\b/gi, 'Placa trasera'], [/\bharness\b/gi, 'Arnés'], [/\bstickers?\b/gi, 'Calcomanías'], [/\bdecals?\b/gi, 'Calcomanías'],
  [/\btools\b/gi, 'Herramientas'], [/\bextras\b/gi, 'Extras'], [/\bspecial accessories\b/gi, 'Accesorios especiales'], [/\baccessories\b/gi, 'Accesorios'],
  [/\bwrap around\b/gi, 'envolvente'], [/\btwo handed\b/gi, 'de dos manos'], [/\bloop handle\b/gi, 'manija cerrada'],
  [/\bcat\./gi, 'catalítico'], [/\bvalve\b/gi, 'Válvula'], [/\bcover\b/gi, 'Tapa'], [/\bcase\b/gi, 'Carcasa'], [/\bhousing\b/gi, 'Carcasa'], [/\band\b/gi, 'y'],
];
function enCastellano(nombre) {
  let t = String(nombre || '').replace(/\s+/g, ' ').trim();
  for (const [re, es] of PALABRAS) t = t.replace(re, es);
  // "CARBURADOR C1Q-S71" -> "Carburador C1Q-S71": primera letra en mayúscula, el resto como quedó
  t = t.replace(/\b([A-ZÁÉÍÓÚÑ])([A-ZÁÉÍÓÚÑ]{3,})\b/g, (m, a, b) => a + b.toLowerCase());
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Qué repuestos del catálogo corresponden a cada dibujo (por palabras del nombre del repuesto)
const PARTES = [
  [/carbur/i, /carbur|zama|walbro|diafragma|punz/i],
  [/cylinder|piston|crankcase|crankshaft/i, /cilindro|pist[oó]n|aros|cig[üu]e[ñn]al|ret[ée]n|rodamiento|junta base|biela/i],
  [/starter/i, /arranque|cazoleta|polea|resorte de arr|cuerda|manija de arr/i],
  [/muffler|exhaust/i, /escape|silenciador/i],
  [/ignition/i, /bobina|encendido|volante|buj[ií]a|magn[ée]tico/i],
  [/clutch/i, /embrague|campana/i],
  [/air filter/i, /filtr/i],
  [/fuel|tank/i, /tanque|combustible|manguera|tapa tanque|chupador|filtro de nafta/i],
  [/drive tube|drive shaft/i, /tubo|eje|cardan|ca[ñn]o/i],
  [/gear ?head|gearbox|deflector/i, /engranaje|caja de|cabezal|protector|pi[ñn][óo]n caja/i],
  [/handle|throttle/i, /manillar|manija|acelerador|gatillo|soporte/i],
  [/oil pump/i, /bomba de aceite|sinf[ií]n|aceite/i],
  [/chain brake/i, /freno|cinta/i],
  [/sprocket/i, /pi[ñn][óo]n/i],
  [/guide bar|chain/i, /espada|cadena/i],
  [/engine housing|shroud|cover/i, /carcasa|tapa/i],
];

/**
 * Despiece online de una máquina, con los dibujos en castellano y, si se pasan los repuestos de la
 * máquina, los que corresponden a cada dibujo.
 */
export function despieceOnline(clave, productos = []) {
  const d = datos()[clave];
  if (!d || !d.variantes?.length) return null;
  const nombreDe = (p) => p.nombre || p.clave_producto || p.codigo;
  return {
    fuente: FUENTE,
    variantes: d.variantes.map((v) => ({
      nombre: v.nombre,
      url: v.url,
      dibujos: (v.dibujos || []).map(([nombre, id]) => {
        // un dibujo puede juntar dos partes ("Ignition system, Clutch"): valen todas las reglas que coinciden
        const reglas = PARTES.filter(([re]) => re.test(nombre)).map(([, re]) => re);
        const repuestos = reglas.length ? productos.filter((p) => reglas.some((re) => re.test(nombreDe(p)))) : [];
        return {
          nombre: enCastellano(nombre),
          original: nombre,
          url: `${v.url}${id}`,
          repuestos: repuestos.map((p) => ({ codigo: p.codigo, nombre: nombreDe(p) })),
        };
      }),
    })),
  };
}

export function tieneDespieceOnline(clave) {
  return !!datos()[clave]?.variantes?.length;
}

/** URL del despiece (primera variante) de una máquina, o null. */
export function urlDespieceOnline(clave) {
  return datos()[clave]?.variantes?.[0]?.url || null;
}
