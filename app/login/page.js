'use client';

const USUARIOS = ['Flor Lastra', 'Gaston', 'Flor Faubel', 'Alan Kieper'];

const page = { backgroundColor: '#f6f8fb', minHeight: '100vh' };
const card = { maxWidth: '380px', margin: '90px auto', padding: '36px 32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(26,68,134,0.08)', fontFamily: 'system-ui, sans-serif' };
const logoImg = { height: '46px', width: 'auto', display: 'block', margin: '0 auto 4px auto' };
const subtitle = { color: '#888', textAlign: 'center', marginBottom: '28px', fontSize: '14px' };
const userButton = { display: 'block', width: '100%', boxSizing: 'border-box', backgroundColor: '#f0f4fa', color: '#1A4486', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px', textAlign: 'center' };

function entrarComo(nombre) {
  document.cookie = `logbelts_user=${encodeURIComponent(nombre)}; path=/; max-age=${60 * 60 * 24 * 400}`;
  window.location.href = '/';
}

export default function Login() {
  return (
    <main style={page}>
      <div style={card}>
        <img src="/logo-logbelts.png" alt="Logbelts" style={logoImg} />
        <p style={subtitle}>¿Quién sos?</p>
        {USUARIOS.map((nombre) => (
          <button key={nombre} type="button" style={userButton} onClick={() => entrarComo(nombre)}>
            {nombre}
          </button>
        ))}
      </div>
    </main>
  );
}
