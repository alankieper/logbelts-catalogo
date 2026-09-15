// Ilustraciones de línea (estilo plano técnico) de repuestos genéricos, dibujadas a mano para Logbelts.
// Cada trazo lleva pathLength="1" para poder animar el dibujo con CSS (ver .dibujo en sitio.css).

const base = {
  viewBox: '0 0 120 120',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};
const L = { pathLength: 1 };

export const Carburador = (p) => (
  <svg {...base} {...p}>
    <rect {...L} x="46" y="18" width="28" height="18" rx="3" />
    <path {...L} d="M40 36h40l8 8v36l-8 8H40l-8-8V44z" />
    <circle {...L} cx="60" cy="62" r="15" />
    <circle {...L} cx="60" cy="62" r="8" />
    <path {...L} d="M52 62h16M60 54v16" />
    <rect {...L} x="38" y="88" width="44" height="18" rx="8" />
    <circle {...L} cx="38" cy="44" r="2.5" /><circle {...L} cx="82" cy="44" r="2.5" />
    <circle {...L} cx="38" cy="80" r="2.5" /><circle {...L} cx="82" cy="80" r="2.5" />
    <path {...L} d="M88 54l16-8" /><circle {...L} cx="106" cy="45" r="4" />
    <path {...L} d="M32 66H20" /><circle {...L} cx="16" cy="66" r="4" />
    <path {...L} d="M60 106v8M54 114h12" />
  </svg>
);

export const Piston = (p) => (
  <svg {...base} {...p}>
    <path {...L} d="M34 22q26-10 52 0v40q-26 6-52 0z" />
    <path {...L} d="M34 30q26 5 52 0M34 36q26 5 52 0M34 42q26 5 52 0" />
    <circle {...L} cx="60" cy="52" r="7" />
    <circle {...L} cx="60" cy="52" r="3" />
    <path {...L} d="M55 58l-6 36M65 58l6 36" />
    <circle {...L} cx="60" cy="100" r="13" />
    <circle {...L} cx="60" cy="100" r="7" />
    <path {...L} d="M44 100h-6M76 100h6" />
  </svg>
);

export const Bujia = (p) => (
  <svg {...base} {...p}>
    <rect {...L} x="54" y="6" width="12" height="10" rx="2" />
    <rect {...L} x="50" y="16" width="20" height="36" rx="7" />
    <path {...L} d="M50 26h20M50 34h20M50 42h20" />
    <path {...L} d="M44 56h32l4 8-4 8H44l-4-8z" />
    <path {...L} d="M60 56v16" />
    <path {...L} d="M48 76h24v22H48zM48 81l24 4M48 87l24 4M48 93l24 4" />
    <path {...L} d="M60 98v10M52 110h12v-4" />
  </svg>
);

export const Cadena = (p) => (
  <svg {...base} {...p}>
    <rect {...L} x="8" y="50" width="30" height="18" rx="9" />
    <rect {...L} x="30" y="50" width="30" height="18" rx="9" />
    <rect {...L} x="52" y="50" width="30" height="18" rx="9" />
    <rect {...L} x="74" y="50" width="30" height="18" rx="9" />
    <circle {...L} cx="34" cy="59" r="2.5" /><circle {...L} cx="56" cy="59" r="2.5" />
    <circle {...L} cx="78" cy="59" r="2.5" /><circle {...L} cx="100" cy="59" r="2.5" />
    <path {...L} d="M40 50l6-10 8 10M84 50l6-10 8 10" />
    <path {...L} d="M20 68l4 12 6-12M64 68l4 12 6-12" />
    <path {...L} d="M8 92h104" strokeDasharray="4 5" />
  </svg>
);

export const Correa = (p) => (
  <svg {...base} {...p}>
    <circle {...L} cx="38" cy="60" r="26" />
    <circle {...L} cx="38" cy="60" r="18" />
    <circle {...L} cx="38" cy="60" r="5" />
    <path {...L} d="M38 42v13M38 65v13M20 60h13M43 60h13" />
    <circle {...L} cx="92" cy="60" r="15" />
    <circle {...L} cx="92" cy="60" r="4" />
    <path {...L} d="M38 34L92 45M38 86l54-11" />
  </svg>
);

export const FiltroAire = (p) => (
  <svg {...base} {...p}>
    <rect {...L} x="16" y="30" width="88" height="60" rx="12" />
    <rect {...L} x="26" y="40" width="68" height="40" rx="6" />
    <path {...L} d="M30 44l6 32 6-32 6 32 6-32 6 32 6-32 6 32 6-32 6 32" />
    <circle {...L} cx="22" cy="36" r="2" /><circle {...L} cx="98" cy="84" r="2" />
  </svg>
);

export const Cabezal = (p) => (
  <svg {...base} {...p}>
    <circle {...L} cx="60" cy="60" r="32" />
    <circle {...L} cx="60" cy="60" r="22" />
    <circle {...L} cx="60" cy="60" r="8" />
    <path {...L} d="M60 28v-10M52 18h16" />
    <path {...L} d="M28 64C18 66 12 72 6 80M92 56c10-2 16-8 22-16" />
    <path {...L} d="M44 44a22 22 0 0 1 32 0M76 76a22 22 0 0 1-32 0" />
  </svg>
);

export const Arranque = (p) => (
  <svg {...base} {...p}>
    <circle {...L} cx="52" cy="54" r="34" />
    <circle {...L} cx="52" cy="54" r="10" />
    <path {...L} d="M52 44c12 0 18 8 18 14s-6 16-18 16-24-8-24-22 12-26 28-26" />
    <path {...L} d="M84 62l16 26" />
    <rect {...L} x="94" y="86" width="20" height="10" rx="5" transform="rotate(30 104 91)" />
  </svg>
);

/* ---------- Máquinas y familias del catálogo ---------- */

export const Motosierra = (p) => (
  <svg {...base} {...p}>
    <path {...L} d="M16 50h32l6-8h14v42H22q-6 0-6-6z" />
    <path {...L} d="M16 58q-10 0-10 12t10 12" />
    <path {...L} d="M30 42q6-20 28-20" />
    <circle {...L} cx="38" cy="66" r="8" />
    <circle {...L} cx="38" cy="66" r="3" />
    <path {...L} d="M68 52h40q8 0 8 8t-8 8H68" />
    <path {...L} d="M72 48h36M72 72h36" strokeDasharray="3 3" />
    <circle {...L} cx="108" cy="60" r="2.5" />
  </svg>
);

export const Minitractor = (p) => (
  <svg {...base} {...p}>
    <circle {...L} cx="34" cy="82" r="20" />
    <circle {...L} cx="34" cy="82" r="8" />
    <circle {...L} cx="94" cy="90" r="12" />
    <circle {...L} cx="94" cy="90" r="4" />
    <path {...L} d="M14 72V56h34l10-20h14l6 20h24q8 0 8 8v14h-4" />
    <path {...L} d="M44 56V40H32" />
    <path {...L} d="M78 36l4-14M74 22h16" />
    <path {...L} d="M54 82h28" />
    <rect {...L} x="46" y="100" width="36" height="8" rx="3" />
  </svg>
);

export const Desmalezadora = (p) => (
  <svg {...base} {...p}>
    <rect {...L} x="8" y="12" width="28" height="26" rx="7" />
    <circle {...L} cx="18" cy="25" r="5" />
    <path {...L} d="M34 36l60 58M38 32l60 58" />
    <path {...L} d="M56 52q-12-18 2-32M60 56q18-4 30 8" />
    <circle {...L} cx="58" cy="17" r="3" />
    <circle {...L} cx="92" cy="66" r="3" />
    <ellipse {...L} cx="102" cy="98" rx="13" ry="6" />
    <path {...L} d="M82 104q20 14 36-2" />
    <path {...L} d="M89 98H72" strokeDasharray="3 3" />
  </svg>
);

export const Motor = (p) => (
  <svg {...base} {...p}>
    <rect {...L} x="28" y="42" width="56" height="48" rx="6" />
    <path {...L} d="M36 42V22h40v20M36 28h40M36 34h40" />
    <circle {...L} cx="56" cy="66" r="14" />
    <circle {...L} cx="56" cy="66" r="5" />
    <path {...L} d="M84 52h16v26H84" />
    <path {...L} d="M28 58H14v20h14" />
    <path {...L} d="M42 90v10M70 90v10M34 100h44" />
    <path {...L} d="M76 22l8-8" />
    <circle {...L} cx="87" cy="11" r="3" />
  </svg>
);

export const Generador = (p) => (
  <svg {...base} {...p}>
    <rect {...L} x="12" y="30" width="96" height="58" rx="9" />
    <rect {...L} x="22" y="42" width="42" height="34" rx="4" />
    <circle {...L} cx="43" cy="59" r="9" />
    <rect {...L} x="72" y="42" width="26" height="16" rx="2" />
    <circle {...L} cx="79" cy="69" r="3" />
    <circle {...L} cx="91" cy="69" r="3" />
    <path {...L} d="M50 30v-8h20v8" />
    <path {...L} d="M22 88v12M98 88v12M14 100h16M90 100h16" />
  </svg>
);

export const Cortadora = (p) => (
  <svg {...base} {...p}>
    <path {...L} d="M12 86l6-20h70l10 20z" />
    <circle {...L} cx="28" cy="94" r="9" />
    <circle {...L} cx="84" cy="94" r="9" />
    <rect {...L} x="36" y="46" width="30" height="20" rx="4" />
    <circle {...L} cx="51" cy="56" r="5" />
    <path {...L} d="M86 66l20-48M98 18h16" />
    <path {...L} d="M96 42H80" />
  </svg>
);

export const Junta = (p) => (
  <svg {...base} {...p}>
    <path {...L} d="M24 24h72q8 0 8 8v56q0 8-8 8H24q-8 0-8-8V32q0-8 8-8z" />
    <circle {...L} cx="60" cy="60" r="22" />
    <circle {...L} cx="60" cy="60" r="15" />
    <circle {...L} cx="30" cy="38" r="5" />
    <circle {...L} cx="90" cy="38" r="5" />
    <circle {...L} cx="30" cy="82" r="5" />
    <circle {...L} cx="90" cy="82" r="5" />
  </svg>
);

export const Hidrolavadora = (p) => (
  <svg {...base} {...p}>
    <rect {...L} x="12" y="42" width="46" height="44" rx="8" />
    <circle {...L} cx="35" cy="64" r="11" />
    <path {...L} d="M22 42V18h18" />
    <circle {...L} cx="22" cy="94" r="7" />
    <circle {...L} cx="48" cy="94" r="7" />
    <path {...L} d="M58 72q22 0 26-18t16-14" />
    <path {...L} d="M96 38l16-8M104 40l4 12" />
    <path {...L} d="M112 26l6-4M114 32h6" strokeDasharray="2 3" />
  </svg>
);

export const Sopladora = (p) => (
  <svg {...base} {...p}>
    <rect {...L} x="12" y="40" width="42" height="42" rx="10" />
    <circle {...L} cx="33" cy="61" r="13" />
    <path {...L} d="M33 48v26M20 61h26" />
    <path {...L} d="M33 40q0-22 22-22h10" />
    <path {...L} d="M54 64l48-10v16l-48 6" />
    <path {...L} d="M106 56l10-4M106 62h12M106 68l10 4" strokeDasharray="2 3" />
  </svg>
);

export const Universal = (p) => (
  <svg {...base} {...p}>
    <path {...L} d="M24 84l34-34M32 92l34-34" />
    <path {...L} d="M58 50q-6-16 8-26 10-6 20-2L76 32l2 8 8 2 10-10q4 10-2 20-10 14-28 8" />
    <path {...L} d="M24 84q-8 8 0 12 4 4 8-4" />
    <path {...L} d="M88 70l13 7v15l-13 7-13-7V77z" />
    <circle {...L} cx="88" cy="84" r="5" />
  </svg>
);

export const Arnes = (p) => (
  <svg {...base} {...p}>
    <path {...L} d="M34 14q-12 30 8 54M86 14q12 30-8 54" />
    <path {...L} d="M42 68q18 12 36 0" />
    <path {...L} d="M28 30h14M78 30h14" />
    <rect {...L} x="50" y="54" width="20" height="14" rx="4" />
    <path {...L} d="M60 76v12" />
    <circle {...L} cx="60" cy="94" r="6" />
    <path {...L} d="M60 100q0 10 8 10" />
  </svg>
);

/* ---------- Nosotros: misión, visión y valores ---------- */

export const Diana = (p) => (
  <svg {...base} {...p}>
    <circle {...L} cx="54" cy="66" r="42" />
    <circle {...L} cx="54" cy="66" r="28" />
    <circle {...L} cx="54" cy="66" r="14" />
    <circle {...L} cx="54" cy="66" r="3" />
    <path {...L} d="M54 66L102 18" />
    <path {...L} d="M102 18l2-12M102 18l12-2M94 26l2-10M94 26l10-2" />
  </svg>
);

export const Binoculares = (p) => (
  <svg {...base} {...p}>
    <circle {...L} cx="34" cy="78" r="20" />
    <circle {...L} cx="86" cy="78" r="20" />
    <circle {...L} cx="34" cy="78" r="10" />
    <circle {...L} cx="86" cy="78" r="10" />
    <path {...L} d="M18 66l10-36h16l6 30M102 66L92 30H76l-6 30" />
    <path {...L} d="M50 52h20v18H50z" />
    <path {...L} d="M30 30V20h12v10M78 30V20h12v10" />
    <path {...L} d="M8 108h104" strokeDasharray="4 5" />
  </svg>
);

export const Escudo = (p) => (
  <svg {...base} {...p}>
    <path {...L} d="M60 10l42 14v32c0 30-18 46-42 54-24-8-42-24-42-54V24z" />
    <path {...L} d="M60 24l28 10v22c0 20-12 32-28 38-16-6-28-18-28-38V34z" />
    <path {...L} d="M44 60l12 12 22-24" />
  </svg>
);

const sinTildes =(s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const POR_FAMILIA = [
  [/motosierra/, Motosierra],
  [/minitractor|tractor/, Minitractor],
  [/desmalezadora|bordeadora/, Desmalezadora],
  [/cortar|cortadora|cesped/, Cortadora],
  [/motores|motor 4t/, Motor],
  [/generador/, Generador],
  [/arranque/, Arranque],
  [/carbur/, Carburador],
  [/junta/, Junta],
  [/hidrolavadora|motobomba/, Hidrolavadora],
  [/sopladora/, Sopladora],
  [/encendido|bujia/, Bujia],
  [/arnes/, Arnes],
  [/cadena|espada/, Cadena],
  [/correa/, Correa],
  [/filtro/, FiltroAire],
  [/cabezal|tanza/, Cabezal],
  [/piston|cilindro/, Piston],
];

/** Dibujo de línea que corresponde a una familia del catálogo (por su nombre). */
export function dibujoFamilia(nombre = '') {
  const n = sinTildes(nombre);
  return (POR_FAMILIA.find(([re]) => re.test(n)) || [null, Universal])[1];
}

/** Carburador grande con cotas y líneas de eje, para fondos (estilo plano). */
export const CarburadorPlano = (p) => (
  <svg viewBox="0 0 560 400" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {/* ejes */}
    <path {...L} d="M280 20v360M60 200h440" strokeDasharray="14 6 2 6" strokeWidth="0.8" />
    {/* cuerpo */}
    <path {...L} d="M170 110h220l30 30v120l-30 30H170l-30-30V140z" strokeWidth="1.6" />
    <path {...L} d="M186 126h188l18 18v112l-18 18H186l-18-18V144z" />
    {/* venturi */}
    <circle {...L} cx="280" cy="200" r="62" strokeWidth="1.6" />
    <circle {...L} cx="280" cy="200" r="44" />
    <circle {...L} cx="280" cy="200" r="22" />
    <path {...L} d="M240 170l80 60M240 230l80-60" strokeWidth="0.8" />
    {/* bocina de aire */}
    <path {...L} d="M226 110V70h108v40M240 70V52h80v18" />
    {/* cuba */}
    <path {...L} d="M196 300v30q0 22 22 22h124q22 0 22-22v-30" />
    <path {...L} d="M230 352v18h100v-18" />
    {/* mariposa y palanca */}
    <path {...L} d="M420 170l70-34" /><circle {...L} cx="498" cy="132" r="10" /><circle {...L} cx="498" cy="132" r="3" />
    <path {...L} d="M420 230h40v24" />
    {/* tornillos de regulación */}
    <path {...L} d="M140 180H96M140 220H104" /><rect {...L} x="72" y="172" width="24" height="16" rx="3" /><rect {...L} x="80" y="212" width="24" height="16" rx="3" />
    {/* bulones de brida */}
    <circle {...L} cx="170" cy="140" r="6" /><circle {...L} cx="390" cy="140" r="6" />
    <circle {...L} cx="170" cy="260" r="6" /><circle {...L} cx="390" cy="260" r="6" />
    {/* cotas */}
    <path {...L} d="M218 30h124M218 24v12M342 24v12" strokeWidth="0.8" />
    <path {...L} d="M530 110v190M524 110h12M524 300h12" strokeWidth="0.8" />
    <path {...L} d="M338 262l40 40h60" strokeWidth="0.8" />
    <g fill="currentColor" stroke="none" fontFamily="ui-monospace, Consolas, monospace" fontSize="12" letterSpacing="2">
      <text x="248" y="18">Ø 24 mm</text>
      <text x="538" y="210" transform="rotate(90 538 210)">CUERPO</text>
      <text x="444" y="306">VENTURI</text>
      <text x="400" y="164">MARIPOSA</text>
      <text x="40" y="164">AJUSTE H / L</text>
      <text x="236" y="392">CUBA</text>
    </g>
  </svg>
);
