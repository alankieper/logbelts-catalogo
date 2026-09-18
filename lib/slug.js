/** Convierte un texto en slug para URLs: "Máquinas de cortar césped" → "maquinas-de-cortar-cesped". */
export function slugify(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
