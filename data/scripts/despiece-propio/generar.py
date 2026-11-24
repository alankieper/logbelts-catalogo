"""Arma la ficha (maquina_xxx.py) de cada máquina a partir de sus repuestos del catálogo:
clasifica cada repuesto por tipo de pieza, agrupa los del mismo tipo, elige la foto a trazar,
y ubica cada pieza en la grilla con su punto en la máquina de fondo.
uso: python generar.py moto stihl__ms-180 husqvarna__61 ...
"""
import json, glob, os, re, sys, math, urllib.request

S = os.path.dirname(os.path.abspath(__file__))
FOTOS = os.path.join(S, 'wt', 'public', 'fotos')
CACHE = os.path.join(S, 'fotos-remotas'); os.makedirs(CACHE, exist_ok=True)

P = {}
for f in glob.glob(os.path.join(S, 'prod_*.json')):
    for p in json.load(open(f)):
        P[p['codigo']] = p
MODELOS = {r['k']: r for r in json.load(open(os.path.join(S, 'modelos.json')))}


def completar(c):
    """Repuestos que no están en la copia de la base (recodificados): se leen de su página publicada."""
    if c in P:
        return
    try:
        h = urllib.request.urlopen(f'https://logbelts-web.vercel.app/p/{c}', timeout=60).read().decode('utf8')
    except Exception:
        P[c] = {'codigo': c}
        return
    nombre = re.search(r'<title>(.*?) — código', h)
    img = re.search(r'og:image" content="[^"]*/fotos/([^"/]+)"', h)
    p = {'codigo': c, 'nombre': nombre.group(1) if nombre else c}
    if img:
        p['foto'] = img.group(1)
        viejo = P.get(os.path.splitext(img.group(1))[0])  # la foto suele ser la del código anterior
        if viejo:
            p['subcategoria'] = viejo.get('subcategoria')
            p['descripcion'] = viejo.get('descripcion')
    P[c] = p

# tipo, nombre de la pieza, regla, punto en la motosierra (vista de 2000 px del dibujo de Canva)
TIPOS_MOTO = [
    ('interruptor', 'Interruptor de encendido', r'interruptor', (430, 520)),
    ('tapa_filtro', 'Tapa del filtro y carcasa', r'tapa de fi ?ltro|cubierta|carcasa', (650, 270)),
    ('filtro', 'Filtro de aire', r'filtro', (650, 310)),
    ('membranas', 'Kit de juntas y membranas del carburador', r'kits de juntas y diafragmas|membrana|diafragma', (470, 525)),
    ('carburador', 'Carburador', r'carburador', (480, 500)),
    ('admision', 'Codo y brida de admisión', r'admisi[oó]n|brida|codo', (440, 520)),
    ('cebador', 'Varilla del cebador', r'cebador|choke', (385, 545)),
    ('acelerador', 'Acelerador', r'acelerador|gatillo', (262, 650)),
    ('cilindro', 'Cilindro y pistón', r'cilindro', (650, 340)),
    ('piston', 'Pistón y aros', r'pist[oó]n|\baros?\b', (660, 370)),
    ('ciguenal', 'Cigüeñal', r'cig[üu]e[ñn]al', (700, 620)),
    ('carter', 'Bloque de cárter', r'c[aá]rter', (660, 700)),
    ('reten', 'Retenes de aceite', r'ret[eé]n', (730, 660)),
    ('bobina', 'Bobina de encendido', r'bobina|encendido', (560, 520)),
    ('bujia', 'Bujía', r'buj[ií]a', (600, 450)),
    ('escape', 'Escape', r'escape|silenciador', (1060, 420)),
    ('juntas', 'Juntas', r'junta', (1000, 460)),
    ('tapa_tanque', 'Tapa de tanque', r'tapa (de )?tanque', (215, 760)),
    ('tanque_aceite', 'Tanque de aceite', r'tanque de aceite', (980, 860)),
    ('tanque', 'Tanque de combustible', r'tanque', (210, 800)),
    ('manguera', 'Mangueras', r'manguera', (410, 610)),
    ('resorte_arranque', 'Resorte de arranque', r'resorte (de )?arranque', (680, 745)),
    ('polea', 'Polea de arranque', r'polea', (705, 765)),
    ('arranque', 'Tapa de arranque', r'arranque|cazoleta', (640, 720)),
    ('silentblock', 'Silentblocks', r'silentblock|amortiguador', (330, 590)),
    ('manubrio', 'Manubrio', r'manubrio', (900, 300)),
    ('traba', 'Traba giratoria', r'traba', (520, 465)),
    ('tornilleria', 'Kit de tornillería', r'tornill', (540, 640)),
    ('sinfin', 'Sinfín de la bomba de aceite', r'sin ?f[ií]n', (1015, 780)),
    ('bomba', 'Bomba de aceite', r'bomba', (1000, 810)),
    ('tapa_pinon', 'Tapa de piñón', r'tapa de pi[ñn][oó]n', (990, 680)),
    ('resorte_embrague', 'Resorte de embrague', r'resorte (de )?embrague', (1000, 690)),
    ('embrague', 'Embrague y campana', r'campana|embrague', (1010, 700)),
    ('pinon', 'Piñón', r'pi[ñn][oó]n', (1020, 710)),
    ('cinta', 'Cinta de freno', r'cinta', (1045, 620)),
    ('manija_freno', 'Manija de freno', r'freno', (1120, 200)),
    ('tensor', 'Tensor de cadena', r'estira|tensor', (1060, 760)),
    ('garra', 'Garra de apoyo', r'garra', (1105, 560)),
    ('espada', 'Espada', r'espada', (1500, 690)),
    ('cadena', 'Cadena', r'cadena', (1500, 590)),
    ('valvulas', 'Válvulas de venteo y descompresión', r'v[aá]lvula', (600, 330)),
    ('otros', 'Otros repuestos', r'.', (650, 600)),
]


# ajustes de trazado por foto (los que ya se probaron a mano)
AJUSTES = {
    '2220180': {'comp': 0.6}, '2204031': {'comp': 0.15}, '2222030': {'comp': 0.3, 'lo': 25, 'hi': 80},
    '2222045': {'lo': 25, 'hi': 80}, '2224017': {'comp': 0.3}, '2203401': {'lo': 15, 'hi': 45},
    '2220068': {'lo': 25, 'hi': 70}, '2220135': {'recorte': [0.12, 0, 1, 1]}, '2221610': {'lo': 25, 'hi': 70},
    '2214067': {'lo': 15, 'hi': 45}, '2214068': {'lo': 15, 'hi': 45}, '2215045': {'lo': 20, 'hi': 60},
    '2220091': {'lo': 25, 'hi': 70}, '2220122': {'comp': 0.5}, '2220191': {'lo': 25, 'hi': 70},
    '2220165': {'lo': 25, 'hi': 70}, '2290517': {'invertir': True, 'comp': 0.5},
    '2291025': {'recorte': [0, 0.45, 0.75, 1], 'comp': 0.02},
    '2107136': {'recorte': [0.07, 0.07, 0.93, 0.93]}, '2120063': {'recorte': [0.07, 0.17, 0.93, 0.83]},
    '4307679': {'lo': 200, 'hi': 400}, '2107132': {'lo': 120, 'hi': 260}, '2112081': {'lo': 140, 'hi': 300},
}


def ajustes(c):
    aj = {'comp': 0.12}
    aj.update(AJUSTES.get(c, {}))
    return aj


def texto(p):
    return ' '.join(str(p.get(k) or '') for k in ('nombre', 'descripcion', 'subcategoria')).lower()


def clasificar(codigos, tipos):
    grupos = {}
    for c in codigos:
        t = texto(P.get(c, {}))
        for k, nombre, regla, ancla in tipos:
            if re.search(regla, t):
                grupos.setdefault(k, []).append(c)
                break
    return grupos


def foto_local(c):
    p = P.get(c, {})
    f = p.get('foto') or ''
    if f.startswith('http'):
        dest = os.path.join(CACHE, c + os.path.splitext(f.split('?')[0])[1])
        if not os.path.exists(dest):
            try:
                urllib.request.urlretrieve(f, dest)
            except Exception:
                return None
        # potrace/opencv no leen webp sin más: se convierte con opencv si hace falta
        return dest
    if f and os.path.exists(os.path.join(FOTOS, f)):
        return os.path.join(FOTOS, f)
    for e in ('png', 'jpg'):
        q = os.path.join(FOTOS, f'{c}.{e}')
        if os.path.exists(q):
            return q
    return None


def foto_de_tipo(k, tipos, evitar=()):
    """Foto de cualquier repuesto del catálogo del mismo tipo (cuando la pieza no tiene foto propia)."""
    for c in sorted(P):
        t = texto(P[c])
        for kk, _, regla, _ in tipos:
            if re.search(regla, t):
                if kk == k and c not in evitar and foto_local(c):
                    return c
                break
    return None


def ficha_moto(clave):
    m = MODELOS[clave]
    for c in m['cods']:
        completar(c)
    grupos = clasificar(m['cods'], TIPOS_MOTO)
    piezas = []
    for k, nombre, _, ancla in TIPOS_MOTO:
        if k not in grupos:
            continue
        cods = grupos[k]
        fuente = next((c for c in cods if foto_local(c)), None) or foto_de_tipo(k, TIPOS_MOTO)
        piezas.append((nombre, fuente, cods, ancla))
    n = len(piezas)
    cols = 8
    filas = math.ceil((n + 3) / cols)  # 3 casillas al final para el rótulo
    return piezas, cols, filas


PLANTILLA = '''# Despiece de la {maquina}. Generado por generar.py; lo lee componer.py.
MAQUINA = {maquina!r}
ARCHIVO = {archivo!r}
BASE_IMAGEN = 'canva/moto.png'
ANCHO, ALTO = 1800, {alto}
BX, BY, BS = 325, 34, 0.36
GUIAS = 'activa'
C0, F0, CW, CH = 12, 520, 222, 214


def A(x, y):
    return (x * 1.6, y * 1.6)


def celda(col, fila, ancho=1, mx=12, my=28):
    x, y = C0 + col * CW, F0 + fila * CH
    return (x + mx, y + my, CW * ancho - 2 * mx, CH - my - 10)


PIEZAS = [
{piezas}
]
ROTULO = (C0 + {rc} * CW + 12, F0 + {rf} * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {extra!r}
'''


def escribir(clave):
    m = MODELOS[clave]
    piezas, cols, filas = ficha_moto(clave)
    lineas, extra = [], {}
    for i, (nombre, fuente, cods, ancla) in enumerate(piezas):
        col, fila = i % cols, i // cols
        aj = ajustes(fuente)
        if fuente and foto_local(fuente) and not os.path.basename(foto_local(fuente)).startswith(fuente + '.'):
            extra[fuente] = foto_local(fuente)
        lineas.append(f"    ({i + 1}, {nombre!r}, {fuente!r}, {cods!r}, celda({col}, {fila}), A{ancla}, {aj!r}),")
    # rótulo: las 3 últimas casillas de la última fila
    rc, rf = cols - 3, filas - 1
    alto = 520 + filas * 214 + 20
    archivo = clave.replace('__', '-').replace('-ms-', '-ms').replace('-fs-', '-fs') + '.json'
    txt = PLANTILLA.format(maquina=m['nombre'], archivo=archivo, alto=alto, piezas='\n'.join(lineas), rc=rc, rf=rf, extra=extra)
    out = os.path.join(S, 'fichas', f'maquina_{clave}.py')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w').write(txt)
    return out, len(piezas), len(m['cods'])


if __name__ == '__main__' and sys.argv[1] == 'moto':
    for clave in sys.argv[2:]:
        out, n, r = escribir(clave)
        print(clave, n, 'piezas', r, 'repuestos', '->', os.path.basename(out))


# ---------- desmalezadoras: contorno de la portada (el mismo de la FS 120), puntos en su viewBox ----------
TIPOS_DESMA = [
    ('membranas', 'Kit de juntas y membranas del carburador', r'kits de juntas y diafragmas|diafragma|bombin', (610, 135)),
    ('juntas', 'Juntas', r'junta', (566, 140)),
    ('tanza', 'Cabezal de tanza', r'tanza|trimcut', (120, 935)),
    ('admision', 'Brida y colector de admisión', r'admisi[oó]n|brida|colector', (590, 120)),
    ('carburador', 'Carburador', r'carburador', (604, 124)),
    ('volante', 'Volante magnético', r'volante', (470, 100)),
    ('bobina', 'Bobina de encendido', r'bobina|boobina|ignici[oó]n|encendido', (492, 48)),
    ('valvulas', 'Válvula de descompresión', r'v[aá]lvula|descompresor', (530, 30)),
    ('cilindro', 'Cilindro y pistón', r'cilindro|block', (530, 36)),
    ('piston', 'Pistón y aros', r'pist[oó]n|\baros?\b|jaula', (548, 58)),
    ('carter', 'Cárter', r'c[aá]rter', (515, 140)),
    ('ciguenal', 'Cigüeñal', r'cig[üu]e[ñn]al', (520, 118)),
    ('reten', 'Retenes de aceite', r'ret[eé]n', (505, 130)),
    ('escape', 'Escape', r'escape|silenciador', (575, 40)),
    ('tapa_filtro', 'Tapa del filtro y caja filtrera', r'tapa de fi ?ltro|cubre filtro|cobertor de filtro|filtrera', (640, 70)),
    ('filtro', 'Filtro de aire', r'filtro', (634, 88)),
    ('tapa_tanque', 'Tapa de tanque', r'tapa (de )?(tanque|combustible)', (585, 170)),
    ('tanque', 'Tanque de combustible', r'tanque', (560, 165)),
    ('manguera', 'Mangueras', r'manguera', (592, 148)),
    ('resorte_arranque', 'Resorte de arranque', r'resorte (de )?arranque', (468, 116)),
    ('polea', 'Polea y cazoleta de arranque', r'polea|cazoleta|trinquete', (472, 108)),
    ('arranque', 'Tapa de arranque', r'arranque', (462, 98)),
    ('carcasa', 'Carcasa del motor', r'cobertor motor|carcasa de motor|cobertor (superior|lateral)|soporte escape', (560, 60)),
    ('resorte_embrague', 'Resorte de embrague', r'resorte (de )?embrague', (470, 212)),
    ('embrague', 'Embrague y campana', r'embrague|campana', (480, 228)),
    ('acelerador', 'Acelerador y cable', r'acelerador|gatillo|cable', (726, 300)),
    ('arnes', 'Enganche del arnés', r'arn[eé]s', (380, 370)),
    ('manillar', 'Manillar', r'manillar|manija', (600, 395)),
    ('cardan', 'Eje cardán y cañonera', r'card[aá]n|ca[ñn]onera|ca[ñn]o|tubo|buje', (330, 520)),
    ('protector', 'Protector del cabezal', r'protector|cortador|cobertor de cabezal', (226, 850)),
    ('tuerca', 'Tuerca de la cuchilla', r'tuerca', (139, 880)),
    ('rulemanes', 'Rulemanes, arandelas y taza', r'rulem[aá]n|arandela|taza', (150, 840)),
    ('engranajes', 'Caja de engranajes', r'engranaje|caja eng|puntera|kit de reparaci', (139, 850)),
    ('tornilleria', 'Tornillería', r'tornill', (520, 140)),
    ('otros', 'Otros repuestos', r'.', (545, 90)),
]

DCW, DCH, DC0, DF0 = 222, 238, 12, 20


def celdas_desma(n):
    """Casillas: al lado de la máquina (columnas 4 a 7, filas 0 a 3) y después a todo el ancho."""
    out, fila = [], 0
    while len(out) < n + 3:
        cols = range(4, 8) if fila < 4 else range(0, 8)
        for col in cols:
            out.append((col, fila))
        fila += 1
    return out


def escribir_desma(clave):
    m = MODELOS[clave]
    for c in m['cods']:
        completar(c)
    grupos = clasificar(m['cods'], TIPOS_DESMA)
    piezas = []
    for k, nombre, _, ancla in TIPOS_DESMA:
        if k in grupos:
            cods = grupos[k]
            fuente = next((c for c in cods if foto_local(c)), None) or foto_de_tipo(k, TIPOS_DESMA)
            piezas.append((nombre, fuente, cods, ancla))
    cel = celdas_desma(len(piezas))
    lineas, extra = [], {}
    for i, (nombre, fuente, cods, ancla) in enumerate(piezas):
        col, fila = cel[i]
        x, y = DC0 + col * DCW + 12, DF0 + fila * DCH + 28
        caja = (x, y, DCW - 24, DCH - 38)
        if fuente and foto_local(fuente) and not os.path.basename(foto_local(fuente)).startswith(fuente + '.'):
            extra[fuente] = foto_local(fuente)
        lineas.append(f"    ({i + 1}, {nombre!r}, {fuente!r}, {cods!r}, {caja!r}, {ancla!r}, {ajustes(fuente)!r}),")
    # rótulo: tres casillas libres al final (si la última fila está llena, en una fila nueva)
    usados = len(piezas)
    rc, rf = cel[usados]
    ult_fila_cols = 8 if rf >= 4 else 4
    if rc + 3 > (8 if rf >= 4 else 8):
        rf += 1; rc = 0 if rf >= 4 else 4
    rc = max(rc, (8 - 3) if False else rc)
    filas = rf + 1
    alto = max(1000, DF0 + filas * DCH + 20)
    rot = (DC0 + rc * DCW + 12, DF0 + rf * DCH + 20, 3 * DCW - 24, DCH - 50)
    archivo = clave.replace('__', '-').replace('-fs-', '-fs').replace('-srm-', '-srm') + '.json'
    txt = f'''# Despiece de la {m['nombre']}. Generado por generar.py (desmalezadora); lo lee componer.py.
MAQUINA = {m['nombre']!r}
ARCHIVO = {archivo!r}
BASE = 'DesmalezadoraContorno'
ANCHO, ALTO = 1800, {alto}
BX, BY, BS = 40, 30, 0.9
GUIAS = 'activa'
PIEZAS = [
{chr(10).join(lineas)}
]
ROTULO = {rot!r}
FOTOS_EXTRA = {extra!r}
'''
    out = os.path.join(S, 'fichas', f'maquina_{clave}.py')
    open(out, 'w').write(txt)
    return out, len(piezas), len(m['cods'])


if __name__ == '__main__' and sys.argv[1] == 'desma':
    for clave in sys.argv[2:]:
        out, n, r = escribir_desma(clave)
        print(clave, n, 'piezas', r, 'repuestos', '->', os.path.basename(out))
