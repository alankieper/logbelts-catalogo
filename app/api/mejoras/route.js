import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

const MIME_A_MEDIA_TYPE = {
  'image/jpeg': 'image/jpeg',
  'image/png': 'image/png',
  'image/webp': 'image/webp',
  'image/gif': 'image/gif',
};

async function pedirPropuestaIA({ instruccion, productoCodigo, pagina, referencia, fotoBuffer, fotoMimeType }) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const contexto = [
    'Sos un asistente que ayuda al equipo comercial de Logbelts (venden motosierras, cadenas, espadas, piñones, filtros, desmalezadoras, minitractores, motores 4T y repuestos) a preparar propuestas de mejora para su catálogo de productos.',
    'Un vendedor propuso un cambio. Tu tarea es redactar una propuesta de edición clara y accionable para que un editor humano la revise y apruebe. No inventes datos que no te dieron: si falta información, decilo en el resumen.',
    `Código de producto: ${productoCodigo || 'no especificado'}`,
    `Página del catálogo: ${pagina || 'no especificada'}`,
    `Referencia: ${referencia || 'no especificada'}`,
    `Instrucción del vendedor: ${instruccion}`,
    fotoBuffer
      ? 'Se adjunta una foto de referencia (la página del catálogo o el producto).'
      : 'No se adjuntó foto.',
    '',
    'Respondé ÚNICAMENTE con un JSON válido (sin markdown, sin texto extra) con esta forma exacta:',
    '{"tipo_cambio": "texto corto que clasifique el cambio (ej: \\"corregir texto\\", \\"reemplazar foto\\", \\"actualizar medida\\", \\"otro\\")", "resumen": "2-4 oraciones en español describiendo la propuesta de edición concreta que el editor debería aplicar", "texto_nuevo": "si el cambio es de texto, el texto final y limpio para imprimir en el catálogo (ej: \\"Cadena 3/8 Widia\\"), sin explicaciones ni comillas extra. null si el cambio no es de texto o no hay suficiente información para redactarlo con confianza"}',
  ].join('\n');

  const content = [{ type: 'text', text: contexto }];
  if (fotoBuffer) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: fotoMimeType,
        data: fotoBuffer.toString('base64'),
      },
    });
  }

  const respuesta = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 500,
    messages: [{ role: 'user', content }],
  });

  const texto = respuesta.content.find((b) => b.type === 'text');
  if (!texto) throw new Error('La IA no devolvió texto.');

  const match = texto.text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('La IA no devolvió un JSON válido.');

  return JSON.parse(match[0]);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const vendedor = formData.get('vendedor');
    const productoCodigo = formData.get('producto_codigo') || '';
    const pagina = formData.get('pagina_catalogo') || '';
    const referencia = formData.get('referencia') || '';
    const instruccion = formData.get('instruccion') || '';
    const foto = formData.get('foto');

    if (!vendedor) {
      return NextResponse.json({ ok: false, error: 'Falta identificar al vendedor.' }, { status: 400 });
    }
    if (!instruccion) {
      return NextResponse.json({ ok: false, error: 'Falta la instrucción del cambio.' }, { status: 400 });
    }

    let fotoUrl = null;
    let fotoBuffer = null;
    let fotoMimeType = null;

    if (foto && typeof foto === 'object' && foto.size > 0) {
      fotoMimeType = MIME_A_MEDIA_TYPE[foto.type] || 'image/jpeg';
      const arrayBuffer = await foto.arrayBuffer();
      fotoBuffer = Buffer.from(arrayBuffer);

      const nombreArchivo = `mejoras/${Date.now()}-${(foto.name || 'foto.jpg').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const subida = await supabase.storage.from('catalogo-material').upload(nombreArchivo, fotoBuffer, {
        contentType: fotoMimeType,
      });

      if (subida.error) {
        return NextResponse.json({ ok: false, error: 'No se pudo guardar la foto.' }, { status: 500 });
      }

      fotoUrl = supabase.storage.from('catalogo-material').getPublicUrl(nombreArchivo).data.publicUrl;
    }

    let propuesta;
    try {
      propuesta = await pedirPropuestaIA({ instruccion, productoCodigo, pagina, referencia, fotoBuffer, fotoMimeType });
    } catch (e) {
      propuesta = { tipo_cambio: 'otro', resumen: 'No se pudo generar la propuesta automática. Un editor debe revisar la instrucción original.', texto_nuevo: null };
    }

    const insert = await supabase.from('mejoras').insert({
      vendedor,
      producto_codigo: productoCodigo || null,
      pagina_catalogo: pagina || null,
      referencia: referencia || null,
      foto_url: fotoUrl,
      instruccion,
      ia_resumen: propuesta.resumen || null,
      ia_tipo_cambio: propuesta.tipo_cambio || null,
      ia_texto_nuevo: propuesta.texto_nuevo || null,
      estado: 'pendiente',
    });

    if (insert.error) {
      return NextResponse.json({ ok: false, error: 'No se pudo guardar la mejora.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Error inesperado procesando la mejora.' }, { status: 500 });
  }
}
