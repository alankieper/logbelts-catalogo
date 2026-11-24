# Despiece de la Stihl MS 210. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 210'
ARCHIVO = 'stihl-ms210.json'
BASE_IMAGEN = 'motosierra-canva.png'
ANCHO, ALTO = 1800, 1182
BX, BY, BS = 325, 34, 0.36
GUIAS = 'activa'
C0, F0, CW, CH = 12, 520, 222, 214


def A(x, y):
    return (x * 1.6, y * 1.6)


def celda(col, fila, ancho=1, mx=12, my=28):
    x, y = C0 + col * CW, F0 + fila * CH
    return (x + mx, y + my, CW * ancho - 2 * mx, CH - my - 10)


PIEZAS = [
    (1, 'Tapa del filtro y carcasa', '2207015', ['2207015'], celda(0, 0), A(650, 270), {'comp': 0.12}),
    (2, 'Kit de juntas y membranas del carburador', '2909035', ['2909035'], celda(1, 0), A(470, 525), {'comp': 0.12}),
    (3, 'Codo y brida de admisión', '2220069', ['2220069', '2220094'], celda(2, 0), A(440, 520), {'comp': 0.12}),
    (4, 'Varilla del cebador', '2220136', ['2220136'], celda(3, 0), A(385, 545), {'comp': 0.12}),
    (5, 'Cilindro y pistón', '2203043', ['2203043'], celda(4, 0), A(650, 340), {'comp': 0.12}),
    (6, 'Pistón y aros', '2204033', ['2204033', '2205024'], celda(5, 0), A(660, 370), {'comp': 0.12}),
    (7, 'Escape', '2210015', ['2210015'], celda(6, 0), A(1060, 420), {'comp': 0.12}),
    (8, 'Juntas', '2210011', ['2210011'], celda(7, 0), A(1000, 460), {'comp': 0.12}),
    (9, 'Tapa de tanque', '2214030', ['2214030'], celda(0, 1), A(215, 760), {'comp': 0.12}),
    (10, 'Tanque de combustible', '2214029', ['2214029'], celda(1, 1), A(210, 800), {'comp': 0.12}),
    (11, 'Tapa de arranque', '2215082', ['2215082'], celda(2, 1), A(640, 720), {'comp': 0.12}),
    (12, 'Silentblocks', '2220092', ['2220092'], celda(3, 1), A(330, 590), {'comp': 0.12}),
    (13, 'Traba giratoria', '2220192', ['2220192'], celda(4, 1), A(520, 465), {'comp': 0.12}),
    (14, 'Sinfín de la bomba de aceite', '2219049', ['2219049', '2219063'], celda(5, 1), A(1015, 780), {'comp': 0.12}),
    (15, 'Embrague y campana', '2212089', ['2212089'], celda(6, 1), A(1010, 700), {'comp': 0.12}),
    (16, 'Garra de apoyo', '2220080', ['2220080'], celda(7, 1), A(1105, 560), {'comp': 0.12}),
    (17, 'Válvulas de venteo y descompresión', '2201008', ['2201008'], celda(0, 2), A(600, 330), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 2 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {'2909035': '/private/tmp/claude-502/-Users-alankieper--claude-spares-spare-JwqGkO/bdb2ee8a-f3f5-4bfe-a9da-bac05da5d67f/scratchpad/wt/public/fotos/2209035.jpg'}
