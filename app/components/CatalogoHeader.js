import ThemeToggle from './ThemeToggle';
import ListaPedido from './ListaPedido';
import RegistrarVisita from './RegistrarVisita';

export default function CatalogoHeader({ q = '' }) {
  return (
    <header className="cat">
      <RegistrarVisita />
      <ListaPedido />
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
        <ThemeToggle />
        <a href="/manuales" className="hlink hlink-last" title="Manuales y despieces">Manuales</a>
      </div>
    </header>
  );
}
