export const dynamic = 'force-dynamic';

function sanitizarNext(raw) {
  const n = typeof raw === 'string' ? raw : '';
  if (n.startsWith('/') && !n.startsWith('//')) return n;
  return '/';
}

export default function Acceso({ searchParams }) {
  const next = sanitizarNext(searchParams?.next);
  const err = searchParams?.err === '1';

  return (
    <main className="acceso">
      <div className="acceso-card">
        <img src="/logo-blanco.png" alt="Logbelts" className="acceso-logo" />
        <h1>Antes de ver el catálogo</h1>
        <p className="acceso-sub">Completá estos datos para entrar — es de una sola vez.</p>

        <form action="/api/acceso" method="post" className="acceso-form">
          <input type="hidden" name="next" value={next} />
          <div>
            <label>Empresa o nombre *</label>
            <input name="empresa_nombre" required maxLength={120} autoFocus />
          </div>
          <div>
            <label>Teléfono *</label>
            <input name="telefono" type="tel" required maxLength={40} />
          </div>
          {err ? <p className="acceso-err">Completá ambos datos para continuar.</p> : null}
          <button type="submit">Entrar al catálogo</button>
        </form>
      </div>
    </main>
  );
}
