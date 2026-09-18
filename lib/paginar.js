/** Productos por página en los listados del catálogo (divisible por 2, 3 y 4 columnas). */
export const POR_PAGINA = 24;

/**
 * Corta una lista en páginas. `pagina` llega de la URL (?pagina=2) y se corrige si es inválida.
 * Devuelve { items, pagina, paginas, desde, hasta, total } con desde/hasta en base 1.
 */
export function paginar(lista, pagina, porPagina = POR_PAGINA) {
  const total = lista.length;
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  const n = Math.min(Math.max(parseInt(pagina, 10) || 1, 1), paginas);
  const inicio = (n - 1) * porPagina;
  return {
    items: lista.slice(inicio, inicio + porPagina),
    pagina: n,
    paginas,
    desde: total ? inicio + 1 : 0,
    hasta: Math.min(inicio + porPagina, total),
    total,
  };
}

/** Números a mostrar en la paginación: 1 … 4 5 [6] 7 8 … 20 (null = puntos suspensivos). */
export function numerosDePagina(pagina, paginas) {
  const set = new Set([1, paginas, pagina, pagina - 1, pagina + 1]);
  if (pagina <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (pagina >= paginas - 2) [paginas - 1, paginas - 2, paginas - 3].forEach((n) => set.add(n));
  const nums = [...set].filter((n) => n >= 1 && n <= paginas).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
}
