'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

const card = { maxWidth: '380px', margin: '90px auto', padding: '36px 32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(26,68,134,0.08)', fontFamily: 'system-ui, sans-serif' };
const page = { backgroundColor: '#f6f8fb', minHeight: '100vh' };
const title = { color: '#1A4486', fontSize: '22px', textAlign: 'center', marginBottom: '4px' };
const subtitle = { color: '#888', textAlign: 'center', marginBottom: '28px', fontSize: '14px' };
const label = { display: 'block', marginBottom: '6px', color: '#444', fontSize: '14px', fontWeight: '600' };
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #dde3ec', fontSize: '15px', boxSizing: 'border-box', outline: 'none' };
const button = { backgroundColor: '#2C5AA0', color: 'white', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '18px' };
const errorText = { color: '#c0392b', fontSize: '13px', marginTop: '8px' };

export default function Login() {
  const [email, setEmail] = useState('');
    const [enviado, setEnviado] = useState(false);
      const [error, setError] = useState('');
        const [cargando, setCargando] = useState(false);

          async function handleSubmit(e) {
              e.preventDefault();
                  setError('');
                      setCargando(true);
                          const supabase = createClient();
                              const redirectUrl = window.location.origin + '/auth/confirm';
                                  const result = await supabase.auth.signInWithOtp({ email: email, options: { emailRedirectTo: redirectUrl } });
                                      setCargando(false);
                                          if (result.error) {
                                                setError('Hubo un problema. Intenta de nuevo en un momento.');
                                                    } else {
                                                          setEnviado(true);
                                                              }
                                                                }

                                                                  if (enviado) {
                                                                      return (
                                                                            <main style={page}>
                                                                                    <div style={card}>
                                                                                              <h1 style={title}>Revisa tu email</h1>
                                                                                                        <p style={subtitle}>Te enviamos un link a {email}. Tocalo para entrar.</p>
                                                                                                                </div>
                                                                                                                      </main>
                                                                                                                          );
                                                                                                                            }
                                                                                                                            
                                                                                                                              return (
                                                                                                                                  <main style={page}>
                                                                                                                                        <div style={card}>
                                                                                                                                                <h1 style={title}>Logbelts</h1>
                                                                                                                                                        <p style={subtitle}>Mejoras de Catalogo</p>
                                                                                                                                                                <form onSubmit={handleSubmit}>
                                                                                                                                                                          <label style={label}>Tu email</label>
                                                                                                                                                                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" style={inputStyle} />
                                                                                                                                                                                              {error && <p style={errorText}>{error}</p>}
                                                                                                                                                                                                        <button type="submit" disabled={cargando} style={button}>{cargando ? 'Enviando...' : 'Ingresar'}</button>
                                                                                                                                                                                                                </form>
                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                          </main>
                                                                                                                                                                                                                            );
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                            
