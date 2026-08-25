import { supabase } from '../lib/supabase';

export default async function Home() {
  const { data: solicitudes, error } = await supabase
    .from('solicitudes')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#1A4486' }}>Logbelts – Mejoras de Catálogo</h1>

      <button style={{
        backgroundColor: '#1A4486',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '14px 24px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '100%',
        marginTop: '16px',
        marginBottom: '24px'
      }}>
        + Nueva mejora
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}

      {solicitudes && solicitudes.length === 0 && (
        <p style={{ color: '#666' }}>Todavía no hay solicitudes cargadas.</p>
      )}

      {solicitudes && solicitudes.map((s) => (
        <div key={s.id} style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '12px'
        }}>
          <h3 style={{ margin: '0 0 8px 0' }}>{s.titulo}</h3>
          <p style={{ margin: '4px 0', color: '#555' }}>Producto: {s.producto || '-'}</p>
          <p style={{ margin: '4px 0', color: '#555' }}>Página: {s.pagina_catalogo || '-'}</p>
          <p style={{ margin: '4px 0', color: '#555' }}>Estado: {s.estado}</p>
          <p style={{ margin: '4px 0', color: '#555' }}>Prioridad: {s.prioridad}</p>
        </div>
      ))}
    </main>
  );
}
