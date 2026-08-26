'use client';

import { useState } from 'react';
import CapturaFoto from '../components/CapturaFoto';
import { pageStyle, containerStyle, heroTitleStyle, heroSubtitleStyle, cardStyle, COLOR_PRIMARY, COLOR_TEXTO, COLOR_ERROR, COLOR_OK, SHADOW_SOFT, FONT_TEXTO } from '../theme';
import { IconMejora, IconFlecha } from '../components/Icons';

const page = pageStyle;
const container = containerStyle('520px');
const card = cardStyle;
const label = { display: 'block', marginTop: '20px', marginBottom: '8px', color: '#444', fontSize: '13.5px', fontWeight: '700' };
const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e1e6f0', fontSize: '15px', boxSizing: 'border-box', outline: 'none', fontFamily: FONT_TEXTO, backgroundColor: '#fafbfe' };
const button = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: COLOR_PRIMARY, color: 'white', border: 'none', borderRadius: '14px', padding: '17px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '28px', boxShadow: SHADOW_SOFT };
const backLink = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '22px', color: 'rgba(255,255,255,0.72)', fontSize: '14px', textDecoration: 'none', fontFamily: FONT_TEXTO };
const errorText = { color: COLOR_ERROR, fontSize: '14px', marginTop: '14px', fontFamily: FONT_TEXTO };
const okText = { color: COLOR_OK, fontSize: '15px', marginTop: '4px', fontWeight: '700', textAlign: 'center', fontFamily: FONT_TEXTO };
const cardCentered = { ...card, textAlign: 'center' };

function obtenerUsuarioActual() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )logbelts_user=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function NuevaMejora() {
  const [productoCodigo, setProductoCodigo] = useState('');
  const [pagina, setPagina] = useState('');
  const [referencia, setReferencia] = useState('');
  const [instruccion, setInstruccion] = useState('');
  const [foto, setFoto] = useState(null);
  const [estado, setEstado] = useState('form'); // form | enviando | listo | error
  const [error, setError] = useState('');

  async function enviar(e) {
    e.preventDefault();
    if (!instruccion.trim()) {
      setError('Contanos qué querés cambiar.');
      return;
    }
    setError('');
    setEstado('enviando');

    const formData = new FormData();
    formData.set('vendedor', obtenerUsuarioActual() || '');
    formData.set('producto_codigo', productoCodigo);
    formData.set('pagina_catalogo', pagina);
    formData.set('referencia', referencia);
    formData.set('instruccion', instruccion);
    if (foto) formData.set('foto', foto, foto.name || 'foto.jpg');

    try {
      const res = await fetch('/api/mejoras', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || 'No se pudo enviar la mejora.');
        setEstado('form');
        return;
      }
      setEstado('listo');
    } catch (e) {
      setError('No se pudo enviar la mejora. Revisá tu conexión e intentá de nuevo.');
      setEstado('form');
    }
  }

  if (estado === 'listo') {
    return (
      <main style={page}>
        <div style={container}>
          <h1 style={heroTitleStyle}>Nueva mejora</h1>
          <div style={cardCentered}>
            <p style={okText}>¡Listo! Tu propuesta quedó pendiente de revisión.</p>
          </div>
          <a href="/" style={backLink}><IconFlecha width={15} height={15} />Volver al inicio</a>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={container}>
        <h1 style={heroTitleStyle}>Nueva mejora</h1>
        <p style={heroSubtitleStyle}>Contanos qué habría que mejorar. La IA prepara una propuesta y Alan la revisa.</p>

        <div style={card}>
          <form onSubmit={enviar}>
            <label style={label}>Código de producto</label>
            <input value={productoCodigo} onChange={(e) => setProductoCodigo(e.target.value)} style={inputStyle} placeholder="Ej: 383748" />

            <label style={label}>Página del catálogo</label>
            <input value={pagina} onChange={(e) => setPagina(e.target.value)} style={inputStyle} placeholder="Ej: 42" />

            <label style={label}>Referencia</label>
            <input value={referencia} onChange={(e) => setReferencia(e.target.value)} style={inputStyle} placeholder="Ej: Cadena 3/8" />

            <label style={label}>Foto (opcional)</label>
            <CapturaFoto onFoto={setFoto} />

            <label style={label}>¿Qué querés cambiar? *</label>
            <textarea value={instruccion} onChange={(e) => setInstruccion(e.target.value)} required rows={4} style={inputStyle} placeholder='Ej: "Cambiar esta foto" o "Cambiar el nombre a Cadena 3/8 Widia"' />

            {error && <p style={errorText}>{error}</p>}

            <button type="submit" style={{ ...button, opacity: estado === 'enviando' ? 0.6 : 1 }} disabled={estado === 'enviando'}>
              <IconMejora width={18} height={18} />
              {estado === 'enviando' ? 'Analizando con IA...' : 'Enviar mejora'}
            </button>
          </form>
        </div>

        <a href="/" style={backLink}><IconFlecha width={15} height={15} />Volver</a>
      </div>
    </main>
  );
}
