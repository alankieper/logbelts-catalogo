// Máquinas Logbelts en dibujo de contorno (hero de la portada). Mismo sistema que LineasRepuestos:
// cada trazo con pathLength="1" para animar el dibujo con CSS (.dibujo en sitio.css).

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};
const L = { pathLength: 1 };

/** Minitractor de costado (frente a la derecha): ruedas, capot con parrilla, asiento, volante y plato de corte. */
export const MinitractorContorno = (p) => (
  <svg viewBox="0 0 400 300" {...base} {...p}>
    {/* rueda trasera */}
    <circle {...L} cx="110" cy="220" r="58" />
    <circle {...L} cx="110" cy="220" r="40" />
    <circle {...L} cx="110" cy="220" r="14" />
    <circle cx="110" cy="220" r="50" strokeDasharray="5 7" strokeWidth="1.2" />
    {/* rueda delantera */}
    <circle {...L} cx="318" cy="238" r="38" />
    <circle {...L} cx="318" cy="238" r="24" />
    <circle {...L} cx="318" cy="238" r="9" />
    <circle cx="318" cy="238" r="31" strokeDasharray="4 6" strokeWidth="1.2" />
    {/* guardabarros y chasis */}
    <path {...L} d="M44 214Q48 146 110 144Q164 144 176 196" />
    <path {...L} d="M176 196H280" />
    <path {...L} d="M276 216Q280 186 318 186Q354 186 362 216" />
    {/* capot, parrilla y faro */}
    <path {...L} d="M200 182L220 124Q226 110 244 110L330 114Q358 118 370 150L380 188Q382 200 368 200H286" />
    <path {...L} d="M236 124L330 128" />
    <path {...L} d="M352 152L362 188M343 154L353 190M334 156L344 192" />
    <path {...L} d="M318 132L352 137L357 149L322 145Z" />
    {/* asiento */}
    <path {...L} d="M112 124Q106 64 126 58L156 60Q172 62 170 84L166 124" />
    <path {...L} d="M98 126H180Q190 126 188 138L184 148H104Q94 148 96 136Z" />
    <path {...L} d="M122 76Q140 72 156 78" />
    {/* columna y volante */}
    <path {...L} d="M226 120L250 66" />
    <ellipse {...L} cx="252" cy="60" rx="34" ry="10" />
    <path {...L} d="M232 62L272 58" />
    {/* plato de corte y suelo */}
    <path {...L} d="M150 252H292L302 266H160Z" />
    <path d="M18 284H392" strokeDasharray="6 8" strokeWidth="1.2" />
  </svg>
);

/** Desmalezadora: motor con arranque y tanque, barra, manubrio tipo bicicleta, cabezal y protector. */
export const DesmalezadoraContorno = (p) => (
  <svg viewBox="0 0 400 250" {...base} {...p}>
    {/* motor */}
    <path {...L} d="M40 72Q40 48 62 46L118 44Q140 44 142 66L144 120Q144 138 126 140L60 142Q40 142 40 122Z" />
    <path {...L} d="M74 44V30H118V44M86 30V44M98 30V44M110 30V44" />
    <circle {...L} cx="62" cy="94" r="22" />
    <circle {...L} cx="62" cy="94" r="8" />
    <path {...L} d="M40 94H24M24 84V104" />
    {/* tanque de combustible */}
    <path {...L} d="M52 142L56 172Q58 182 70 182H118Q130 182 132 172L134 140" />
    <circle {...L} cx="78" cy="162" r="6" />
    {/* campana de embrague y barra */}
    <path {...L} d="M144 78L178 88V110L144 116" />
    <path {...L} d="M178 92L356 190M178 106L350 202" />
    {/* manubrio con puños y acelerador */}
    <path {...L} d="M232 118L252 128L244 146L224 136Z" />
    <path {...L} d="M238 130Q226 90 196 60L176 46" />
    <path {...L} d="M240 132Q272 110 312 98L334 92" />
    <path {...L} d="M180 50L152 30L158 22L186 42Z" />
    <path {...L} d="M332 86L364 80L366 94L334 100Z" />
    <path {...L} d="M348 98L346 112" />
    {/* cabezal de engranajes, protector y cabezal de tanza */}
    <path {...L} d="M350 188L366 196L372 214L358 222L344 206Z" />
    <path {...L} d="M298 214Q306 190 346 188Q386 188 396 210" />
    <ellipse {...L} cx="350" cy="226" rx="30" ry="9" />
    <path {...L} d="M320 226V234Q350 246 380 234V226" />
    <path d="M318 230L286 236M382 230L398 236" strokeDasharray="4 4" strokeWidth="1.4" />
  </svg>
);

/** Motosierra de costado (espada a la izquierda): espada con cadena, tapa del piñón, cuerpo y manijas. */
export const MotosierraContorno = (p) => (
  <svg viewBox="0 0 420 200" {...base} {...p}>
    {/* espada y cadena */}
    <path {...L} d="M38 120Q20 120 20 136Q20 152 38 152L204 146V124Z" />
    <path d="M38 115L204 119M38 157L204 151M20 136Q14 136 15 128" strokeDasharray="6 5" strokeWidth="1.6" />
    <circle {...L} cx="42" cy="136" r="4" />
    <path {...L} d="M104 130L96 136L104 142M120 130L112 136L120 142M136 130L128 136L136 142" />
    {/* tapa del piñón con tuercas */}
    <path {...L} d="M204 112H262Q272 112 272 122V160Q272 170 262 170H208Q198 170 198 160V122Q198 112 204 112Z" />
    <circle {...L} cx="230" cy="128" r="5" />
    <circle {...L} cx="230" cy="154" r="5" />
    {/* cuerpo y tapa superior */}
    <path {...L} d="M272 100L300 72Q306 64 320 64H370Q388 64 392 82L398 132Q400 152 382 156L272 162" />
    <path {...L} d="M300 72L312 52Q316 46 326 46H362Q376 46 378 60L380 66" />
    <path {...L} d="M320 98H366M320 110H366M320 122H366" />
    <path {...L} d="M300 84L290 76H276" />
    {/* manija delantera, protector de mano, manija trasera y gatillo */}
    <path {...L} d="M254 150Q240 100 262 60Q276 34 306 30Q330 28 334 46" />
    <path {...L} d="M244 40L264 32L284 96L266 104Z" />
    <path {...L} d="M392 88Q412 88 414 112Q416 150 396 160L372 164" />
    <path {...L} d="M396 104Q404 122 396 144" />
    <path {...L} d="M386 152L378 170" />
  </svg>
);
