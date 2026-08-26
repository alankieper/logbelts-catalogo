'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

const page = { backgroundColor: '#f6f8fb', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' };
const container = { padding: '28px 20px', maxWidth: '640px', margin: '0 auto' };
const title = { color: '#1A4486', fontSize: '22px', marginBottom: '4px', textAlign: 'center' };
const subtitle = { color: '#888', fontSize: '14px', marginBottom: '24px', textAlign: 'center' };
const errorText = { color: '#c0392b', textAlign: 'center' };
const card = { backgroundColor: 'white', borderRadius: '14px', padding: '28px 20px', textAlign: 'center', boxShadow: '0 2px 10px rgba(26,68,134,0.06)' };
const button = { display: 'inline-block', backgroundColor: '#2C5AA0', color: 'white', border: 'none', borderRadius: '10px', padding: '13px 20px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', marginTop: '16px' };
const backLink = { display: 'block', marginTop: '24px', textAlign: 'center', color: '#2C5AA0', textDecoration: 'none', fontSize: '14px', fontWeight: '600' };

export default function VerCatalogo() {
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
    <main style={page}>
      <div style={container}>
        <h1 style={title}>Ver catálogo</h1>
        <p style={subtitle}>Catálogo digital de Logbelts</p>

        {loading && <div style={card}>Cargando...</div>}

        {!loading && error && <div style={card}><p style={errorText}>{error}</p></div>}

        {!loading && !error && !archivo && (
          <div style={card}>
            <p>Todavía no se cargó el catálogo digital.</p>
            <a href="/catalogo/cargar" style={button}>Cargar archivo</a>
          </div>
        )}

        {!loading && archivo && (
          <div>
            <p style={{ color: '#555', fontSize: '13px', marginBottom: '10px' }}>{archivo.nombre}</p>
            {esPdf ? (
              <iframe
                src={archivo.url}
                title="Catálogo"
                style={{ width: '100%', height: '75vh', border: '1px solid #dde3ec', borderRadius: '12px', backgroundColor: 'white' }}
              />
            ) : (
              <img src={archivo.url} alt="Catálogo" style={{ width: '100%', borderRadius: '12px', boxShadow: '0 2px 10px rgba(26,68,134,0.08)' }} />
            )}
            <a href={archivo.url} target="_blank" rel="noreferrer" style={button}>Abrir en una pestaña nueva</a>
          </div>
        )}

        <a href="/catalogo" style={backLink}>← Volver a Catálogo Digital</a>
      </div>
    </main>
  );
}
