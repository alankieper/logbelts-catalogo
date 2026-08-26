'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

// ---------------------------------------------------------------------------
// Estilos compartidos
// ---------------------------------------------------------------------------
const page = { backgroundColor: '#f6f8fb', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' };
const container = { padding: '24px 18px 60px', maxWidth: '620px', margin: '0 auto' };
const title = { color: '#1A4486', fontSize: '25px', marginBottom: '4px', textAlign: 'center', fontWeight: '800', letterSpacing: '-0.3px' };
const subtitle = { color: '#8a93a3', fontSize: '14px', marginBottom: '22px', textAlign: 'center', lineHeight: '1.4' };

const tabBar = { display: 'flex', backgroundColor: '#e9edf5', borderRadius: '16px', padding: '5px', marginBottom: '18px', gap: '4px' };
const tabButtonBase = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '11px 4px', borderRadius: '12px', border: 'none', backgroundColor: 'transparent', color: '#6b7484', fontSize: '12px', fontWeight: '700', cursor: 'pointer' };
const tabButtonActive = { ...tabButtonBase, backgroundColor: 'white', color: '#1A4486', boxShadow: '0 3px 10px rgba(26,68,134,0.14)' };

const card = { backgroundColor: 'white', borderRadius: '20px', padding: '22px 20px', boxShadow: '0 4px 24px rgba(26,68,134,0.07)', minHeight: '280px' };
const sectionTitle = { color: '#222', fontSize: '17px', fontWeight: '700', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' };
const sectionHint = { color: '#98a1b0', fontSize: '13px', margin: '0 0 18px 0' };

const bigButton = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', boxSizing: 'border-box', backgroundColor: '#2C5AA0', color: 'white', border: 'none', borderRadius: '14px', padding: '17px 18px', fontSize: '15.5px', fontWeight: '700', textAlign: 'center', textDecoration: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(44,90,160,0.25)' };
const secondaryButton = { ...bigButton, backgroundColor: '#f0f4fa', color: '#2C5AA0', boxShadow: 'none' };
const label = { display: 'block', marginBottom: '6px', color: '#444', fontSize: '13.5px', fontWeight: '600', marginTop: '14px' };
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e7ef', fontSize: '15px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', backgroundColor: '#fafbfd' };
const errorText = { color: '#c0392b', fontSize: '13.5px', marginTop: '10px' };
const okText = { color: '#2E8B57', fontSize: '14px', marginTop: '6px', fontWeight: '700' };
const fileRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f0f2f6', fontSize: '13px', color: '#444' };
const removeBtn = { background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '13px', fontWeight: '600' };

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function obtenerUsuarioActual() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )logbelts_user=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// ---------------------------------------------------------------------------
// Iconos (SVG en linea, sin dependencias externas)
// ---------------------------------------------------------------------------
function IconLibro(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconCamara(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconSubir(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Seccion: Ver catalogo
// ---------------------------------------------------------------------------
function SeccionVerCatalogo({ irACargar }) {
  const [loading, setLoading] = useState(true);
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      const supabase = createClient();
      const result = await supabase.storage.from('catalogo-digital').list('', {
        limit: 50,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (result.error) {
        setError('No se pudo cargar el catálogo en este momento.');
        setLoading(false);
        return;
      }

      const archivos = (result.data || []).filter((f) => f.name && !f.name.startsWith('.'));

      if (archivos.length === 0) {
        setLoading(false);
        return;
      }

      const publica = supabase.storage.from('catalogo-digital').getPublicUrl(archivos[0].name);
      setArchivo({ nombre: archivos[0].name, url: publica.data.publicUrl });
      setLoading(false);
    }
    cargar();
  }, []);

  const esPdf = archivo && archivo.nombre.toLowerCase().endsWith('.pdf');

  return (
    <div>
      <h2 style={sectionTitle}><IconLibro /> Ver catálogo</h2>
      <p style={sectionHint}>Catálogo digital de Logbelts</p>

      {loading && <p style={{ color: '#98a1b0' }}>Cargando...</p>}

      {!loading && error && <p style={errorText}>{error}</p>}

      {!loading && !error && !archivo && (
        <div>
          <p style={{ color: '#666' }}>Todavía no se cargó el catálogo digital.</p>
          <button type="button" style={{ ...bigButton, marginTop: '10px' }} onClick={irACargar}>Cargar archivo</button>
        </div>
      )}

      {!loading && archivo && (
        <div>
          <p style={{ color: '#98a1b0', fontSize: '12.5px', marginBottom: '10px' }}>{archivo.nombre}</p>
          {esPdf ? (
            <iframe
              src={archivo.url}
              title="Catálogo"
              style={{ width: '100%', height: '65vh', border: '1px solid #e2e7ef', borderRadius: '14px', backgroundColor: 'white' }}
            />
          ) : (
            <img src={archivo.url} alt="Catálogo" style={{ width: '100%', borderRadius: '14px' }} />
          )}
          <a href={archivo.url} target="_blank" rel="noreferrer" style={{ ...secondaryButton, marginTop: '14px', display: 'flex' }}>Abrir en una pestaña nueva</a>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seccion: Camara
// ---------------------------------------------------------------------------
function SeccionCamara() {
  const [estado, setEstado] = useState('inicio'); // inicio | streaming | preview | guardando | guardado | sin_camara
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
    const usuario = obtenerUsuarioActual();

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
      creado_por: usuario,
    });

    if (insert.error) {
      setError('La foto se subió, pero no se pudo guardar la referencia. Avisale a soporte.');
      setEstado('preview');
      return;
    }

    setEstado('guardado');
  }

  return (
    <div>
      <h2 style={sectionTitle}><IconCamara /> Cámara</h2>
      <p style={sectionHint}>Sacá una foto de referencia para el catálogo.</p>

      {estado === 'inicio' && (
        <>
          <button type="button" style={bigButton} onClick={activarCamara}>Activar cámara</button>
          <button
            type="button"
            style={{ ...secondaryButton, marginTop: '10px' }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            Subir foto desde archivos
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
            Subir foto desde archivos
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onArchivoSeleccionado} style={{ display: 'none' }} />
        </>
      )}

      {(estado === 'preview' || estado === 'guardando' || estado === 'guardado') && fotoUrl && (
        <>
          <img src={fotoUrl} alt="Foto capturada" style={{ width: '100%', borderRadius: '14px' }} />

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

          {estado === 'guardando' && <p style={{ color: '#98a1b0', marginTop: '10px' }}>Guardando...</p>}

          {estado === 'guardado' && (
            <>
              <p style={okText}>¡Listo! La foto se guardó junto con la referencia.</p>
              <button type="button" style={{ ...bigButton, marginTop: '10px' }} onClick={() => { reintentar(); setPagina(''); setComentario(''); }}>Tomar otra foto</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seccion: Cargar archivos
// ---------------------------------------------------------------------------
function SeccionCargarArchivos() {
  const [archivos, setArchivos] = useState([]);
  const [pagina, setPagina] = useState('');
  const [comentario, setComentario] = useState('');
  const [estado, setEstado] = useState('seleccionando'); // seleccionando | subiendo | listo
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function onSeleccion(e) {
    const nuevos = Array.from(e.target.files || []);
    setArchivos((prev) => [...prev, ...nuevos]);
    e.target.value = '';
  }

  function quitarArchivo(idx) {
    setArchivos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function subirTodo() {
    if (archivos.length === 0) return;
    setEstado('subiendo');
    setError('');

    const supabase = createClient();
    const usuario = obtenerUsuarioActual();

    for (const archivo of archivos) {
      const nombreSeguro = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const nombreArchivo = `${Date.now()}-${nombreSeguro}`;

      const subida = await supabase.storage.from('catalogo-material').upload(nombreArchivo, archivo, {
        contentType: archivo.type || undefined,
      });

      if (subida.error) {
        setError(`No se pudo subir "${archivo.name}". Intentá de nuevo.`);
        setEstado('seleccionando');
        return;
      }

      const publica = supabase.storage.from('catalogo-material').getPublicUrl(nombreArchivo);

      const insert = await supabase.from('catalogo_material').insert({
        tipo: 'archivo',
        pagina: pagina || null,
        comentario: comentario || null,
        nombre_archivo: archivo.name,
        imagen_url: publica.data.publicUrl,
        creado_por: usuario,
      });

      if (insert.error) {
        setError(`"${archivo.name}" se subió, pero no se pudo guardar la referencia.`);
      }
    }

    setEstado('listo');
  }

  function empezarDeNuevo() {
    setArchivos([]);
    setPagina('');
    setComentario('');
    setEstado('seleccionando');
    setError('');
  }

  return (
    <div>
      <h2 style={sectionTitle}><IconSubir /> Cargar archivos</h2>
      <p style={sectionHint}>Fotos, capturas de pantalla, PDFs o documentos.</p>

      {estado === 'seleccionando' && (
        <>
          <button type="button" style={bigButton} onClick={() => inputRef.current && inputRef.current.click()}>Elegir archivos</button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            onChange={onSeleccion}
            style={{ display: 'none' }}
          />

          {archivos.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              {archivos.map((f, idx) => (
                <div key={`${f.name}-${idx}`} style={fileRow}>
                  <span>{f.name} <span style={{ color: '#999' }}>({formatBytes(f.size)})</span></span>
                  <button type="button" style={removeBtn} onClick={() => quitarArchivo(idx)}>Quitar</button>
                </div>
              ))}
            </div>
          )}

          <label style={label}>Página o referencia del catálogo (opcional)</label>
          <input type="text" value={pagina} onChange={(e) => setPagina(e.target.value)} placeholder="Ej: página 12, producto X" style={inputStyle} />

          <label style={label}>Comentario (opcional)</label>
          <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Qué querés modificar en esta parte" rows={3} style={inputStyle} />

          {error && <p style={errorText}>{error}</p>}

          <button
            type="button"
            style={{ ...bigButton, marginTop: '16px', opacity: archivos.length === 0 ? 0.5 : 1 }}
            onClick={subirTodo}
            disabled={archivos.length === 0}
          >
            Subir {archivos.length > 0 ? `(${archivos.length})` : ''}
          </button>
        </>
      )}

      {estado === 'subiendo' && <p style={{ color: '#98a1b0' }}>Subiendo archivos...</p>}

      {estado === 'listo' && (
        <>
          <p style={okText}>¡Listo! Se subieron {archivos.length} archivo(s) con su referencia.</p>
          {error && <p style={errorText}>{error}</p>}
          <button type="button" style={{ ...secondaryButton, marginTop: '10px' }} onClick={empezarDeNuevo}>Subir más archivos</button>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagina principal: Catalogo Digital (todo integrado en una sola ventana)
// ---------------------------------------------------------------------------
export default function CatalogoDigital() {
  const [tab, setTab] = useState('ver');

  return (
    <main style={page}>
      <div style={container}>
        <h1 style={title}>Catálogo Digital</h1>
        <p style={subtitle}>Mirá el catálogo y proponé mejoras: sacá una foto o subí archivos de referencia, todo en un mismo lugar.</p>

        <div style={tabBar}>
          <button type="button" style={tab === 'ver' ? tabButtonActive : tabButtonBase} onClick={() => setTab('ver')}>
            <IconLibro />
            Ver catálogo
          </button>
          <button type="button" style={tab === 'camara' ? tabButtonActive : tabButtonBase} onClick={() => setTab('camara')}>
            <IconCamara />
            Cámara
          </button>
          <button type="button" style={tab === 'cargar' ? tabButtonActive : tabButtonBase} onClick={() => setTab('cargar')}>
            <IconSubir />
            Archivos
          </button>
        </div>

        <div style={card}>
          {tab === 'ver' && <SeccionVerCatalogo irACargar={() => setTab('cargar')} />}
          {tab === 'camara' && <SeccionCamara />}
          {tab === 'cargar' && <SeccionCargarArchivos />}
        </div>
      </div>
    </main>
  );
}
