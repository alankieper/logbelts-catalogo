'use client';

import { useEffect } from 'react';

/**
 * Último recinto de seguridad: se usa sólo si falla algo tan de base que ni siquiera se puede
 * armar el marco del sitio (encabezado y pie). Por eso lleva su propio <html> y estilos propios,
 * sin depender de nada más.
 */
export default function ErrorGrave({ error, reset }) {
  useEffect(() => {
    console.error('Falló el marco del sitio:', error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#f6f8fb',
          color: '#10233f',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        }}
      >
        <div style={{ maxWidth: '520px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#5b6b83' }}>
            Logbelts
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: '26px', fontWeight: 700 }}>La web no está respondiendo</h1>
          <p style={{ margin: '0 0 22px', lineHeight: 1.6, color: '#3d5a80' }}>
            Estamos con un problema momentáneo. Probá de nuevo en unos segundos.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: 0,
              borderRadius: '10px',
              padding: '12px 22px',
              fontSize: '15px',
              fontWeight: 600,
              color: '#fff',
              background: '#00408C',
              cursor: 'pointer',
            }}
          >
            Probar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
