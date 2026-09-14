import { leerTodosRaw } from './catalogo';

/**
 * Datos técnicos para las guías (correas, espadas y cadenas), extraídos del texto del catálogo
 * (nombre y medidas). Son orientativos: el catálogo no tiene campos técnicos estructurados.
 */

const num = s => parseFloat(String(s).replace(',', '.'));
const fraccion = s => {
  const m = String(s).match(/^(\d+)\/(\d+)$/);
  return m ? Number(m[1]) / Number(m[2]) : num(s);
};
const comillas = s => String(s || '').replace(/[”“″]/g, '"');
const fotoUrl = f => (f ? (/^https?:\/\//.test(f) ? f : `/fotos/${f}`) : null);

export async function correas() {
  const todos = await leerTodosRaw();
  return todos
    .filter(p => !p.oculto && (p.clave_producto === 'Correas' || /^correa/i.test(p.nombre || '')))
    .map(p => {
      const texto = comillas([...(p.medidas || []), p.nombre].join(' | '));
      let largoMm = null;
      let ancho = null;
      const pulgadas = texto.match(/(\d{2,3}(?:[.,]\d{1,2})?)\s*"?\s*[xX]\s*(\d\/\d{1,2})\s*"?/);
      if (pulgadas) {
        largoMm = Math.round(num(pulgadas[1]) * 25.4);
        ancho = `${pulgadas[2]}"`;
      } else {
        const mm = texto.match(/\b(\d{1,2})\s*[xX]\s*(\d{3,4})\b/);
        if (mm) {
          largoMm = Number(mm[2]);
          ancho = `${mm[1]} mm`;
        }
      }
      const nombre = p.nombre || '';
      const uso = /plataforma|corte/i.test(nombre) ? 'Plataforma de corte'
        : /transmisi|tracci|hidrost/i.test(nombre) ? 'Transmisión / tracción'
        : 'Otra';
      return {
        codigo: p.codigo, nombre, marcas: p.marcas || [], oem: p.codigo_original || [],
        largoMm, largoPulg: largoMm ? Math.round((largoMm / 25.4) * 10) / 10 : null,
        ancho, uso, foto: fotoUrl(p.foto),
      };
    })
    .sort((a, b) => (a.largoMm ?? 1e9) - (b.largoMm ?? 1e9));
}

const CALIBRES_MM = { '1.1': '.043"', '1.3': '.050"', '1.5': '.058"', '1.6': '.063"' };

export async function espadasYCadenas() {
  const todos = await leerTodosRaw();
  return todos
    .filter(p => !p.oculto && /^(espada|cadena)\b/i.test(p.nombre || ''))
    .map(p => {
      const texto = comillas([p.nombre, ...(p.medidas || [])].join(' '));
      const tipo = /^espada/i.test(p.nombre) ? 'Espada' : 'Cadena';
      const largo = tipo === 'Espada' ? (texto.match(/\b(\d{2})\s*"/) || [])[1] : null;
      const pasoM = texto.match(/(3\/8\s*"?\s*LP|3\/8|\.?325|1\/4|\.?404)/i);
      const paso = pasoM
        ? /lp/i.test(pasoM[1]) ? '3/8" LP' : /325/.test(pasoM[1]) ? '.325"' : /404/.test(pasoM[1]) ? '.404"' : `${pasoM[1].replace(/\s|"/g, '')}"`
        : null;
      const calibreM = texto.match(/(?:calibre\s*)?\b0?\.?(043|050|058|063)\b/i);
      const calibreMm = texto.match(/\b(1[.,][1356])\s*(?:mm)?\b/);
      const calibre = calibreM ? `.${calibreM[1]}"` : calibreMm ? CALIBRES_MM[calibreMm[1].replace(',', '.')] || null : null;
      const eslabones = (texto.match(/\b(\d{2,3})\s*DL\b/i) || [])[1] || null;
      return {
        codigo: p.codigo, nombre: p.nombre, tipo, marcas: p.marcas || [],
        largo: largo ? `${largo}"` : null, paso, calibre, eslabones: eslabones ? Number(eslabones) : null,
        rollo: /rollo/i.test(p.nombre), foto: fotoUrl(p.foto),
      };
    });
}
