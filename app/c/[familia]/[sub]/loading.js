import CatalogoHeader from '../../../components/CatalogoHeader';
import { EsqueletoEncabezado, EsqueletoFiltros, EsqueletoGrilla } from '../../../components/EsqueletoCatalogo';

/** Esqueleto mientras carga la subcategoría: filtros + grilla con la forma de la tarjeta. */
export default function Cargando() {
  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap" role="status" aria-live="polite">
          <span className="sr-only">Cargando productos…</span>
          <EsqueletoEncabezado />
          <div className="catgrid">
            <div className="filters">
              <EsqueletoFiltros />
            </div>
            <div>
              <div className="sk sk-toolbar" aria-hidden="true" />
              <EsqueletoGrilla n={12} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
