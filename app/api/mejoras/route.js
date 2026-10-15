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

export async function POST(request) {
  try {
    // Sólo alguien identificado (vendedor o admin): esta ruta sube archivos.
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

    // Sin IA: la propuesta queda como la escribió el vendedor y un editor la revisa.
    const propuesta = { tipo_cambio: 'otro', resumen: 'Propuesta del vendedor: un editor debe revisar la instrucción original.', texto_nuevo: null };

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
