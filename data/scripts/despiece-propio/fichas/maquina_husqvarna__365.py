# Despiece de la Husqvarna 365. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Husqvarna 365'
ARCHIVO = 'husqvarna-365.json'
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
    (1, 'Interruptor de encendido', '2220200', ['2220200'], celda(0, 0), A(430, 520), {'comp': 0.12}),
    (2, 'Tapa del filtro y carcasa', '2207014', ['2207014', '2220179'], celda(1, 0), A(650, 270), {'comp': 0.12}),
    (3, 'Kit de juntas y membranas del carburador', '2209024', ['2209024'], celda(2, 0), A(470, 525), {'comp': 0.12}),
    (4, 'Carburador', '2202827', ['2202827'], celda(3, 0), A(480, 500), {'comp': 0.12}),
    (5, 'Codo y brida de admisión', '2220098', ['2220098'], celda(4, 0), A(440, 520), {'comp': 0.12}),
    (6, 'Varilla del cebador', '2220134', ['2220134'], celda(5, 0), A(385, 545), {'comp': 0.12}),
    (7, 'Acelerador', '2125161', ['2125161'], celda(6, 0), A(262, 650), {'comp': 0.12}),
    (8, 'Cilindro y pistón', '2203080', ['2203080'], celda(7, 0), A(650, 340), {'comp': 0.12}),
    (9, 'Pistón y aros', '2204056', ['2204056', '2205031', '2205032'], celda(0, 1), A(660, 370), {'comp': 0.12}),
    (10, 'Cigüeñal', '2222051', ['2222051', '2222052', '2222056'], celda(1, 1), A(700, 620), {'comp': 0.12}),
    (11, 'Bobina de encendido', '2224037', ['2224037'], celda(2, 1), A(560, 520), {'comp': 0.12}),
    (12, 'Escape', '2203026', ['2203026', '2203027'], celda(3, 1), A(1060, 420), {'comp': 0.12}),
    (13, 'Juntas', '2210075', ['2210075'], celda(4, 1), A(1000, 460), {'comp': 0.12}),
    (14, 'Tapa de tanque', '2214046', ['2214046'], celda(5, 1), A(215, 760), {'comp': 0.12}),
    (15, 'Tanque de combustible', '2214024', ['2214024'], celda(6, 1), A(210, 800), {'comp': 0.12}),
    (16, 'Tapa de arranque', '2215081', ['2215081'], celda(7, 1), A(640, 720), {'comp': 0.12}),
    (17, 'Silentblocks', '2220107', ['2220107', '2220108'], celda(0, 2), A(330, 590), {'comp': 0.12}),
    (18, 'Manubrio', '2220121', ['2220121'], celda(1, 2), A(900, 300), {'comp': 0.12}),
    (19, 'Sinfín de la bomba de aceite', '2219059', ['2219059', '2219093', '2219094'], celda(2, 2), A(1015, 780), {'comp': 0.12}),
    (20, 'Resorte de embrague', '2112107', ['2112107'], celda(3, 2), A(1000, 690), {'comp': 0.12}),
    (21, 'Embrague y campana', '2212056', ['2212056', '2212084', '2212101'], celda(4, 2), A(1010, 700), {'comp': 0.12}),
    (22, 'Manija de freno', '2220172', ['2220172'], celda(5, 2), A(1120, 200), {'comp': 0.12}),
    (23, 'Garra de apoyo', '2220083', ['2220083'], celda(6, 2), A(1105, 560), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 3 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
