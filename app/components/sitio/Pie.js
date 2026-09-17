import Link from 'next/link';
import { CATALOGO, CONTACTO, NAV, PORTAL_DISTRIBUIDORES, telHref } from '../../../lib/sitio';
import { MARCA, modulo } from '../../../lib/marca';

export default function Pie() {
  return (
    <footer className="sitio-pie">
      <div className="contenedor sitio-pie__grilla">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sitio-pie__logo" src={MARCA.logoClaro} alt={MARCA.nombre} width="93" height="46" loading="lazy" />
          <p>Importadores y distribuidores de repuestos para bosque y jardín. Venta mayorista exclusiva para comercios y talleres.</p>
        </div>
        <div>
          <h2>Sitio</h2>
          <ul>
            {NAV.map(n => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}
            {modulo('distribuidores') && <li><Link href="/donde-comprar">Dónde comprar</Link></li>}
          </ul>
        </div>
        <div>
          <h2>Herramientas</h2>
          <ul>
            <li><Link href={CATALOGO}>Catálogo online</Link></li>
            {modulo('maquinas') && <li><a href="/maquinas">Repuestos por {MARCA.maquinas.singular}</a></li>}
            {modulo('pedidoRapido') && <li><a href="/pedido-rapido">Pedido rápido</a></li>}
            {modulo('guias') && <li><Link href="/guias">Guías técnicas</Link></li>}
            <li><Link href="/descargas">Catálogos en PDF</Link></li>
            {modulo('despiece') && <li><a href="/despiece">Despiece por modelo</a></li>}
          </ul>
        </div>
        <div>
          <h2>Distribuidores</h2>
          <ul>
            <li><Link href="/contacto">Quiero ser distribuidor</Link></li>
            <li><Link href="/condiciones">Condiciones comerciales</Link></li>
            {modulo('material') && <li><Link href="/material">Material para tu comercio</Link></li>}
            <li><a href="/mi-cuenta">Mi cuenta</a></li>
            {modulo('distribuidores') && <li><a href={PORTAL_DISTRIBUIDORES} target="_blank" rel="noopener noreferrer">Portal B2B</a></li>}
          </ul>
          <h2 style={{ marginTop: 22 }}>Contacto</h2>
          <ul>
            <li><a href={telHref}>{CONTACTO.telefono}</a></li>
            <li><a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a></li>
            <li>{CONTACTO.direccion}</li>
            <li>{CONTACTO.dias}, {CONTACTO.horario}</li>
          </ul>
        </div>
      </div>
      <div className="contenedor sitio-pie__base">
        <span>© {new Date().getFullYear()} {MARCA.nombre} · Premium quality professional</span>
        <span>Venta mayorista únicamente</span>
      </div>
    </footer>
  );
}
