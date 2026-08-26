'use client';

import { useRef, useState } from 'react';
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
const fileRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f2f6', fontSize: '13px', color: '#444' };
const removeBtn = { background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '13px', fontWeight: '600' };

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Estados: 'seleccionando' | 'subiendo' | 'listo'
export default function CargarArchivos() {
  const [archivos, setArchivos] = useState([]);
  const [pagina, setPagina] = useState('');
  const [comentario, setComentario] = useState('');
  const [estado, setEstado] = useState('seleccionando');
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
    const userResult = await supabase.auth.getUser();
    const email = userResult.data && userResult.data.user ? userResult.data.user.email : null;

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
        creado_por: email,
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
    <main style={page}>
      <div style={container}>
        <h1 style={title}>Cargar archivos</h1>
        <p style={subtitle}>Subí fotos, capturas de pantalla, PDFs o documentos para proponer mejoras.</p>

        <div style={card}>
          {estado === 'seleccionando' && (
            <>
              <button type="button" style={bigButton} onClick={() => inputRef.current && inputRef.current.click()}>
                Elegir archivos
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={onSeleccion}
                style={{ display: 'none' }}
              />

              {archivos.length > 0 && (
                <div style={{ marginTop: '16px' }}>
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

          {estado === 'subiendo' && <p style={subtitle}>Subiendo archivos...</p>}

          {estado === 'listo' && (
            <>
              <p style={okText}>¡Listo! Se subieron {archivos.length} archivo(s) con su referencia.</p>
              {error && <p style={errorText}>{error}</p>}
              <button type="button" style={{ ...secondaryButton, marginTop: '10px' }} onClick={empezarDeNuevo}>Subir más archivos</button>
            </>
          )}
        </div>

        <a href="/catalogo" style={backLink}>← Volver a Catálogo Digital</a>
      </div>
    </main>
  );
}
