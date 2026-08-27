import fs from 'fs';

const JSON_IN = process.argv[2] || 'data/productos.json';
const MAP_IN = process.argv[3] || 'data/scripts/fotos-map.json';
const CSV_OUT = process.argv[4] || 'data/productos.csv';

const P = JSON.parse(fs.readFileSync(JSON_IN, 'utf8'));
const M = JSON.parse(fs.readFileSync(MAP_IN, 'utf8'));

// palabras de "sección" que NO son la aplicación del producto
const SECTION_WORDS = /CILINDROS? COMPLETOS?|KITS? DE|JUNTAS Y DIAFRAGMAS|PISTONES? Y AROS?|CUCHILLAS?|CORREAS? DE KEVLAR|POLEAS?|TORRETAS?|CARCASAS?|EJES?|RUEDAS? DE PLATAFORMA Y BULONES|RUEDAS?|RESORTES?|CABLES? DE ACCIONAMIENTO|CABLES? ACELERADOR|ELECTROEMBRAGUES?|CAJAS? DE ENGRANAJES?|CABEZALES? DE TANZA|TANZA PREMIUM|BOMBINES?|V[ÁA]LVULAS?|FILTROS? DE (AIRE|COMBUSTIBLE|ACEITE)|MANGUERAS?( DE COMBUSTIBLE| DE ACEITE)?|BRIDAS? DE ADMISI[ÓO]N|BUJES? PASAMANGUERA|LLAVES? PASES? DE COMBUSTIBLE|LLAVES? DE COMBUSTIBLE|PUNZUARES?( DE CARBURADOR)?|REPARACIONES? DE CARBURADOR|CARBURADORES?|BOMBAS? DE ACEITE( Y SIN FIN)?|CAMPANAS? DE EMBRAGUE|ESCAPES?|ESPADAS?( STANDARD| PREMIUM)?|CADENAS?( PREMIUM| CORTADAS?)?|ACCESORIOS?|HERRAMIENTAS?|TAPAS? DE DEP[ÓO]SITOS?|TAPAS? DE ARRANQUE|TAPAS? FILTRO DE AIRE|TAPAS? DE FRENO|CINTAS?|CIG[ÜU]E[ÑN]ALES?|RETENES?|EMBRAGUES?|RESORTES? DE EMBRAGUE|BOBINAS? DE IGNICI[ÓO]N( 2T| 4T)?|SISTEMAS? DE ARRANQUE|SOLENOIDES? DE ARRANQUE|TAMBOR DE ARRANQUE|BURROS? DE ARRANQUE|MOTORES? 4T|C[ÁA]MARAS? Y NEUM[ÁA]TICOS|SISTEMA DE DIRECCI[ÓO]N|TREN DELANTERO|INTERRUPTOR DE ELECTROEMBRAGUE|PARTES? DE|REEMPLAZOS?|REEMPLAZO|CONVENCIONALES? Y TRITURADORAS?|UNIVERSALES?( Y OTROS REEMPLAZOS)?|SEG[ÚU]N MARCA|MINITRACTORES?|DESMALEZADORAS?|MOTOSIERRAS?|M[ÁA]QUINAS? DE CORTAR C[ÉE]SPED|CARBURACI[ÓO]N|ENCENDIDO|JUNTAS DE MOTOR( \d TIEMPOS?| 4 TIEMPOS?| 2 TIEMPOS?)?|GENERADORES?|PARTES? DE GENERADOR|PARTES? DE HIDROLAVADORA|PARTES? DE MOTOBOMBAS?|N[ºuU]EVA SUBSECCI[ÓO]N|MANUBRIOS|DENTRO DE DESPIECE POR MARCA|OTROS|VARIOS|\bDE\b|\bY\b|\bLA\b/gi;

const titleCase = s => s.replace(/[A-ZÁÉÍÓÚÑ]{2,}(?:CC|HP)?/g, w =>
  /^(MTD|AYP|HQV|B&S|GX\d+|FS\d+|MS\d+|LT\d+|YTH\d+|CS\d+|SRM\d+|PB\d+|GT\d+)$/i.test(w)
    ? w : w.charAt(0) + w.slice(1).toLowerCase());
function aplicacionDe(enc) {
  if (!enc) return null;
  const parts = enc.split(/\s+[-–]\s+/).map(s => s.trim());
  const keep = [];
  for (let seg of parts) {
    let c = seg.replace(SECTION_WORDS, ' ')
      .replace(/\b[24]\s*TIEMPOS?\b|\b[24]T\b/gi, ' ')
      .replace(/\s+/g, ' ').replace(/^[\/\s·-]+|[\/\s·-]+$/g, '').trim();
    if (c.length >= 2 && !/^[()\/\s]+$/.test(c)) keep.push(c);
  }
  let s = keep.join(' · ').replace(/(\s*·\s*)+/g, ' · ').replace(/^[·\s-]+|[·\s-]+$/g, '').trim();
  s = titleCase(s).replace(/(\d)\s*Cc\b/g, '$1cc').replace(/(\d)\s*Hp\b/gi, '$1 HP').replace(/\bXp\b/g, 'XP');
  return s.length >= 2 ? s : null;
}

let conFoto = 0, placeholders = 0;
for (const p of P) {
  const f = M[p.codigo];
  p.foto = f ? f.archivo : null;
  p.foto_confianza = f ? f.confianza : null;
  if (f) conFoto++;

  if (!p.descripcion) {
    const tipo = p.clave_producto ||
      (p.subcategoria && !/^C[OÓ]DIGO$/i.test(p.subcategoria)
        ? p.subcategoria.charAt(0) + p.subcategoria.slice(1).toLowerCase() : 'Producto');
    const apl = aplicacionDe(p.encabezado_pdf) || (p.marcas || [])[0] || null;
    const nombre = apl ? `${tipo} — ${apl}` : tipo;
    p.nombre = nombre;
    p.descripcion = apl ? `${tipo} para ${apl}` : tipo;
    p.fuente_desc = 'derivada (clave de código + sección del catálogo)';
    placeholders++;
    p.estado = f ? 'derivado_con_foto' : 'derivado_sin_foto';
  } else if (p.fuente_desc == null) {
    p.fuente_desc = 'texto del PDF';
  }
}

fs.writeFileSync(JSON_IN, JSON.stringify(P, null, 1));

const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
  'marcas', 'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
  'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'flags', 'encabezado_pdf'];
const cell = v => {
  let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v);
  if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
};
fs.writeFileSync(CSV_OUT, '﻿' + [COLS.join(';'), ...P.map(r => COLS.map(c => cell(r[c])).join(';'))].join('\r\n'));

const st = {};
for (const r of P) st[r.estado] = (st[r.estado] || 0) + 1;
console.log('con foto:', conFoto, '/', P.length);
console.log('descripciones derivadas:', placeholders);
console.log('estado:', JSON.stringify(st, null, 1));
console.log('\nejemplos derivados:');
for (const r of P.filter(x => x.fuente_desc && x.fuente_desc.startsWith('derivada')).slice(0, 12))
  console.log('  ', r.codigo, '→', r.descripcion);
