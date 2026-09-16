import CatalogoHeader from '../../components/CatalogoHeader';
import { EsqueletoEncabezado, EsqueletoGrilla } from '../../components/EsqueletoCatalogo';

/** Esqueleto mientras carga todo lo compatible con una marca. */
export default function Cargando() {
  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap" role="status" aria-live="polite">
          <span className="sr-only">Cargando productos…</span>
          <EsqueletoEncabezado />
          <div className="sk sk-toolbar" aria-hidden="true" />
          <EsqueletoGrilla n={12} />
        </div>
      </main>
    </>
  );
}
