'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

const page = { backgroundColor: '#f6f8fb', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' };
const container = { padding: '28px 20px', maxWidth: '480px', margin: '0 auto' };
const title = { color: '#1A4486', fontSize: '22px', marginBottom: '4px', textAlign: 'center' };
const subtitle = { color: '#888', fontSize: '14px', marginBottom: '24px', textAlign: 'center' };
const card = { backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(26,68,134,0.06)' };
const bigButton = { display: 'block', width: '100%', boxSizing: 'border-box', backgroundColor: '#2C5AA0', color: 'white', border: 'none', borderRadius: '14px', padding: '18px 20px', fontSize: '16px', fontWeight: '700', textAlign: 'center', textDecoration: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(44,90,160,0.25)' };
const secondaryButton = { ...bigButton, backgroundColor: 'white', color: '#2C5AA0', border: '2px solid #2C5AA0', boxShadow: 'none' };
const label = { display: 'block', marginBottom: '6px', color: '#444', fontSize: '14px', fontWeight: '600', marginTop: '14px' };
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #dde3ec', fontSize: '15px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };
const errorText = { color: '#c0392b', fontSize: '14px', marginTop: '10px' };
const okText = { color: '#2E8B57', fontSize: '14px', marginTop: '10px', fontWeight: '600' };
const backLink = { display: 'block', marginTop: '20px', textAlign: 'center', color: '#2C5AA0', textDecoration: 'none', fontSize: '14px', fontWeight: '600' };

// Estados posibles: 'inicio' | 'streaming' | 'preview' | 'guardando' | 'guardado' | 'sin_camara'
export default function Camara() {
  const [estado, setEstado] = useState('inicio');
  const [error, setError] = useState('');
  const [fotoBlob, setFotoBlob] = useState(null);
  const [fotoUrl, setFotoUrl] = useState('');
  const [pagina, setPagina] = useState('');
  const [comentario, setComentario] = useState('');
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
      setFotoBlob(blob);
      setFotoUrl(URL.createObjectURL(blob));
      detenerStream();
      setEstado('preview');
    }, 'image/jpeg', 0.9);
  }

  function reintentar() {
    setFotoBlob(null);
    setFotoUrl('');
    setEstado('inicio');
  }

  function onArchivoSeleccionado(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFotoBlob(file);
    setFotoUrl(URL.createObjectURL(file));
    setEstado('preview');
  }

  async function guardar() {
    setEstado('guardando');
    setError('');
    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const email = userResult.data && userResult.data.user ? userResult.data.user.email : null;

    const nombreArchivo = `${Date.now()}-camara.jpg`;
    const subida = await supabase.storage.from('catalogo-material').upload(nombreArchivo, fotoBlob, {
      contentType: 'image/jpeg',
    });

    if (subida.error) {
      setError('No se pudo guardar la foto. Intentá de nuevo.');
      setEstado('preview');
      return;
    }

    const publica = supabase.storage.from('catalogo-material').getPublicUrl(nombreArchivo);

    const insert = await supabase.from('catalogo_material').insert({
      tipo: 'camara',
      pagina: pagina || null,
      comentario: comentario || null,
      nombre_archivo: nombreArchivo,
      imagen_url: publica.data.publicUrl,
      creado_por: email,
    });

    if (insert.error) {
      setError('La foto se subió, pero no se pudo guardar la referencia. Avisale a soporte.');
      setEstado('preview');
      return;
    }

    setEstado('guardado');
  }

  return (
    <main style={page}>
      <div style={container}>
        <h1 style={title}>Cámara</h1>
        <p style={subtitle}>Sacá una foto de referencia para el catálogo.</p>

        <div style={card}>
          {estado === 'inicio' && (
            <>
              <button type="button" style={bigButton} onClick={activarCamara}>📷 Activar cámara</button>
              <button
                type="button"
                style={{ ...secondaryButton, marginTop: '12px' }}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                Subir foto desde archivos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onArchivoSeleccionado}
                style={{ display: 'none' }}
              />
            </>
          )}

          {estado === 'streaming' && (
            <>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '10px', backgroundColor: '#000' }} />
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
                Subir foto desde archivos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onArchivoSeleccionado}
                style={{ display: 'none' }}
              />
            </>
          )}

          {(estado === 'preview' || estado === 'guardando' || estado === 'guardado') && fotoUrl && (
            <>
              <img src={fotoUrl} alt="Foto capturada" style={{ width: '100%', borderRadius: '10px' }} />

              {estado === 'preview' && (
                <>
                  <label style={label}>Página o referencia del catálogo (opcional)</label>
                  <input type="text" value={pagina} onChange={(e) => setPagina(e.target.value)} placeholder="Ej: página 12, producto X" style={inputStyle} />

                  <label style={label}>Comentario (opcional)</label>
                  <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Qué querés mejorar en esta parte" rows={3} style={inputStyle} />

                  {error && <p style={errorText}>{error}</p>}

                  <button type="button" style={{ ...bigButton, marginTop: '14px' }} onClick={guardar}>Confirmar y guardar</button>
                  <button type="button" style={{ ...secondaryButton, marginTop: '10px' }} onClick={reintentar}>Volver a tomar la foto</button>
                </>
              )}

              {estado === 'guardando' && <p style={subtitle}>Guardando...</p>}

              {estado === 'guardado' && (
                <>
                  <p style={okText}>¡Listo! La foto se guardó junto con la referencia.</p>
                  <button type="button" style={{ ...bigButton, marginTop: '10px' }} onClick={() => { reintentar(); setPagina(''); setComentario(''); }}>Tomar otra foto</button>
                </>
              )}
            </>
          )}
        </div>

        <a href="/catalogo" style={backLink}>← Volver a Catálogo Digital</a>
      </div>
    </main>
  );
}
