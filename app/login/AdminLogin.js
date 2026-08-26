'use client';

import { useState } from 'react';
import { COLOR_PRIMARY, COLOR_TEXTO, COLOR_ERROR, FONT_TEXTO } from '../theme';
import { IconAdmin } from '../components/Icons';

const separador = { display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 12px', color: '#bbb', fontSize: '12px', fontFamily: FONT_TEXTO };
const linea = { flex: 1, height: '1px', backgroundColor: '#eee' };
const toggleButton = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', boxSizing: 'border-box', backgroundColor: 'white', border: `1.5px solid ${COLOR_PRIMARY}`, color: COLOR_PRIMARY, borderRadius: '16px', padding: '14px 16px', cursor: 'pointer', fontFamily: FONT_TEXTO, fontSize: '15px', fontWeight: '700' };
const form = { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' };
const input = { width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e1e6f0', fontSize: '15px', outline: 'none', fontFamily: FONT_TEXTO, backgroundColor: '#fafbfe', color: COLOR_TEXTO };
const entrarBtn = { backgroundColor: COLOR_PRIMARY, color: 'white', border: 'none', borderRadius: '14px', padding: '13px', fontSize: '14.5px', fontWeight: '700', cursor: 'pointer', fontFamily: FONT_TEXTO };
const cancelarBtn = { backgroundColor: 'transparent', color: '#888', border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: FONT_TEXTO, padding: '4px' };
const errorText = { color: COLOR_ERROR, fontSize: '13px', margin: 0, fontFamily: FONT_TEXTO };

export default function AdminLogin() {
  const [abierto, setAbierto] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || 'No se pudo iniciar sesión.');
        setEnviando(false);
        return;
      }
      window.location.href = '/';
    } catch (e) {
      setError('No se pudo iniciar sesión. Revisá tu conexión.');
      setEnviando(false);
    }
  }

  if (!abierto) {
    return (
      <>
        <div style={separador}><span style={linea} /><span>o</span><span style={linea} /></div>
        <button type="button" style={toggleButton} onClick={() => setAbierto(true)}>
          <IconAdmin width={18} height={18} />
          Entrar como Admin
        </button>
      </>
    );
  }

  return (
    <>
      <div style={separador}><span style={linea} /><span>Admin</span><span style={linea} /></div>
      <form onSubmit={entrar} style={form}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoFocus
          style={input}
        />
        {error && <p style={errorText}>{error}</p>}
        <button type="submit" style={{ ...entrarBtn, opacity: enviando ? 0.6 : 1 }} disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="button" style={cancelarBtn} onClick={() => { setAbierto(false); setError(''); setPassword(''); }}>Cancelar</button>
      </form>
    </>
  );
}
