export default function CatalogoHeader({ q = '' }) {
  return (
    <header className="cat">
      <div className="wrap">
        <a className="brand" href="/" aria-label="Logbelts — inicio">
          <img src="/logo-blanco.png" alt="Logbelts — Premium Quality Professional" />
        </a>
        <form className="search" action="/buscar" method="get" role="search">
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Buscar por código, código original, marca, modelo…"
            aria-label="Buscar productos"
          />
          <button type="submit" aria-label="Buscar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
        </form>
        <a href="/manuales" className="hlink" title="Manuales y despieces">Manuales</a>
        <a
          href="/identificar"
          className="hcart"
          title="Identificar repuesto por foto"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="6" width="18" height="14" rx="2" />
            <circle cx="12" cy="13" r="3.5" />
            <path d="M8 6l1-1.5h6L16 6" />
          </svg>
          Foto
        </a>
      </div>
    </header>
  );
}
