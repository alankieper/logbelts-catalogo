import { supabase } from '../../../../../lib/supabase';
import { pageStyle, containerStyle, heroTitleStyle, heroSubtitleStyle, cardStyle, COLOR_CEMENTO, FONT_TEXTO } from '../../../../theme';
import MarcarRegion from './MarcarRegion';

export const dynamic = 'force-dynamic';

const page = pageStyle;
const container = containerStyle('720px');
const card = { ...cardStyle, textAlign: 'center' };
const emptyState = { color: COLOR_CEMENTO, fontSize: '14.5px', fontFamily: FONT_TEXTO, lineHeight: '1.5' };

export default async function AplicarMejora({ params }) {
  const mejoraRes = await supabase.from('mejoras').select('*').eq('id', params.id).single();
  const mejora = mejoraRes.data;

  const listado = await supabase.storage.from('catalogo-digital').list('', {
    limit: 50,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  const archivos = (listado.data || []).filter((f) => f.name && !f.name.startsWith('.'));
  const catalogoUrl = archivos.length > 0
    ? supabase.storage.from('catalogo-digital').getPublicUrl(archivos[0].name).data.publicUrl
    : null;

  if (!mejora) {
    return (
      <main style={page}>
        <div style={container}>
          <h1 style={heroTitleStyle}>Mejora no encontrada</h1>
          <div style={card}><p style={emptyState}>Puede que ya haya sido revisada. <a href="/admin" style={{ color: 'inherit' }}>Volver al panel</a>.</p></div>
        </div>
      </main>
    );
  }

  if (!catalogoUrl) {
    return (
      <main style={page}>
        <div style={container}>
          <h1 style={heroTitleStyle}>Aplicar mejora</h1>
          <div style={card}><p style={emptyState}>Todavía no hay ningún catálogo digital cargado — subí uno primero desde /catalogo antes de poder aplicar cambios. <a href="/admin" style={{ color: 'inherit' }}>Volver al panel</a>.</p></div>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={container}>
        <h1 style={heroTitleStyle}>Aplicar mejora</h1>
        <p style={heroSubtitleStyle}>Marcá el recuadro exacto de la página a cambiar. Se genera una nueva versión del catálogo con el cambio aplicado ahí.</p>
        <MarcarRegion mejora={mejora} catalogoUrl={catalogoUrl} />
      </div>
    </main>
  );
}
