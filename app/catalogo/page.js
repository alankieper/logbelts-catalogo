const page = { backgroundColor: '#f6f8fb', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' };
const container = { padding: '28px 20px', maxWidth: '480px', margin: '0 auto' };
const title = { color: '#1A4486', fontSize: '24px', marginBottom: '4px', textAlign: 'center' };
const subtitle = { color: '#888', fontSize: '14px', marginBottom: '30px', textAlign: 'center' };

const bigButton = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: '#2C5AA0',
  color: 'white',
  border: 'none',
  borderRadius: '14px',
  padding: '22px 20px',
  fontSize: '17px',
  fontWeight: '700',
  textAlign: 'center',
  textDecoration: 'none',
  marginBottom: '16px',
  boxShadow: '0 4px 14px rgba(44,90,160,0.25)',
};

const secondaryButton = {
  ...bigButton,
  backgroundColor: 'white',
  color: '#2C5AA0',
  border: '2px solid #2C5AA0',
  boxShadow: 'none',
};

export default function CatalogoDigital() {
  return (
    <main style={page}>
      <div style={container}>
        <h1 style={title}>CATÁLOGO DIGITAL</h1>
        <p style={subtitle}>Mirá el catálogo y subí fotos o archivos para proponer mejoras.</p>

        <a href="/catalogo/ver" style={secondaryButton}>📖 Ver catálogo</a>
        <a href="/catalogo/camara" style={bigButton}>📷 CÁMARA</a>
        <a href="/catalogo/cargar" style={bigButton}>📁 CARGAR ARCHIVOS</a>
      </div>
    </main>
  );
}
