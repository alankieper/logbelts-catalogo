'use client';

import { useEffect, useRef, useState } from 'react';
import { revisarMejora } from '../../../actions';
import { COLOR_PRIMARY, COLOR_CEMENTO, COLOR_ERROR, COLOR_OK, SHADOW_SOFT, FONT_TEXTO, cardStyle } from '../../../../theme';

const card = { ...cardStyle, padding: '22px' };
const toolbar = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '16px' };
const navBtn = { backgroundColor: '#eef2fb', color: COLOR_PRIMARY, border: 'none', borderRadius: '10px', padding: '9px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: FONT_TEXTO };
const pageLabel = { fontSize: '13px', color: COLOR_CEMENTO, fontWeight: '700', minWidth: '110px', textAlign: 'center' };
const canvasWrap = { position: 'relative', margin: '0 auto', touchAction: 'none', lineHeight: 0, border: '1px solid #e6eaf2', borderRadius: '12px', overflow: 'hidden' };
const hint = { fontSize: '13px', color: COLOR_CEMENTO, textAlign: 'center', marginBottom: '14px', fontFamily: FONT_TEXTO };
const tipoRow = { display: 'flex', gap: '10px', marginTop: '20px' };
const tipoBtn = (activo) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: activo ? `2px solid ${COLOR_PRIMARY}` : '1px solid #e1e6f0', backgroundColor: activo ? '#eef2fb' : 'white', color: activo ? COLOR_PRIMARY : '#555', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: FONT_TEXTO, opacity: 1 });
const label = { display: 'block', marginTop: '18px', marginBottom: '8px', color: '#444', fontSize: '13.5px', fontWeight: '700' };
const textareaStyle = { width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e1e6f0', fontSize: '15px', outline: 'none', fontFamily: FONT_TEXTO, backgroundColor: '#fafbfe' };
const fotoPreview = { width: '100%', maxWidth: '220px', borderRadius: '12px', marginTop: '8px', display: 'block' };
const botones = { display: 'flex', gap: '12px', marginTop: '26px' };
const botonConfirmar = { flex: 1, backgroundColor: COLOR_PRIMARY, color: 'white', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: SHADOW_SOFT, fontFamily: FONT_TEXTO };
const botonRechazar = { flex: '0 0 auto', backgroundColor: 'white', color: '#c0392b', border: '2px solid #f0d3d3', borderRadius: '14px', padding: '16px 18px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: FONT_TEXTO };
const errorText = { color: COLOR_ERROR, fontSize: '14px', marginTop: '14px', textAlign: 'center', fontFamily: FONT_TEXTO };
const okText = { color: COLOR_OK, fontSize: '15px', fontWeight: '700', textAlign: 'center', fontFamily: FONT_TEXTO };

const ANCHO_OBJETIVO = 640;

function contieneFoto(texto) {
  return /foto|imagen|imágen/i.test(texto || '');
}

export default function MarcarRegion({ mejora, catalogoUrl }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const pdfRef = useRef(null);
  const dragRef = useRef(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [pagina, setPagina] = useState(() => {
    const n = parseInt(mejora.pagina_catalogo, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  });
  const [rect, setRect] = useState(null); // {x,y,w,h} en pixeles del canvas
  const [tipo, setTipo] = useState(contieneFoto(mejora.ia_tipo_cambio) && mejora.foto_url ? 'foto' : 'texto');
  const [texto, setTexto] = useState(mejora.ia_texto_nuevo || '');
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function cargarPdf() {
      setCargando(true);
      setError('');
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const pdf = await pdfjsLib.getDocument(catalogoUrl).promise;
        if (cancelado) return;
        pdfRef.current = pdf;
        setTotalPaginas(pdf.numPages);
        await renderizarPagina(pdf, Math.min(pagina, pdf.numPages));
      } catch (e) {
        if (!cancelado) setError('No se pudo cargar el catálogo para marcar la región.');
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarPdf();
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogoUrl]);

  useEffect(() => {
    if (!pdfRef.current) return;
    let cancelado = false;
    setRect(null);
    setCargando(true);
    renderizarPagina(pdfRef.current, pagina).finally(() => {
      if (!cancelado) setCargando(false);
    });
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]);

  // Evita condiciones de carrera: si se pide otra página antes de que
  // termine de renderizar la actual, se cancela el render en curso para
  // que el canvas nunca termine mostrando una página distinta a la que
  // dice el número arriba (crítico: esto es lo que define qué se edita
  // en el catálogo real).
  const paginaSolicitadaRef = useRef(null);
  const renderTaskRef = useRef(null);

  async function renderizarPagina(pdf, numeroPagina) {
    paginaSolicitadaRef.current = numeroPagina;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    const paginaPdf = await pdf.getPage(numeroPagina);
    if (paginaSolicitadaRef.current !== numeroPagina) return;

    const viewportBase = paginaPdf.getViewport({ scale: 1 });
    const escala = ANCHO_OBJETIVO / viewportBase.width;
    const viewport = paginaPdf.getViewport({ scale: escala });

    const canvas = canvasRef.current;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    const task = paginaPdf.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;
    try {
      await task.promise;
    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') throw e;
    } finally {
      if (renderTaskRef.current === task) renderTaskRef.current = null;
    }
  }

  function coordenadasRelativas(e) {
    const rectCanvas = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const escalaX = canvasRef.current.width / rectCanvas.width;
    const escalaY = canvasRef.current.height / rectCanvas.height;
    return { x: (clientX - rectCanvas.left) * escalaX, y: (clientY - rectCanvas.top) * escalaY };
  }

  function onPointerDown(e) {
    const p = coordenadasRelativas(e);
    dragRef.current = { startX: p.x, startY: p.y };
    setRect({ x: p.x, y: p.y, w: 0, h: 0 });
  }

  function onPointerMove(e) {
    if (!dragRef.current) return;
    const p = coordenadasRelativas(e);
    const { startX, startY } = dragRef.current;
    setRect({
      x: Math.min(startX, p.x),
      y: Math.min(startY, p.y),
      w: Math.abs(p.x - startX),
      h: Math.abs(p.y - startY),
    });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  async function confirmar() {
    if (!rect || rect.w < 8 || rect.h < 8) {
      setError('Marcá primero el recuadro a cambiar (arrastrá sobre la página).');
      return;
    }
    if (tipo === 'texto' && !texto.trim()) {
      setError('Escribí el texto que va a reemplazar al actual.');
      return;
    }
    setError('');
    setEnviando(true);

    const canvas = canvasRef.current;
    const body = {
      pagina,
      x: rect.x / canvas.width,
      y: rect.y / canvas.height,
      w: rect.w / canvas.width,
      h: rect.h / canvas.height,
      tipo,
      texto: tipo === 'texto' ? texto.trim() : undefined,
    };

    try {
      const res = await fetch(`/api/mejoras/${mejora.id}/aplicar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || 'No se pudo aplicar la mejora.');
        setEnviando(false);
        return;
      }
      setListo(true);
    } catch (e) {
      setError('No se pudo aplicar la mejora. Revisá tu conexión.');
      setEnviando(false);
    }
  }

  async function rechazar() {
    setEnviando(true);
    const formData = new FormData();
    formData.set('id', mejora.id);
    formData.set('decision', 'rechazada');
    await revisarMejora(formData);
    window.location.href = '/admin';
  }

  if (listo) {
    return (
      <div style={card}>
        <p style={okText}>¡Listo! Se generó una nueva versión del catálogo con el cambio aplicado.</p>
        <div style={botones}>
          <a href="/admin" style={{ ...botonConfirmar, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>Volver al panel</a>
          <a href="/catalogo" style={{ ...botonRechazar, textAlign: 'center', textDecoration: 'none', color: COLOR_PRIMARY, borderColor: '#e1e6f0' }}>Ver catálogo</a>
        </div>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={toolbar}>
        <button type="button" style={navBtn} onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={cargando || pagina <= 1}>← Anterior</button>
        <span style={pageLabel}>Página {pagina}{totalPaginas ? ` de ${totalPaginas}` : ''}</span>
        <button type="button" style={navBtn} onClick={() => setPagina((p) => Math.min(totalPaginas || p + 1, p + 1))} disabled={cargando || (totalPaginas > 0 && pagina >= totalPaginas)}>Siguiente →</button>
      </div>

      <p style={hint}>{cargando ? 'Cargando página...' : 'Arrastrá sobre la página para marcar el recuadro a cambiar.'}</p>

      <div ref={wrapRef} style={canvasWrap}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: 'auto', cursor: 'crosshair' }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        />
        {rect && canvasRef.current && (
          <div
            style={{
              position: 'absolute',
              border: `2px solid ${COLOR_PRIMARY}`,
              backgroundColor: 'rgba(0,64,140,0.15)',
              left: `${(rect.x / canvasRef.current.width) * 100}%`,
              top: `${(rect.y / canvasRef.current.height) * 100}%`,
              width: `${(rect.w / canvasRef.current.width) * 100}%`,
              height: `${(rect.h / canvasRef.current.height) * 100}%`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      <div style={tipoRow}>
        <button type="button" style={tipoBtn(tipo === 'texto')} onClick={() => setTipo('texto')}>Cambiar texto</button>
        <button type="button" style={tipoBtn(tipo === 'foto')} onClick={() => mejora.foto_url && setTipo('foto')} disabled={!mejora.foto_url}>
          Cambiar foto{!mejora.foto_url ? ' (sin foto)' : ''}
        </button>
      </div>

      {tipo === 'texto' && (
        <>
          <label style={label}>Texto nuevo</label>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} style={textareaStyle} placeholder="Texto que va a reemplazar al actual" />
        </>
      )}

      {tipo === 'foto' && mejora.foto_url && (
        <>
          <label style={label}>Foto que subió el vendedor</label>
          <img src={mejora.foto_url} alt="Foto de la mejora" style={fotoPreview} />
        </>
      )}

      {error && <p style={errorText}>{error}</p>}

      <div style={botones}>
        <button type="button" style={{ ...botonConfirmar, opacity: enviando ? 0.6 : 1 }} onClick={confirmar} disabled={enviando || cargando}>
          {enviando ? 'Aplicando...' : 'Confirmar y aplicar'}
        </button>
        <button type="button" style={botonRechazar} onClick={rechazar} disabled={enviando}>Rechazar</button>
      </div>
    </div>
  );
}
