# Despiece de la Husqvarna 61. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Husqvarna 61'
ARCHIVO = 'husqvarna-61.json'
BASE_IMAGEN = 'motosierra-canva.png'
ANCHO, ALTO = 1800, 1396
BX, BY, BS = 325, 34, 0.36
GUIAS = 'activa'
C0, F0, CW, CH = 12, 520, 222, 214


def A(x, y):
    return (x * 1.6, y * 1.6)


def celda(col, fila, ancho=1, mx=12, my=28):
    x, y = C0 + col * CW, F0 + fila * CH
    return (x + mx, y + my, CW * ancho - 2 * mx, CH - my - 10)


PIEZAS = [
    (1, 'Interruptor de encendido', '2220199', ['2220199'], celda(0, 0), A(430, 520), {'comp': 0.12}),
    (2, 'Tapa del filtro y carcasa', '2220178', ['2220178'], celda(1, 0), A(650, 270), {'comp': 0.12}),
    (3, 'Filtro de aire', '4307668', ['4307668'], celda(2, 0), A(650, 310), {'comp': 0.12}),
    (4, 'Carburador', '2202828', ['2202828'], celda(3, 0), A(480, 500), {'comp': 0.12}),
    (5, 'Varilla del cebador', '2220133', ['2220133'], celda(4, 0), A(385, 545), {'comp': 0.12}),
    (6, 'Cilindro y pistón', '2203065', ['2203065'], celda(5, 0), A(650, 340), {'comp': 0.12}),
    (7, 'Pistón y aros', '2204058', ['2204058', '2205030'], celda(6, 0), A(660, 370), {'comp': 0.12}),
    (8, 'Cigüeñal', '2222050', ['2222050', '2222055'], celda(7, 0), A(700, 620), {'comp': 0.12}),
    (9, 'Retenes de aceite', '2227656', ['2227656'], celda(0, 1), A(730, 660), {'comp': 0.12}),
    (10, 'Bobina de encendido', '2224038', ['2224038'], celda(1, 1), A(560, 520), {'comp': 0.12}),
    (11, 'Escape', '2203025', ['2203025', '2203405'], celda(2, 1), A(1060, 420), {'comp': 0.12}),
    (12, 'Juntas', '2210066', ['2210066'], celda(3, 1), A(1000, 460), {'comp': 0.12}),
    (13, 'Tapa de tanque', '2214041', ['2214041'], celda(4, 1), A(215, 760), {'comp': 0.12}),
    (14, 'Tanque de combustible', '2214023', ['2214023'], celda(5, 1), A(210, 800), {'comp': 0.12}),
    (15, 'Tapa de arranque', '2215029', ['2215029', '2215030', '2215080'], celda(6, 1), A(640, 720), {'comp': 0.12}),
    (16, 'Silentblocks', '2220106', ['2220106'], celda(7, 1), A(330, 590), {'comp': 0.12}),
    (17, 'Manubrio', '2219092', ['2219092', '2220120'], celda(0, 2), A(900, 300), {'comp': 0.12}),
    (18, 'Sinfín de la bomba de aceite', '2219058', ['2219058'], celda(1, 2), A(1015, 780), {'comp': 0.12}),
    (19, 'Resorte de embrague', '2112107', ['2112107'], celda(2, 2), A(1000, 690), {'comp': 0.12}),
    (20, 'Embrague y campana', '2212055', ['2212055', '2212078', '2212102', '2212103', '2212104'], celda(3, 2), A(1010, 700), {'comp': 0.12}),
    (21, 'Manija de freno', '2220171', ['2220171'], celda(4, 2), A(1120, 200), {'comp': 0.12}),
    (22, 'Garra de apoyo', '2220082', ['2220082'], celda(5, 2), A(1105, 560), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 3 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
