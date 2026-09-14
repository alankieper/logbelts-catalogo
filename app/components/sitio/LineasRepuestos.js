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
