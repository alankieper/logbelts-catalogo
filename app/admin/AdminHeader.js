import '../catalogo-extra.css';
import { MARCA } from '../../lib/marca';
import { contarPendientes } from '../../lib/fotosPendientes';
import BotonTema from '../components/BotonTema';

export default async function AdminHeader({ activo }) {
  const pendientes = await contarPendientes();
  const link = (href, label, key, aviso = 0) => (
    <a href={href} data-on={activo === key ? 'true' : undefined}>
      {label}
      {aviso > 0 ? (
        <span className="adm-noti" aria-label={`${aviso} ${aviso === 1 ? 'foto pendiente' : 'fotos pendientes'}`}>{aviso > 99 ? '99+' : aviso}</span>
      ) : null}
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
          {link('/admin/fotos-pendientes', 'Fotos pendientes', 'fotos', pendientes)}
          {link('/admin/material', 'Material', 'material')}
          {link('/admin/codigos', 'Códigos', 'codigos')}
          {link('/admin/oem', 'OEM', 'oem')}
          {link('/admin/excel', 'Excel', 'excel')}
          {link('/admin/categorias', 'Categorías', 'categorias')}
          {link('/admin/manuales', 'Manuales', 'manuales')}
          {link('/admin/importar', 'Importar PDF', 'importar')}
        </nav>
        <span className="right">
          <a href="/">Ver sitio</a>
          <a href="/#catalogo">Ver catálogo</a>
        </span>
        <BotonTema className="tema-boton--admin" />
        <a className="adm-salir" href="/logout">Salir</a>
      </div>
    </header>
  );
}
