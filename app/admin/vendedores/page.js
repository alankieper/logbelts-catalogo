import { supabase } from '../../../lib/supabase';
import { agregarVendedor, cambiarActivo } from './actions';
import { pageStyle, containerStyle, heroTitleStyle, heroSubtitleStyle, cardStyle, COLOR_PRIMARY, COLOR_TEXTO, COLOR_CEMENTO, SHADOW_SOFT, FONT_TEXTO } from '../../theme';
import { IconFlecha } from '../../components/Icons';

export const dynamic = 'force-dynamic';

const page = pageStyle;
const container = containerStyle('480px');
const card = { ...cardStyle, padding: '10px 22px' };
const fila = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f0f2f6' };
const avatar = { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: COLOR_PRIMARY, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13.5px', fontWeight: '800', flexShrink: 0 };
const nombreRow = { display: 'flex', alignItems: 'center', gap: '12px' };
const nombreEstilo = (activo) => ({ fontSize: '15px', fontWeight: '700', color: activo ? COLOR_TEXTO : '#aaa', textDecoration: activo ? 'none' : 'line-through' });
const botonToggle = (activo) => ({ backgroundColor: activo ? 'white' : COLOR_PRIMARY, color: activo ? '#c0392b' : 'white', border: activo ? '2px solid #f0d3d3' : 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', fontFamily: FONT_TEXTO });
const formNuevo = { display: 'flex', gap: '10px', marginTop: '22px' };
const input = { flex: 1, padding: '14px 16px', borderRadius: '14px', border: '1px solid #e1e6f0', fontSize: '15px', outline: 'none', fontFamily: FONT_TEXTO, backgroundColor: 'white' };
const botonAgregar = { backgroundColor: COLOR_PRIMARY, color: 'white', border: 'none', borderRadius: '14px', padding: '0 22px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: SHADOW_SOFT };
const link = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginTop: '30px', color: 'white', fontWeight: '700', textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px', padding: '14px' };
const emptyState = { color: COLOR_CEMENTO, textAlign: 'center', fontSize: '14px', padding: '18px 0', fontFamily: FONT_TEXTO };

function iniciales(nombre) {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase();
}

export default async function Vendedores() {
  const result = await supabase.from('vendedores').select('*').order('nombre');
  const vendedores = result.data || [];

  return (
    <main style={page}>
      <div style={container}>
        <h1 style={heroTitleStyle}>Vendedores</h1>
        <p style={heroSubtitleStyle}>Alta y baja de perfiles del equipo comercial.</p>

        <div style={card}>
          {vendedores.length === 0 && <p style={emptyState}>No hay vendedores cargados.</p>}
          {vendedores.map((v) => (
            <div key={v.id} style={fila}>
              <span style={nombreRow}>
                <span style={avatar}>{iniciales(v.nombre)}</span>
                <span style={nombreEstilo(v.activo)}>{v.nombre}</span>
              </span>
              <form action={cambiarActivo}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="activo" value={String(v.activo)} />
                <button type="submit" style={botonToggle(v.activo)}>{v.activo ? 'Desactivar' : 'Activar'}</button>
              </form>
            </div>
          ))}
        </div>

        <form action={agregarVendedor} style={formNuevo}>
          <input name="nombre" required style={input} placeholder="Nombre del nuevo vendedor" />
          <button type="submit" style={botonAgregar}>Agregar</button>
        </form>

        <a href="/admin" style={link}><IconFlecha width={16} height={16} />Volver al panel</a>
      </div>
    </main>
  );
}
