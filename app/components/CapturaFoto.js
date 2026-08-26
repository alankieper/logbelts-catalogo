'use client';

import { useEffect, useRef, useState } from 'react';
import { COLOR_PRIMARY, COLOR_ERROR, COLOR_CEMENTO, SHADOW_SOFT, FONT_TEXTO } from '../theme';
import { IconCamara, IconSubir, IconCatalogo } from './Icons';

const fila = { display: 'flex', gap: '18px', justifyContent: 'center', padding: '4px 0' };
const columna = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' };
const fab = { width: '52px', height: '52px', borderRadius: '50%', border: 'none', backgroundColor: COLOR_PRIMARY, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: SHADOW_SOFT, flexShrink: 0 };
const fabSecundario = { ...fab, backgroundColor: '#eef2fb', color: COLOR_PRIMARY, boxShadow: 'none', border: '1px solid #e1e6f0' };
const fabLabel = { fontSize: '11.5px', color: COLOR_CEMENTO, fontWeight: '600', fontFamily: FONT_TEXTO };
const bigButton = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', boxSizing: 'border-box', backgroundColor: COLOR_PRIMARY, color: 'white', border: 'none', borderRadius: '14px', padding: '16px 18px', fontSize: '15px', fontWeight: '700', textAlign: 'center', cursor: 'pointer', boxShadow: SHADOW_SOFT, fontFamily: FONT_TEXTO };
const secondaryButton = { ...bigButton, backgroundColor: '#eef2fb', color: COLOR_PRIMARY, boxShadow: 'none' };
const errorText = { color: COLOR_ERROR, fontSize: '13.5px', marginTop: '10px', fontFamily: FONT_TEXTO, textAlign: 'center' };

// Estados: 'inicio' | 'streaming' | 'preview' | 'sin_camara'
// Notifica al padre via onFoto(blobOFile | null) cada vez que hay una foto lista.
export default function CapturaFoto({ onFoto }) {
  const [estado, setEstado] = useState('inicio');
  const [error, setError] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => detenerStream();
  }, []);

  // En iOS Safari, asignar srcObject apenas se pide el stream (antes de que
  // el <video> esté montado) o sin llamar a play() explícitamente puede
  // dejar la cámara "prendida" pero sin mostrar imagen.
  useEffect(() => {
    if (estado === 'streaming' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [estado]);

  function detenerStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function activarCamara() {
    setError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setEstado('sin_camara');
      setError('Este navegador no permite acceder a la cámara. Podés subir una foto desde tus archivos.');
      return;
    }
    try {
      // facingMode como constraint "ideal" (no exacta): en algunos iPhone
      // pedirla exacta hace fallar getUserMedia con OverconstrainedError
      // y la cámara nunca abre, aunque el permiso esté dado.
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
      streamRef.current = stream;
      setEstado('streaming');
    } catch (e) {
      setEstado('sin_camara');
      if (e && e.name === 'NotAllowedError') {
        setError('No diste permiso para usar la cámara. Podés activarlo desde la configuración del navegador, o subir una foto desde tus archivos.');
      } else if (e && e.name === 'NotFoundError') {
        setError('No se encontró una cámara en este dispositivo. Podés subir una foto desde tus archivos.');
      } else {
        setError('No se pudo abrir la cámara. Podés subir una foto desde tus archivos.');
      }
    }
  }

  function capturarFoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      detenerStream();
      setFotoUrl(URL.createObjectURL(blob));
      setEstado('preview');
      onFoto(blob);
    }, 'image/jpeg', 0.9);
  }

  function reintentar() {
    setFotoUrl('');
    setEstado('inicio');
    onFoto(null);
  }

  function onArchivoSeleccionado(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFotoUrl(URL.createObjectURL(file));
    setEstado('preview');
    onFoto(file);
  }

  return (
    <div>
      {(estado === 'inicio' || estado === 'sin_camara') && (
        <>
          <div style={fila}>
            <div style={columna}>
              <button type="button" style={fab} onClick={activarCamara} aria-label="Activar cámara" title="Activar cámara">
                <IconCamara width={22} height={22} />
              </button>
              <span style={fabLabel}>Cámara</span>
            </div>
            <div style={columna}>
              <button type="button" style={fab} onClick={() => fileInputRef.current && fileInputRef.current.click()} aria-label="Subir foto" title="Subir foto">
                <IconSubir width={22} height={22} />
              </button>
              <span style={fabLabel}>Subir</span>
            </div>
            <div style={columna}>
              <a href="/catalogo" target="_blank" rel="noreferrer" style={{ ...fabSecundario, textDecoration: 'none' }} aria-label="Ver catálogo" title="Ver catálogo en una pestaña nueva">
                <IconCatalogo width={20} height={20} />
              </a>
              <span style={fabLabel}>Catálogo</span>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onArchivoSeleccionado} style={{ display: 'none' }} />
          {error && <p style={errorText}>{error}</p>}
        </>
      )}

      {estado === 'streaming' && (
        <>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: '14px', backgroundColor: '#000' }} />
          <button type="button" style={{ ...bigButton, marginTop: '14px' }} onClick={capturarFoto}>Capturar foto</button>
        </>
      )}

      {estado === 'preview' && fotoUrl && (
        <>
          <img src={fotoUrl} alt="Foto capturada" style={{ width: '100%', borderRadius: '14px' }} />
          <button type="button" style={{ ...secondaryButton, marginTop: '10px' }} onClick={reintentar}>Volver a tomar la foto</button>
        </>
      )}
    </div>
  );
}
