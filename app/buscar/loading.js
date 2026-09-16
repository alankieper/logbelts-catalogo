import CatalogoHeader from '../components/CatalogoHeader';
import { EsqueletoEncabezado, EsqueletoGrilla } from '../components/EsqueletoCatalogo';

/** Esqueleto mientras se resuelve la búsqueda. */
export default function Cargando() {
  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap" role="status" aria-live="polite">
          <span className="sr-only">Buscando…</span>
          <EsqueletoEncabezado />
          <EsqueletoGrilla n={12} />
        </div>
      </main>
    </>
  );
}
