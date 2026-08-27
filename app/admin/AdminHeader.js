export default function AdminHeader({ activo }) {
  const link = (href, label, key) => (
    <a href={href} data-on={activo === key ? 'true' : undefined}>
      {label}
    </a>
  );
  return (
    <header className="adm-top">
      <div className="wrap">
        <a className="brand" href="/admin">
          <img src="/logo-blanco.png" alt="Logbelts" />
        </a>
        <nav>
          {link('/admin', 'Tablero', 'home')}
          {link('/admin/productos', 'Productos', 'productos')}
          {link('/admin/categorias', 'Categorías', 'categorias')}
          {link('/admin/manuales', 'Manuales', 'manuales')}
          {link('/admin/importar', 'Importar PDF', 'importar')}
        </nav>
        <span className="right">
          <a href="/">Ver catálogo</a> &nbsp;·&nbsp; <a href="/logout">Salir</a>
        </span>
      </div>
    </header>
  );
}
