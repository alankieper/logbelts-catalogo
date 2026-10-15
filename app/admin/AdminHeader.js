import '../catalogo-extra.css';
import './admin-extra.css';
import './barra-admin.css';
import { MARCA } from '../../lib/marca';
import { contarPendientes } from '../../lib/fotosPendientes';
import BarraAdmin from './BarraAdmin';

// Barra lateral del panel. Cada pantalla le dice cuál es la suya con `activo`; los botones están en menuDatos.js.
export default async function AdminHeader({ activo }) {
  const pendientes = await contarPendientes();
  return <BarraAdmin activo={activo} pendientes={pendientes} logo={MARCA.logoClaro} nombre={MARCA.nombre} />;
}
