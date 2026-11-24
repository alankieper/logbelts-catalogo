# Despiece de la Husqvarna 372. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Husqvarna 372'
ARCHIVO = 'husqvarna-372.json'
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
    (1, 'Interruptor de encendido', '2220200', ['2220200'], celda(0, 0), A(430, 520), {'comp': 0.12}),
    (2, 'Tapa del filtro y carcasa', '2207014', ['2207014', '2220179'], celda(1, 0), A(650, 270), {'comp': 0.12}),
    (3, 'Filtro de aire', '4307666', ['4307666'], celda(2, 0), A(650, 310), {'comp': 0.12}),
    (4, 'Codo y brida de admisión', '2220098', ['2220098'], celda(3, 0), A(440, 520), {'comp': 0.12}),
    (5, 'Varilla del cebador', '2220134', ['2220134'], celda(4, 0), A(385, 545), {'comp': 0.12}),
    (6, 'Acelerador', '2125161', ['2125161'], celda(5, 0), A(262, 650), {'comp': 0.12}),
    (7, 'Cilindro y pistón', '2203081', ['2203081'], celda(6, 0), A(650, 340), {'comp': 0.12}),
    (8, 'Cigüeñal', '2222056', ['2222056'], celda(7, 0), A(700, 620), {'comp': 0.12}),
    (9, 'Bobina de encendido', '2224037', ['2224037'], celda(0, 1), A(560, 520), {'comp': 0.12}),
    (10, 'Escape', '2203026', ['2203026', '2203027'], celda(1, 1), A(1060, 420), {'comp': 0.12}),
    (11, 'Juntas', '2210075', ['2210075'], celda(2, 1), A(1000, 460), {'comp': 0.12}),
    (12, 'Tanque de combustible', '2214024', ['2214024'], celda(3, 1), A(210, 800), {'comp': 0.12}),
    (13, 'Tapa de arranque', '2215081', ['2215081'], celda(4, 1), A(640, 720), {'comp': 0.12}),
    (14, 'Silentblocks', '2220107', ['2220107', '2220108'], celda(5, 1), A(330, 590), {'comp': 0.12}),
    (15, 'Sinfín de la bomba de aceite', '2219059', ['2219059', '2219093'], celda(6, 1), A(1015, 780), {'comp': 0.12}),
    (16, 'Resorte de embrague', '2112107', ['2112107'], celda(7, 1), A(1000, 690), {'comp': 0.12}),
    (17, 'Embrague y campana', '2212056', ['2212056', '2212084'], celda(0, 2), A(1010, 700), {'comp': 0.12}),
    (18, 'Manija de freno', '2220172', ['2220172'], celda(1, 2), A(1120, 200), {'comp': 0.12}),
    (19, 'Garra de apoyo', '2220083', ['2220083'], celda(2, 2), A(1105, 560), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 2 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
