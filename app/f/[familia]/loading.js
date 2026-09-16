import CatalogoHeader from '../../components/CatalogoHeader';
import { EsqueletoEncabezado, EsqueletoTiles } from '../../components/EsqueletoCatalogo';

/** Esqueleto mientras carga la familia (mismo encabezado y misma grilla que la página). */
export default function Cargando() {
  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap" role="status" aria-live="polite">
          <span className="sr-only">Cargando categorías…</span>
          <EsqueletoEncabezado />
          <EsqueletoTiles n={8} />
        </div>
      </main>
    </>
  );
}
