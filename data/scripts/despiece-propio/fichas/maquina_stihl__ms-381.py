# Despiece de la Stihl MS 381. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 381'
ARCHIVO = 'stihl-ms381.json'
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
    (1, 'Tapa del filtro y carcasa', '2207018', ['2207018', '2220185'], celda(0, 0), A(650, 270), {'comp': 0.12}),
    (2, 'Kit de juntas y membranas del carburador', '2209096', ['2209096'], celda(1, 0), A(470, 525), {'comp': 0.12}),
    (3, 'Carburador', '2202804', ['2202804', '2202809'], celda(2, 0), A(480, 500), {'comp': 0.12}),
    (4, 'Codo y brida de admisión', '2220072', ['2220072', '2220097'], celda(3, 0), A(440, 520), {'comp': 0.12}),
    (5, 'Cilindro y pistón', '2203053', ['2203053'], celda(4, 0), A(650, 340), {'comp': 0.12}),
    (6, 'Pistón y aros', '2204041', ['2204041', '2205029'], celda(5, 0), A(660, 370), {'comp': 0.12}),
    (7, 'Cigüeñal', '2222038', ['2222038', '2222049'], celda(6, 0), A(700, 620), {'comp': 0.12}),
    (8, 'Retenes de aceite', '2227653', ['2227653', '2227656'], celda(7, 0), A(730, 660), {'comp': 0.12}),
    (9, 'Escape', '2203019', ['2203019', '2203402'], celda(0, 1), A(1060, 420), {'comp': 0.12}),
    (10, 'Juntas', '2210060', ['2210060'], celda(1, 1), A(1000, 460), {'comp': 0.12}),
    (11, 'Tapa de tanque', '2214036', ['2214036', '2214037'], celda(2, 1), A(215, 760), {'comp': 0.12}),
    (12, 'Tanque de combustible', '2214063', ['2214063'], celda(3, 1), A(210, 800), {'comp': 0.12}),
    (13, 'Mangueras', '2221614', ['2221614', '2221618', '2921021'], celda(4, 1), A(410, 610), {'comp': 0.12}),
    (14, 'Resorte de arranque', '2215042', ['2215042'], celda(5, 1), A(680, 745), {'comp': 0.12}),
    (15, 'Polea de arranque', '2215047', ['2215047'], celda(6, 1), A(705, 765), {'comp': 0.12}),
    (16, 'Tapa de arranque', '2215022', ['2215022', '2215085'], celda(7, 1), A(640, 720), {'comp': 0.12}),
    (17, 'Manubrio', '2220126', ['2220126'], celda(0, 2), A(900, 300), {'comp': 0.12}),
    (18, 'Traba giratoria', '2220193', ['2220193'], celda(1, 2), A(520, 465), {'comp': 0.12}),
    (19, 'Kit de tornillería', '2220209', ['2220209'], celda(2, 2), A(540, 640), {'comp': 0.12}),
    (20, 'Sinfín de la bomba de aceite', '2219095', ['2219095', '2220146'], celda(3, 2), A(1015, 780), {'comp': 0.12}),
    (21, 'Resorte de embrague', '2212047', ['2212047'], celda(4, 2), A(1000, 690), {'comp': 0.12}),
    (22, 'Embrague y campana', '2212039', ['2212039'], celda(5, 2), A(1010, 700), {'comp': 0.12}),
    (23, 'Manija de freno', '2220170', ['2220170'], celda(6, 2), A(1120, 200), {'comp': 0.12}),
    (24, 'Garra de apoyo', '2220081', ['2220081'], celda(7, 2), A(1105, 560), {'comp': 0.12}),
    (25, 'Espada', '2290534', ['2290534', '2290537'], celda(0, 3), A(1500, 690), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 3 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
