# Despiece de la Stihl MS 360. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 360'
ARCHIVO = 'stihl-ms360.json'
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
    (1, 'Tapa del filtro y carcasa', '2207016', ['2207016', '2220182'], celda(0, 0), A(650, 270), {'comp': 0.12}),
    (2, 'Filtro de aire', '2207055', ['2207055'], celda(1, 0), A(650, 310), {'comp': 0.12}),
    (3, 'Kit de juntas y membranas del carburador', '2209021', ['2209021'], celda(2, 0), A(470, 525), {'comp': 0.12}),
    (4, 'Carburador', '2202848', ['2202848'], celda(3, 0), A(480, 500), {'comp': 0.12}),
    (5, 'Codo y brida de admisión', '2220070', ['2220070'], celda(4, 0), A(440, 520), {'comp': 0.12}),
    (6, 'Varilla del cebador', '2220137', ['2220137'], celda(5, 0), A(385, 545), {'comp': 0.12}),
    (7, 'Cilindro y pistón', '2203047', ['2203047'], celda(6, 0), A(650, 340), {'comp': 0.12}),
    (8, 'Pistón y aros', '2204037', ['2204037', '2205027'], celda(7, 0), A(660, 370), {'comp': 0.12}),
    (9, 'Cigüeñal', '2222036', ['2222036', '2222047'], celda(0, 1), A(700, 620), {'comp': 0.12}),
    (10, 'Escape', '2203016', ['2203016', '2203403'], celda(1, 1), A(1060, 420), {'comp': 0.12}),
    (11, 'Juntas', '2210069', ['2210069'], celda(2, 1), A(1000, 460), {'comp': 0.12}),
    (12, 'Tapa de tanque', '2214032', ['2214032', '2214033'], celda(3, 1), A(215, 760), {'comp': 0.12}),
    (13, 'Tanque de combustible', '2214060', ['2214060'], celda(4, 1), A(210, 800), {'comp': 0.12}),
    (14, 'Mangueras', '2221615', ['2221615'], celda(5, 1), A(410, 610), {'comp': 0.12}),
    (15, 'Resorte de arranque', '2215041', ['2215041'], celda(6, 1), A(680, 745), {'comp': 0.12}),
    (16, 'Tapa de arranque', '2215019', ['2215019', '2215050', '2215083'], celda(7, 1), A(640, 720), {'comp': 0.12}),
    (17, 'Silentblocks', '2220099', ['2220099'], celda(0, 2), A(330, 590), {'comp': 0.12}),
    (18, 'Manubrio', '2220124', ['2220124'], celda(1, 2), A(900, 300), {'comp': 0.12}),
    (19, 'Traba giratoria', '2220191', ['2220191'], celda(2, 2), A(520, 465), {'comp': 0.12, 'lo': 25, 'hi': 70}),
    (20, 'Sinfín de la bomba de aceite', '2219043', ['2219043', '2220145'], celda(3, 2), A(1015, 780), {'comp': 0.12}),
    (21, 'Embrague y campana', '2212079', ['2212079', '2212091'], celda(4, 2), A(1010, 700), {'comp': 0.12}),
    (22, 'Manija de freno', '2220167', ['2220167'], celda(5, 2), A(1120, 200), {'comp': 0.12}),
    (23, 'Cadena', '2291030', ['2291030'], celda(6, 2), A(1500, 590), {'comp': 0.12}),
    (24, 'Válvulas de venteo y descompresión', '2201007', ['2201007', '2201009'], celda(7, 2), A(600, 330), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 3 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
