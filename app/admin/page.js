import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

const ADMIN = 'Alan Kieper';

const page = { backgroundColor: '#f6f8fb', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' };
const container = { padding: '24px', maxWidth: '820px', margin: '0 auto' };
const headerRow = { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' };
const title = { color: '#1A4486', fontSize: '24px', margin: 0, fontWeight: '800' };
const backLink = { color: '#2C5AA0', fontSize: '14px', fontWeight: '600', textDecoration: 'none' };
const subheader = { color: '#888', fontSize: '14px', marginBottom: '24px' };

const kpiRow = { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' };
const kpiCard = { flex: '1 1 140px', backgroundColor: 'white', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 10px rgba(26,68,134,0.06)' };
const kpiNumber = { fontSize: '28px', fontWeight: '800', color: '#1A4486', margin: 0 };
const kpiLabel = { fontSize: '13px', color: '#888', marginTop: '4px' };

const section = { backgroundColor: 'white', borderRadius: '14px', padding: '20px 22px', marginBottom: '18px', boxShadow: '0 2px 10px rgba(26,68,134,0.06)' };
const sectionTitle = { color: '#222', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' };

const barRow = { marginBottom: '12px' };
const barLabelRow = { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#444', marginBottom: '4px' };
const barTrack = { backgroundColor: '#eef1f6', borderRadius: '8px', height: '10px', overflow: 'hidden' };

const listItem = { display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f0f2f6', fontSize: '13px' };
const listItemLast = { ...listItem, borderBottom: 'none' };
const badgeStyle = (color) => ({ display: 'inline-block', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: color + '22', color, marginLeft: '6px' });

const emptyState = { color: '#999', fontSize: '13px', padding: '8px 0' };

const COLORES_ESTADO = { nueva: '#2C5AA0', en_analisis: '#B8860B', aprobada: '#2E8B57', en_diseno: '#7B4EA3', pendiente_revision: '#C77D00', finalizada: '#4C7A4C', rechazada: '#C0392B' };
const TEXTO_ESTADO = { nueva: 'Nueva', en_analisis: 'En analisis', aprobada: 'Aprobada', en_diseno: 'En diseno', pendiente_revision: 'Pendiente de revision', finalizada: 'Finalizada', rechazada: 'Rechazada' };

function contarPor(items, campo, vacio) {
  const conteo = {};
  for (const item of items) {
    const valor = item[campo] || vacio;
    conteo[valor] = (conteo[valor] || 0) + 1;
  }
  return Object.entries(conteo).sort((a, b) => b[1] - a[1]);
}

function BarraLista({ datos, colorBarra }) {
  if (!datos || datos.length === 0) {
    return <p style={emptyState}>Todavia no hay datos.</p>;
  }
  const max = datos[0][1];
  return (
    <div>
      {datos.map(([nombre, cantidad]) => (
        <div key={nombre} style={barRow}>
          <div style={barLabelRow}>
            <span>{nombre}</span>
            <span style={{ fontWeight: '700', color: '#1A4486' }}>{cantidad}</span>
          </div>
          <div style={barTrack}>
            <div style={{ width: `${Math.max(6, (cantidad / max) * 100)}%`, backgroundColor: colorBarra, height: '100%', borderRadius: '8px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AdminPage() {
  const cookieStore = cookies();
  const usuarioCookie = cookieStore.get('logbelts_user');
  const usuario = usuarioCookie ? decodeURIComponent(usuarioCookie.value) : null;

  if (usuario !== ADMIN) {
    redirect('/');
  }

  const [solicitudesRes, materialRes] = await Promise.all([
    supabase.from('solicitudes').select('*').order('created_at', { ascending: false }),
    supabase.from('catalogo_material').select('*').order('created_at', { ascending: false }),
  ]);

  const solicitudes = solicitudesRes.data || [];
  const material = materialRes.data || [];

  const porVendedor = contarPor(solicitudes, 'creado_por', 'Sin dato (mejoras anteriores)');
  const porProducto = contarPor(solicitudes.filter((s) => s.producto), 'producto', 'Sin producto').slice(0, 8);
  const porEstado = contarPor(solicitudes, 'estado', 'nueva');
  const materialPorVendedor = contarPor(material, 'creado_por', 'Sin dato');

  const recientes = solicitudes.slice(0, 8);

  return (
    <main style={page}>
      <div style={container}>
        <div style={headerRow}>
          <h1 style={title}>Panel de administrador</h1>
          <a href="/" style={backLink}>Volver al inicio</a>
        </div>
        <p style={subheader}>Estadisticas de mejoras del catalogo y material cargado</p>

        <div style={kpiRow}>
          <div style={kpiCard}>
            <p style={kpiNumber}>{solicitudes.length}</p>
            <p style={kpiLabel}>Mejoras solicitadas</p>
          </div>
          <div style={kpiCard}>
            <p style={kpiNumber}>{porVendedor.length}</p>
            <p style={kpiLabel}>Vendedores activos</p>
          </div>
          <div style={kpiCard}>
            <p style={kpiNumber}>{material.length}</p>
            <p style={kpiLabel}>Archivos / fotos cargados</p>
          </div>
          <div style={kpiCard}>
            <p style={kpiNumber}>{(porEstado.find((e) => e[0] === 'aprobada') || [null, 0])[1]}</p>
            <p style={kpiLabel}>Mejoras aprobadas</p>
          </div>
        </div>

        <div style={section}>
          <h2 style={sectionTitle}>Mejoras pedidas por vendedor</h2>
          <BarraLista datos={porVendedor} colorBarra="#2C5AA0" />
        </div>

        <div style={section}>
          <h2 style={sectionTitle}>Productos con mas mejoras pedidas</h2>
          <BarraLista datos={porProducto} colorBarra="#7B4EA3" />
        </div>

        <div style={section}>
          <h2 style={sectionTitle}>Material cargado por vendedor (fotos / archivos)</h2>
          <BarraLista datos={materialPorVendedor} colorBarra="#2E8B57" />
        </div>

        <div style={section}>
          <h2 style={sectionTitle}>Ultimas mejoras pedidas</h2>
          {recientes.length === 0 && <p style={emptyState}>Todavia no hay mejoras cargadas.</p>}
          {recientes.map((s, i) => (
            <div key={s.id} style={i === recientes.length - 1 ? listItemLast : listItem}>
              <div>
                <div style={{ fontWeight: '600', color: '#222' }}>{s.titulo}</div>
                <div style={{ color: '#999', marginTop: '2px' }}>
                  {s.creado_por || 'Sin dato'} · {s.producto || 'Sin producto'}
                </div>
              </div>
              <span style={badgeStyle(COLORES_ESTADO[s.estado] || '#777')}>{TEXTO_ESTADO[s.estado] || s.estado}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
