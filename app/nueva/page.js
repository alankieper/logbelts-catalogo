import { crearSolicitud } from './actions';

const labelStyle = { display: 'block', marginTop: '16px', marginBottom: '6px', fontWeight: 'bold', color: '#333' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' };
const buttonStyle = { backgroundColor: '#1A4486', color: 'white', border: 'none', borderRadius: '8px', padding: '14px 24px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%', marginTop: '24px' };

export default function NuevaMejora() {
  return (
      <main style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ color: '#1A4486' }}>Nueva mejora</h1>

                  <form action={crearSolicitud}>
                          <label style={labelStyle}>Título *</label>
                                  <input name="titulo" required style={inputStyle} placeholder="Ej: Falta medida de cadena" />

                                          <label style={labelStyle}>Producto</label>
                                                  <input name="producto" style={inputStyle} placeholder="Ej: Cadena 3/8" />

                                                          <label style={labelStyle}>Página del catálogo</label>
                                                                  <input name="pagina_catalogo" style={inputStyle} placeholder="Ej: 42" />

                                                                          <label style={labelStyle}>Descripción *</label>
                                                                                  <textarea name="descripcion" required rows={4} style={inputStyle} placeholder="Contanos qué habría que mejorar" />

                                                                                          <label style={labelStyle}>Prioridad</label>
                                                                                                  <select name="prioridad" defaultValue="media" style={inputStyle}>
                                                                                                            <option value="baja">Baja</option>
                                                                                                                      <option value="media">Media</option>
                                                                                                                                <option value="alta">Alta</option>
                                                                                                                                        </select>
                                                                                                                                        
                                                                                                                                                <button type="submit" style={buttonStyle}>Enviar mejora</button>
                                                                                                                                                      </form>
                                                                                                                                                      
                                                                                                                                                            <a href="/" style={{ display: 'block', marginTop: '16px', color: '#1A4486' }}>← Volver</a>
                                                                                                                                                                </main>
                                                                                                                                                                  );
                                                                                                                                                                  }
