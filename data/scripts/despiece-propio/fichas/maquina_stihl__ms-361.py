# Despiece de la Stihl MS 361. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 361'
ARCHIVO = 'stihl-ms361.json'
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
    (1, 'Tapa del filtro y carcasa', '2207017', ['2207017', '2220183'], celda(0, 0), A(650, 270), {'comp': 0.12}),
    (2, 'Filtro de aire', '2207057', ['2207057'], celda(1, 0), A(650, 310), {'comp': 0.12}),
    (3, 'Kit de juntas y membranas del carburador', '2109207', ['2109207', '2209135'], celda(2, 0), A(470, 525), {'comp': 0.12}),
    (4, 'Carburador', '2202846', ['2202846'], celda(3, 0), A(480, 500), {'comp': 0.12}),
    (5, 'Codo y brida de admisión', '2220071', ['2220071'], celda(4, 0), A(440, 520), {'comp': 0.12}),
    (6, 'Cilindro y pistón', '2203048', ['2203048', '2210032'], celda(5, 0), A(650, 340), {'comp': 0.12}),
    (7, 'Pistón y aros', '2204038', ['2204038', '2205028'], celda(6, 0), A(660, 370), {'comp': 0.12}),
    (8, 'Cigüeñal', '2222037', ['2222037', '2222048'], celda(7, 0), A(700, 620), {'comp': 0.12}),
    (9, 'Retenes de aceite', '2227654', ['2227654', '2227656'], celda(0, 1), A(730, 660), {'comp': 0.12}),
    (10, 'Bobina de encendido', '2224020', ['2224020'], celda(1, 1), A(560, 520), {'comp': 0.12}),
    (11, 'Escape', '2203017', ['2203017', '2203404', '2210031'], celda(2, 1), A(1060, 420), {'comp': 0.12}),
    (12, 'Juntas', '2210030', ['2210030'], celda(3, 1), A(1000, 460), {'comp': 0.12}),
    (13, 'Tanque de combustible', '2214061', ['2214061'], celda(4, 1), A(210, 800), {'comp': 0.12}),
    (14, 'Resorte de arranque', '2215041', ['2215041'], celda(5, 1), A(680, 745), {'comp': 0.12}),
    (15, 'Tapa de arranque', '2215020', ['2215020', '2215050', '2215073', '2215084'], celda(6, 1), A(640, 720), {'comp': 0.12}),
    (16, 'Manubrio', '2220125', ['2220125'], celda(7, 1), A(900, 300), {'comp': 0.12}),
    (17, 'Traba giratoria', '2220194', ['2220194'], celda(0, 2), A(520, 465), {'comp': 0.12}),
    (18, 'Kit de tornillería', '2220208', ['2220208'], celda(1, 2), A(540, 640), {'comp': 0.12}),
    (19, 'Sinfín de la bomba de aceite', '2219065', ['2219065', '2220144'], celda(2, 2), A(1015, 780), {'comp': 0.12}),
    (20, 'Embrague y campana', '2212038', ['2212038'], celda(3, 2), A(1010, 700), {'comp': 0.12}),
    (21, 'Manija de freno', '2220168', ['2220168'], celda(4, 2), A(1120, 200), {'comp': 0.12}),
    (22, 'Espada', '2290534', ['2290534', '2290543'], celda(5, 2), A(1500, 690), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 3 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
