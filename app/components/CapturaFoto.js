'use client';

import { useEffect, useRef, useState } from 'react';
import { COLOR_PRIMARY, COLOR_ERROR, SHADOW_SOFT, FONT_TEXTO } from '../theme';
import { IconCamara, IconSubir } from './Icons';

const bigButton = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', boxSizing: 'border-box', backgroundColor: COLOR_PRIMARY, color: 'white', border: 'none', borderRadius: '14px', padding: '16px 18px', fontSize: '15px', fontWeight: '700', textAlign: 'center', cursor: 'pointer', boxShadow: SHADOW_SOFT, fontFamily: FONT_TEXTO };
const secondaryButton = { ...bigButton, backgroundColor: '#eef2fb', color: COLOR_PRIMARY, boxShadow: 'none' };
const errorText = { color: COLOR_ERROR, fontSize: '13.5px', marginTop: '10px', fontFamily: FONT_TEXTO };

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setEstado('streaming');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 0);
    } catch (e) {
      setEstado('sin_camara');
      if (e && e.name === 'NotAllowedError') {
        setError('No diste permiso para usar la cámara. Podés activarlo desde la configuración del navegador, o subir una foto desde tus archivos.');
      } else {
        setError('No se pudo acceder a la cámara en este dispositivo. Podés subir una foto desde tus archivos.');
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
      {estado === 'inicio' && (
        <>
          <button type="button" style={bigButton} onClick={activarCamara}><IconCamara width={18} height={18} />Activar cámara</button>
          <button
            type="button"
            style={{ ...secondaryButton, marginTop: '10px' }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <IconSubir width={18} height={18} />Subir foto desde archivos
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onArchivoSeleccionado} style={{ display: 'none' }} />
        </>
      )}

      {estado === 'streaming' && (
        <>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '14px', backgroundColor: '#000' }} />
          <button type="button" style={{ ...bigButton, marginTop: '14px' }} onClick={capturarFoto}>Capturar foto</button>
        </>
      )}

      {estado === 'sin_camara' && (
        <>
          {error && <p style={errorText}>{error}</p>}
          <button
            type="button"
            style={{ ...bigButton, marginTop: '10px' }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <IconSubir width={18} height={18} />Subir foto desde archivos
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onArchivoSeleccionado} style={{ display: 'none' }} />
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
