import { TUTORIALES } from '../../../lib/sitio';

export const metadata = { title: 'Tutoriales' };

// Los videos están alojados en el reproductor de Wix y no se pueden enlazar directo.
// Para agregarlos: subir cada video a YouTube y reemplazar el placeholder por el reproductor.
export default function Tutoriales() {
  return (
    <>
      <section className="cabecera oscuro">
        <div className="contenedor">
          <p className="antetitulo">Aprendé con Logbelts</p>
          <h1 className="titulo-seccion">Tutoriales</h1>
          <p>Videos cortos para elegir, instalar y mantener repuestos de bosque y jardín.</p>
        </div>
      </section>
      <section className="tutoriales">
        <div className="contenedor tutoriales__grilla">
          {TUTORIALES.map(t => (
            <article key={t} className="tutorial">
              <a className="tutorial__video" href="https://www.logbelts.com/videos-tutoriales" target="_blank" rel="noopener noreferrer" aria-label={`Ver video: ${t}`}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              </a>
              <h2>{t}</h2>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
