import { supabase } from '../../lib/supabase';
import { revisarMejora } from './actions';
import { pageStyle, containerStyle, heroTitleStyle, heroSubtitleStyle, cardStyle, COLOR_PRIMARY, COLOR_TEXTO, COLOR_CEMENTO, iaBoxStyle, SHADOW_SOFT, FONT_TEXTO } from '../theme';
import { IconCheck, IconX, IconVendedores, IconFlecha } from '../components/Icons';

export const dynamic = 'force-dynamic';

const page = pageStyle;
const container = containerStyle('740px');
const statsRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' };
const statCard = { ...cardStyle, boxSizing: 'border-box', padding: '18px', textAlign: 'center' };
const statNumber = { fontSize: '28px', fontWeight: '800', color: COLOR_PRIMARY };
const statLabel = { fontSize: '12.5px', color: COLOR_CEMENTO, marginTop: '4px', fontWeight: '600' };
const sectionTitle = { fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: '32px 0 14px', display: 'flex', alignItems: 'center', gap: '8px' };
const card = { ...cardStyle, padding: '22px 22px', marginBottom: '16px' };
const metaRow = { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: COLOR_CEMENTO, margin: '4px 0' };
const instruccionText = { fontSize: '14.5px', color: '#333', marginTop: '14px', lineHeight: '1.5' };
const iaLabel = { fontSize: '11.5px', fontWeight: '800', color: COLOR_PRIMARY, textTransform: 'uppercase', letterSpacing: '0.5px' };
const iaTexto = { fontSize: '14px', color: '#333', marginTop: '6px', lineHeight: '1.5' };
const foto = { width: '100%', maxWidth: '320px', borderRadius: '14px', marginTop: '14px', display: 'block' };
const botones = { display: 'flex', gap: '12px', marginTop: '20px' };
const botonAprobar = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', backgroundColor: '#2E8B57', color: 'white', border: 'none', borderRadius: '12px', padding: '13px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: FONT_TEXTO, textDecoration: 'none', boxSizing: 'border-box' };
const botonRechazar = { ...botonAprobar, backgroundColor: 'white', color: '#c0392b', border: '2px solid #f0d3d3' };
const emptyState = { color: COLOR_CEMENTO, textAlign: 'center', fontSize: '14px', padding: '8px 0', fontFamily: FONT_TEXTO };
const link = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginTop: '30px', color: 'white', fontWeight: '700', textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px', padding: '14px' };

export default async function AdminPanel() {
  const [pendientesRes, todasRes] = await Promise.all([
    supabase.from('mejoras').select('*').eq('estado', 'pendiente').order('created_at', { ascending: true }),
    supabase.from('mejoras').select('estado, vendedor'),
  ]);

  const pendientes = pendientesRes.data || [];
  const todas = todasRes.data || [];

  const aprobadas = todas.filter((m) => m.estado === 'aprobada').length;
  const rechazadas = todas.filter((m) => m.estado === 'rechazada').length;

  const porVendedor = todas.reduce((acc, m) => {
    acc[m.vendedor] = (acc[m.vendedor] || 0) + 1;
    return acc;
  }, {});

  return (
    <main style={page}>
      <div style={container}>
        <h1 style={heroTitleStyle}>Panel de administración</h1>
        <p style={heroSubtitleStyle}>Revisá las mejoras propuestas por el equipo comercial.</p>

        <div style={statsRow}>
          <div style={statCard}><div style={statNumber}>{pendientes.length}</div><div style={statLabel}>Pendientes</div></div>
          <div style={statCard}><div style={statNumber}>{aprobadas}</div><div style={statLabel}>Aprobadas</div></div>
          <div style={statCard}><div style={statNumber}>{rechazadas}</div><div style={statLabel}>Rechazadas</div></div>
          <div style={statCard}><div style={statNumber}>{todas.length}</div><div style={statLabel}>Total</div></div>
        </div>

        {Object.keys(porVendedor).length > 0 && (
          <>
            <h2 style={sectionTitle}><IconVendedores width={16} height={16} />Por vendedor</h2>
            <div style={card}>
              {Object.entries(porVendedor).map(([nombre, cantidad]) => (
                <div key={nombre} style={metaRow}><span>{nombre}</span><span>{cantidad}</span></div>
              ))}
            </div>
          </>
        )}

        <h2 style={sectionTitle}>Pendientes de revisión</h2>

        {pendientes.length === 0 && <div style={card}><p style={emptyState}>No hay mejoras pendientes.</p></div>}

        {pendientes.map((m) => (
          <div key={m.id} style={card}>
            <div style={metaRow}><span>Vendedor</span><span>{m.vendedor}</span></div>
            <div style={metaRow}><span>Producto</span><span>{m.producto_codigo || '-'}</span></div>
            <div style={metaRow}><span>Página</span><span>{m.pagina_catalogo || '-'}</span></div>
            <div style={metaRow}><span>Referencia</span><span>{m.referencia || '-'}</span></div>

            <p style={instruccionText}><strong>Pidió:</strong> {m.instruccion}</p>

            {m.foto_url && <img src={m.foto_url} alt="Foto de referencia" style={foto} />}

            {m.ia_resumen && (
              <div style={{ ...iaBoxStyle, marginTop: '14px' }}>
                <div style={iaLabel}>Propuesta de la IA {m.ia_tipo_cambio ? `· ${m.ia_tipo_cambio}` : ''}</div>
                <div style={iaTexto}>{m.ia_resumen}</div>
              </div>
            )}

            <div style={botones}>
              <a href={`/admin/mejoras/${m.id}/aplicar`} style={botonAprobar}><IconCheck width={16} height={16} />Revisar y aplicar</a>
              <form action={revisarMejora}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" name="decision" value="rechazada" style={botonRechazar}><IconX width={16} height={16} />Rechazar</button>
              </form>
            </div>
          </div>
        ))}

        <a href="/admin/vendedores" style={link}><IconVendedores width={16} height={16} />Gestionar vendedores</a>
      </div>
    </main>
  );
}
