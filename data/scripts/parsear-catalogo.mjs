import fs from 'fs';

const PAGES = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT_JSON = process.argv[3] || 'productos.json';
const OUT_CSV = process.argv[4] || 'productos.csv';

/* ================= clave de códigos LOGBELTS ================= */
const RUBRO = { '2': '2 Tiempos', '3': 'Cortadora de césped', '4': '4 Tiempos', '5': 'Minitractores', '8': 'Máquina + tiempo' };
const SUBRUBRO = {
  '2': { '1': 'Desmalezadora', '2': 'Motosierra', '3': 'Sopladora', '4': 'Fumigador', '5': 'Corta cerco', '6': 'Hoyadora', '7': 'Generador', '9': 'Universales' },
  '3': { '1': 'Minitractor', '2': 'Minitractor de empuje' },
  '4': { '1': 'Desmalezadora', '2': 'Motosierra', '3': 'Motor general', '4': 'Hidrolavadora', '5': 'Compresor', '7': 'Generadores', '8': 'Motobombas', '9': 'Universal' },
  '5': { '8': 'Minitractor' },
};
const PRODUCTO = {
  '01': 'Partes de carburador', '02': 'Carburador', '03': 'Kit de cilindros', '04': 'Kit de pistón',
  '05': 'Aros', '06': 'Filtro de combustible', '07': 'Filtro de aire', '08': 'Filtro de aceite',
  '09': 'Juntas de carburador', '10': 'Juntas de motor', '11': 'Bombines', '12': 'Embragues / campanas / resortes',
  '13': 'Caja de engranaje', '14': 'Tanque de combustible / tapa', '15': 'Tapas de arranque', '16': 'Tanza',
  '17': 'Cabezales porta tanza', '18': 'Bujías', '19': 'Bomba de aceite', '20': 'Partes', '21': 'Mangueras',
  '22': 'Cigüeñal', '23': 'Llave de paso', '24': 'Bobina de ignición', '25': 'Cables', '27': 'Retén',
  '90': 'Espadas', '91': 'Cadenas',
};
const PRODUCTO_R3 = { '01': 'Cuchillas', '02': 'Torretas', '03': 'Poleas', '04': 'Cables', '05': 'Resortes', '06': 'Ruedas' };

// familia canónica (índice del catálogo) a partir de la clave
function familiaFromClave(r, srName) {
  if (r === '5') return 'Minitractores';
  if (r === '3') return 'Máquinas de cortar césped';
  const map = {
    'Desmalezadora': 'Desmalezadoras', 'Motosierra': 'Motosierras', 'Sopladora': 'Sopladoras',
    'Fumigador': 'Fumigadores', 'Corta cerco': 'Corta cercos', 'Hoyadora': 'Hoyadoras',
    'Generador': 'Generadores', 'Generadores': 'Generadores', 'Motor general': 'Motores 4T y generadores',
    'Hidrolavadora': 'Hidrolavadora y motobomba', 'Motobombas': 'Hidrolavadora y motobomba',
    'Compresor': 'Compresores', 'Universales': 'Repuestos universales', 'Universal': 'Repuestos universales',
  };
  return map[srName] || null;
}

function decodeCodigo(code) {
  if (!/^\d{7}$/.test(code)) return { valido: false };
  const r = code[0], sr = code[1], prod = code.slice(2, 4), corr = code.slice(4);
  const rubro = RUBRO[r] || null;
  const subrubro = (SUBRUBRO[r] && SUBRUBRO[r][sr]) || null;
  let producto = r === '3' ? (PRODUCTO_R3[prod] || null) : r === '5' ? 'Correas' : (PRODUCTO[prod] || null);
  return { valido: true, r, sr, prod, corr, rubro, subrubro, producto, familia: familiaFromClave(r, subrubro) };
}

/* ================= diccionario de marcas ================= */
const BRANDS = ['MTD', 'Yard Machines', 'Yard-Man', 'Yardman', 'Troy Bilt', 'White', 'Cub Cadet', 'AYP', 'Poulan',
  'Weed Eater', 'Craftsman', 'Z-Beast', 'Murray', 'Noma', 'Husqvarna', 'HQV', 'Toro', 'John Deere', 'Hustler',
  'Ariens', 'Stihl', 'Echo', 'Homelite', 'McCulloch', 'Mc Culloch', 'Oleo Mac', 'Oleo-Mac', 'Jonsered',
  'Shindaiwa', 'Honda', 'Briggs & Stratton', 'B&S', 'Kohler', 'Tecumseh', 'Loncin', 'Shibaura', 'Mitsubishi',
  'Maruyama', 'Caroni', 'Kawasaki', 'Robin', 'Zenoah', 'Zomax', 'NGK', 'Walbro', 'Zama', 'Ruixing', 'Nikki'];
const BRAND_LC = BRANDS.map(b => b.toLowerCase());
function findBrands(text) {
  const t = ' ' + text.toLowerCase() + ' ';
  const out = [];
  BRANDS.forEach((b, i) => { if (t.includes(' ' + BRAND_LC[i] + ' ') || t.includes(' ' + BRAND_LC[i] + '/') || t.includes('/' + BRAND_LC[i])) out.push(b); });
  return [...new Set(out.map(b => b === 'HQV' ? 'Husqvarna' : b === 'B&S' ? 'Briggs & Stratton' : b === 'Mc Culloch' ? 'McCulloch' : b === 'Yardman' ? 'Yard-Man' : b === 'Oleo-Mac' ? 'Oleo Mac' : b))];
}

/* ================= helpers ================= */
const clean = s => (s || '').replace(/\s+/g, ' ').trim();
const isCodigoTok = s => /^C[OÓ]DIGO$/i.test(s.trim());
const CODE_RE = /\b\d{7}\b/;
const FOOTER_RE = /Marcelo T\. de Alvear|Ciudad Autónoma de Buenos Aires|C\.P\. 1058|\+54 ?11|\+54 ?0237|6093 ?6665|6114 ?2012|4660295/i;
const NOISE_RE = /\[FOTO[^\]]*\]|C[oó]digo\s+Logbelts:?\s*\d{6,7}|GASTON|\bNUEVO\b|VERIFICAR FOTO|DATOS NO\s*ENCONTRADOS|\bA ASIGNAR\b|DESCRIPCI[ÓO]N:?/gi;
const FLAG_RE = /\b(NUEVO|A ASIGNAR|VERIFICAR FOTO|DATOS NO\s*ENCONTRADOS|SIN FOTO)\b/gi;
const REF_RE = /\b(GND-?[A-Z0-9\/]+|D\d{2}-[A-Z]{2,4}|DG\d?-[A-Z]{1,3}|NK\d|BS\d{2}|H\d{2}\/BNG)\b/gi;
const OEM_RE = /\b(?:REPL\.?-?|Repl\.?-?|OEM\.?-?|REEMPLAZA?)\s*[:\-]?\s*([A-Z0-9][A-Z0-9][A-Z0-9\.\-\/]{2,20})/gi;
const MEAS_RE = /(Ø\s?[\d.,]+\s?(?:mm|"|”)?|\b\d+[.,]?\d*\s?(?:mm|cc)\b|Paso\s?[\d.,\/"”]+|Calibre\s?[\d.,"”]+|\b\d+\s?DL\b|\b\d+[.,]?\d*"\s?[Xx]\s?\d+\/\d+"?|\b\d+[.,]?\d*”\s?[Xx]\s?\d+\/\d+”?)/gi;

function headerFor(items, y) {
  // encabezados reales: y chico, MAYÚSCULAS, no "CODIGO...", no footer, con letras
  const cands = items
    .filter(it => it.y < 70 && it.s.trim().length > 6)
    .map(it => ({ y: it.y, t: clean(it.s) }))
    .filter(h => {
      const t = h.t;
      if (/^C[OÓ]DIGO\b/i.test(t)) return false;
      if (/^DESCRIPCI/i.test(t)) return false;
      if (FOOTER_RE.test(t)) return false;
      const letters = t.replace(/[^A-Za-zÁÉÍÓÚÑ]/g, '');
      return letters.length >= 5 && t === t.toUpperCase();
    })
    .sort((a, b) => a.y - b.y);
  if (!cands.length) return null;
  let h = cands[0];
  for (const c of cands) if (c.y <= y + 6) h = c;
  return h.t;
}

function parseHeader(raw, dec) {
  if (!raw) return { familia: dec.familia || null, subcategoria: dec.producto || null, marcas: [], raw: null };
  const parts = raw.split(/\s+[-–]\s+/).map(s => s.trim()).filter(Boolean);
  const FAM_KW = [
    [/MINITRACTOR/, 'Minitractores'], [/CORTAR C[EÉ]SPED|CORTAC[EÉ]SPED/, 'Máquinas de cortar césped'],
    [/MOTOSIERRA/, 'Motosierras'], [/DESMALEZADORA/, 'Desmalezadoras'], [/CARBURACI[ÓO]N/, 'Carburación'],
    [/JUNTAS DE MOTOR/, 'Juntas de motor'], [/ARRANQUE/, 'Sistemas de arranque'], [/ENCENDIDO|BUJ[IÍ]A/, 'Encendido'],
    [/GENERADOR/, 'Motores 4T y generadores'], [/MOTOBOMBA|HIDROLAVADORA/, 'Hidrolavadora y motobomba'],
    [/UNIVERSAL/, 'Repuestos universales'],
  ];
  let familia = null, subCandidates = [];
  for (const p of parts) {
    let matched = false;
    for (const [re, name] of FAM_KW) if (re.test(p)) { familia = familia || name; matched = true; }
    if (!matched) subCandidates.push(p);
  }
  const marcas = findBrands(raw);
  // subcategoría: la parte que no es familia ni lista de marcas
  const sub = subCandidates.find(p => !findBrands(p).length && !/REEMPLAZO|OTROS|VARIOS|SEG[UÚ]N MARCA/i.test(p))
    || subCandidates[0] || null;
  return {
    familia: familia || dec.familia || null,
    familia_indice: familia || null,
    subcategoria: sub ? clean(sub) : (dec.producto || null),
    marcas,
    raw,
  };
}

function extractBits(text) {
  const oem = [];
  let m; OEM_RE.lastIndex = 0;
  while ((m = OEM_RE.exec(text))) {
    let v = clean(m[1]).replace(/[.,;:]+$/, '');
    if (/\d/.test(v) && v.length >= 4) oem.push(v);
  }
  const refs = [...new Set((text.match(REF_RE) || []).map(s => clean(s).toUpperCase()))];
  const meas = [...new Set((text.match(MEAS_RE) || []).map(clean))];
  const flags = [...new Set((text.match(FLAG_RE) || []).map(s => s.toUpperCase().replace(/\s+/g, ' ')))];
  return { oem: [...new Set(oem)], refs, meas, flags };
}

const HEADER_WORDS = /\b(REEMPLAZOS?|COMPLETOS?|MOTOSIERRAS?|DESMALEZADORAS?|MINITRACTORES?|CARBURACI[ÓO]N|CARBURADORES?|CILINDROS?|PISTONES?|ESPADAS?|CADENAS?|CUCHILLAS?|FILTROS?|JUNTAS|DIAFRAGMAS|BOMBINES|V[ÁA]LVULAS|UNIVERSALES?|OTROS|VARIOS|PREMIUM|STANDARD|CONVENCIONALES|TRITURADORAS|ACCESORIOS|HERRAMIENTAS|SEG[ÚU]N MARCA|DE KEVLAR|PORTA TANZA|DE TANZA)\b/g;
function stripNoise(text, headerRaw) {
  let t = ' ' + text + ' ';
  if (headerRaw) {
    for (const chunk of headerRaw.split(/\s+[-–\/]\s+/)) {
      if (chunk.trim().length > 3) t = t.split(chunk).join(' ');
    }
    t = t.split(headerRaw).join(' ');
  }
  t = t.replace(NOISE_RE, ' ').replace(REF_RE, ' ');
  // quitar secuencias de 2+ palabras en MAYÚSCULA (bleed de encabezados)
  t = t.replace(/(?:\b[A-ZÁÉÍÓÚÑ]{3,}\b[\s\/-]+){2,}\b[A-ZÁÉÍÓÚÑ]{3,}\b/g, ' ');
  t = t.replace(HEADER_WORDS, ' ');
  t = t.replace(/\s*[-–]\s*[-–]\s*/g, ' ').replace(/(^|\s)[-–]+(\s|$)/g, ' ');
  return clean(t).replace(/^[-–:·•\s]+/, '').replace(/[-–:·•\s]+$/, '').trim();
}
function shortName(desc, claveProducto) {
  if (desc && desc.length > 4) {
    let n = desc.split(/(?<=\w)\s+(?:Repl|REPL|para|compatible)\b/i)[0];
    n = n.replace(/\s+/g, ' ').trim();
    if (n.length > 70) n = n.slice(0, 67).replace(/\s+\S*$/, '') + '…';
    return n;
  }
  return claveProducto || null;
}

/* ================= parseo ================= */
const rawProducts = [];

for (const pg of PAGES) {
  const clim = pg.items.filter(it => it.s.trim() !== '' && !FOOTER_RE.test(it.s));
  const contentItems = clim.filter(it => !isCodigoTok(it.s) && !/^\d{1,3}$/.test(it.s.trim()));

  // filas de tabla
  const byY = {};
  for (const it of pg.items) (byY[it.y] = byY[it.y] || []).push(it);
  const tableRows = Object.entries(byY).filter(([, arr]) => {
    const s = arr.slice().sort((a, b) => a.x - b.x);
    return s[0] && CODE_RE.test((s[0].s || '').trim()) && s[0].x < 120 && s.filter(a => a.s.trim()).length >= 4;
  });
  const headRow = Object.values(byY).find(arr => arr.some(a => /LOGBELTS/i.test(a.s)) && arr.some(a => /LARGO|DESCRIPCI/i.test(a.s)));
  const isTable = tableRows.length >= 3 && headRow;

  // anclas CODIGO (grilla)
  const anchors = [];
  for (const it of pg.items) {
    if (!isCodigoTok(it.s)) continue;
    const near = pg.items.filter(o => Math.abs(o.y - it.y) < 6 && o.x > it.x && o.x < it.x + 95 && CODE_RE.test(o.s.trim()))
      .sort((a, b) => a.x - b.x);
    if (near.length) anchors.push({ x: it.x, y: it.y, code: near[0].s.trim().match(CODE_RE)[0] });
  }

  // ---- TABLA ----
  if (isTable) {
    const hs = headRow.filter(a => a.s.trim()).sort((a, b) => a.x - b.x);
    const cols = {};
    for (const a of hs) {
      const k = a.s.trim().toUpperCase();
      if (/LOGBELTS/.test(k)) cols.codigo = a.x;
      else if (/ORIGINAL/.test(k)) cols.oem = a.x;
      else if (/UBICACI/.test(k)) cols.ubicacion = a.x;
      else if (/DESCRIPCI/.test(k)) cols.descripcion = a.x;
      else if (/LARGO/.test(k)) cols.largo = a.x;
    }
    for (const [y, arr] of tableRows) {
      const s = arr.filter(a => a.s.trim()).sort((a, b) => a.x - b.x);
      const code = s[0].s.trim().match(CODE_RE)[0];
      const b = { oem: '', ubicacion: '', descripcion: '', largo: '' };
      for (const a of s.slice(1)) {
        let best = null, bd = 1e9;
        for (const k of ['oem', 'ubicacion', 'descripcion', 'largo']) {
          if (cols[k] == null) continue;
          const d = Math.abs(a.x - cols[k]); if (d < bd) { bd = d; best = k; }
        }
        if (best) b[best] += (b[best] ? ' ' : '') + a.s.trim();
      }
      const dec = decodeCodigo(code);
      const H = parseHeader(headerFor(pg.items, +y), dec);
      const bits = extractBits([b.oem, b.descripcion, b.largo].join(' '));
      const desc = clean([b.ubicacion, b.descripcion, b.largo].filter(Boolean).join(' '));
      const brs = findBrands(desc);
      rawProducts.push({
        codigo: code, tipo_pagina: 'tabla', pagina: pg.p, dec,
        nombre: shortName(clean([b.ubicacion, b.descripcion].filter(Boolean).join(' — ')), dec.producto),
        descripcion: desc || null,
        compatibilidad: clean(b.descripcion) || null,
        ubicacion: clean(b.ubicacion) || null,
        codigo_original: [...new Set([clean(b.oem), ...bits.oem].filter(v => v && /\w/.test(v)))],
        medidas: [...new Set([clean(b.largo).replace(/[”"]/g, '"'), ...bits.meas].filter(Boolean))],
        ref_interna: bits.refs,
        marcas: brs.length ? brs : H.marcas,
        familia: H.familia, familia_indice: H.familia_indice, subcategoria: H.subcategoria, encabezado: H.raw,
        flags: bits.flags,
      });
    }
  }

  // ---- GRILLA ----
  if (anchors.length) {
    anchors.sort((a, b) => a.y - b.y || a.x - b.x);
    const blockYs = [...new Set(anchors.map(a => a.y))].sort((a, b) => a - b);
    for (let bi = 0; bi < blockYs.length; bi++) {
      const y0 = blockYs[bi], y1 = bi + 1 < blockYs.length ? blockYs[bi + 1] : pg.h + 60;
      const row = anchors.filter(a => a.y === y0).sort((a, b) => a.x - b.x);
      const blockItems = contentItems.filter(it => it.y > y0 + 4 && it.y < y1 - 2);
      for (let ci = 0; ci < row.length; ci++) {
        const a = row[ci];
        const xL = ci === 0 ? -1e9 : (row[ci - 1].x + a.x) / 2;
        const xR = ci + 1 < row.length ? (a.x + row[ci + 1].x) / 2 : 1e9;
        const mine = blockItems.filter(it => it.x >= xL && it.x < xR).sort((p, q) => p.y - q.y || p.x - q.x);
        const rawText = clean(mine.map(it => it.s).join(' '));
        const dec = decodeCodigo(a.code);
        const H = parseHeader(headerFor(pg.items, y0), dec);
        const bits = extractBits(rawText);
        const desc = stripNoise(rawText, H.raw);
        const hasDesc = desc && desc.length > 3;
        const brs = findBrands(desc);
        rawProducts.push({
          codigo: a.code, tipo_pagina: 'grilla', pagina: pg.p, dec,
          nombre: shortName(hasDesc ? desc : '', dec.producto),
          descripcion: hasDesc ? desc : null,
          compatibilidad: hasDesc ? desc : null,
          ubicacion: null,
          codigo_original: bits.oem,
          medidas: bits.meas,
          ref_interna: bits.refs,
          marcas: brs.length ? brs : H.marcas,
          familia: H.familia, familia_indice: H.familia_indice, subcategoria: H.subcategoria, encabezado: H.raw,
          flags: bits.flags,
        });
      }
    }
  }

  // ---- bloques anotados "Código Logbelts:" ----
  for (let i = 0; i < pg.items.length; i++) {
    const mm = pg.items[i].s.match(/C[oó]digo\s+Logbelts:?\s*(\d{6,7})/i);
    if (!mm) continue;
    const code = mm[1].length === 6 ? mm[1] : mm[1];
    const anchor = pg.items[i];
    const after = pg.items.filter(it => it.y > anchor.y - 2 && it.y < anchor.y + 130 && Math.abs(it.x - anchor.x) < 150)
      .sort((a, b) => a.y - b.y);
    const txt = clean(after.map(it => it.s).join(' '));
    const dm = txt.match(/DESCRIPCI[ÓO]N:?\s*(.+?)(?:\s*NUEVO|\s*VERIFICAR|\s*GASTON|$)/i);
    if (dm && dm[1] && dm[1].trim().length > 4) {
      const tgt = rawProducts.filter(p => p.codigo === code);
      for (const t of tgt) { t.descripcion = clean(dm[1]); t.fuente_desc = 'anotacion'; }
      if (!tgt.length) {
        const dec = decodeCodigo(code);
        rawProducts.push({
          codigo: code, tipo_pagina: 'anotacion', pagina: PAGES.find(p => p.items.includes(anchor)) ? 0 : 0, dec,
          nombre: dec.producto || null, descripcion: clean(dm[1]), compatibilidad: clean(dm[1]),
          ubicacion: null, codigo_original: [], medidas: [], ref_interna: [], marcas: findBrands(dm[1]),
          familia: dec.familia, subcategoria: dec.producto, encabezado: null, flags: ['NUEVO'], fuente_desc: 'anotacion',
        });
      }
    }
  }
}

/* ================= dedupe + estado ================= */
const byCode = new Map();
for (const p of rawProducts) {
  const score = (p.descripcion ? 4 : 0) + (p.fuente_desc === 'anotacion' ? 3 : 0) +
    (p.familia ? 2 : 0) + p.codigo_original.length + (p.tipo_pagina === 'tabla' ? 2 : 0);
  const prev = byCode.get(p.codigo);
  if (!prev) { p._score = score; byCode.set(p.codigo, p); }
  else {
    if (p.descripcion && !prev.descripcion) prev.descripcion = p.descripcion;
    if (p.familia && !prev.familia) { prev.familia = p.familia; prev.subcategoria = prev.subcategoria || p.subcategoria; }
    if (!prev.codigo_original.length && p.codigo_original.length) prev.codigo_original = p.codigo_original;
    if (!prev.marcas.length && p.marcas.length) prev.marcas = p.marcas;
    prev._dups = (prev._dups || 1) + 1;
    if (score > prev._score) { p._score = score; p._dups = prev._dups; byCode.set(p.codigo, p); }
  }
}

const final = [...byCode.values()].map(p => {
  const nombreUtil = p.nombre && p.nombre.length > 6 && p.nombre !== (p.dec && p.dec.producto);
  const tieneInfo = (p.descripcion && p.descripcion.length > 4) || nombreUtil;
  let estado = 'completo';
  if (!tieneInfo && !p.familia) estado = 'revisar';
  else if (!tieneInfo) estado = 'falta_descripcion';
  else if (!p.familia) estado = 'falta_categoria';
  if ((p.flags || []).includes('A ASIGNAR')) estado = 'sin_codigo';
  const dec = p.dec || {};
  return {
    codigo: p.codigo,
    estado,
    nombre: p.nombre || null,
    descripcion: p.descripcion || null,
    familia: p.familia || null,
    familia_indice: p.familia_indice || null,
    subcategoria: p.subcategoria || null,
    marcas: p.marcas || [],
    codigo_original: p.codigo_original || [],
    compatibilidad: p.compatibilidad || null,
    ubicacion: p.ubicacion || null,
    medidas: p.medidas || [],
    ref_interna: p.ref_interna || [],
    clave_rubro: dec.rubro || null,
    clave_subrubro: dec.subrubro || null,
    clave_producto: dec.producto || null,
    clave_valida: !!dec.valido,
    pagina: p.pagina || null,
    origen: p.tipo_pagina,
    flags: p.flags || [],
    encabezado_pdf: p.encabezado || null,
  };
}).sort((a, b) => a.codigo.localeCompare(b.codigo));

fs.writeFileSync(OUT_JSON, JSON.stringify(final, null, 1));

const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'familia', 'familia_indice', 'subcategoria', 'marcas', 'codigo_original',
  'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'clave_rubro', 'clave_subrubro', 'clave_producto',
  'pagina', 'origen', 'flags', 'encabezado_pdf'];
const cell = v => {
  let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v);
  if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
};
fs.writeFileSync(OUT_CSV, '﻿' + [COLS.join(';'), ...final.map(r => COLS.map(c => cell(r[c])).join(';'))].join('\r\n'));

const st = {};
for (const r of final) st[r.estado] = (st[r.estado] || 0) + 1;
console.log('TOTAL:', final.length);
console.log('estado:', JSON.stringify(st));
console.log('con familia:', final.filter(r => r.familia).length, '/', final.length);
console.log('con subcategoría:', final.filter(r => r.subcategoria).length);
console.log('con OEM:', final.filter(r => r.codigo_original.length).length);
console.log('clave válida+producto:', final.filter(r => r.clave_valida && r.clave_producto).length);
console.log('familias:', JSON.stringify([...new Set(final.map(r => r.familia))].filter(Boolean)));
