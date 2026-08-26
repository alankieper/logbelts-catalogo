'use client';

import { COLOR_PRIMARY, COLOR_TEXTO, FONT_TEXTO } from '../theme';

const userButton = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: '#f4f7fc',
  border: 'none',
  borderRadius: '16px',
  padding: '14px 16px',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: FONT_TEXTO,
};

const avatar = {
  flexShrink: 0,
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: COLOR_PRIMARY,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: '800',
};

const nombreEstilo = { color: COLOR_TEXTO, fontSize: '16px', fontWeight: '700' };

function iniciales(nombre) {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase();
}

function entrarComo(nombre) {
  document.cookie = `logbelts_user=${encodeURIComponent(nombre)}; path=/; max-age=${60 * 60 * 24 * 400}`;
  window.location.href = '/';
}

export default function EntrarComoBoton({ nombre }) {
  return (
    <button type="button" style={userButton} onClick={() => entrarComo(nombre)}>
      <span style={avatar}>{iniciales(nombre)}</span>
      <span style={nombreEstilo}>{nombre}</span>
    </button>
  );
}
