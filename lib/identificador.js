import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

/**
 * Identificar un repuesto a partir de una foto.
 * 1) Claude describe la pieza (tipo, textos visibles, marcas, medida).
 * 2) Se arma una lista corta del catálogo con esos datos.
 * 3) Claude compara la foto del cliente contra las fotos de los candidatos y las rankea.
 */

const MODEL = 'claude-sonnet-5';

const TIPOS = [
  'cilindro', 'piston', 'aros', 'kit de cilindros', 'cuchilla', 'correa', 'espada', 'cadena',
  'filtro de aire', 'filtro de combustible', 'filtro de aceite', 'carburador', 'kit de juntas de carburador',
  'junta de motor', 'polea', 'torreta', 'eje', 'bobina de ignicion', 'embrague', 'campana de embrague',
  'arranque', 'bomba de aceite', 'caja de engranaje', 'cabezal de tanza', 'bujia', 'manguera',
  'tanque de combustible', 'reten', 'resorte', 'rueda', 'cigueñal', 'escape', 'amortiguador',
];

function textOf(msg) {
  return (msg.content || []).map((b) => b.text || '').join('');
}
function parseJson(txt) {
  const m = txt && txt.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}
const norm = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function shortlist(productos, info, n = 10) {
  const tipo = norm(info.tipo);
  const textos = (info.textos || []).map((t) => norm(t).replace(/[^a-z0-9]/g, '')).filter((t) => t.length >= 3);
  const marcas = (info.marcas || []).map(norm);
  const medida = norm(info.medida);

  const scored = productos.map((p) => {
    let s = 0;
    const cp = norm(p.clave_producto);
    const sub = norm(p.subcategoria);
    const nom = norm(p.nombre);
    if (tipo && tipo !== 'otro') {
      const t = tipo.split(' ')[0];
      if (cp.includes(t) || sub.includes(t) || nom.includes(t)) s += 40;
      else if (tipo.includes('cilindro') && (cp.includes('cilindro') || cp.includes('pist'))) s += 30;
    }
    for (const t of textos) {
      const hay = norm(p.codigo + ' ' + (p.codigo_original || []).join(' ')).replace(/[^a-z0-9]/g, '');
      if (hay.includes(t)) s += 55;
    }
    for (const m of marcas) if ((p.marcas || []).some((x) => norm(x).includes(m)) || norm(p.compatibilidad).includes(m)) s += 18;
    if (medida) for (const md of p.medidas || []) if (norm(md).replace(/\s/g, '').includes(medida.replace(/\s/g, ''))) s += 15;
    if (p.foto) s += 6;
    return { p, s };
  });

  scored.sort((a, b) => b.s - a.s);
  const top = scored.filter((x) => x.s > 0).slice(0, n * 2);
  const conFoto = top.filter((x) => x.p.foto).slice(0, n);
  const sinFoto = top.filter((x) => !x.p.foto).slice(0, 3);
  return [...conFoto, ...sinFoto].map((x) => x.p);
}

export async function identificar(imgBase64, mime) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, error: 'Falta configurar ANTHROPIC_API_KEY en .env.local.' };
  const client = new Anthropic({ apiKey: key });
  const mediaType = /png/i.test(mime) ? 'image/png' : /webp/i.test(mime) ? 'image/webp' : 'image/jpeg';

  // --- Etapa 1: describir la pieza ---
  let info = {};
  try {
    const s1 = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imgBase64 } },
            {
              type: 'text',
              text: `Es la foto de un repuesto para motosierra / desmalezadora / cortadora de césped / motor a explosión chico. Analizala y respondé SOLO con un JSON:
{"tipo":"<uno de: ${TIPOS.join(', ')}, u 'otro'>",
 "textos":["<cada número o código visible impreso/grabado en la pieza>"],
 "marcas":["<marcas visibles: Stihl, Husqvarna, Honda, Oleo Mac, Echo, ...>"],
 "medida":"<si se ve un diámetro o cilindrada, ej '44mm' o '52cc'; sino null>",
 "caracteristicas":"<una frase: forma, color, material, rasgos distintivos>"}`,
            },
          ],
        },
      ],
    });
    info = parseJson(textOf(s1)) || {};
  } catch (e) {
    return { ok: false, error: 'La IA no pudo analizar la foto: ' + String(e.message || e).slice(0, 200) };
  }

  // --- lista corta ---
  const productos = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'productos.json'), 'utf8')).filter(
    (p) => !p.oculto
  );
  const cand = shortlist(productos, info, 10);
  if (!cand.length) return { ok: true, info, resultados: [] };

  // --- Etapa 2: comparar con las fotos de los candidatos ---
  const content = [
    { type: 'text', text: 'FOTO DEL CLIENTE — la pieza a identificar:' },
    { type: 'image', source: { type: 'base64', media_type: mediaType, data: imgBase64 } },
    { type: 'text', text: 'CANDIDATOS del catálogo LOGBELTS (código, descripción, y su foto cuando la tiene):' },
  ];
  for (const c of cand) {
    content.push({
      type: 'text',
      text: `\n[${c.codigo}] ${c.nombre || c.clave_producto || 'Producto'} — ${c.familia || ''} › ${c.subcategoria || ''}${
        c.medidas && c.medidas.length ? ' · ' + c.medidas.join(' ') : ''
      }`,
    });
    const fp = c.foto ? path.join(process.cwd(), 'public', 'fotos', c.foto) : null;
    if (fp && fs.existsSync(fp)) {
      try {
        const b = fs.readFileSync(fp).toString('base64');
        content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b } });
      } catch {}
    }
  }
  content.push({
    type: 'text',
    text: `\nCompará la FOTO DEL CLIENTE con cada candidato y devolvé SOLO un JSON array, del más probable al menos:
[{"codigo":"...","confianza":<0-100>,"motivo":"<1 frase: por qué coincide (forma, medida, marca) o por qué no>"}]
Incluí sólo los que tengan chance real (confianza >= 15). Si ninguno coincide de verdad, devolvé [].
No inventes códigos: usá sólo los de la lista.`,
  });

  let rank = [];
  try {
    const s2 = await client.messages.create({ model: MODEL, max_tokens: 900, messages: [{ role: 'user', content }] });
    rank = parseJson(textOf(s2)) || [];
  } catch (e) {
    return { ok: false, error: 'La IA no pudo comparar: ' + String(e.message || e).slice(0, 200), info };
  }

  const byCode = new Map(productos.map((p) => [p.codigo, p]));
  const resultados = (Array.isArray(rank) ? rank : [])
    .map((r) => ({ codigo: r.codigo, confianza: Number(r.confianza) || 0, motivo: r.motivo || '', producto: byCode.get(r.codigo) }))
    .filter((r) => r.producto)
    .sort((a, b) => b.confianza - a.confianza)
    .slice(0, 8);

  return { ok: true, info, resultados };
}
