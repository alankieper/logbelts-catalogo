/**
 * Genera extension-fotos/lista.json: productos con foto faltante o de baja calidad
 * para la extensión de Chrome "Logbelts · Fotos del catálogo".
 *
 * Uso:  node data/scripts/generar-lista-extension.mjs
 *
 * Campos por producto (cortos para que el archivo pese poco):
 *   c código · n nombre original · b texto de búsqueda ("Categoría en singular + nombre limpio")
 *   f familia · s subcategoría · m motivo (sin_foto | muy_baja | baja | regular) · px lado mayor de la foto actual
 *   foto archivo actual · v interés en la web (vistas + consultas) · o códigos originales · mk marca
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

sharp.cache(false);

const SALIDA = path.join('extension-fotos', 'lista.json');

// Excluidos a pedido: correas y cuchillas de mini tractor, aros de pistón (tienen fotos propias).
const excluido = (p) =>
  (p.familia === 'Minitractores' && /CORREAS|CUCHILLA/i.test(p.subcategoria || '')) || /^aros$/i.test(p.subcategoria || '');

function motivoPorLado(lado) {
  if (lado < 200) return 'muy_baja';
  if (lado < 400) return 'baja';
  if (lado < 600) return 'regular';
  return null;
}

// ---------- categoría en singular ----------
const POR_SUBCATEGORIA = {
  'CARBURADORES': 'Carburador',
  'Carburadores': 'Carburador',
  'CARBURADORES 4T OTROS REEMPLAZOS': 'Carburador',
  'CARBURADORES 2T OTROS REEMPLAZOS': 'Carburador',
  'PUNZUARES DE CARBURADOR': 'Punzuar de carburador',
  'VÁLVULAS': 'Válvula',
  'KITS DE JUNTAS Y DIAFRAGMAS': 'Kit de juntas y diafragma',
  'REPARACIONES DE CARBURADOR / KITS DE JUNTAS': 'Kit de reparación de carburador',
  'Juntas de motor': 'Junta',
  'TAPAS DE CILINDRO': 'Junta de tapa de cilindro',
  'Tapas de arranque': 'Tapa de arranque',
  'FILTROS DE AIRE REEMPLAZOS 4T': 'Filtro de aire',
  'FILTROS DE AIRE REEMPLAZOS 2T': 'Filtro de aire',
  'FILTROS DE AIRE SOPLADORAS 2T': 'Filtro de aire',
  'Filtro de aire': 'Filtro de aire',
  'TAPAS FILTRO DE AIRE REEMPLAZO 2T': 'Tapa de filtro de aire',
  'CILINDROS COMPLETOS': 'Kit de cilindro',
  'Kit de cilindros': 'Kit de cilindro',
  'CILINDROS Y PISTONES (SEGÚN MARCA)': 'Kit de cilindro',
  'PISTONES Y AROS': 'Kit de pistón',
  'Kit de pistón': 'Kit de pistón',
  'TORRETAS CARCASAS EJES': 'Torreta',
  'POLEAS': 'Polea',
  'Bobina de ignición': 'Bobina de ignición',
  'Cables': 'Cable',
  'CABLES DE ACCIONAMIENTO': 'Cable de accionamiento',
  'CABLES ACELERADOR': 'Cable de acelerador',
  'BOMBA DE ACEITE Y SIN FIN': 'Bomba de aceite',
  'Bomba de aceite': 'Bomba de aceite',
  'EMBRAGUES': 'Embrague',
  'Embragues / campanas / resortes': 'Embrague',
  'CAMPANA DE EMBRAGUE': 'Campana de embrague',
  'Mangueras de combustible': 'Manguera de combustible',
  'Mangueras': 'Manguera',
  'ELECTROEMBRAGUES': 'Electroembrague',
  'Escapes': 'Escape',
  'RUEDAS DE PLATAFORMA Y BULONES': 'Rueda de plataforma',
  'RUEDAS PARA MÁQUINAS DE EMPUJE': 'Rueda',
  'RESORTES DE PLATAFORMAS': 'Resorte de plataforma',
  'NEUMATICOS': 'Neumático',
  'CÁMARAS Y NEUMÁTICOS': 'Neumático',
  'BOMBINES 2T': 'Bombín',
  'ESPADAS STANDARD': 'Espada',
  'CADENAS PREMIUM': 'Cadena',
  'TANZA PREMIUM': 'Tanza',
  'FILTROS DE COMBUSTIBLE': 'Filtro de combustible',
  'Retén': 'Retén',
  'RETENES': 'Retén',
  'Filtro de aceite': 'Filtro de aceite',
  "KIT DE O´RING": "O'ring",
  'LLAVES PASES DE COMBUSTIBLE': 'Llave de paso de combustible',
  'Caja de engranaje': 'Caja de engranaje',
  'Cigüeñal': 'Cigüeñal',
  'Tanque de combustible / tapa': 'Tanque de combustible',
  'Partes de carburador': 'Repuesto de carburador',
};

// Para subcategorías genéricas (Partes, REPUESTOS, 3500...) se usa clave_producto.
const POR_CLAVE = {
  'Carburador': 'Carburador',
  'Partes de carburador': 'Repuesto de carburador',
  'Juntas de carburador': 'Kit de juntas y diafragma',
  'Juntas de motor': 'Junta',
  'Tapas de arranque': 'Tapa de arranque',
  'Filtro de aire': 'Filtro de aire',
  'Filtro de combustible': 'Filtro de combustible',
  'Filtro de aceite': 'Filtro de aceite',
  'Kit de cilindros': 'Kit de cilindro',
  'Kit de pistón': 'Kit de pistón',
  'Aros': 'Aro de pistón',
  'Cigüeñal': 'Cigüeñal',
  'Bobina de ignición': 'Bobina de ignición',
  'Cables': 'Cable',
  'Cadenas': 'Cadena',
  'Espadas': 'Espada',
  'Bomba de aceite': 'Bomba de aceite',
  'Tanque de combustible / tapa': 'Tanque de combustible',
  'Caja de engranaje': 'Caja de engranaje',
  'Embragues / campanas / resortes': 'Embrague',
  'Mangueras': 'Manguera',
  'Poleas': 'Polea',
  'Ruedas': 'Rueda',
  'Torretas': 'Torreta',
  'Tanza': 'Tanza',
  'Cabezales porta tanza': 'Cabezal de tanza',
  'Bombines': 'Bombín',
  'Escape': 'Escape',
  'Retén': 'Retén',
  'Llave de paso': 'Llave de paso de combustible',
};

function categoria(p) {
  if (p.subcategoria === 'Cabezales de tanza' || p.subcategoria === 'ESPADAS PREMIUM') return POR_CLAVE[p.clave_producto] || null;
  return POR_SUBCATEGORIA[p.subcategoria] || POR_CLAVE[p.clave_producto] || null;
}

// ---------- limpieza del nombre ----------
const sinTildes = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Si el nombre ya arranca con uno de estos sustantivos, no se le antepone la categoría.
const SUSTANTIVOS = new Set(
  (
    'carburador junta kit tapa filtro filtrera esponja bobina cable comando polea torreta carcasa eje escape silenciador ' +
    'embrague campana resorte rueda neumatico camara espada cadena tanza cabezal manguera pasamanguera reten bomba sin ' +
    'sinfin valvula bombin punzuar diafragma aro oring piston conjunto cilindro biela ciguenal carter jaula amortiguador ' +
    'buje canonera soporte tanque llave codo brida manubrio manillar traba tuerca motor medidor cobertor tambor ' +
    'portacarbones capuchon interruptor manometro caja electroembrague sistema repuesto rodamiento arandela bulon perno ' +
    'tornillo mandril soga burro solenoide engranaje block cazoleta aguja mango lima cubre base protector cuba flotante ' +
    'palanca gatillo perilla bujia pinon estator volante rotor arranque sello anillo clip chaveta abrazadera guia tensor ' +
    'cubierta deposito tapon varilla cebador acelerador regulador tapita retén o-ring kit cortacorriente ojalillo ' +
    'tambor portacarbon generador cortacerco tubo cinta manija garra extractor silentblock piñon ' +
    'cardan agarre relay ventilador sensor ruleman arbol balancin asiento cortador puntera'
  )
    .split(' ')
    .map(sinTildes),
);
const singularDe = (palabra) => {
  const w = sinTildes(palabra).replace(/[^a-z-]/g, '');
  const candidatos = [w, w.replace(/es$/, ''), w.replace(/s$/, '')];
  return candidatos.find((c) => SUSTANTIVOS.has(c)) || null;
};

// Encabezados genéricos en plural que vienen del PDF ("Tapas de arranque — Maquinas", "Mangueras", "Partes").
const PLURALES = [
  [/^partes( de)?\b\s*/i, ''],
  [/^tapas de arranque\b/i, 'Tapa de arranque'],
  [/^tapas cilindro\b/i, 'Tapa de cilindro'],
  [/^juntas de motor\b/i, 'Junta'],
  [/^filtros de aire\b/i, 'Filtro de aire'],
  [/^kits de juntas\b/i, 'Kit de juntas'],
  [/^tanque de combustible \/ tapa\b/i, 'Tanque de combustible'],
  [/^cajas de engranajes\b/i, 'Caja de engranaje'],
  [/^carburadores\b/i, 'Carburador'],
  [/^mangueras\b/i, 'Manguera'],
  [/^ruedas\b/i, 'Rueda'],
  [/^cables\b/i, 'Cable'],
  [/^poleas\b/i, 'Polea'],
  [/^cadenas\b/i, 'Cadena'],
  [/^espadas\b/i, 'Espada'],
  [/^retenes\b/i, 'Retén'],
  [/^bombines\b/i, 'Bombín'],
];

function limpiarNombre(nombre) {
  let s = String(nombre || '');
  s = s.replace(/Código Logbelts:.*$/i, ' ');
  s = s.replace(/[`\[\]]/g, ' ').replace(/\bC[ÓO]DIGO\b/g, ' '); // restos del PDF
  s = s.replace(/\(\s*verificar foto\s*\)/gi, ' '); // marca de la planilla de Cowork
  s = s.replace(/\b[Tt][Ii][Pp][Oo](?=\s|[A-ZÁÉÍÓÚ]|$)/g, ' '); // "Tipo Zama", "TipoZama"
  s = s.replace(/^\s*oem\b/i, ' ').replace(/\brepl\b/gi, ' ');
  s = s.replace(/\bfi (?=[a-záéíóúñ])/g, 'fi'); // "fi ltro" -> "filtro" (OCR del PDF)
  // abreviaturas de marca del PDF: "Repl St- FS38/55", "HUSQ. 61", "HQV"
  s = s.replace(/\bSt-\s*/gi, 'Stihl ').replace(/\bST(?=\s+(?:MS|FS|BG|BR|SH|HS|TS|KM)\b)/g, 'Stihl').replace(/\bSithl\b/gi, 'Stihl');
  s = s.replace(/\bHus-\s*/gi, 'Husqvarna ').replace(/\bHUSQ\b\.?/gi, 'Husqvarna').replace(/\bHQV\b/g, 'Husqvarna');
  s = s.replace(/\bHU-\s*/g, 'Husqvarna ').replace(/\bHU(?=\d)/g, 'Husqvarna ').replace(/\bOL-\s*/g, 'Oleo Mac ');
  s = s.replace(/[—–·]/g, ' ').replace(/…|\.{3,}/g, ' ').replace(/\s-\s/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  // basura al final: familia o encabezado del PDF en mayúsculas ("DESMALEZADORAS", "TAPAS DE DEPOSITOS")
  // (no si es "... para desmalezadora": ahí la máquina es parte del nombre)
  s = s.replace(/(?<!\b(?:para|de|y))\s+(desmalezadoras?|motosierras?|sopladoras?|minitractor(es)?|maquinas)\s*$/i, '');
  const cola = s.match(/\s((?:[A-ZÁÉÍÓÚÑ]{2,}\s?){2,})$/);
  const resto = cola ? s.slice(0, s.length - cola[0].length) : '';
  if (cola && /[a-záéíóúñ]/.test(resto) && cola[1].replace(/\s/g, '').length >= 8) {
    s = s.slice(0, s.length - cola[0].length);
  }
  for (const [re, rep] of PLURALES) s = s.replace(re, rep);
  s = s.replace(/\s+/g, ' ').trim();
  // primera palabra en plural de una pieza conocida -> singular ("Torretas MTD" -> "Torreta MTD")
  s = s.replace(/^([A-Za-zÁÉÍÓÚÑáéíóúñ]+?)(es|s)(?=\s|$)/, (m, raiz, fin) => {
    if (SUSTANTIVOS.has(sinTildes(m))) return m;
    if (SUSTANTIVOS.has(sinTildes(raiz))) return raiz;
    if (fin === 'es' && SUSTANTIVOS.has(sinTildes(raiz + 'e'))) return raiz + 'e';
    return m;
  });
  // "Escape Escape Escape 6kw" / "Escape con Codo Escape con Codo" -> sin repetir
  for (let i = 0; i < 3; i++) s = s.replace(/\b(.{3,}?)\s+\1\b/gi, '$1');
  // "Walbro 9 x 2,8mm Walbro 9 x 2,8 mm" -> mitad
  const t = s.split(' ');
  for (let n = Math.floor(t.length / 2); n >= 2; n--) {
    const a = sinTildes(t.slice(0, n).join('')).replace(/\s/g, '');
    const b = sinTildes(t.slice(n).join('')).replace(/\s/g, '');
    if (a === b || (b.startsWith(a) && b.length - a.length <= 2)) {
      s = t.slice(0, n).join(' ');
      break;
    }
  }
  s = s.replace(/ (De|Del|Y|Con|Para|Sin|En|A)(?= )/g, (m) => m.toLowerCase());
  s = s.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\(\s*\)/g, ' ').replace(/\s+/g, ' ');
  return s.replace(/^[\s,.;:/-]+|[\s,.;:/-]+$/g, '').trim();
}

// ¿el texto extra (marca / compatibilidad) ya está dicho en el nombre?
function yaIncluido(texto, extra) {
  const base = sinTildes(texto);
  const fichas = sinTildes(extra).split(/[\s,/()]+/).filter((w) => w.length >= 4 || /\d/.test(w));
  if (!fichas.length) return true;
  return fichas.filter((w) => base.includes(w)).length / fichas.length >= 0.5;
}

const MARCAS_RE =
  /\b(stihl|husqvarna|echo|honda|b&s|briggs|kohler|mtd|toro|walbro|zama|chinas?|oleo ?mac|shindaiwa|tecumseh|john deere|cub cadet|poulan|mc ?culloch|homelite|efco|kawasaki|robin|makita|dolmar|sparta|ruixing|huayi|gx ?\d+|ms ?-?\d+|fs ?-?\d+)\b/i;
const tieneModelo = (t) => /\d/.test(t) || MARCAS_RE.test(t);

// Modelo desde el encabezado de la página del PDF: "PARTES DE DESMALEZADORAS REEMPLAZO ST FS160 / 220 / 280"
function modeloDelEncabezado(enc) {
  if (!enc) return null;
  let m = enc.match(/REEMPLAZO\s+(.+)$/i)?.[1];
  if (!m) {
    const cola = enc.match(/\s-\s([^-]+)$/)?.[1];
    if (cola && MARCAS_RE.test(cola)) m = cola;
  }
  if (!m) return null;
  m = m.replace(/\s*\/\s*/g, '/').replace(/^ST\b/i, 'Stihl').replace(/\b[A-ZÁÉÍÓÚÑ]{4,}\b/g, (w) => w.charAt(0) + w.slice(1).toLowerCase());
  return limpiarNombre(m);
}

// Repuestos "Chinas": sin el tipo de máquina la búsqueda trae cualquier cosa.
// "Escape Chinas 26cc" -> "Escape desmalezadora china 26cc". El rubro sale de clave_subrubro (familia a veces está mal).
const RUBRO = {
  'Desmalezadora': 'desmalezadora',
  'Motosierra': 'motosierra',
  'Sopladora': 'sopladora',
  'Corta cerco': 'cortacerco',
  'Hoyadora': 'hoyadora',
  'Motor general': 'motor',
  'Generadores': 'generador',
  'Motobombas': 'motobomba',
  'Minitractor': 'minitractor',
  'Minitractor de empuje': 'cortacésped',
};
const FEMENINOS = new Set(['desmalezadora', 'motosierra', 'sopladora', 'hoyadora', 'motobomba']);
const MAQUINA_PLURAL = /\b(desmalezadoras?|motosierras?|sopladoras?|motobombas?|generador(?:es)?|motor(?:es)?)\s+chin(?:a|as|o|os)\b/gi;

function agregarRubroChino(texto, p) {
  texto = texto.replace(/\bchinese\b/gi, 'chino');
  if (!/\bchin(?:a|as|o|os)\b/i.test(texto)) return texto;
  // ya dice la máquina: "Desmalezadoras Chinas" -> "desmalezadora china"
  let yaTieneMaquina = false;
  texto = texto.replace(MAQUINA_PLURAL, (_, maq) => {
    yaTieneMaquina = true;
    const sing = sinTildes(maq).replace(/(adora|ierra|omba)s$/, '$1').replace(/(motor|generador)es$/, '$1');
    return `${sing} ${FEMENINOS.has(sing) ? 'china' : 'chino'}`;
  });
  if (yaTieneMaquina) return texto;
  // La cilindrada o el modelo mandan sobre clave_subrubro (hay productos de 26cc cargados como motosierra).
  const rubro = rubroPorCilindrada(texto) || RUBRO[p.clave_subrubro] || rubroDeducido(texto, p);
  if (!rubro) return texto.replace(/\bchinas\b/i, 'china').replace(/\bchinos\b/i, 'chino');
  return texto.replace(/\bchin(?:a|as|o|os)\b/i, `${rubro} ${FEMENINOS.has(rubro) ? 'china' : 'chino'}`);
}

// En repuestos chinos "4500" / "5200" es la cilindrada: 45cc / 52cc (mismo criterio para 2500, 3800, 5800, 6200).
// "4500/5200 45cc 52cc" -> "45cc/52cc"
function cilindradaChina(texto) {
  if (!/\bchin[ao]\b/i.test(texto)) return texto;
  let t = texto.replace(/\b(25|38|45|52|58|62)00(?:\s*cc)?\b/gi, '$1cc').replace(/\b(\d{2})\s*cc\b/gi, '$1cc');
  const vistos = new Set();
  t = t.replace(/\b\d{2}cc\b/g, (cc) => {
    if (vistos.has(cc)) return '';
    vistos.add(cc);
    return cc;
  });
  return t.replace(/\s*\/\s*(?=\s|$)/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function rubroPorCilindrada(texto) {
  const t = sinTildes(texto);
  if (/\b(3800|4500|5200|5800|6200)\b/.test(t)) return 'motosierra';
  if (/\b(26|33|43)\s*cc\b|\b(26|33|43)\/\d{2}/.test(t)) return 'desmalezadora';
  return null;
}

// Productos "Universales": la máquina sale del encabezado del PDF o de la cilindrada / modelo.
function rubroDeducido(texto, p) {
  const enc = sinTildes(p.encabezado_pdf || '');
  if (/motosierra/.test(enc)) return 'motosierra';
  if (/desmalezadora/.test(enc)) return 'desmalezadora';
  if (/sopladora/.test(enc)) return 'sopladora';
  if (/generador|grupo/.test(enc)) return 'generador';
  const t = sinTildes(texto);
  if (/\bgrupos?\b/.test(t)) return 'generador';
  if (/\b\d+([,.]\d+)?\s*hp\b|\bg[xpc]v?\d{3}\b/.test(t)) return 'motor';
  if (/\b(3800|4500|5200|5800|6200)\b|\b(38|45|58|62)\s*cc\b/.test(t)) return 'motosierra';
  if (/\b(26|33|43)\s*cc\b|\b(26|33|43)\/\d{2}/.test(t)) return 'desmalezadora';
  return null;
}

// "Campana De Embrague Resorte De Embrague": al leer la grilla del PDF se pegó el rótulo del casillero de al lado.
// Se usa el último rótulo (el del propio producto, pegado a su código) y se avisa en el panel.
const NO_PEGADO = /^(jaula de agujas|filtrera|kit pist|kit de pist|conjunto)/;
// "Campana de Embrague Piñón Fijo" y "Tapa de Tanque Motores OHV" son una sola pieza, no dos rótulos.
const NO_CORTE = new Set(['motor', 'motores', 'completo', 'completa', 'block', 'comb', 'pinon', 'piñon']);
function rotulosPegados(nombre) {
  const original = String(nombre || '');
  if (/—/.test(original)) return null; // "Tapas de arranque — Repuestos" es título de sección (se usa la descripción)
  const s = limpiarNombre(original);
  if (NO_PEGADO.test(sinTildes(s))) return null;
  const plano = (t) => sinTildes(t).replace(/\s+/g, ' ').trim();
  for (const x of s.matchAll(/\bde\s+\p{Lu}\p{L}*\s+(\p{Lu}\p{L}+)/giu)) {
    const palabra = x[1];
    if (NO_CORTE.has(sinTildes(palabra)) || !singularDe(palabra)) continue;
    const corte = x.index + x[0].length - palabra.length;
    const primero = s.slice(0, corte).trim();
    let ultimo = s.slice(corte).trim();
    if (primero.split(' ').length < 2) continue;
    // "Sistema de Arranque Sistema de A...": es el mismo rótulo repetido y cortado, no dos productos
    if (plano(primero).startsWith(plano(ultimo)) || plano(ultimo).startsWith(plano(primero))) return null;
    // el PDF corta los nombres largos (~72 caracteres): se saca la última palabra incompleta ("Ki", "Embrag")
    if (original.length >= 70) ultimo = ultimo.replace(/\s+\p{L}{1,7}$/u, '').replace(/\s+(de|y|con|del)$/i, '').trim();
    if (!ultimo) return null;
    return { primero, ultimo };
  }
  return null;
}

// "Manillar Agarre Izquierdo Cardan Cañonera Con Cardan Protector De Cabezal": 4 o más piezas distintas en un
// mismo nombre = varios rótulos del PDF pegados (con 3 hay nombres legítimos como "Junta Tapa de Cilindro").
// Los kits y conjuntos enumeran lo que traen ("Kit Junta Y Diafragma Carburador"): no son rótulos pegados.
const ES_KIT = /^\s*(kit|kits|conjunto|juego|set|block)\b/i;
// Palabras que casi siempre son complemento de otra pieza ("Junta Base Filtro Generadores", "Campana ... Piñón Flotante").
const NO_CUENTA = new Set(['kit', 'base', 'generador', 'motor', 'block', 'pinon', 'arranque']);
function rotulosMultiples(nombre) {
  const original = String(nombre || '');
  if (original.includes('—') || ES_KIT.test(original)) return null;
  const piezas = new Set();
  // sólo cuentan las piezas que ABREN un rótulo: "Resorte De Embrague" cuenta "resorte", no "embrague"
  for (const m of original.matchAll(/(^|[^\p{L}])(\p{Lu}\p{L}+)/gu)) {
    const antes = original.slice(0, m.index + m[1].length).trimEnd();
    if (/\b(de|del|y|con|para|sin)$/i.test(antes)) continue;
    const pieza = singularDe(m[2]);
    if (pieza && !NO_CUENTA.has(pieza)) piezas.add(pieza);
  }
  return piezas.size >= 4 ? [...piezas] : null;
}

function textoBusqueda(p) {
  const nomOriginal = String(p.nombre || '');
  const desc = String(p.descripcion || '');
  const plano = (s) => sinTildes(s).replace(/\s+/g, ' ').trim();
  const pegado = rotulosPegados(nomOriginal);
  const nom = pegado ? pegado.ultimo : nomOriginal;
  const pocasLetras = (nom.match(/\p{L}/gu) || []).length < 3;
  const descAmplia = !pegado && desc.length > nom.length && plano(desc).startsWith(plano(nom));
  // "Tapas de arranque — Maquinas" es el título de la sección; el producto real está en la descripción
  const esTitulo = /—/.test(nom) && desc && !/—/.test(desc) && plano(desc).split(/[\s·]/)[0] !== plano(nom).split(/\s/)[0];
  const cat = categoria(p);
  // varios rótulos pegados: el nombre no sirve para buscar, se usa la categoría (y abajo se le suma el modelo)
  const multiples = cat ? rotulosMultiples(nomOriginal) : null;
  const limpio = multiples ? cat : limpiarNombre(pocasLetras || descAmplia || esTitulo ? desc : nom);
  let texto = limpio;
  if (cat) {
    const catNorm = sinTildes(cat);
    const limpioNorm = sinTildes(limpio);
    const primera = limpio.split(/[\s,(]/)[0] || '';
    const empiezaConPieza = !!singularDe(primera) || limpioNorm.startsWith(catNorm);
    if (!limpio || catNorm.startsWith(limpioNorm)) texto = cat;
    else if (!empiezaConPieza) texto = `${cat} ${limpio}`;
  }
  // Sin modelo ni marca: agregar el del encabezado del PDF, la compatibilidad o la marca para que la búsqueda sirva.
  if (!tieneModelo(texto)) {
    const extra = [
      /^(3500|6500)$/.test(p.subcategoria || '') ? `generador ${p.subcategoria}` : null,
      modeloDelEncabezado(p.encabezado_pdf),
      p.compatibilidad && p.compatibilidad.length <= 60 ? limpiarNombre(p.compatibilidad) : null,
      p.marcas?.[0],
    ]
      .filter(Boolean)
      .find((x) => !yaIncluido(texto, x) && !/^(motosierras?|desmalezadoras?|sopladoras?|minitractor(es)?|maquinas?)$/i.test(x.trim()));
    if (extra) texto = `${texto} ${extra}`;
  }
  texto = texto.replace(/\bSt\s+Stihl\b/gi, 'Stihl').replace(/\s+/g, ' ').trim();
  // "Zuncho de Freno 4500 / 5200": esos números son modelos de motosierra china aunque no diga "Chinas".
  const esModeloChino =
    /\b(2500|3800|4500|5200|5800|6200)(?:\s*cc)?\b/i.test(texto) &&
    !/\bchin[aoe]/i.test(texto) &&
    !/generador|\bkw\b|watts?|\bhp\b/i.test(texto) &&
    !['Generadores', 'Motor general', 'Motobombas'].includes(p.clave_subrubro) &&
    !/\b(stihl|husqvarna|echo|honda|oleo ?mac|shindaiwa|kohler|briggs|b&s|tecumseh|efco|makita|dolmar|homelite|poulan|mc ?culloch|zenoah|komatsu|partner|jonsered|mitsubishi|kawasaki|robin)\b/i.test(texto);
  if (esModeloChino) texto = texto.replace(/\b(2500|3800|4500|5200|5800|6200)/, 'motosierra china $1');
  texto = agregarRubroChino(texto, p);
  texto = cilindradaChina(texto);
  for (let i = 0; i < 3; i++) texto = texto.replace(/\b(\p{L}{3,}(?:\s\p{L}{2,})?)\s+\1\b/giu, '$1'); // "Embrague Embrague" -> "Embrague"
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// ---------- datos ----------
async function main() {
  // --env <archivo>: leer otra base (ej. la de logbelts-web: `vercel env pull` de ese proyecto). Por defecto .env.local.
  const iEnv = process.argv.indexOf('--env');
  const env = fs.readFileSync(iEnv > 0 ? process.argv[iEnv + 1] : '.env.local', 'utf8');
  const get = (k) => {
    const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
    return m ? m[1].replace(/\r$/, '').trim().replace(/^["']|["']$/g, '') : undefined;
  };
  // `vercel env pull` deja las claves secretas como "[SENSITIVE]": en ese caso se usa la pública (alcanza para leer).
  const real = (v) => (v && !/^\[?sensitive\]?$/i.test(v) ? v : undefined);
  const db = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), real(get('SUPABASE_SERVICE_ROLE_KEY')) || get('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    auth: { persistSession: false },
  });

  async function leerTodo(tabla, cols) {
    let todos = [];
    for (let desde = 0; ; desde += 1000) {
      const { data, error } = await db.from(tabla).select(cols).range(desde, desde + 999);
      if (error) throw new Error(`${tabla}: ${error.message}`);
      todos = todos.concat(data);
      if (data.length < 1000) return todos;
    }
  }

  const locales = new Map(JSON.parse(fs.readFileSync('data/productos.json', 'utf8')).map((p) => [p.codigo, p]));
  const enDB = await leerTodo('cat_productos', 'codigo,foto,oculto,descontinuado');
  const eventos = await leerTodo('cat_eventos', 'tipo,codigo,meta').catch(() => []);

  const interes = {};
  for (const e of eventos) {
    const peso = e.tipo === 'ver' ? 1 : ['consulta', 'lista_add', 'favorito'].includes(e.tipo) ? 3 : 0;
    if (!peso) continue;
    const codigos = [e.codigo, ...(Array.isArray(e.meta?.codigos) ? e.meta.codigos : [])].filter(Boolean);
    for (const c of codigos) interes[c] = (interes[c] || 0) + peso;
  }

  const lista = [];
  const catalogo = []; // todos los productos visibles, para la lupa de la extensión
  for (const fila of enDB) {
    if (fila.oculto || fila.descontinuado) continue;
    const p = { ...locales.get(fila.codigo), foto: fila.foto };
    if (!p.nombre) continue;
    const subida = /^https?:\/\//.test(p.foto || ''); // subida desde el admin: se considera buena

    let motivo = subida ? null : 'sin_foto';
    let px = null;
    if (p.foto && !subida) {
      const archivo = path.join('public', 'fotos', p.foto);
      if (fs.existsSync(archivo)) {
        const m = await sharp(fs.readFileSync(archivo)).metadata();
        px = Math.max(m.width, m.height);
        motivo = motivoPorLado(px);
      }
    }
    catalogo.push({
      c: p.codigo,
      n: String(p.nombre).trim(),
      b: textoBusqueda(p),
      f: p.familia,
      s: p.subcategoria,
      foto: p.foto || null,
      px,
      m: excluido(p) ? 'excluido' : motivo || 'ok',
    });
    if (!motivo || excluido(p)) continue;

    lista.push({
      c: p.codigo,
      n: String(p.nombre).trim(),
      b: textoBusqueda(p),
      f: p.familia,
      s: p.subcategoria,
      m: motivo,
      px,
      foto: p.foto || null,
      v: interes[p.codigo] || 0,
      o: (p.codigo_original || []).filter(Boolean).slice(0, 4),
      mk: p.marcas?.[0] || null,
      nota: (() => {
        const cat = categoria(p);
        const multiples = cat ? rotulosMultiples(p.nombre) : null;
        if (multiples) {
          return `Nombre con varios rótulos pegados en el catálogo (${multiples.join(', ')}). Busqué por la categoría "${cat}"; fijate en la foto actual qué pieza es.`;
        }
        const pegado = rotulosPegados(p.nombre);
        return pegado
          ? `Nombre dudoso en el catálogo: "${pegado.primero}" y "${pegado.ultimo}" quedaron pegados. Busqué "${pegado.ultimo}"; fijate en la foto actual cuál es.`
          : undefined;
      })(),
    });
  }

  const SEVERIDAD = { sin_foto: 0, muy_baja: 1, baja: 2, regular: 3 };
  lista.sort((a, b) => SEVERIDAD[a.m] - SEVERIDAD[b.m] || a.c.localeCompare(b.c));
  fs.writeFileSync(SALIDA, JSON.stringify(lista));
  catalogo.sort((a, b) => a.c.localeCompare(b.c));
  fs.writeFileSync(path.join('extension-fotos', 'catalogo.json'), JSON.stringify(catalogo));
  console.log(`Catálogo completo para la lupa: ${catalogo.length} productos`);

  const cuenta = lista.reduce((acc, x) => ((acc[x.m] = (acc[x.m] || 0) + 1), acc), {});
  console.log(`Lista generada: ${lista.length} productos`, cuenta);
  console.log('Recargá la extensión en chrome://extensions para ver los cambios.');
}

export { textoBusqueda, limpiarNombre, rotulosPegados, rotulosMultiples };

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) await main();
