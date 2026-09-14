'use client';

import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/productos', label: 'Familias' },
  { href: '/maquinas', label: 'Por máquina', nuevo: true },
  { href: '/pedido-rapido', label: 'Pedido rápido', nuevo: true },
  { href: '/mi-cuenta', label: 'Mi cuenta' },
  { href: '/guias', label: 'Guías técnicas' },
  { href: '/manuales', label: 'Manuales' },
  { href: '/', label: 'Sitio Logbelts' },
];

export default function CatNav() {
  const pathname = usePathname() || '';
  const activo = href => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <nav className="catnav" aria-label="Catálogo">
      <div className="wrap">
        {LINKS.map(l => (
          <a key={l.href} href={l.href} className={l.nuevo ? 'nuevo' : undefined} aria-current={activo(l.href) ? 'page' : undefined}>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
