'use client';

import { useEffect } from 'react';

/**
 * Red de seguridad del sitio: si una página falla (por ejemplo, si la base de datos no
 * responde un momento), en vez de una pantalla en blanco o un cartel en inglés se ve esto,
 * con un botón para reintentar sin perder el lugar.
 *
 * El detalle técnico va a la consola del servidor, no a la pantalla del visitante.
 */
export default function ErrorDelSitio({ error, reset }) {
  useEffect(() => {
    console.error('Falló una página del sitio:', error);
  }, [error]);

  return (
    <main className="cat">
      <div className="wrap">
        <p className="eyebrow">Algo salió mal</p>
        <h1 className="page">No pudimos mostrar esta página</h1>
        <p className="lead">
          Fue un problema puntual de nuestro lado, no algo que hayas hecho vos. Probá de nuevo: casi
          siempre se resuelve al instante. Si vuelve a fallar, escribinos y lo miramos.
        </p>
        <div className="err-acciones">
          <button type="button" className="err-btn err-btn--fuerte" onClick={() => reset()}>
            Probar de nuevo
          </button>
          <a className="err-btn" href="/">Ir al inicio</a>
          <a className="err-btn" href="/contacto">Escribirnos</a>
        </div>
      </div>
    </main>
  );
}
