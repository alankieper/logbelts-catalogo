import Anthropic from '@anthropic-ai/sdk';

/**
 * Mejora descripciones con Claude a partir de datos que YA vienen del catálogo
 * (código, tipo de pieza según la clave, subcategoría, compatibilidad, encabezado).
 * No inventa modelos: si no hay info suficiente deja la descripción como estaba.
 */

const LOTE = 20;
const MAX_PRODUCTOS = 500; // tope de seguridad por corrida

const PROMPT_SISTEMA = `Sos asistente de catálogo de repuestos para máquinas de bosque y jardín (LOGBELTS).
Te paso una lista de productos con datos parciales del catálogo. Para cada uno, devolvé una
descripción corta (máx 90 caracteres), en español, clara y comercial, SÓLO con información que
se deduzca de los datos dados. Reglas:
- No inventes números de modelo, medidas ni marcas que no estén en los datos.
- Si los datos alcanzan sólo para algo genérico, devolvé algo genérico (no adornes).
- Formato de salida: JSON válido, un objeto { "<codigo>": "<descripcion>", ... }. Nada más.`;

function itemLinea(p) {
  return {
    codigo: p.codigo,
    tipo: p.clave_producto || null,
    subcategoria: p.subcategoria || null,
    marcas: p.marcas || [],
    compatibilidad: p.compatibilidad || null,
    seccion_catalogo: p.encabezado_pdf || null,
    descripcion_actual: p.descripcion || null,
  };
}

export async function enriquecerDescripciones(productos, { limite = MAX_PRODUCTOS } = {}) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, error: 'No hay ANTHROPIC_API_KEY configurada.', mejorados: 0 };

  const objetivo = productos
    .filter((p) => !p.descripcion || (p.fuente_desc && p.fuente_desc.startsWith('derivada')))
    .slice(0, limite);
  if (!objetivo.length) return { ok: true, mejorados: 0, revisados: 0 };

  const client = new Anthropic({ apiKey: key });
  let mejorados = 0;
  let errores = 0;

  for (let i = 0; i < objetivo.length; i += LOTE) {
    const lote = objetivo.slice(i, i + LOTE);
    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 1500,
        system: PROMPT_SISTEMA,
        messages: [{ role: 'user', content: JSON.stringify(lote.map(itemLinea)) }],
      });
      const txt = (msg.content || []).map((b) => b.text || '').join('');
      const jsonMatch = txt.match(/\{[\s\S]*\}/);
      if (!jsonMatch) { errores++; continue; }
      const map = JSON.parse(jsonMatch[0]);
      for (const p of lote) {
        const d = map[p.codigo];
        if (d && typeof d === 'string' && d.trim().length > 3) {
          p.descripcion = d.trim();
          p.nombre = d.trim();
          p.fuente_desc = 'ia';
          if (p.estado && p.estado.startsWith('derivado')) p.estado = p.foto ? 'ia_con_foto' : 'ia';
          mejorados++;
        }
      }
    } catch (e) {
      errores++;
    }
  }

  return { ok: true, mejorados, revisados: objetivo.length, errores };
}
