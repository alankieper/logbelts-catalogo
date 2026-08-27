/* Iconos lineales para familias y subcategorías del catálogo.
   viewBox 24x24, trazo currentColor. */

const P = {
  // --- máquinas / familias ---
  motosierra: (
    <>
      <path d="M3 9h7l2-2h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-5" />
      <path d="M3 9v4h6l2 2" />
      <path d="M10 15h9" />
      <path d="M11 15l1 2M14 15l1 2M17 15l1 2" />
      <circle cx="6.5" cy="11" r="1" />
    </>
  ),
  minitractor: (
    <>
      <circle cx="7" cy="16" r="3.5" />
      <circle cx="18" cy="17" r="2.5" />
      <path d="M7 12.5V9h4l2 4h4l1 2" />
      <path d="M10.5 9V6.5H14" />
    </>
  ),
  desmalezadora: (
    <>
      <path d="M4 6l12 9" />
      <path d="M13.5 8.5l3-3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M16 16.5l4 3M20 16.5l-4 3" />
      <path d="M4 6l1.5-1.5" />
    </>
  ),
  cortacesped: (
    <>
      <path d="M3 20l6-6" />
      <rect x="9" y="10" width="10" height="6" rx="1.5" />
      <circle cx="11" cy="18" r="1.8" />
      <circle cx="18" cy="18" r="1.8" />
      <path d="M9 12l-4-2" />
    </>
  ),
  motor: (
    <>
      <rect x="6" y="9" width="10" height="9" rx="1.5" />
      <path d="M16 11h3v5h-3" />
      <path d="M8 9V6.5h5V9" />
      <path d="M6 12H3.5M6 15H3.5" />
      <path d="M10 18v2" />
    </>
  ),
  generador: (
    <>
      <rect x="4" y="8" width="12" height="10" rx="1.5" />
      <path d="M16 11h4v4h-4" />
      <path d="M10 10l-2 4h3l-2 4" />
    </>
  ),
  arranque: (
    <>
      <circle cx="11" cy="12" r="6" />
      <circle cx="11" cy="12" r="1.6" />
      <path d="M11 6V3.5M17 12h2.5" />
      <path d="M15.5 7.5l3-2.5" />
    </>
  ),
  junta: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="8" cy="8" r=".6" />
      <circle cx="16" cy="8" r=".6" />
      <circle cx="8" cy="16" r=".6" />
      <circle cx="16" cy="16" r=".6" />
    </>
  ),
  carburador: (
    <>
      <rect x="7" y="8" width="10" height="8" rx="1.5" />
      <path d="M12 5v3M9 16v3M15 16v3" />
      <path d="M7 11H4M17 11h3" />
      <circle cx="12" cy="12" r="1.4" />
    </>
  ),
  hidrolavadora: (
    <>
      <path d="M4 14h5v-3l4-2v9H4z" />
      <path d="M13 9l6-4v3l-4 2" />
      <path d="M6 20h5" />
    </>
  ),
  universal: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />
    </>
  ),
  sopladora: (
    <>
      <path d="M4 12a4 4 0 0 1 4-4h2v8H8a4 4 0 0 1-4-4z" />
      <path d="M10 9h6l3-2v10l-3-2h-6" />
      <path d="M6 16l-1.5 3" />
    </>
  ),
  encendido: (
    <>
      <rect x="9" y="3" width="6" height="7" rx="1" />
      <path d="M10 10h4l-1.5 5h-1z" />
      <path d="M12 15v4M12 19l3 2.5" />
    </>
  ),

  // --- subcategorías ---
  correa: (
    <>
      <rect x="4" y="9" width="16" height="7" rx="3.5" />
      <path d="M4 12.5h16" strokeDasharray="1.5 2.5" />
      <path d="M8 9v7M16 9v7" strokeDasharray="1.5 2.5" />
    </>
  ),
  cuchilla: (
    <>
      <path d="M4 12c4-4 12-4 16 0-4 4-12 4-16 0z" />
      <circle cx="12" cy="12" r="1.4" />
      <path d="M6 10.5l1 1M17 10.5l-1 1" />
    </>
  ),
  polea: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <path d="M5 12h1.5M17.5 12H19" />
    </>
  ),
  torreta: (
    <>
      <rect x="9" y="4" width="6" height="10" rx="1" />
      <path d="M7 14h10l-1 6H8z" />
      <path d="M12 4V2" />
    </>
  ),
  cilindro: (
    <>
      <rect x="8" y="4" width="8" height="16" rx="1.5" />
      <path d="M5 7h3M5 10h3M5 13h3M16 7h3M16 10h3M16 13h3" />
    </>
  ),
  piston: (
    <>
      <rect x="8" y="4" width="8" height="9" rx="1" />
      <path d="M8 8h8M8 10.5h8" />
      <path d="M12 13v4M9.5 21h5" />
      <circle cx="12" cy="18" r="1.2" />
    </>
  ),
  espada: (
    <>
      <path d="M3 12h14l4-2v4l-4-2" />
      <circle cx="6" cy="12" r="2.5" />
      <path d="M17 10.5v3" />
    </>
  ),
  cadena: (
    <>
      <rect x="3" y="9" width="6" height="6" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="2" />
      <rect x="15" y="9" width="6" height="6" rx="2" />
    </>
  ),
  filtro: (
    <>
      <path d="M5 6h14l-5 6v6l-4-2v-4z" />
    </>
  ),
  cabezal: (
    <>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 6V3M12 21v-3M6 12H3M21 12h-3" />
    </>
  ),
  cable: (
    <>
      <path d="M4 7h2v3M20 17h-2v-3" />
      <path d="M6 8c4 0 4 8 12 8" />
    </>
  ),
  bomba: (
    <>
      <circle cx="10" cy="13" r="5" />
      <path d="M10 8V4h5v3M15 5l4-1v4l-4-1" />
      <circle cx="10" cy="13" r="1.4" />
    </>
  ),
  rueda: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
    </>
  ),
  resorte: (
    <>
      <path d="M6 4h12M6 20h12" />
      <path d="M7 4c8 2-8 5 0 7s-8 5 0 7" />
    </>
  ),
  embrague: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 5v4M12 15v4M5 12h4M15 12h4" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  engranaje: (
    <>
      <rect x="4" y="6" width="10" height="12" rx="1.5" />
      <circle cx="16" cy="12" r="4" />
      <path d="M16 8v-1M16 17v-1M20 12h1M11 12h1" />
    </>
  ),
  manguera: (
    <>
      <path d="M4 6c0 6 16 6 16 12" />
      <rect x="3" y="4" width="3" height="3" rx="1" />
      <rect x="18" y="17" width="3" height="3" rx="1" />
    </>
  ),
  bobina: (
    <>
      <rect x="5" y="7" width="14" height="10" rx="1.5" />
      <path d="M8 7v10M11 7v10M14 7v10" />
      <path d="M19 10h2M19 14h2" />
    </>
  ),
  tanque: (
    <>
      <rect x="5" y="8" width="14" height="11" rx="2" />
      <path d="M10 8V6h4v2" />
      <path d="M11 5h2" />
    </>
  ),
  escape: (
    <>
      <rect x="4" y="8" width="12" height="8" rx="2" />
      <path d="M16 10h4M16 14h4" />
      <path d="M7 8V6M11 8V6" />
    </>
  ),
  amortiguador: (
    <>
      <path d="M12 3v4M12 17v4" />
      <path d="M8 7h8v3l-8 4v3h8" />
    </>
  ),
  valvula: (
    <>
      <path d="M12 4v9" />
      <path d="M8 13h8l-2 5h-4z" />
      <path d="M9 4h6" />
    </>
  ),
  bomba_aceite: (
    <>
      <path d="M7 10h6v8H7z" />
      <path d="M13 12h5M13 16h5" />
      <path d="M10 10V6l3-2" />
    </>
  ),
  parte: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};

const RULES = [
  [/motosierra/, 'motosierra'],
  [/minitractor/, 'minitractor'],
  [/desmalezadora|corta ?cerco|fumigador|hoyadora/, 'desmalezadora'],
  [/cortar c[eé]sped|cortac[eé]sped|c[eé]sped/, 'cortacesped'],
  [/generador/, 'generador'],
  [/motor(es)? 4t|motor general|hidrolavadora|motobomba/, 'motor'],
  [/hidrolavadora|motobomba/, 'hidrolavadora'],
  [/arranque|solenoide|tambor|burro/, 'arranque'],
  [/juntas de motor|junta de motor/, 'junta'],
  [/carburaci[oó]n|carburador|bombines?|punzuar/, 'carburador'],
  [/universal/, 'universal'],
  [/sopladora/, 'sopladora'],
  [/encendido|buj[ií]a|capuch[oó]n/, 'encendido'],
  // subcategorías
  [/correa/, 'correa'],
  [/cuchilla/, 'cuchilla'],
  [/polea/, 'polea'],
  [/torreta|carcasa|eje/, 'torreta'],
  [/cilindro/, 'cilindro'],
  [/pist[oó]n|aros?/, 'piston'],
  [/espada/, 'espada'],
  [/cadena/, 'cadena'],
  [/filtro/, 'filtro'],
  [/cabezal|tanza/, 'cabezal'],
  [/cable/, 'cable'],
  [/bomba de aceite|sin ?fin/, 'bomba_aceite'],
  [/bomba/, 'bomba'],
  [/rueda|neum[aá]tico|c[aá]mara|bul[oó]n/, 'rueda'],
  [/resorte/, 'resorte'],
  [/electroembrague|embrague|campana/, 'embrague'],
  [/caja de engranaje|engranaje/, 'engranaje'],
  [/manguera/, 'manguera'],
  [/bobina/, 'bobina'],
  [/tanque|dep[oó]sito|tapa de/, 'tanque'],
  [/escape|silenciador/, 'escape'],
  [/amortiguador/, 'amortiguador'],
  [/v[aá]lvula/, 'valvula'],
  [/cig[üu]e[ñn]al|reten|manubrio/, 'parte'],
];

export function claveIcono(nombre) {
  const n = (nombre || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const [re, k] of RULES) if (re.test(n)) return k;
  return 'parte';
}

export default function Icono({ nombre, clave, size = 22, className }) {
  const k = clave || claveIcono(nombre);
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {P[k] || P.parte}
    </svg>
  );
}
