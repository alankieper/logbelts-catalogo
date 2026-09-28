import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { MARCA } from '../../../lib/marca';
import { usuarioActual } from '../../../lib/sesionServidor';
import { esperaAntiFuerzaBruta } from '../../../lib/intentosLogin';

const MAX_FOTO = 6 * 1024 * 1024;

const MIME_A_MEDIA_TYPE = {
  'image/jpeg': 'image/jpeg',
  'image/png': 'image/png',
  'image/webp': 'image/webp',
  'image/gif': 'image/gif',
};

async function pedirPropuestaIA({ instruccion, productoCodigo, pagina, referencia, fotoBuffer, fotoMimeType }) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const contexto = [
    `Sos un asistente que ayuda al equipo comercial de ${MARCA.nombre} (${MARCA.rubro}: ${MARCA.descripcionCorta}) a preparar propuestas de mejora para su catálogo de productos.`,
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
    // Sólo alguien identificado (vendedor o admin): esta ruta sube archivos y consume la cuenta de IA.
    const usuario = await usuarioActual();
    if (!usuario) {
      return NextResponse.json({ ok: false, error: 'Tenés que identificarte para proponer mejoras.' }, { status: 401 });
    }
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'sin-ip';
    if (esperaAntiFuerzaBruta('mejoras:' + ip) > 0) {
      return NextResponse.json({ ok: false, error: 'Demasiadas propuestas seguidas. Esperá un momento.' }, { status: 429 });
    }
    esperaAntiFuerzaBruta('mejoras:' + ip, true);

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
    if (!productoCodigo || !pagina) {
      return NextResponse.json({ ok: false, error: 'Falta el código de producto o la página del catálogo.' }, { status: 400 });
    }
    if (!instruccion) {
      return NextResponse.json({ ok: false, error: 'Falta la instrucción del cambio.' }, { status: 400 });
    }

    let fotoUrl = null;
    let fotoBuffer = null;
    let fotoMimeType = null;

    if (foto && typeof foto === 'object' && foto.size > 0) {
      if (!MIME_A_MEDIA_TYPE[foto.type]) {
        return NextResponse.json({ ok: false, error: 'La foto tiene que ser JPG, PNG, WEBP o GIF.' }, { status: 400 });
      }
      if (foto.size > MAX_FOTO) {
        return NextResponse.json({ ok: false, error: 'La foto pesa más de 6 MB.' }, { status: 400 });
      }
      fotoMimeType = MIME_A_MEDIA_TYPE[foto.type];
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
      console.error('Mejoras: falló la propuesta automática:', e?.message || e);
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
