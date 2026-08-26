import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { readFile } from 'fs/promises';
import path from 'path';

// Editar un PDF de ~140 páginas con pdf-lib tarda bastante más que el
// timeout default de las funciones serverless de Vercel.
export const maxDuration = 60;

function envolverTexto(font, texto, tamanio, anchoMax) {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const lineas = [];
  let actual = '';

  for (const palabra of palabras) {
    const candidata = actual ? `${actual} ${palabra}` : palabra;
    if (font.widthOfTextAtSize(candidata, tamanio) > anchoMax && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = candidata;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { pagina, x, y, w, h, tipo, texto } = body;

    if (!pagina || x == null || y == null || !w || !h || !tipo) {
      return NextResponse.json({ ok: false, error: 'Falta la región marcada.' }, { status: 400 });
    }

    const mejoraRes = await supabase.from('mejoras').select('*').eq('id', id).single();
    if (mejoraRes.error || !mejoraRes.data) {
      return NextResponse.json({ ok: false, error: 'No se encontró la mejora.' }, { status: 404 });
    }
    const mejora = mejoraRes.data;

    if (tipo === 'foto' && !mejora.foto_url) {
      return NextResponse.json({ ok: false, error: 'Esta mejora no tiene foto adjunta.' }, { status: 400 });
    }
    if (tipo === 'texto' && !texto) {
      return NextResponse.json({ ok: false, error: 'Falta el texto a estampar.' }, { status: 400 });
    }

    const listado = await supabase.storage.from('catalogo-digital').list('', {
      limit: 50,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    const archivos = (listado.data || []).filter((f) => f.name && !f.name.startsWith('.'));
    if (archivos.length === 0) {
      return NextResponse.json({ ok: false, error: 'No hay ningún catálogo digital cargado todavía.' }, { status: 400 });
    }
    const archivoActual = archivos[0].name;
    const urlActual = supabase.storage.from('catalogo-digital').getPublicUrl(archivoActual).data.publicUrl;

    const pdfResp = await fetch(urlActual);
    if (!pdfResp.ok) {
      return NextResponse.json({ ok: false, error: 'No se pudo descargar el catálogo vigente.' }, { status: 500 });
    }
    const pdfBytes = await pdfResp.arrayBuffer();

    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const indicePagina = Number(pagina) - 1;
    const paginas = pdfDoc.getPages();
    if (indicePagina < 0 || indicePagina >= paginas.length) {
      return NextResponse.json({ ok: false, error: `El catálogo tiene ${paginas.length} páginas, no existe la página ${pagina}.` }, { status: 400 });
    }
    const page = paginas[indicePagina];
    const { width: anchoPagina, height: altoPagina } = page.getSize();

    const rectX = x * anchoPagina;
    const rectW = w * anchoPagina;
    const rectH = h * altoPagina;
    const rectY = altoPagina - (y * altoPagina) - rectH;

    page.drawRectangle({ x: rectX, y: rectY, width: rectW, height: rectH, color: rgb(1, 1, 1) });

    if (tipo === 'foto') {
      const fotoResp = await fetch(mejora.foto_url);
      if (!fotoResp.ok) {
        return NextResponse.json({ ok: false, error: 'No se pudo descargar la foto de la mejora.' }, { status: 500 });
      }
      const fotoBytes = await fotoResp.arrayBuffer();
      const contentType = fotoResp.headers.get('content-type') || '';

      let imagen;
      try {
        if (contentType.includes('png')) {
          imagen = await pdfDoc.embedPng(fotoBytes);
        } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
          imagen = await pdfDoc.embedJpg(fotoBytes);
        } else {
          return NextResponse.json({ ok: false, error: 'La foto debe ser JPG o PNG para poder estamparla en el PDF.' }, { status: 400 });
        }
      } catch (e) {
        return NextResponse.json({ ok: false, error: 'No se pudo procesar la foto para el PDF.' }, { status: 500 });
      }

      const escala = Math.min(rectW / imagen.width, rectH / imagen.height);
      const anchoFinal = imagen.width * escala;
      const altoFinal = imagen.height * escala;
      page.drawImage(imagen, {
        x: rectX + (rectW - anchoFinal) / 2,
        y: rectY + (rectH - altoFinal) / 2,
        width: anchoFinal,
        height: altoFinal,
      });
    } else {
      const fontBytes = await readFile(path.join(process.cwd(), 'public/fonts/AktivGrotesk-Medium.ttf'));
      const font = await pdfDoc.embedFont(fontBytes);

      let tamanio = Math.min(16, rectH * 0.5);
      let lineas = envolverTexto(font, texto, tamanio, rectW);
      while (lineas.length * tamanio * 1.25 > rectH && tamanio > 6) {
        tamanio -= 1;
        lineas = envolverTexto(font, texto, tamanio, rectW);
      }

      const interlineado = tamanio * 1.25;
      const altoBloque = lineas.length * interlineado;
      let cursorY = rectY + rectH - (rectH - altoBloque) / 2 - tamanio;

      for (const linea of lineas) {
        page.drawText(linea, { x: rectX, y: cursorY, size: tamanio, font, color: rgb(0.11, 0.13, 0.16) });
        cursorY -= interlineado;
      }
    }

    const nuevoPdfBytes = await pdfDoc.save();
    const nombreNuevo = `catalogo-${Date.now()}.pdf`;
    const subida = await supabase.storage.from('catalogo-digital').upload(nombreNuevo, Buffer.from(nuevoPdfBytes), {
      contentType: 'application/pdf',
    });
    if (subida.error) {
      return NextResponse.json({ ok: false, error: 'No se pudo guardar la nueva versión del catálogo.' }, { status: 500 });
    }
    const urlNueva = supabase.storage.from('catalogo-digital').getPublicUrl(nombreNuevo).data.publicUrl;

    const update = await supabase.from('mejoras').update({
      estado: 'aprobada',
      revisado_en: new Date().toISOString(),
      region: { pagina: Number(pagina), x, y, w, h, tipo },
      ia_texto_nuevo: tipo === 'texto' ? texto : mejora.ia_texto_nuevo,
      catalogo_version_url: urlNueva,
      aplicado_en: new Date().toISOString(),
    }).eq('id', id);

    if (update.error) {
      return NextResponse.json({ ok: false, error: 'El catálogo se actualizó pero no se pudo guardar el estado de la mejora.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, catalogoUrl: urlNueva });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Error inesperado aplicando la mejora.' }, { status: 500 });
  }
}
