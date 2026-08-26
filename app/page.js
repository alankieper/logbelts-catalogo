import { supabase } from '../lib/supabase';
import { pageStyle, containerStyle, heroTitleStyle, heroSubtitleStyle, cardStyle, COLOR_PRIMARY, COLOR_TEXTO, COLOR_CEMENTO, COLOR_ERROR, SHADOW_SOFT, FONT_TEXTO } from './theme';
import { IconMejora } from './components/Icons';

export const dynamic = 'force-dynamic';

const page = pageStyle;
const container = containerStyle('600px');
const button = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#ffffff', color: COLOR_PRIMARY, border: 'none', borderRadius: '16px', padding: '18px 24px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', width: '100%', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box', boxShadow: SHADOW_SOFT, marginBottom: '28px' };
const emptyState = { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: '48px', fontSize: '15px' };
const card = { ...cardStyle, padding: '20px 22px', marginBottom: '16px' };
const cardTitle = { margin: '0 0 12px 0', color: COLOR_TEXTO, fontSize: '17px', fontWeight: '800' };
const row = { display: 'flex', justifyContent: 'space-between', margin: '5px 0', fontSize: '13px', color: COLOR_CEMENTO };
const resumen = { color: '#4a5568', fontSize: '13.5px', marginTop: '12px', lineHeight: '1.5', backgroundColor: '#f4f7fc', borderRadius: '12px', padding: '12px 14px' };

function colorEstado(estado) {
  const colores = { pendiente: '#B8860B', aprobada: '#2E8B57', rechazada: '#C0392B' };
  return colores[estado] || '#777';
}

function textoEstado(estado) {
  const textos = { pendiente: 'Pendiente de revisión', aprobada: 'Aprobada', rechazada: 'Rechazada' };
  return textos[estado] || estado;
}

function badgeStyle(estado) {
  const color = colorEstado(estado);
  return { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: color + '1c', color, marginTop: '12px' };
}

export default async function Home() {
  const result = await supabase.from('mejoras').select('*').order('created_at', { ascending: false }).limit(30);
  const mejoras = result.data;
  const error = result.error;

  return (
    <main style={page}>
      <div style={container}>
        <h1 style={heroTitleStyle}>Cataloplus</h1>
        <p style={heroSubtitleStyle}>Mejoras del catálogo, propuestas por el equipo</p>

        <a href="/nueva" style={button}><IconMejora width={19} height={19} />Nueva mejora</a>

        {error && <p style={{ color: COLOR_ERROR, textAlign: 'center', fontFamily: FONT_TEXTO }}>Error: {error.message}</p>}

        {mejoras && mejoras.length === 0 && (
          <p style={emptyState}>Todavía no hay mejoras propuestas.</p>
        )}

        {mejoras && mejoras.map((m) => (
          <div key={m.id} style={card}>
            <h3 style={cardTitle}>{m.referencia || m.producto_codigo || 'Mejora'}</h3>
            <div style={row}><span>Vendedor</span><span>{m.vendedor}</span></div>
            <div style={row}><span>Producto</span><span>{m.producto_codigo || '-'}</span></div>
            <div style={row}><span>Página</span><span>{m.pagina_catalogo || '-'}</span></div>
            <span style={badgeStyle(m.estado)}>{textoEstado(m.estado)}</span>
            {m.ia_resumen && <p style={resumen}>{m.ia_resumen}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
