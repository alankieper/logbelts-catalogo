'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navBar = {
  backgroundColor: 'white',
  borderBottom: '1px solid #eef1f6',
  padding: '14px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  rowGap: '8px',
  fontFamily: 'system-ui, sans-serif',
  boxShadow: '0 2px 10px rgba(26,68,134,0.05)',
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
  height: '34px',
  width: 'auto',
  display: 'block',
};

const catalogoLink = {
  backgroundColor: '#2C5AA0',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 16px',
  fontSize: '13px',
  fontWeight: '700',
  textDecoration: 'none',
  boxShadow: '0 3px 10px rgba(44,90,160,0.22)',
  whiteSpace: 'nowrap',
};

const adminLink = {
  backgroundColor: '#f0f4fa',
  color: '#1A4486',
  border: '1px solid #dbe4f2',
  borderRadius: '10px',
  padding: '10px 16px',
  fontSize: '13px',
  fontWeight: '700',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const userRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: '#8a93a3',
  width: '100%',
  justifyContent: 'flex-end',
};

const logoutLink = {
  color: '#c0392b',
  textDecoration: 'none',
  fontWeight: '600',
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

  // No mostrar el nav en /login ni en /auth (mismas rutas publicas que middleware.js)
  if (pathname && (pathname.startsWith('/login') || pathname.startsWith('/auth'))) {
    return null;
  }

  return (
    <nav style={navBar}>
      <a href="/" style={logoLink}>
        <img src="/logo-logbelts.png" alt="Logbelts" style={logoImg} />
      </a>
      <a href="/catalogo" style={catalogoLink}>CATÁLOGO DIGITAL</a>
      {usuario === 'Alan Kieper' && (
        <a href="/admin" style={adminLink}>PANEL ADMIN</a>
      )}
      {usuario && (
        <span style={userRow}>
          Hola, {usuario} · <a href="/logout" style={logoutLink}>Salir</a>
        </span>
      )}
    </nav>
  );
}
