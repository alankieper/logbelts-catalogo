import { supabase } from '../../lib/supabase';
import { pageStyle, containerStyle, heroTitleStyle, heroSubtitleStyle, cardStyle, COLOR_TEXT_LIGHT_MUTED, FONT_TEXTO } from '../theme';
import EntrarComoBoton from './EntrarComoBoton';
import AdminLogin from './AdminLogin';

export const dynamic = 'force-dynamic';

const page = { ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const container = { ...containerStyle('420px'), padding: '20px' };
const logoImg = { height: '38px', width: 'auto', display: 'block', margin: '0 auto 22px' };
const card = { ...cardStyle };
const grid = { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '18px' };
const emptyState = { color: '#999', textAlign: 'center', fontSize: '14px', fontFamily: FONT_TEXTO };

export default async function Login() {
  const result = await supabase.from('vendedores').select('nombre').eq('activo', true).order('nombre');
  const vendedores = result.data || [];

  return (
    <main style={page}>
      <div style={container}>
        <img src="/logo-blanco.png" alt="Logbelts" style={logoImg} />
        <h1 style={heroTitleStyle}>Cataloplus</h1>
        <p style={heroSubtitleStyle}>¿Quién sos?</p>
        <div style={card}>
          {vendedores.length === 0 && <p style={emptyState}>No hay vendedores cargados todavía. Pedile a un administrador que agregue uno en /admin/vendedores.</p>}
          <div style={grid}>
            {vendedores.map((v) => (
              <EntrarComoBoton key={v.nombre} nombre={v.nombre} />
            ))}
          </div>
          <AdminLogin />
        </div>
      </div>
    </main>
  );
}
