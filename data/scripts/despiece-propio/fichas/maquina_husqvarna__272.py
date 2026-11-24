# Despiece de la Husqvarna 272. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Husqvarna 272'
ARCHIVO = 'husqvarna-272.json'
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
    (1, 'Tapa del filtro y carcasa', '2220178', ['2220178'], celda(0, 0), A(650, 270), {'comp': 0.12}),
    (2, 'Varilla del cebador', '2220133', ['2220133'], celda(1, 0), A(385, 545), {'comp': 0.12}),
    (3, 'Cilindro y pistón', '2203073', ['2203073'], celda(2, 0), A(650, 340), {'comp': 0.12}),
    (4, 'Cigüeñal', '2222050', ['2222050', '2222055'], celda(3, 0), A(700, 620), {'comp': 0.12}),
    (5, 'Escape', '2203025', ['2203025', '2203405'], celda(4, 0), A(1060, 420), {'comp': 0.12}),
    (6, 'Tapa de tanque', '2214041', ['2214041'], celda(5, 0), A(215, 760), {'comp': 0.12}),
    (7, 'Tanque de combustible', '2214023', ['2214023'], celda(6, 0), A(210, 800), {'comp': 0.12}),
    (8, 'Tapa de arranque', '2215080', ['2215080'], celda(7, 0), A(640, 720), {'comp': 0.12}),
    (9, 'Silentblocks', '2220106', ['2220106'], celda(0, 1), A(330, 590), {'comp': 0.12}),
    (10, 'Manubrio', '2219092', ['2219092', '2220120'], celda(1, 1), A(900, 300), {'comp': 0.12}),
    (11, 'Sinfín de la bomba de aceite', '2219058', ['2219058'], celda(2, 1), A(1015, 780), {'comp': 0.12}),
    (12, 'Embrague y campana', '2212055', ['2212055', '2212078'], celda(3, 1), A(1010, 700), {'comp': 0.12}),
    (13, 'Manija de freno', '2220171', ['2220171'], celda(4, 1), A(1120, 200), {'comp': 0.12}),
    (14, 'Garra de apoyo', '2220082', ['2220082'], celda(5, 1), A(1105, 560), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 2 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
