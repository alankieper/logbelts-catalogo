import { supabase } from '../lib/supabase';

export const dynamic = 'force-dynamic';

const page = { backgroundColor: '#f6f8fb', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' };
const container = { padding: '24px', maxWidth: '600px', margin: '0 auto' };
const logoImg = { height: '52px', width: 'auto', display: 'block', marginBottom: '4px' };
const subheader = { color: '#888', fontSize: '14px', marginBottom: '24px' };
const button = { backgroundColor: '#2C5AA0', color: 'white', border: 'none', borderRadius: '12px', padding: '16px 24px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box', boxShadow: '0 4px 14px rgba(44,90,160,0.25)' };
const emptyState = { color: '#999', textAlign: 'center', marginTop: '48px', fontSize: '15px' };
const card = { backgroundColor: 'white', borderRadius: '14px', padding: '18px 20px', marginTop: '16px', boxShadow: '0 2px 10px rgba(26,68,134,0.06)' };
const cardTitle = { margin: '0 0 10px 0', color: '#222', fontSize: '17px', fontWeight: '600' };
const row = { display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '13px', color: '#777' };

function colorEstado(estado) {
      const colores = { nueva: '#2C5AA0', en_analisis: '#B8860B', aprobada: '#2E8B57', en_diseno: '#7B4EA3', pendiente_revision: '#C77D00', finalizada: '#4C7A4C', rechazada: '#C0392B' };
      return colores[estado] || '#777';
}

function textoEstado(estado) {
      const textos = { nueva: 'Nueva', en_analisis: 'En analisis', aprobada: 'Aprobada', en_diseno: 'En diseno', pendiente_revision: 'Pendiente de revision', finalizada: 'Finalizada', rechazada: 'Rechazada' };
      return textos[estado] || estado;
}

function badgeStyle(estado) {
      const color = colorEstado(estado);
      return { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: color + '22', color: color, marginTop: '10px' };
}

export default async function Home() {
      const result = await supabase.from('solicitudes').select('*').order('created_at', { ascending: false });
      const solicitudes = result.data;
      const error = result.error;

  return (
          <main style={page}>
            <div style={container}>
              <img src="/logo-logbelts.png" alt="Logbelts" style={logoImg} />
            <p style={subheader}>Mejoras de Catalogo</p>

        <a href="/nueva" style={button}>+ Nueva mejora</a>

    {error && <p style={{ color: '#c0392b', marginTop: '16px' }}>Error: {error.message}</p>}

    {solicitudes && solicitudes.length === 0 && (
                  <p style={emptyState}>Todavia no hay solicitudes cargadas.</p>
             )}

    {solicitudes && solicitudes.map((s) => (
                  <div key={s.id} style={card}>
                    <h3 style={cardTitle}>{s.titulo}</h3>
                <div style={row}><span>Producto</span><span>{s.producto || '-'}</span></div>
                <div style={row}><span>Pagina</span><span>{s.pagina_catalogo || '-'}</span></div>
                <div style={row}><span>Prioridad</span><span>{s.prioridad}</span></div>
                <span style={badgeStyle(s.estado)}>{textoEstado(s.estado)}</span>
        </div>
            ))}
</div>
    </main>
  );
}
