'use client';

import { useEffect } from 'react';

/**
 * Red de seguridad del panel.
 *
 * A diferencia del sitio público, acá SÍ se muestra el detalle técnico del error: el panel
 * lo usa el equipo, y saber qué falló (por ejemplo "falta una columna en la base") ahorra
 * tener que adivinar. Antes, cuando algo fallaba al guardar, la pantalla quedaba en blanco
 * y no había forma de saber por qué.
 */
export default function ErrorDelPanel({ error, reset }) {
  useEffect(() => {
    console.error('Falló una pantalla del panel:', error);
  }, [error]);

  return (
    <main style={{ padding: '28px 20px', maxWidth: '760px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 10px', fontSize: '22px' }}>Algo falló en el panel</h1>
      <p style={{ margin: '0 0 18px', lineHeight: 1.6, color: 'var(--ink-soft, #55637a)' }}>
        La acción no se completó. Nada quedó a medias: si estabas guardando, el cambio no se
        guardó. Probá de nuevo; si el error se repite, copiá el texto de abajo y mandámelo.
      </p>

      <pre
        style={{
          margin: '0 0 18px',
          padding: '14px 16px',
          borderRadius: '12px',
          background: 'var(--surface-2, #f1f4f9)',
          border: '1px solid var(--rule, #d8dfe9)',
          fontSize: '13px',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {error?.message || 'Error desconocido'}
        {error?.digest ? `\n\nReferencia: ${error.digest}` : ''}
      </pre>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            border: 0,
            borderRadius: '10px',
            padding: '11px 20px',
            fontSize: '15px',
            fontWeight: 600,
            color: '#fff',
            background: 'var(--brand-ink, #00408C)',
            cursor: 'pointer',
          }}
        >
          Probar de nuevo
        </button>
        <a
          href="/admin"
          style={{
            borderRadius: '10px',
            padding: '11px 20px',
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
            color: 'var(--brand-ink, #00408C)',
            border: '1px solid var(--rule, #d8dfe9)',
          }}
        >
          Volver al panel
        </a>
      </div>
    </main>
  );
}
