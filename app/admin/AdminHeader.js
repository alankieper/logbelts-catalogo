import '../catalogo-extra.css';
import { MARCA } from '../../lib/marca';
import BotonTema from '../components/BotonTema';

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
          <img src={MARCA.logoClaro} alt={MARCA.nombre} />
        </a>
        <nav>
          {link('/admin', 'Tablero', 'home')}
          {link('/admin/metricas', 'Métricas', 'metricas')}
          {link('/admin/temporada', 'Temporada', 'temporada')}
          {link('/admin/contactos', 'Contactos', 'contactos')}
          {link('/admin/vendedores', 'Vendedores', 'vendedores')}
          {link('/admin/distribuidores', 'Distribuidores', 'distribuidores')}
          {link('/admin/productos', 'Productos', 'productos')}
          {link('/admin/fotos-pendientes', 'Fotos pendientes', 'fotos')}
          {link('/admin/codigos', 'Códigos', 'codigos')}
          {link('/admin/oem', 'OEM', 'oem')}
          {link('/admin/excel', 'Excel', 'excel')}
          {link('/admin/categorias', 'Categorías', 'categorias')}
          {link('/admin/manuales', 'Manuales', 'manuales')}
          {link('/admin/importar', 'Importar PDF', 'importar')}
        </nav>
        <span className="right">
          <a href="/">Ver sitio</a> &nbsp;·&nbsp; <a href="/#catalogo">Ver catálogo</a> &nbsp;·&nbsp; <a href="/logout">Salir</a>
        </span>
        <BotonTema className="tema-boton--admin" />
      </div>
    </header>
  );
}
