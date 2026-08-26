'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { COLOR_TEXT_LIGHT_MUTED, FONT_TEXTO } from '../theme';
import { IconCatalogo, IconAdmin, IconSalir } from './Icons';

const navBar = {
  backgroundColor: 'rgba(7,21,49,0.72)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: '14px 22px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  rowGap: '10px',
  fontFamily: FONT_TEXTO,
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

const logoLink = {
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
};

const logoImg = {
  height: '30px',
  width: 'auto',
  display: 'block',
};

const navLinks = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const pillLink = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: COLOR_TEXT_LIGHT_MUTED,
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: '10px',
  padding: '9px 14px',
  fontSize: '13px',
  fontWeight: '700',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const pillLinkActive = {
  ...pillLink,
  color: '#ffffff',
  backgroundColor: 'rgba(255,255,255,0.12)',
  borderColor: 'rgba(255,255,255,0.3)',
};

const userRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '13px',
  color: COLOR_TEXT_LIGHT_MUTED,
};

const logoutLink = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: '#ff9d9d',
  textDecoration: 'none',
  fontWeight: '700',
};

function obtenerUsuarioCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )logbelts_user=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function Nav() {
  const pathname = usePathname();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    setUsuario(obtenerUsuarioCookie());
  }, [pathname]);

  if (pathname && (pathname.startsWith('/login') || pathname.startsWith('/auth'))) {
    return null;
  }

  return (
    <nav style={navBar}>
      <a href="/" style={logoLink}>
        <img src="/logo-blanco.png" alt="Logbelts" style={logoImg} />
      </a>
      <div style={navLinks}>
        <a href="/catalogo" style={pathname?.startsWith('/catalogo') ? pillLinkActive : pillLink}>
          <IconCatalogo width={15} height={15} />
          Catálogo
        </a>
        <a href="/admin" style={pathname?.startsWith('/admin') ? pillLinkActive : pillLink}>
          <IconAdmin width={15} height={15} />
          Admin
        </a>
      </div>
      {usuario && (
        <span style={userRow}>
          Hola, {usuario}
          <a href="/logout" style={logoutLink}><IconSalir width={15} height={15} />Salir</a>
        </span>
      )}
    </nav>
  );
}
