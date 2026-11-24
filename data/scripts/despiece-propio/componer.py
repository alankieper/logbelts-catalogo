"""Arma el despiece de la Stihl FS 120: traza cada pieza, la ubica en su casilla y escribe
- despiece-fs120.json (datos para la web)
- _lab/despiece.svg (vista de prueba)
"""
import json, os, re, subprocess, sys

S = os.path.dirname(os.path.abspath(__file__))
WT = os.path.join(S, 'wt')
FOTOS = os.path.join(WT, 'public', 'fotos')
TMP = os.path.join(S, 'trazos'); os.makedirs(TMP, exist_ok=True)
PY = os.path.join(S, 'venv', 'bin', 'python')

CFG = {}
exec(open(sys.argv[1]).read(), CFG)
ANCHO, ALTO = CFG['ANCHO'], CFG['ALTO']
BX, BY, BS = CFG['BX'], CFG['BY'], CFG['BS']
def maq(u, v):
    return (BX + BS * u, BY + BS * v)

PX_POR_U = 4      # resolución del trazado: 4 px por unidad del dibujo
GROSOR = 4        # px -> 1 unidad de línea en todas las piezas

PIEZAS = CFG['PIEZAS']


def foto(c):
    for e in ('png', 'jpg'):
        p = os.path.join(FOTOS, f'{c}.{e}')
        if os.path.exists(p):
            return p
    raise SystemExit(f'sin foto {c}')


def trazar(c, lado, aj):
    out = os.path.join(TMP, f'{c}.svg')
    args = [PY, '-I', os.path.join(S, 'trazar.py'), foto(c), out,
            str(aj.get('lo', 40)), str(aj.get('hi', 110)), str(GROSOR), str(lado), str(aj.get('min', 140)), str(aj.get('comp', 0.04)), '1' if aj.get('invertir') else '0', '1' if aj.get('bordes') else '0', ','.join(map(str, aj.get('recorte', [])))]
    r = subprocess.run(args, capture_output=True, text=True, check=True)
    _, w, h = r.stdout.split()
    svg = open(out).read()
    g = re.search(r'<g transform="([^"]+)"', svg).group(1)
    paths = re.findall(r'<path d="([^"]+)"', svg)
    return int(w), int(h), g, ' '.join(p.replace('\n', ' ') for p in paths)


def recortar_linea(ax, ay, caja):
    """Punto del borde de la caja sobre la recta ancla -> centro de la caja."""
    x, y, w, h = caja
    cx, cy = x + w / 2, y + h / 2
    dx, dy = ax - cx, ay - cy
    t = min(abs((w / 2) / dx) if dx else 9e9, abs((h / 2) / dy) if dy else 9e9)
    return cx + dx * t, cy + dy * t


datos = []
for n, nombre, cf, cods, caja, ancla, aj in PIEZAS:
    x, y, w, h = caja
    # primero un trazado de prueba para saber la proporción, después al tamaño final
    w0, h0, _, _ = trazar(cf, 400, aj)
    s_fit = min(w / w0, h / h0)
    lado = int(round(max(w0, h0) * s_fit * PX_POR_U))
    tw, th, gt, d = trazar(cf, lado, aj)
    s = min(w / tw, h / th)
    ox, oy = x + (w - tw * s) / 2, y + (h - th * s) / 2
    ax, ay = maq(*ancla)
    bx, by, bw, bh = ox, oy, tw * s, th * s
    lx, ly = recortar_linea(ax, ay, (bx - 6, by - 6, bw + 12, bh + 12))
    datos.append({
        'n': n, 'nombre': nombre, 'codigos': cods,
        'caja': [round(bx, 1), round(by, 1), round(bw, 1), round(bh, 1)],
        'transform': f'translate({ox:.2f} {oy:.2f}) scale({s:.4f}) {gt}',
        'd': d,
        'linea': [round(ax, 1), round(ay, 1), round(lx, 1), round(ly, 1)],
        'numero': [round(x - 2, 1), round(y - 12, 1)],
    })
    print(n, cf, f'lado={lado}', f's={s:.3f}', file=sys.stderr)

# máquina de base: contorno de la portada
lm = open(os.path.join(WT, 'app', 'components', 'sitio', 'LineasMaquinas.js')).read()
i = lm.index('export const ' + CFG['BASE'])
bloque = lm[i:lm.index('</svg>', i)]
gt = re.search(r'<g transform="([^"]+)"', bloque).group(1)
base_paths = re.findall(r' d="([^"]+)"', bloque)
salida = {
    'maquina': CFG['MAQUINA'], 'ancho': ANCHO, 'alto': ALTO,
    'base': {'transform': f'translate({BX} {BY}) scale({BS}) {gt}', 'd': base_paths},
    'guias': CFG.get('GUIAS', 'siempre'),
    'rotulo': CFG.get('ROTULO'),
    'piezas': datos,
}
json.dump(salida, open(os.path.join(S, CFG['ARCHIVO']), 'w'), ensure_ascii=False, separators=(',', ':'))
os.makedirs(os.path.join(WT, 'public', 'dibujos-despiece'), exist_ok=True)
json.dump(salida, open(os.path.join(WT, 'public', 'dibujos-despiece', CFG['ARCHIVO']), 'w'), ensure_ascii=False, separators=(',', ':'))

# vista de prueba
o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ANCHO} {ALTO}" width="1500" style="background:#fff;font-family:sans-serif">']
o.append(f'<g transform="{salida["base"]["transform"]}" fill="none" stroke="#9aa6b8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">')
o += [f'<path d="{p}"/>' for p in base_paths]
o.append('</g>')
for p in datos:
    a = p['linea']
    o.append(f'<line x1="{a[0]}" y1="{a[1]}" x2="{a[2]}" y2="{a[3]}" stroke="#9aa6b8" stroke-width="1.2" stroke-dasharray="4 4"/>')
    o.append(f'<circle cx="{a[0]}" cy="{a[1]}" r="3" fill="#9aa6b8"/>')
    o.append(f'<g transform="{p["transform"]}" fill="#13284b"><path d="{p["d"]}"/></g>')
    nx, ny = p['numero']
    o.append(f'<circle cx="{nx+12}" cy="{ny+12}" r="12" fill="#13284b"/><text x="{nx+12}" y="{ny+16.5}" font-size="13" font-weight="700" fill="#fff" text-anchor="middle">{p["n"]}</text>')
o.append('</svg>')
open(os.path.join(WT, 'public', '_lab', 'despiece-' + CFG['ARCHIVO'].replace('.json', '.svg')), 'w').write('\n'.join(o))
print('ok', file=sys.stderr)
