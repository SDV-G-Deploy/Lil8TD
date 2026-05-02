from PIL import Image, ImageDraw
from pathlib import Path

S = 4
W, H = 256 * S, 176 * S
img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

def xy(v): return int(round(v * S))
def rect(x0, y0, x1, y1, c): d.rectangle([xy(x0), xy(y0), xy(x1) - 1, xy(y1) - 1], fill=c)
def poly(points, c): d.polygon([(xy(x), xy(y)) for x, y in points], fill=c)
def line(points, c, w=1): d.line([(xy(x), xy(y)) for x, y in points], fill=c, width=max(1, xy(w)))
def dot(x, y, c): rect(x, y, x + 1, y + 1, c)

INK = '#21140e'
INK2 = '#392416'
HI = '#f3d891'

# The atlas is intentionally chunky and asymmetric. It should read as drawn game art at phone size,
# not as procedural tiles with tiny noise.

def grass_tile(x, y, seed):
    bases = ['#1b3f24', '#214c28', '#183920', '#254f2d']
    mids = ['#2f6433', '#3f7138', '#365f2e', '#496d35']
    rect(x, y, x + 32, y + 32, '#0b1710')
    # irregular painted body
    poly([(x+2,y+3),(x+28,y+1),(x+31,y+10),(x+29,y+29),(x+7,y+31),(x+1,y+24)], bases[seed % 4])
    poly([(x+5,y+7),(x+20,y+4),(x+27,y+11),(x+24,y+22),(x+10,y+26),(x+4,y+18)], mids[seed % 4])
    poly([(x+3,y+22),(x+12,y+19),(x+19,y+24),(x+27,y+22),(x+30,y+29),(x+6,y+30)], '#142a19')
    # broad brush strokes, not confetti
    line([(x+4,y+11),(x+10,y+8),(x+18,y+9),(x+25,y+6)], '#6d8345', 2)
    line([(x+7,y+19),(x+13,y+16),(x+20,y+17)], '#7b8c4a', 2)
    line([(x+17,y+25),(x+24,y+22),(x+29,y+23)], '#506b36', 2)
    if seed in (0, 2):
        # chunky flower/weed clump
        rect(x+8,y+15,x+10,y+18,'#cfa55f'); rect(x+7,y+16,x+11,y+17,'#e5bd71')
        rect(x+5,y+18,x+13,y+20,'#365f2e')
    if seed in (1, 3):
        # little stone/sprout landmark for phone-scale variety
        poly([(x+19,y+18),(x+25,y+17),(x+27,y+22),(x+22,y+24)], '#8b805f')
        line([(x+20,y+18),(x+25,y+17)], '#d8bd78', 1)
    if seed == 3:
        # one tiny storybook mushroom; rare and chunky enough not to become noise
        rect(x+12,y+21,x+14,y+25,'#d7bd83')
        poly([(x+9,y+20),(x+14,y+17),(x+20,y+21)], '#b95a42')
        rect(x+13,y+19,x+15,y+20,'#ffd98a')
    # hand outline
    line([(x+2,y+4),(x+28,y+2),(x+30,y+11),(x+29,y+29),(x+7,y+30),(x+2,y+24),(x+2,y+4)], '#102116', 1)


def path_tile(x, y, seed):
    rect(x, y, x + 32, y + 32, '#24150e')
    # dark grass/earth shoulders make path distinct and less tiled
    poly([(x+0,y+0),(x+32,y+0),(x+30,y+8),(x+24,y+11),(x+7,y+9),(x+1,y+13)], '#3b291a')
    poly([(x+0,y+32),(x+32,y+32),(x+31,y+22),(x+25,y+20),(x+7,y+22),(x+1,y+18)], '#2e1e14')
    # meandering painted road center
    wob = seed % 4
    poly([(x+4,y+9+wob),(x+14,y+6),(x+27,y+8),(x+30,y+14),(x+27,y+24),(x+15,y+26),(x+4,y+23),(x+2,y+15)], '#704622')
    poly([(x+7,y+11),(x+16,y+9),(x+25,y+11),(x+26,y+16),(x+23,y+21),(x+14,y+23),(x+7,y+20),(x+5,y+15)], '#b97535')
    poly([(x+9,y+14),(x+17,y+12),(x+24,y+14),(x+22,y+17),(x+15,y+19),(x+8,y+18)], '#d4934a')
    line([(x+6,y+22),(x+13,y+24),(x+23,y+22),(x+27,y+18)], '#4d2d18', 2)
    line([(x+8,y+11),(x+17,y+9),(x+25,y+11)], '#e3b15e', 1)
    # chunky border stones/planks
    for i, px in enumerate([4 + (seed % 3), 15, 25 - (seed % 2)]):
        c = '#8d7a55' if i != 1 else '#aa8b5b'
        poly([(x+px,y+4),(x+px+5,y+4),(x+px+6,y+7),(x+px+1,y+8)], c)
        line([(x+px+1,y+4),(x+px+5,y+4)], '#e2c77c', 1)
    for i, px in enumerate([7, 18 + (seed % 4)]):
        poly([(x+px,y+25),(x+px+7,y+24),(x+px+8,y+28),(x+px+1,y+29)], '#66523b')
    if seed == 2:
        # small warm road marker, useful for handcrafted rhythm but low priority
        rect(x+27,y+15,x+30,y+19,'#3b291a')
        rect(x+28,y+12,x+29,y+16,'#d4a85f')
    line([(x+3,y+10+wob),(x+14,y+7),(x+27,y+8),(x+30,y+14),(x+27,y+24),(x+15,y+26),(x+4,y+23),(x+2,y+15),(x+3,y+10+wob)], INK2, 1)


def tower_base(x, y, stone, roof, trim):
    # exaggerated toy-soldier tower base, intentionally crooked
    poly([(x+4,y+50),(x+44,y+48),(x+48,y+54),(x+8,y+56)], '#00000088')
    poly([(x+6,y+36),(x+41,y+34),(x+45,y+48),(x+5,y+51)], '#1a100c')
    poly([(x+9,y+17),(x+36,y+13),(x+41,y+43),(x+12,y+46)], stone)
    line([(x+9,y+17),(x+36,y+13),(x+41,y+43),(x+12,y+46),(x+9,y+17)], INK, 2)
    rect(x+14,y+22,x+20,y+27,'#f2ddb055'); rect(x+29,y+20,x+35,y+25,'#f2ddb055')
    line([(x+13,y+31),(x+38,y+29)], '#26232a', 3)
    line([(x+15,y+38),(x+36,y+36)], '#f6d99844', 1)
    poly([(x+5,y+10),(x+39,y+6),(x+44,y+17),(x+8,y+21)], roof)
    line([(x+5,y+10),(x+39,y+6),(x+44,y+17),(x+8,y+21),(x+5,y+10)], INK, 2)
    line([(x+9,y+9),(x+37,y+5)], trim, 3)
    line([(x+13,y+18),(x+37,y+16)], '#ffffff33', 1)
    # cheeky inset badge/face hint gives warmth without becoming UI clutter
    rect(x+21,y+25,x+26,y+29,'#1b1411')
    rect(x+22,y+26,x+24,y+28,'#ffe7a166')


def tower_arrow(x, y):
    tower_base(x, y, '#666166', '#7b5a2e', '#ffe680')
    # jaunty oversized bow + pennant: reliable, toy-soldier, not sleek/mobile
    line([(x+23,y+17),(x+25,y-2)], '#4b321d', 3)
    line([(x+11,y+5),(x+22,y-1),(x+36,y+5)], '#f0cf54', 4)
    line([(x+11,y+5),(x+21,y+11),(x+36,y+5)], '#7e5a24', 2)
    line([(x+12,y+5),(x+35,y+5)], '#fff1a1', 1)
    poly([(x+35,y-1),(x+47,y+4),(x+36,y+9)], '#f8eaa1')
    line([(x+35,y-1),(x+47,y+4),(x+36,y+9)], INK2, 1)
    rect(x+7,y+0,x+12,y+12,'#b9472e'); line([(x+7,y+0),(x+12,y+0),(x+12,y+12)], INK, 1)


def tower_burst(x, y):
    tower_base(x, y, '#6b584c', '#82371e', '#ffd179')
    # squat kettle-cannon with a friendly ember belly
    poly([(x+5,y+5),(x+36,y+0),(x+44,y+8),(x+12,y+14)], '#4b2517')
    line([(x+5,y+5),(x+36,y+0),(x+44,y+8),(x+12,y+14),(x+5,y+5)], INK, 2)
    rect(x+34,y+3,x+47,y+9,'#1b1110')
    rect(x+38,y+4,x+45,y+7,'#ffbd6a44')
    poly([(x+17,y+3),(x+31,y+1),(x+33,y+11),(x+16,y+13)], '#ef8d42')
    poly([(x+24,y+8),(x+34,y+16),(x+24,y+25),(x+14,y+16)], '#ffd179')
    poly([(x+24,y+12),(x+29,y+16),(x+24,y+21),(x+19,y+16)], '#ff6f2d')
    line([(x+15,y+16),(x+33,y+16)], '#fff0a855', 1)


def tower_frost(x, y):
    tower_base(x, y, '#526b77', '#245e78', '#dffcff')
    # playful crystal crown, taller and more iconic but still icy/old-school
    poly([(x+23,y-6),(x+35,y+8),(x+27,y+23),(x+14,y+11)], '#8ee6f6')
    poly([(x+23,y-2),(x+29,y+8),(x+24,y+19),(x+18,y+10)], '#dffcff')
    poly([(x+10,y+7),(x+17,y+0),(x+18,y+15)], '#65bfd4')
    poly([(x+37,y+7),(x+31,y+1),(x+29,y+15)], '#5eb2ca')
    line([(x+23,y-6),(x+35,y+8),(x+27,y+23),(x+14,y+11),(x+23,y-6)], '#12384c', 2)
    line([(x+11,y+11),(x+37,y+8)], '#dffcff', 3)
    line([(x+23,y+0),(x+24,y+20)], '#ffffff88', 1)


def enemy_grunt(x, y):
    # tan soldier with shield and horned cap
    poly([(x+7,y+15),(x+25,y+13),(x+27,y+29),(x+6,y+30)], '#6b4c2b')
    poly([(x+8,y+7),(x+23,y+5),(x+26,y+20),(x+8,y+23)], '#d5b96e')
    line([(x+9,y+6),(x+23,y+5),(x+25,y+20),(x+8,y+22),(x+9,y+6)], INK, 1)
    poly([(x+7,y+2),(x+24,y+3),(x+21,y+8),(x+11,y+8)], '#f0d990')
    poly([(x+6,y+4),(x+1,y+1),(x+8,y+8)], '#e7cc82')
    poly([(x+24,y+4),(x+31,y+1),(x+23,y+8)], '#e7cc82')
    rect(x+12,y+13,x+15,y+16,'#2f2118'); rect(x+19,y+12,x+22,y+15,'#2f2118')
    rect(x+16,y+17,x+20,y+18,'#8b5d34')
    poly([(x+2,y+17),(x+10,y+18),(x+10,y+27),(x+3,y+25)], '#8b6a38')
    line([(x+3,y+17),(x+10,y+18),(x+10,y+27)], '#e4c87a', 1)
    rect(x+22,y+21,x+31,y+25,'#4c331f')


def enemy_runner(x, y):
    # red scarf/fox-like runner with long readable motion shape
    poly([(x+1,y+20),(x+13,y+16),(x+29,y+19),(x+31,y+24),(x+11,y+25)], '#762231')
    poly([(x+5,y+11),(x+22,y+8),(x+30,y+14),(x+22,y+22),(x+7,y+21)], '#de5753')
    poly([(x+20,y+2),(x+31,y+7),(x+25,y+13)], '#f07a57')
    poly([(x+18,y+5),(x+12,y+1),(x+15,y+10)], '#f07a57')
    line([(x+6,y+11),(x+22,y+8),(x+29,y+14),(x+22,y+22),(x+7,y+20),(x+6,y+11)], INK, 1)
    rect(x+23,y+10,x+26,y+13,'#ffe6d1')
    line([(x+0,y+15),(x+7,y+14),(x+15,y+15)], '#ffd88599', 2)
    line([(x+0,y+18),(x+8,y+18),(x+13,y+19)], '#ffe0a055', 1)
    rect(x+5,y+24,x+13,y+27,'#3d1720'); rect(x+20,y+23,x+29,y+26,'#3d1720')


def enemy_brute(x, y):
    # big purple ogre, huge head/arms/horns
    poly([(x+2,y+15),(x+30,y+13),(x+32,y+30),(x+1,y+31)], '#3e2864')
    poly([(x+5,y+5),(x+27,y+4),(x+30,y+21),(x+4,y+24)], '#8e6bd7')
    line([(x+6,y+5),(x+26,y+4),(x+29,y+21),(x+5,y+23),(x+6,y+5)], '#1b102d', 2)
    poly([(x+2,y+0),(x+11,y+6),(x+7,y+11)], '#d6c4ff')
    poly([(x+30,y+0),(x+21,y+6),(x+25,y+11)], '#d6c4ff')
    rect(x+12,y+13,x+16,y+17,'#1d1132'); rect(x+20,y+12,x+24,y+16,'#1d1132')
    rect(x+2,y+20,x+10,y+29,'#2b1b47'); rect(x+24,y+19,x+32,y+28,'#2b1b47')
    rect(x+14,y+18,x+22,y+20,'#50397c')
    line([(x+10,y+21),(x+24,y+19)], '#cdb6ff', 1)


def hero_tower_overlays():
    # Second-pass silhouettes: make the three towers read as miniature hero pieces even at phone size.
    # Arrow: tall watch spire + giant bow profile.
    x, y = 0, 40
    poly([(x+2,y+38),(x+14,y+28),(x+14,y+49),(x+5,y+51)], '#352418')
    poly([(x+35,y+27),(x+47,y+35),(x+43,y+50),(x+34,y+45)], '#352418')
    line([(x+24,y+14),(x+24,y-7)], '#2f2015', 4)
    line([(x+8,y+4),(x+22,y-4),(x+40,y+4)], '#ffe680', 5)
    line([(x+8,y+4),(x+22,y+13),(x+40,y+4)], '#6d4c21', 3)
    poly([(x+34,y-3),(x+48,y+4),(x+35,y+11)], '#fff1a1')
    line([(x+34,y-3),(x+48,y+4),(x+35,y+11)], INK2, 1)
    rect(x+18,y+3,x+21,y+19,'#f3d891')

    # Burst: squat armored bomb-cannon; wide top makes it distinct from arrow/frost.
    x, y = 48, 40
    poly([(x+2,y+6),(x+37,y-2),(x+48,y+8),(x+11,y+17)], '#361912')
    line([(x+2,y+6),(x+37,y-2),(x+48,y+8),(x+11,y+17),(x+2,y+6)], INK, 2)
    rect(x+36,y+3,x+50,y+10,'#160d0b')
    rect(x+39,y+5,x+47,y+8,'#ffd17966')
    poly([(x+15,y+2),(x+31,y+0),(x+36,y+13),(x+18,y+17)], '#ef8d42')
    poly([(x+25,y+8),(x+37,y+18),(x+25,y+30),(x+13,y+18)], '#ffd179')
    poly([(x+25,y+13),(x+31,y+18),(x+25,y+24),(x+19,y+18)], '#ff6f2d')
    line([(x+8,y+36),(x+42,y+34)], '#2b1711', 4)

    # Frost: tallest crown and side crystals; slim vertical read, not a cannon.
    x, y = 96, 40
    poly([(x+24,y-8),(x+38,y+8),(x+28,y+28),(x+12,y+13)], '#8edff0')
    poly([(x+24,y-3),(x+31,y+8),(x+25,y+23),(x+18,y+11)], '#dcfbff')
    poly([(x+7,y+9),(x+18,y-3),(x+18,y+19)], '#62bed6')
    poly([(x+42,y+10),(x+31,y-2),(x+30,y+20)], '#58abc4')
    line([(x+24,y-8),(x+38,y+8),(x+28,y+28),(x+12,y+13),(x+24,y-8)], '#12384c', 2)
    line([(x+24,y-1),(x+25,y+26)], '#ffffff99', 1)
    line([(x+10,y+14),(x+40,y+10)], '#e6ffff', 3)


def enemy_personality_overlays():
    # Small character accents: feet, tools, scars/speed streaks. Chunky, not noisy.
    x, y = 0, 104
    rect(x+4,y+27,x+13,y+31,'#3d291b'); rect(x+21,y+26,x+31,y+30,'#3d291b')
    rect(x+1,y+18,x+8,y+26,'#a37a3e'); line([(x+2,y+18),(x+8,y+20),(x+8,y+26)], '#f0d990', 1)
    rect(x+26,y+10,x+30,y+13,'#5c3a20')

    x, y = 32, 104
    line([(x-1,y+14),(x+8,y+13),(x+17,y+14)], '#ffd885cc', 2)
    line([(x-1,y+18),(x+9,y+18),(x+15,y+20)], '#ffe0a077', 1)
    rect(x+2,y+25,x+12,y+28,'#31131b'); rect(x+20,y+24,x+31,y+27,'#31131b')
    poly([(x+6,y+9),(x+1,y+6),(x+4,y+15)], '#aa3b42')

    x, y = 64, 104
    rect(x+0,y+21,x+10,y+31,'#2b1b47'); rect(x+24,y+20,x+33,y+30,'#2b1b47')
    rect(x+11,y+24,x+16,y+31,'#281941'); rect(x+19,y+23,x+25,y+31,'#281941')
    line([(x+9,y+21),(x+25,y+19)], '#d8c8ff', 1)
    rect(x+14,y+17,x+22,y+19,'#3c2860')


for i in range(4): grass_tile(i * 32, 0, i)
for i in range(4): path_tile(128 + i * 32, 0, i + 1)
tower_arrow(0, 40); tower_burst(48, 40); tower_frost(96, 40)
hero_tower_overlays()
enemy_grunt(0, 104); enemy_runner(32, 104); enemy_brute(64, 104)
enemy_personality_overlays()
# UI ornaments / icon row
rect(0,144,16,160,'#1e130e')
poly([(8,144),(16,152),(8,160),(0,152)], '#a97938')
line([(8,146),(14,152),(8,158),(2,152),(8,146)], '#f0d28a', 1)
poly([(8,149),(11,153),(8,157),(5,153)], '#4a2e1d')
rect(24,145,40,159,'#1b110d'); poly([(26,152),(33,146),(38,153),(31,158)], '#e3c85d'); line([(26,152),(33,146),(38,153)], '#fff1a1', 1)
rect(48,145,64,159,'#1b110d'); poly([(50,154),(56,146),(63,153),(56,159)], '#ef8d42'); poly([(55,151),(59,153),(56,157),(53,153)], '#ffd179')
rect(72,145,88,159,'#1b110d'); poly([(80,145),(87,153),(80,160),(73,153)], '#8edff0'); line([(80,147),(80,158)], '#e6ffff', 1)

out = Path('assets/art-handdrawn')
out.mkdir(parents=True, exist_ok=True)
img.save(out / 'lil8td-handdrawn-v1.png')
print(out / 'lil8td-handdrawn-v1.png')
