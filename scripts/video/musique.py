# Musiques originales des vidéos, composées et synthétisées ici (numpy seulement, aucune bibliothèque sous licence).
#   motion : la vidéo « Les toiles » (motion design) : pop électro, 120 BPM, sol majeur (sol - ré - mi mineur - do).
#            Une mesure = 2 s, une toile par mesure. Intro, couplet, refrain, pause pour Tilleul, montée, final.
#   reel   : la vidéo « Les vraies toiles » : pop acoustique chaloupée, 114,3 BPM (une mesure = 2,1 s = le rythme
#            des changements de toile), do majeur (do - la mineur - fa - sol) : guitare, piano électrique, sifflet.
# Usage : python musique.py motion|reel duree_en_secondes sortie.wav
import sys, wave
import numpy as np

SR = 44100
style = sys.argv[1]; duree = float(sys.argv[2]); sortie = sys.argv[3]
N = int(SR * duree)
rng = np.random.default_rng(3)
BUS = ('batt', 'basse', 'harm', 'lead')
bus = {k: np.zeros((2, N)) for k in BUS}
kicks = []  # instants des grosses caisses (pour le « pompage » des nappes et de la basse)


def hz(n):  # numéro MIDI -> fréquence
    return 440 * 2 ** ((n - 69) / 12)


def tps(d):
    return np.arange(int(SR * d)) / SR


def poser(nom, signal, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    s = signal[: N - i] * gain
    bus[nom][0, i:i + len(s)] += s * np.sqrt((1 - pan) / 2)
    bus[nom][1, i:i + len(s)] += s * np.sqrt((1 + pan) / 2)


def aigus(x):  # filtre passe-haut du premier ordre : garde le souffle des cymbales
    return np.diff(x, prepend=0)


def bruit(d):
    return rng.standard_normal(int(SR * d))


# ---------- batterie ----------
def grosse_caisse(d=0.5, grave=48, attaque=130):
    t = tps(d)
    s = np.sin(2 * np.pi * np.cumsum(grave + attaque * np.exp(-t * 30)) / SR) * np.exp(-t * 6.5)
    return s + bruit(d) * np.exp(-t * 400) * 0.25

def caisse_claire(d=0.3):
    t = tps(d)
    return 0.8 * aigus(bruit(d)) * np.exp(-t * 20) + 0.6 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)

def claquement(d=0.35):  # mains qui claquent : trois petites rafales puis une queue
    t = tps(d)
    e = sum(np.exp(-np.clip(t - o, 0, None) * 140) * (t >= o) for o in (0, 0.011, 0.022)) + 0.45 * np.exp(-t * 16) * (t >= 0.022)
    return aigus(bruit(d)) * e * 0.7

def charleston(d=0.07, chute=70):
    return aigus(aigus(bruit(d))) * np.exp(-tps(d) * chute) * 0.8

def cymbale(d=2.4):
    return aigus(aigus(bruit(d))) * np.exp(-tps(d) * 1.7) * 0.6

def doigts(d=0.12):  # claquement de doigts
    t = tps(d)
    return aigus(bruit(d)) * np.exp(-t * 55) * 0.8 + np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 90) * 0.25

def secoue(d=0.1):  # oeuf sonore : bruit court à attaque douce
    t = tps(d)
    return aigus(bruit(d)) * np.exp(-t * 45) * np.minimum(1, t * 250) * 0.7

def montee(d):  # bruit qui monte, plus un sifflement de plus en plus aigu
    t = tps(d); k = t / d
    return aigus(aigus(bruit(d))) * k ** 2 * 0.5 + np.sin(2 * np.pi * np.cumsum(300 * (10 ** k)) / SR) * k ** 2 * 0.25

def impact(d=1.6):
    t = tps(d)
    return np.sin(2 * np.pi * 42 * t) * np.exp(-t * 2.4) + 0.5 * aigus(bruit(d)) * np.exp(-t * 5)


# ---------- instruments ----------
def basse_pop(n, d):  # basse pincée, riche au début puis ronde
    t = tps(d); f = hz(n)
    s = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (1.5 + 1.2 * k)) for k in range(1, 9))
    return s * np.minimum(1, t * 300) * np.minimum(1, (d - t) / 0.03)

def basse_douce(n, d):  # basse ronde, presque sinusoïdale
    t = tps(d); f = hz(n)
    s = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 4)) * np.exp(-t * 2.2)
    return s * np.minimum(1, t * 200) * np.minimum(1, (d - t) / 0.04)

def nappe(notes, d):  # accord tenu, deux voix désaccordées par note
    t = tps(d); s = np.zeros_like(t)
    for n in notes:
        for det in (-0.1, 0.1):
            f = hz(n) * 2 ** (det / 12)
            s += sum(np.sin(2 * np.pi * f * k * t) / k ** 1.5 for k in (1, 2, 3, 4))
    return s * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.12) / len(notes)

def pincee(n, d=0.4):  # note pincée brillante (arpèges)
    t = tps(d); f = hz(n)
    return sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (7 + 5 * k)) for k in range(1, 7)) * np.minimum(1, t * 600)

def cloche(n, d=0.9):  # petite cloche synthétique (modulation de fréquence)
    t = tps(d); f = hz(n)
    return np.sin(2 * np.pi * f * t + 3 * np.exp(-t * 5) * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 3.2) * np.minimum(1, t * 500)

def guitare(n, d=1.3):  # corde de guitare : harmoniques qui s'éteignent de plus en plus vite
    t = tps(d); f = hz(n)
    s = sum(np.sin(2 * np.pi * f * k * t * (1 + 0.0003 * k * k)) / k ** 1.1 * np.exp(-t * (2.6 + 1.3 * k)) for k in range(1, 9))
    return (s + bruit(d) * np.exp(-t * 300) * 0.05) * np.minimum(1, t * 800)

def piano_elec(n, d=1.2):  # piano électrique doux
    t = tps(d); f = hz(n)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) + 0.55 * np.sin(2 * np.pi * 2 * f * t + 0.5) * np.exp(-t * 5) + 0.18 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 9)
    return s * np.minimum(1, t * 400)

def sifflet(n, d):  # sifflement : sinus avec un petit vibrato qui s'installe, un peu de souffle
    t = tps(d); f = hz(n)
    vib = 0.012 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t * 3)
    s = np.sin(2 * np.pi * f * t + 2 * np.pi * f * np.cumsum(vib) / SR * 40) + 0.08 * np.sin(2 * np.pi * 2 * f * t)
    return (s + 0.02 * aigus(bruit(d))) * np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.08)

def kalimba(n, d=0.9):
    t = tps(d); f = hz(n)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 25)) * np.exp(-t * 4) * np.minimum(1, t * 500)


# ---------- fabrication ----------
def motion():
    B = 60 / 120; BAR = 4 * B; S = B / 4
    ACC = [[55, 59, 62], [50, 54, 57], [52, 55, 59], [48, 52, 55]]  # sol, ré, mi mineur, do
    RAC = [43, 38, 40, 36]
    BASSE = [(0, 0), (3, 0), (6, 12), (10, 0), (12, 0), (14, 12)]  # (pas de 16e, octave en plus) : basse syncopée
    # motif (temps, note, durée en temps) joué en boucle sur les quatre accords
    MOTIF = [
        [(0, 74, .5), (.5, 71, .5), (1, 74, .5), (1.5, 76, .5), (2, 79, 1), (3, 76, .5), (3.5, 74, .5)],
        [(0, 74, .5), (.5, 76, .5), (1, 74, 1), (2, 69, .5), (2.5, 71, .5), (3, 74, 1)],
        [(0, 76, .5), (.5, 79, .5), (1, 83, 1), (2, 79, .5), (2.5, 76, .5), (3, 74, 1)],
        [(0, 76, .5), (.5, 74, .5), (1, 72, 1), (2, 79, 1), (3, 76, .5), (3.5, 74, .5)],
    ]
    nb = int(duree // BAR)

    def section(b):
        if b < 2: return 'intro'
        if b < 7: return 'A'
        if b < 23: return 'B'
        if b < 26: return 'pause'
        if b == 26: return 'montee'
        if b < nb - 1: return 'final'
        return 'fin'

    for b in range(nb):
        s = section(b); t0 = b * BAR; c = b % 4
        # harmonie : accord tenu, arpège brillant
        poser('harm', nappe(ACC[c], BAR + 0.1), t0, 0, {'intro': 0.5, 'pause': 0.7}.get(s, 0.45))
        if s != 'fin':
            for k in range(16 if s in ('A', 'B', 'final') else 8):
                pas = S if s in ('A', 'B', 'final') else 2 * S
                n = ACC[c][[0, 1, 2, 1][k % 4]] + 12 + (12 if k % 8 >= 4 else 0)
                g = 0.5 + 0.2 * (k % 4 == 0)
                if s == 'intro': g *= 0.4 + 0.6 * (t0 + k * pas) / (2 * BAR)
                poser('harm', pincee(n), t0 + k * pas, 0.4 if k % 2 else -0.4, g * 0.55)
        # motif
        if s in ('B', 'final') or (s == 'A' and b >= 4) or s == 'pause':
            for tb, n, d in MOTIF[c]:
                if s == 'pause' and tb not in (0, 2): continue
                poser('lead', cloche(n, d * B + 0.7), t0 + tb * B, 0.15, 0.5 if s != 'pause' else 0.4)
        # batterie et basse
        fort = s in ('A', 'B', 'final')
        if fort:
            for beat in range(4):
                kicks.append(t0 + beat * B); poser('batt', grosse_caisse(), t0 + beat * B, 0, 0.7)
        if s == 'pause':
            kicks.append(t0); poser('batt', grosse_caisse(0.4, 52, 90), t0, 0, 0.6)
        if fort:
            for k in range(8):  # croches : fermées sur le temps, ouvertes entre les temps
                ouverte = k % 2 == 1
                poser('batt', charleston(0.3 if ouverte else 0.07, 12 if ouverte else 70), t0 + k * B / 2, 0.25, 0.28 if ouverte else 0.2)
            if s != 'A' or b >= 4:
                for beat in (1, 3): poser('batt', claquement(), t0 + beat * B, 0, 0.6)
            if s != 'A':
                for k in range(16): poser('batt', secoue(), t0 + k * S, -0.3, 0.12 + 0.1 * (k % 4 == 2))
            for pas, oct_ in BASSE:
                poser('basse', basse_pop(RAC[c] + oct_, S * 3 if pas % 4 == 0 else S * 1.6), t0 + pas * S, 0, 0.9)
        if s == 'pause':
            poser('basse', basse_douce(RAC[c], BAR), t0, 0, 0.6)
            for k in range(8): poser('batt', charleston(), t0 + k * B / 2, 0.25, 0.12)
        # montées et passages
        if s == 'intro' and b == 1: poser('batt', montee(BAR), t0, 0, 0.55)
        if s == 'montee':
            poser('batt', montee(BAR), t0, 0, 0.75)
            for i in range(8): poser('batt', caisse_claire(), t0 + i * B / 2, 0, 0.3 + 0.06 * i)
            for i in range(16): poser('batt', caisse_claire(), t0 + 2 * B + i * B / 8, 0, 0.45 + 0.04 * i)
        if b == 1 or (s == 'A' and b == 6) or (s == 'B' and (b - 7) % 4 == 3):  # roulement de caisse claire avant un changement
            for i in range(8): poser('batt', caisse_claire(), t0 + 3 * B + i * B / 8, 0, 0.35 + 0.05 * i)
        if b in (2, 7, 15, 23, 27):
            poser('batt', cymbale(), t0, 0, 0.55)
        if b in (2, 27, nb - 1): poser('batt', impact(), t0, 0, 0.9)
        if s == 'fin':
            kicks.append(t0); poser('batt', grosse_caisse(), t0, 0, 1.0)
            poser('harm', nappe([55, 59, 62, 67], duree - t0), t0, 0, 0.7)
            poser('lead', cloche(79, 2.5), t0, 0.1, 0.7)
            poser('basse', basse_pop(31, 2.0), t0, 0, 1.0)
            poser('batt', cymbale(), t0, 0, 0.6)


def reel():
    BAR = 2.1; B = BAR / 4
    ACC = [[48, 52, 55, 60, 64], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 47, 50, 55, 59]]  # do, la mineur, fa, sol
    RAC = [36, 33, 29, 31]
    ACP = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]  # accords du piano électrique
    HOOK = [
        [(0, 76, 1), (1, 79, .5), (1.5, 81, .5), (2, 79, 1), (3, 76, 1)],
        [(0, 81, 1), (1, 79, .5), (1.5, 76, .5), (2, 76, 1), (3, 72, 1)],
        [(0, 81, 1.5), (1.5, 79, .5), (2, 77, 1), (3, 76, 1)],
        [(0, 74, 1), (1, 79, 1), (2, 83, 1.5), (3.5, 81, .5)],
    ]
    nb = int(duree // BAR)

    def sw(tb):  # croches chaloupées : la seconde croche d'un temps arrive un peu plus tard
        return int(tb) + (0.58 if tb % 1 == 0.5 else tb % 1)

    def section(b):
        if b < 2: return 'intro'
        if b < 10: return 'A'
        if b < 12: return 'pause'
        if b < nb - 2: return 'B'
        if b < nb - 1: return 'montee'
        return 'fin'

    for b in range(nb):
        s = section(b); t0 = b * BAR; c = b % 4
        gain_g = {'intro': 0.9, 'pause': 0.8}.get(s, 0.75)
        if s != 'fin':
            # guitare : accord battu, bas-haut-haut-bas-haut (temps en croches)
            for k, (dire, g) in enumerate([('b', 1), (None, 0), ('b', .6), ('h', .5), (None, 0), ('h', .55), ('b', .75), ('h', .55)]):
                if dire is None: continue
                notes = ACC[c] if dire == 'b' else ACC[c][::-1][:3]
                for j, n in enumerate(notes):
                    poser('harm', guitare(n), t0 + sw(k / 2) * B + j * 0.011, -0.25, g * gain_g * 0.42)
        if s in ('A', 'B', 'montee'):
            for tb in (0, 2, 2.5): kicks.append(t0 + sw(tb) * B); poser('batt', grosse_caisse(0.32, 54, 90), t0 + sw(tb) * B, 0, 0.8 if tb != 2.5 else 0.55)
            for tb in (1, 3): poser('batt', doigts(), t0 + tb * B, 0.1, 0.9); poser('batt', caisse_claire(0.15), t0 + tb * B, 0, 0.12)
            if s in ('B', 'montee'):
                for tb in (1, 3): poser('batt', claquement(0.3), t0 + tb * B, 0, 0.4)
            for k in range(8): poser('batt', secoue(), t0 + sw(k / 2) * B, -0.35, 0.16 + 0.1 * (k % 2 == 1))
            # basse : fondamentale, reprise syncopée, quinte
            for tb, dn, dur in ((0, 0, 1.3), (1.5, 12, .45), (2, 0, 1.3), (3.5, 7, .45)):
                poser('basse', basse_douce(RAC[c] + dn, dur * B), t0 + sw(tb) * B, 0, 0.95)
            # piano électrique : accords sur les contretemps
            for tb in (0.5, 2.5) if s == 'A' else (0.5, 1.5, 2.5, 3.5):
                for n in ACP[c]: poser('lead', piano_elec(n), t0 + sw(tb) * B, 0.3, 0.2)
        if s == 'pause':
            for k in range(8): poser('lead', kalimba(ACC[c][[1, 2, 3, 2][k % 4]] + 12), t0 + sw(k / 2) * B, 0.35 if k % 2 else -0.35, 0.35)
            poser('basse', basse_douce(RAC[c], 4 * B), t0, 0, 0.7)
            for tb in (1, 3): poser('batt', doigts(), t0 + tb * B, 0.1, 0.5)
        # sifflet : entre au milieu du premier couplet, présent au refrain
        if (s == 'A' and b >= 6) or s == 'B':
            for tb, n, d in HOOK[c]: poser('lead', sifflet(n, d * B), t0 + tb * B, 0, 0.45)
        if s == 'B' and b % 2 == 1:
            for k in range(4): poser('lead', kalimba(ACP[c][k % 3] + 24), t0 + (2 + k * 0.5) * B, 0.4 if k % 2 else -0.4, 0.28)
        if s == 'montee':
            poser('batt', montee(BAR), t0, 0, 0.55)
            for i in range(8): poser('batt', doigts(), t0 + i * B / 2, 0.1, 0.4 + 0.07 * i)
        if b in (2, 12): poser('batt', cymbale(), t0, 0, 0.3)
        if s == 'fin':
            poser('harm', nappe([48, 52, 55, 60, 64], duree - t0), t0, 0, 0.8)
            for j, n in enumerate(ACC[0]): poser('harm', guitare(n, 2.6), t0 + j * 0.02, -0.2, 0.55)
            poser('lead', piano_elec(72, 2.4), t0, 0.3, 0.4)
            poser('basse', basse_douce(36, 2.4), t0, 0, 0.9)
            poser('batt', grosse_caisse(0.32, 54, 90), t0, 0, 0.8)


# ---------- mélange ----------
(motion if style == 'motion' else reel)()
niveau = {'motion': {'batt': 0.9, 'basse': 0.34, 'harm': 0.42, 'lead': 0.5}, 'reel': {'batt': 0.8, 'basse': 0.36, 'harm': 0.5, 'lead': 0.55}}[style]

def pompage(profondeur, creux=0.13):  # la nappe et la basse « respirent » à chaque grosse caisse
    d = np.ones(N)
    for k in kicks:
        i = int(k * SR); L = int(0.35 * SR)
        if i >= N: continue
        seg = 1 - profondeur * np.exp(-np.arange(min(L, N - i)) / SR / creux)
        d[i:i + len(seg)] *= seg
    return d

def reverb(x, d=1.8):  # réponse impulsionnelle synthétique (bruit qui décroît), réverbération chaude
    t = np.arange(int(SR * d)) / SR
    ri = rng.standard_normal(len(t)) * np.exp(-t * 3.2); ri[0] = 0
    taille = 1 << int(np.ceil(np.log2(x.shape[1] + len(ri))))
    f = np.fft.rfftfreq(taille, 1 / SR)
    chaud = 1 / (1 + (f / 2500) ** 2)
    ri_f = np.fft.rfft(ri, taille) * chaud
    y = np.stack([np.fft.irfft(np.fft.rfft(c, taille) * ri_f, taille)[: x.shape[1]] for c in x])
    return y / (np.max(np.abs(y)) + 1e-9) * np.max(np.abs(x)) * 0.5

def echo(x, delai, fois, g):  # écho (croche pointée) qui rebondit d'une oreille à l'autre en s'éteignant
    y = x.copy()
    for k in range(1, fois + 1):
        i = int(delai * SR * k)
        if i >= N: break
        e = x[:, :N - i] * g ** k
        y[:, i:] += e if k % 2 else e[::-1]
    return y

duck_b = pompage(0.55 if style == 'motion' else 0.0); duck_h = pompage(0.6 if style == 'motion' else 0.0)
batt = bus['batt'] * niveau['batt']
basse = bus['basse'] * niveau['basse'] * duck_b
harm = bus['harm'] * niveau['harm'] * duck_h
lead = echo(bus['lead'], 0.75 * 60 / 120 if style == 'motion' else 0.75 * 2.1 / 4, 3, 0.45) * niveau['lead']
brillant = harm + lead
mix = batt + basse + brillant + reverb(brillant) * 0.55

t = np.arange(N) / SR
env = np.minimum(1, t / 0.05) * np.minimum(1, (duree - t) / 1.0)
def adoucir(x):  # passe-bas doux au-dessus de 11 kHz
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(np.fft.rfft(x) / np.sqrt(1 + (f / 11000) ** 4), len(x))
st = np.stack([adoucir(mix[0]) * env, adoucir(mix[1]) * env], axis=1)
st = np.tanh(st / np.max(np.abs(st)) * 1.6) / np.tanh(1.6) * 0.85  # écrête en douceur : le son reste plein sans claquer
with wave.open(sortie, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print(sortie, f'{style} {duree:.1f} s')
