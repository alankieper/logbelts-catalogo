import Link from 'next/link';
import { CATALOGO, CONTACTO, NAV, PORTAL_DISTRIBUIDORES } from '../../../lib/sitio';

export default function Pie() {
  return (
    <footer className="sitio-pie">
      <div className="contenedor sitio-pie__grilla">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sitio-pie__logo" src="/logo-blanco.png" alt="Logbelts" width="93" height="46" loading="lazy" />
          <p>Importadores y distribuidores de repuestos para bosque y jardín. Venta mayorista exclusiva para comercios y talleres.</p>
        </div>
        <div>
          <h2>Sitio</h2>
          <ul>
            {NAV.map(n => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}
            <li><Link href="/donde-comprar">Dónde comprar</Link></li>
          </ul>
        </div>
        <div>
          <h2>Herramientas</h2>
          <ul>
            <li><Link href={CATALOGO}>Catálogo online</Link></li>
            <li><a href="/maquinas">Repuestos por máquina</a></li>
            <li><a href="/pedido-rapido">Pedido rápido</a></li>
            <li><Link href="/guias">Guías técnicas</Link></li>
            <li><Link href="/descargas">Catálogos en PDF</Link></li>
            <li><a href="/despiece">Despiece por modelo</a></li>
          </ul>
        </div>
        <div>
          <h2>Distribuidores</h2>
          <ul>
            <li><Link href="/contacto">Quiero ser distribuidor</Link></li>
            <li><Link href="/material">Material para tu comercio</Link></li>
            <li><a href="/mi-cuenta">Mi cuenta</a></li>
            <li><a href={PORTAL_DISTRIBUIDORES} target="_blank" rel="noopener noreferrer">Portal B2B</a></li>
          </ul>
          <h2 style={{ marginTop: 22 }}>Contacto</h2>
          <ul>
            <li><a href="tel:+541161142012">{CONTACTO.telefono}</a></li>
            <li><a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a></li>
            <li>{CONTACTO.direccion}</li>
            <li>{CONTACTO.dias}, {CONTACTO.horario}</li>
          </ul>
        </div>
      </div>
      <div className="contenedor sitio-pie__base">
        <span>© {new Date().getFullYear()} Logbelts · Premium quality professional</span>
        <span>Venta mayorista únicamente</span>
      </div>
    </footer>
  );
}
