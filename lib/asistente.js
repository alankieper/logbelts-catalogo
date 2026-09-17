import Anthropic from '@anthropic-ai/sdk';
import { buscar, getProducto } from './catalogo';
import { buscarMaquina, maquinasDeProducto } from './maquinas';
import { MARCA, enFrase } from './marca';

/**
 * Asistente del catálogo: responde consultas de repuestos usando solo datos reales del catálogo
 * (herramientas de búsqueda). No informa precios ni stock: eso lo maneja cada vendedor.
 */

const MODELO = 'claude-opus-5';
const MAX_VUELTAS = 6;

export const asistenteDisponible = !!process.env.ANTHROPIC_API_KEY;

const SISTEMA = `Sos el asistente del catálogo online de ${MARCA.nombre}, importador y distribuidor mayorista de repuestos para bosque y jardín en Argentina (motosierras, desmalezadoras, minitractores, cortadoras de césped, motores 4T, hidrolavadoras y motobombas). Te escriben dueños y empleados de comercios y talleres.

Tu trabajo es ayudarlos a identificar el repuesto correcto del catálogo:
- Usá las herramientas para buscar. Respondé solo con lo que devuelvan: no inventes códigos, compatibilidades ni medidas. Si no aparece, decilo y sugerí dejar el pedido o escribirle al vendedor.
- Si falta un dato para identificar la pieza (marca y modelo de la máquina, medida, código original), preguntalo.
- Precios, stock, plazos y condiciones de venta los maneja cada vendedor: no los informes; indicá que se consultan por WhatsApp. La venta es únicamente mayorista.
- Escribí en español rioplatense, breve y claro, en texto plano sin markdown. Cuando recomiendes productos, nombrá el ${enFrase(MARCA.codigo.etiqueta)} de 7 dígitos y el nombre.`;

const HERRAMIENTAS = [
  {
    name: 'buscar_productos',
    description: `Busca repuestos en el catálogo ${MARCA.nombre} por ${enFrase(MARCA.codigo.etiqueta)}, código original del fabricante (OEM), nombre, marca o modelo de ${MARCA.maquinas.singular}. Devuelve hasta 8 productos.`,
    input_schema: {
      type: 'object',
      properties: { consulta: { type: 'string', description: 'Texto a buscar, por ejemplo "carburador ms 250", "754-0260" o "correa plataforma cub cadet".' } },
      required: ['consulta'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: 'repuestos_para_maquina',
    description: 'Lista los repuestos del catálogo que indican compatibilidad con una máquina puntual (marca y modelo), por ejemplo Stihl MS 250 o Husqvarna 143R.',
    input_schema: {
      type: 'object',
      properties: {
        marca: { type: 'string', description: 'Marca de la máquina.' },
        modelo: { type: 'string', description: 'Modelo de la máquina.' },
      },
      required: ['marca', 'modelo'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: 'ver_producto',
    description: `Devuelve la ficha completa de un producto a partir de su ${enFrase(MARCA.codigo.etiqueta)} de 7 dígitos.`,
    input_schema: {
      type: 'object',
      properties: { codigo: { type: 'string', description: `${MARCA.codigo.etiqueta} de 7 dígitos.` } },
      required: ['codigo'],
      additionalProperties: false,
    },
    strict: true,
  },
];

const cortar = (s, n) => (s ? String(s).slice(0, n) : undefined);

function ficha(p, completa = false) {
  return {
    codigo: p.codigo,
    nombre: p.nombre || p.clave_producto,
    familia: p.familia,
    subcategoria: p.subLabel || p.subcategoria,
    marcas: p.marcas?.length ? p.marcas : undefined,
    medidas: p.medidas?.length ? p.medidas : undefined,
    codigos_originales: p.codigo_original?.length ? p.codigo_original.slice(0, completa ? 20 : 4) : undefined,
    compatibilidad: cortar(p.compatibilidad, completa ? 600 : 160),
    descripcion: completa ? cortar(p.descripcion, 600) : undefined,
    maquinas: completa ? maquinasDeProducto(p.codigo).slice(0, 20).map((m) => `${m.marca} ${m.modelo}`) : undefined,
  };
}

const resumenTarjeta = (p) => ({
  codigo: p.codigo,
  nombre: p.nombre || p.clave_producto || p.codigo,
  foto: p.foto ? (/^https?:\/\//.test(p.foto) ? p.foto : `/fotos/${p.foto}`) : null,
});

async function ejecutar(nombre, input, vistos) {
  if (nombre === 'buscar_productos') {
    const res = await buscar(String(input.consulta || ''), 8);
    res.forEach((r) => vistos.set(r.p.codigo, resumenTarjeta(r.p)));
    return { resultados: res.map((r) => ({ ...ficha(r.p), coincidencia: r.motivo })) };
  }
  if (nombre === 'repuestos_para_maquina') {
    const d = await buscarMaquina(input.marca, input.modelo);
    if (!d) return { maquina: null, resultados: [], nota: 'No hay compatibilidades cargadas para esa máquina.' };
    d.productos.forEach((p) => vistos.set(p.codigo, resumenTarjeta(p)));
    return { maquina: `${d.marca} ${d.modelo}`, resultados: d.productos.slice(0, 40).map((p) => ficha(p)) };
  }
  if (nombre === 'ver_producto') {
    const p = await getProducto(String(input.codigo || '').trim());
    if (!p) return { error: 'No existe ese código en el catálogo.' };
    vistos.set(p.codigo, resumenTarjeta(p));
    return ficha(p, true);
  }
  throw new Error(`Herramienta desconocida: ${nombre}`);
}

const DERIVAR = 'Esa consulta la tiene que ver un vendedor. Escribinos por WhatsApp y te ayudamos.';

/** historial: [{ role: 'user' | 'assistant', content: string }] */
export async function responder(historial) {
  const client = new Anthropic();
  const messages = historial.map((m) => ({ role: m.role, content: m.content }));
  const vistos = new Map();

  for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
    const respuesta = await client.messages.create(
      {
        model: MODELO,
        max_tokens: 8000,
        system: SISTEMA,
        tools: HERRAMIENTAS,
        messages,
        output_config: { effort: 'low' },
        fallbacks: 'default',
      },
      { headers: { 'anthropic-beta': 'server-side-fallback-2026-07-01' } }
    );

    if (respuesta.stop_reason === 'refusal') return { texto: DERIVAR, productos: [] };

    if (respuesta.stop_reason !== 'tool_use') {
      const texto = respuesta.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim() || DERIVAR;
      const mencionados = [...new Set(texto.match(/\b\d{7}\b/g) || [])];
      return { texto, productos: mencionados.map((c) => vistos.get(c)).filter(Boolean).slice(0, 6) };
    }

    messages.push({ role: 'assistant', content: respuesta.content });
    const resultados = await Promise.all(
      respuesta.content
        .filter((b) => b.type === 'tool_use')
        .map(async (b) => {
          try {
            return { type: 'tool_result', tool_use_id: b.id, content: JSON.stringify(await ejecutar(b.name, b.input, vistos)) };
          } catch (e) {
            return { type: 'tool_result', tool_use_id: b.id, content: `Error: ${e.message}`, is_error: true };
          }
        })
    );
    messages.push({ role: 'user', content: resultados });
  }
  return { texto: DERIVAR, productos: [] };
}
