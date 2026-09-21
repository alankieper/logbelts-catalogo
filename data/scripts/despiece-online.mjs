/**
 * Arma data/despiece-online.json: el despiece publicado en internet (diyspareparts.com) de cada
 * máquina del catálogo, con sus versiones (FS 55, FS 55 R, FS 55 T…) y los dibujos de cada una
 * (cilindro, arranque, carburador…).
 *
 *   node data/scripts/despiece-online.mjs
 *
 * Toma las máquinas del campo "Despiece" (data/producto-despiece.json), recorre el sitio despacio
 * (una página cada 0,3 s, con curl) y guarda sólo nombres y enlaces: no se copian dibujos ni imágenes.
 * Tarda unos 20-30 minutos. Si se corta, al volver a correrlo retoma desde donde quedó.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { parsearMaquina } from '../../lib/maquinaNombre.js';

const RAIZ = process.cwd();
const BASE = 'https://www.diyspareparts.com';
const MARCAS = { stihl: 'stihl', husqvarna: 'husqvarna', echo: 'echo', 'oleo-mac': 'oleo-mac', honda: 'honda' };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const PAUSA = 300;
const AVANCE = path.join(os.tmpdir(), 'despiece-online-avance.json');

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const entidades = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const texto = (html) => entidades(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

async function pagina(ruta) {
  await dormir(PAUSA);
  try {
    return execFileSync('curl', ['-s', '-f', '-L', '-A', UA, '-H', 'Accept: text/html', '-H', 'Accept-Language: es-AR,es;q=0.9', BASE + ruta], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}
function enlaces(html) {
  const out = [];
  for (const m of (html || '').matchAll(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    out.push([entidades(m[1]).replace(/^https?:\/\/www\.diyspareparts\.com/, ''), texto(m[2])]);
  }
  return out;
}

// ---- máquinas del catálogo con marca presente en el sitio ----
const porProducto = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data/producto-despiece.json'), 'utf8'));
const NUESTRAS = [...new Set(Object.values(porProducto).flat().map((t) => parsearMaquina(t)?.clave).filter((c) => c && MARCAS[c.split('|')[0]]))];

let avance = { fits: {}, res: {}, cache: {} };
try { avance = JSON.parse(fs.readFileSync(AVANCE, 'utf8')); } catch {}
const guardarAvance = () => fs.writeFileSync(AVANCE, JSON.stringify(avance));

// 1) todos los modelos de cada marca (páginas "fits"), recorriendo sus categorías
for (const slug of [...new Set(NUESTRAS.map((c) => c.split('|')[0]))]) {
  if (avance.fits[slug]) continue;
  const vistos = new Set();
  const cola = [`/parts/${slug}/group/`, `/parts/${slug}/`];
  const m = new Map();
  while (cola.length && vistos.size < 150) {
    const u = cola.shift();
    if (vistos.has(u)) continue;
    vistos.add(u);
    for (const [p, t] of enlaces(await pagina(u))) {
      if (new RegExp(`^/parts/${slug}/group/[^?#]+$`).test(p) && !vistos.has(p) && !cola.includes(p)) cola.push(p);
      const f = p.match(new RegExp(`^/parts/${slug}/fits/([^/?#]+)/?$`));
      if (f && t && !m.has(f[1])) m.set(f[1], t);
    }
  }
  avance.fits[slug] = [...m.entries()];
  guardarAvance();
  console.log(`${slug}: ${m.size} modelos en el sitio`);
}

// 2) cruzar con nuestras máquinas: el mismo modelo o el mismo con letras al final (FS 55 -> FS 55 R)
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const modeloDe = (t) => {
  const w = t.replace(/\b(stihl|husqvarna|echo|oleo[- ]?mac|oleomac|honda)\b/gi, ' ').trim().split(/\s+/);
  while (w.length > 1 && /^[A-Za-z]{4,}$/.test(w[w.length - 1])) w.pop();
  return w.join(' ');
};
let i = 0;
for (const clave of NUESTRAS) {
  i++;
  if (avance.res[clave]) continue;
  const [b, k] = clave.split('|');
  const iguales = (avance.fits[b] || []).filter(([, t]) => {
    const mk = norm(modeloDe(t));
    return mk === k || (mk.startsWith(k) && /^[a-z]+$/.test(mk.slice(k.length)));
  });
  // 3) versiones (diagramas) de cada modelo y los dibujos de cada versión
  const variantes = new Map();
  for (const [slugFits, t] of iguales) {
    for (const [h] of enlaces(await pagina(`/parts/${b}/fits/${slugFits}/`))) {
      const m = h.match(new RegExp(`^/parts/${b}/diagrams/([^/?#]+)/`));
      if (m && !variantes.has(m[1])) variantes.set(m[1], modeloDe(t));
    }
  }
  const out = [];
  for (const [slug, modelo] of variantes) {
    const ck = `${b}/${slug}`;
    if (!avance.cache[ck]) {
      const html = await pagina(`/parts/${b}/diagrams/${slug}/`);
      if (!html) continue;
      const vis = new Set();
      const paginas = [];
      for (const [h, t] of enlaces(html)) {
        if (h.startsWith(`/parts/${b}/diagrams/${slug}/`) && h.split('/').filter(Boolean).length === 5 && !vis.has(h) && t) {
          vis.add(h);
          paginas.push([t, h.split('/').pop()]);
        }
      }
      avance.cache[ck] = { titulo: texto((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || ''), paginas };
    }
    out.push({ slug, modelo, ...avance.cache[ck] });
  }
  avance.res[clave] = out;
  guardarAvance();
  console.log(`${i}/${NUESTRAS.length} ${clave}: ${out.length} versiones`);
}

// ---- armar el archivo final ----

// Nombre de la versión. El sitio pone el código exacto entre paréntesis en el título:
// "Stihl FS 55 Brushcutter (FS55C-E) parts diagram" + modelo "FS 55" -> "FS 55 C-E";
// "(FS382-Mix)" -> "FS 38 2-MIX"; "(FS38Z2-Mix)" -> "FS 38 Z 2-MIX".
function nombreVariante(v) {
  const codigo = (String(v.titulo || '').match(/\(([^)]+)\)\s*parts diagram/i) || [])[1];
  const modelo = String(v.modelo || '').toUpperCase().trim();
  const base = modelo.replace(/\s+/g, '');
  if (codigo && base && codigo.toUpperCase().replace(/\s+/g, '').startsWith(base)) {
    let resto = codigo.replace(/\s+/g, '').slice(base.length).toUpperCase();
    resto = resto.replace(/^[-\s]+/, '').replace(/(.)(2-MIX)$/, '$1 $2');
    return `${modelo}${resto ? ` ${resto}` : ''}`;
  }
  // Husqvarna pone el año: "Husqvarna 143RII (2008) parts diagram" -> "143RII (2008)"
  if (codigo && modelo && /^(19|20)\d{2}$/.test(codigo)) return `${modelo} (${codigo})`;
  if (codigo) return codigo.toUpperCase().replace(/^([A-Z]{1,5})(\d)/, '$1 $2');
  return v.slug.toUpperCase().replace(/-/g, ' ').replace(/^([A-Z]{1,5})\s*(\d)/, '$1 $2').trim();
}

// Nombres de dibujo sin la letra de orden del sitio ("B_-Rewind starter" -> "Rewind starter") y sin repetidos
function limpiarDibujos(paginas) {
  const vistos = new Map();
  return paginas.map(([nombre, id]) => {
    const n = String(nombre).replace(/^[A-Z]_?-\s*/, '').replace(/\.{2,}$/, '.').trim();
    const k = n.toLowerCase();
    vistos.set(k, (vistos.get(k) || 0) + 1);
    return [vistos.get(k) > 1 ? `${n} (${vistos.get(k)})` : n, id];
  });
}

const final = {};
let nVar = 0;
for (const [clave, variantes] of Object.entries(avance.res)) {
  const b = clave.split('|')[0];
  const lista = variantes
    .filter((v) => v.paginas?.length)
    .map((v) => ({ nombre: nombreVariante(v), url: `${BASE}/parts/${MARCAS[b]}/diagrams/${v.slug}/`, dibujos: limpiarDibujos(v.paginas) }))
    // la versión "base" primero (la de nombre más corto), después alfabético
    .sort((a, c) => a.nombre.length - c.nombre.length || a.nombre.localeCompare(c.nombre, 'es', { numeric: true }));
  const usados = new Map();
  for (const v of lista) {
    const n = (usados.get(v.nombre) || 0) + 1;
    usados.set(v.nombre, n);
    if (n > 1) v.nombre = `${v.nombre} (${n})`;
  }
  if (lista.length) {
    final[clave] = { variantes: lista };
    nVar += lista.length;
  }
}
fs.writeFileSync(path.join(RAIZ, 'data/despiece-online.json'), JSON.stringify(final));
console.log(`\n${Object.keys(final).length} máquinas con despiece (${nVar} versiones) -> data/despiece-online.json`);
