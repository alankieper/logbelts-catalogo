'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { pageStyle, containerStyle, heroTitleStyle, heroSubtitleStyle, cardStyle, COLOR_PRIMARY, COLOR_ERROR, COLOR_CEMENTO, SHADOW_SOFT, FONT_TEXTO } from '../theme';
import { IconCatalogo, IconMejora } from '../components/Icons';

const page = pageStyle;
const container = containerStyle('640px');
const card = { ...cardStyle, minHeight: '280px' };
const bigButton = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', boxSizing: 'border-box', backgroundColor: COLOR_PRIMARY, color: 'white', border: 'none', borderRadius: '14px', padding: '16px 18px', fontSize: '15.5px', fontWeight: '700', textAlign: 'center', textDecoration: 'none', cursor: 'pointer', boxShadow: SHADOW_SOFT, marginTop: '14px' };
const errorText = { color: COLOR_ERROR, fontSize: '14px' };

export default function CatalogoDigital() {
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
        <h1 style={heroTitleStyle}><IconCatalogo width={26} height={26} style={{ verticalAlign: '-4px', marginRight: '8px' }} />Catálogo Digital</h1>
        <p style={heroSubtitleStyle}>Mirá el catálogo vigente de Logbelts.</p>

        <div style={card}>
          {loading && <p style={{ color: COLOR_CEMENTO, fontFamily: FONT_TEXTO }}>Cargando...</p>}

          {!loading && error && <p style={errorText}>{error}</p>}

          {!loading && !error && !archivo && (
            <div>
              <p style={{ color: '#555', fontFamily: FONT_TEXTO }}>Todavía no se cargó el catálogo digital.</p>
              <a href="/nueva" style={bigButton}><IconMejora width={17} height={17} />Proponer una mejora</a>
            </div>
          )}

          {!loading && archivo && (
            <div>
              <p style={{ color: COLOR_CEMENTO, fontSize: '12.5px', marginBottom: '10px', fontFamily: FONT_TEXTO }}>{archivo.nombre}</p>
              {esPdf ? (
                <iframe
                  src={archivo.url}
                  title="Catálogo"
                  style={{ width: '100%', height: '65vh', border: '1px solid #e2e7ef', borderRadius: '14px', backgroundColor: 'white' }}
                />
              ) : (
                <img src={archivo.url} alt="Catálogo" style={{ width: '100%', borderRadius: '14px' }} />
              )}
              <a href={archivo.url} target="_blank" rel="noreferrer" style={bigButton}>Abrir en una pestaña nueva</a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
