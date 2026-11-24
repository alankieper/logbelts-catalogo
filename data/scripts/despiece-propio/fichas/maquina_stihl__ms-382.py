# Despiece de la Stihl MS 382. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 382'
ARCHIVO = 'stihl-ms382.json'
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
    (1, 'Filtro de aire', '2207054', ['2207054'], celda(0, 0), A(650, 310), {'comp': 0.12}),
    (2, 'Carburador', '2202857', ['2202857'], celda(1, 0), A(480, 500), {'comp': 0.12}),
    (3, 'Codo y brida de admisión', '2220073', ['2220073', '2220097'], celda(2, 0), A(440, 520), {'comp': 0.12}),
    (4, 'Cilindro y pistón', '2203054', ['2203054'], celda(3, 0), A(650, 340), {'comp': 0.12}),
    (5, 'Pistón y aros', '2204042', ['2204042'], celda(4, 0), A(660, 370), {'comp': 0.12}),
    (6, 'Cigüeñal', '2222039', ['2222039'], celda(5, 0), A(700, 620), {'comp': 0.12}),
    (7, 'Retenes de aceite', '2227653', ['2227653', '2227656'], celda(6, 0), A(730, 660), {'comp': 0.12}),
    (8, 'Bobina de encendido', '2224023', ['2224023', '2224029'], celda(7, 0), A(560, 520), {'comp': 0.12}),
    (9, 'Escape', '2203019', ['2203019'], celda(0, 1), A(1060, 420), {'comp': 0.12}),
    (10, 'Juntas', '2210061', ['2210061'], celda(1, 1), A(1000, 460), {'comp': 0.12}),
    (11, 'Resorte de arranque', '2215042', ['2215042'], celda(2, 1), A(680, 745), {'comp': 0.12}),
    (12, 'Polea de arranque', '2215047', ['2215047'], celda(3, 1), A(705, 765), {'comp': 0.12}),
    (13, 'Tapa de arranque', '2215023', ['2215023'], celda(4, 1), A(640, 720), {'comp': 0.12}),
    (14, 'Manubrio', '2220126', ['2220126'], celda(5, 1), A(900, 300), {'comp': 0.12}),
    (15, 'Traba giratoria', '2220193', ['2220193'], celda(6, 1), A(520, 465), {'comp': 0.12}),
    (16, 'Kit de tornillería', '2220209', ['2220209'], celda(7, 1), A(540, 640), {'comp': 0.12}),
    (17, 'Sinfín de la bomba de aceite', '2219046', ['2219046'], celda(0, 2), A(1015, 780), {'comp': 0.12}),
    (18, 'Embrague y campana', '2212040', ['2212040'], celda(1, 2), A(1010, 700), {'comp': 0.12}),
    (19, 'Espada', '2290534', ['2290534'], celda(2, 2), A(1500, 690), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 2 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
