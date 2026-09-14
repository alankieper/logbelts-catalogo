import { notFound } from 'next/navigation';
import CatalogoHeader from '../../../components/CatalogoHeader';
import ProductoCard from '../../../components/ProductoCard';
import NoEncontrado from '../../../components/NoEncontrado';
import Registrar from '../../../components/Registrar';
import { productosDeMaquina } from '../../../../lib/maquinas';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const d = await productosDeMaquina(params.marca, params.modelo);
  if (!d) return { title: 'Máquina no encontrada' };
  return {
    title: `Repuestos para ${d.marca} ${d.modelo}`,
    description: `${d.productos.length} repuestos Logbelts compatibles con ${d.marca} ${d.modelo}. Consultá por WhatsApp (venta mayorista).`,
  };
}

export default async function ModeloMaquinaPage({ params }) {
  const d = await productosDeMaquina(params.marca, params.modelo);
  if (!d) notFound();

  const porFamilia = new Map();
  for (const p of d.productos) {
    const clave = p.familia || 'Otros';
    if (!porFamilia.has(clave)) porFamilia.set(clave, []);
    porFamilia.get(clave).push(p);
  }

  return (
    <>
      <CatalogoHeader />
      <Registrar tipo="maquina" q={`${d.marca} ${d.modelo}`} n={d.productos.length} />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/productos">Catálogo</a>
            <span className="sep">/</span>
            <a href="/maquinas">Por máquina</a>
            <span className="sep">/</span>
            <a href={`/maquinas/${d.marcaSlug}`}>{d.marca}</a>
            <span className="sep">/</span>
            <span aria-current="page">{d.modelo}</span>
          </nav>
          <p className="eyebrow">Repuestos compatibles</p>
          <h1 className="page">{d.marca} {d.modelo}</h1>
          <p className="lead">
            {d.productos.length} repuesto{d.productos.length === 1 ? '' : 's'} del catálogo indica{d.productos.length === 1 ? '' : 'n'} compatibilidad con esta máquina.
            Confirmá siempre con tu vendedor antes de pedir.
          </p>

          {[...porFamilia.entries()].map(([familia, productos]) => (
            <section key={familia} style={{ marginBottom: 26 }}>
              <h2 className="page" style={{ fontSize: '1.1rem' }}>{familia}</h2>
              <div className="pgrid">
                {productos.map((p) => <ProductoCard key={p.codigo} p={p} />)}
              </div>
            </section>
          ))}

          <NoEncontrado
            origen="maquina"
            q={`${d.marca} ${d.modelo}`}
            titulo={`¿Buscás otro repuesto para ${d.marca} ${d.modelo}?`}
            prefijo={`Busco repuestos para ${d.marca} ${d.modelo}: `}
          />
        </div>
      </main>
      <footer className="cat">
        <div className="wrap">Logbelts · Catálogo · versión de trabajo</div>
      </footer>
    </>
  );
}
