import { crearSolicitud } from './actions';

const page = { backgroundColor: '#f6f8fb', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '24px' };
const card = { maxWidth: '480px', margin: '0 auto', padding: '32px 28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(26,68,134,0.08)' };
const title = { color: '#1A4486', fontSize: '22px', marginBottom: '4px' };
const subtitle = { color: '#888', fontSize: '14px', marginBottom: '24px' };
const label = { display: 'block', marginTop: '18px', marginBottom: '6px', color: '#444', fontSize: '14px', fontWeight: '600' };
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #dde3ec', fontSize: '15px', boxSizing: 'border-box', outline: 'none', fontFamily: 'system-ui, sans-serif' };
const button = { backgroundColor: '#2C5AA0', color: 'white', border: 'none', borderRadius: '12px', padding: '15px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '26px', boxShadow: '0 4px 14px rgba(44,90,160,0.25)' };
const backLink = { display: 'block', textAlign: 'center', marginTop: '18px', color: '#888', fontSize: '14px', textDecoration: 'none' };

export default function NuevaMejora() {
    return (
          <main style={page}>
            <div style={card}>
              <h1 style={title}>Nueva mejora</h1>
          <p style={subtitle}>Contanos que habria que mejorar</p>

        <form action={crearSolicitud}>
                <label style={label}>Titulo *</label>
            <input name="titulo" required style={inputStyle} placeholder="Ej: Falta medida de cadena" />

                <label style={label}>Producto</label>
            <input name="producto" style={inputStyle} placeholder="Ej: Cadena 3/8" />

                <label style={label}>Pagina del catalogo</label>
            <input name="pagina_catalogo" style={inputStyle} placeholder="Ej: 42" />

                <label style={label}>Descripcion *</label>
            <textarea name="descripcion" required rows={4} style={inputStyle} placeholder="Contanos que habria que mejorar" />

                <label style={label}>Prioridad</label>
            <select name="prioridad" defaultValue="media" style={inputStyle}>
                  <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
      </select>

          <button type="submit" style={button}>Enviar mejora</button>
      </form>

        <a href="/" style={backLink}>Volver</a>
      </div>
      </main>
    );
}
