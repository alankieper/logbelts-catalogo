'use client';

/** Buscador rápido dentro de la lista de repuestos de la máquina (sólo oculta filas, no borra nada). */
export default function FiltroPiezas() {
  function filtrar(q) {
    const t = q.trim().toLowerCase();
    document.querySelectorAll('#dsp-piezas > li').forEach((li) => {
      li.hidden = !!t && !li.dataset.texto.includes(t);
    });
  }
  return (
    <input
      className="dsp-filtro"
      type="search"
      placeholder="Buscar en la lista (carburador, 2102844…)"
      aria-label="Buscar repuesto en la lista"
      onChange={(e) => filtrar(e.target.value)}
    />
  );
}
