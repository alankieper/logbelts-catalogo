export const metadata = { title: 'Nosotros' };

const BLOQUES = [
  {
    titulo: 'Misión',
    texto:
      'En LOGBELTS trabajamos con pasión y profesionalismo para acompañar a cada cliente en su camino de crecimiento. Creemos en la fuerza de un equipo comprometido, en la excelencia de nuestros productos y servicio, porque nuestra verdadera misión es estar siempre cerca, escuchando y ofreciendo soluciones que transformen su trabajo en resultados.',
  },
  {
    titulo: 'Visión',
    texto:
      'Soñamos con un futuro donde LOGBELTS sea sinónimo de confianza y evolución, consolidarnos como lideres en el mercado nacional e Internacional, aspiramos a ser la primera elección de quienes buscan calidad, servicio humano y soluciones innovadoras, creciendo junto a nuestros clientes con la mirada puesta en el crecimiento sostenido y la mejora continua.',
  },
  {
    titulo: 'Valores',
    texto:
      'En LOGBELTS creemos en hacer las cosas con compromiso y pasión, trabajando con responsabilidad en cada detalle. Nuestra base es la honestidad, la lealtad hacia nuestros clientes y equipo, sosteniendo siempre la disciplina y cumpliendo con nuestra palabra, porque es la garantía de confianza que nos distingue.',
  },
];

export default function Nosotros() {
  return (
    <>
      <section className="cabecera oscuro">
        <div className="contenedor">
          <p className="antetitulo">Nosotros</p>
          <h1 className="titulo-seccion">Pasión, profesionalismo y solución</h1>
        </div>
      </section>
      <section className="texto-largo">
        <div className="contenedor texto-largo__grilla">
          {BLOQUES.map(b => (
            <article key={b.titulo}>
              <h2 className="display">{b.titulo}</h2>
              <p>{b.texto}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
