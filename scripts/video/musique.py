# Musiques originales des vidéos, composées et synthétisées ici (numpy seulement, aucune bibliothèque sous licence).
#   site : la vidéo du site (motion design carré) : douce et acoustique, 80 BPM, fa majeur (fa - ré mineur - si bémol - do).
#          Une mesure = 3 s ; chaque changement de plan tombe au début d'une mesure (57 s : 19 mesures). Piano électrique seul,
#          puis guitare en arpèges et basse ronde pour les mots de Linda, le thème pour les dessins, une seconde voix pour les
#          toiles, puis l'accord du début égrené au piano, sans basse, et l'accord final qui s'éteint.
#          Pas de batterie, pas de cymbale, pas de montée.
#   reel : la vidéo « Les vraies toiles » : pop acoustique chaloupée, 114,3 BPM (une mesure = 2,1 s = le rythme
#          des changements de toile), do majeur (do - la mineur - fa - sol) : guitare, basse, piano électrique,
#          claquements de doigts. Volontairement simple et sec : pas de bruit de synthèse, pas d'écho.
# Usage : python musique.py site|reel duree_en_secondes sortie.wav
import sys, wave
import numpy as np

SR = 44100
style = sys.argv[1]; duree = float(sys.argv[2]); sortie = sys.argv[3]
N = int(SR * duree)
rng = np.random.default_rng(3)
BUS = ('batt', 'basse', 'harm', 'lead')
bus = {k: np.zeros((2, N)) for k in BUS}


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


def aigus(x):  # filtre passe-haut du premier ordre : garde le souffle des percussions
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

def doigts(d=0.12):  # claquement de doigts
    t = tps(d)
    return aigus(bruit(d)) * np.exp(-t * 55) * 0.8 + np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 90) * 0.25

def secoue(d=0.1):  # oeuf sonore : bruit court à attaque douce
    t = tps(d)
    return aigus(bruit(d)) * np.exp(-t * 45) * np.minimum(1, t * 250) * 0.7

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

def guitare(n, d=1.3):  # corde de guitare : harmoniques qui s'éteignent de plus en plus vite
    t = tps(d); f = hz(n)
    s = sum(np.sin(2 * np.pi * f * k * t * (1 + 0.0003 * k * k)) / k ** 1.1 * np.exp(-t * (2.6 + 1.3 * k)) for k in range(1, 9))
    return (s + bruit(d) * np.exp(-t * 300) * 0.05) * np.minimum(1, t * 800)

def piano_elec(n, d=1.2):  # piano électrique doux
    t = tps(d); f = hz(n)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) + 0.55 * np.sin(2 * np.pi * 2 * f * t + 0.5) * np.exp(-t * 5) + 0.18 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 9)
    return s * np.minimum(1, t * 400)


# ---------- fabrication ----------
def site():
    BAR = 3.0; B = BAR / 4; C = B / 2  # 80 BPM : un temps = 0,75 s, une croche = 0,375 s
    ACC = [[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55]]  # fa, ré mineur, si bémol, do
    RAC = [41, 38, 34, 36]
    ARP = [[53, 60, 65, 69], [50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64]]  # notes des arpèges de guitare
    PICKING = [0, 1, 2, 3, 2, 1, 2, 1]  # une note par croche
    # thème (temps, note, durée en temps), une phrase sur les quatre accords
    THEME = [
        [(0, 72, 1), (1, 77, 1), (2, 76, .5), (2.5, 74, .5), (3, 72, 1)],
        [(0, 69, 1.5), (1.5, 72, .5), (2, 74, 1), (3, 72, 1)],
        [(0, 70, 1), (1, 74, 1), (2, 77, 1), (3, 76, .5), (3.5, 74, .5)],
        [(0, 76, 1.5), (1.5, 74, .5), (2, 72, 2)],
    ]
    nb = int(round(duree / BAR))

    def section(b):
        if b == 0: return 'ouverture'   # premier dessin, « Linda Denise »
        if b < 6: return 'linda'        # ses mots
        if b < 13: return 'dessins'     # un dessin par plan
        if b < nb - 2: return 'toiles'  # les toiles et la toile sur commande
        if b < nb - 1: return 'retour'
        return 'fin'

    for b in range(nb):
        s = section(b); t0 = b * BAR; c = 0 if s == 'retour' else b % 4
        if s == 'fin':  # l'accord du début, qui s'éteint
            for j, n in enumerate([41, 53, 60, 65, 69, 72]): poser('harm', guitare(n, duree - t0), t0 + j * 0.03, -0.2, 0.5)
            for n in (65, 69, 72): poser('lead', piano_elec(n, duree - t0), t0 + 0.05, 0.2, 0.22)
            poser('harm', nappe([53, 57, 60], duree - t0), t0, 0, 0.18)
            poser('basse', basse_douce(41, duree - t0), t0, 0, 0.8)
            continue
        # l'accord égrené au piano, une note par temps : seul à l'ouverture, sur la guitare au retour
        if s in ('ouverture', 'retour'):
            for k in range(4): poser('lead', piano_elec(ARP[c][k] + 12, 2.2), t0 + k * B, 0.2 if k % 2 else -0.2, 0.32)
        # guitare en arpèges (doigts), à partir des mots de Linda
        if s != 'ouverture':
            g = 0.34 if s in ('linda', 'retour') else 0.4
            for k, j in enumerate(PICKING):
                poser('harm', guitare(ARP[c][j], 1.6), t0 + k * C, -0.3 if j % 2 else -0.1, g * (1.15 if k == 0 else 1))
        # basse ronde : fondamentale au premier temps, quinte au troisième
        if b >= 2 and s != 'retour':  # elle entre à la 2e mesure des mots de Linda et se tait au retour
            poser('basse', basse_douce(RAC[c], 2 * B), t0, 0, 0.75)
            poser('basse', basse_douce(RAC[c] + 7, 2 * B), t0 + 2 * B, 0, 0.6)
        # piano : accords doux pendant les mots de Linda, thème pour les dessins et les toiles
        if s == 'linda':
            for tb in (0, 2):
                for n in ACC[c]: poser('lead', piano_elec(n + 12, 1.8), t0 + tb * B + 0.02, 0.25, 0.13)
        if s in ('dessins', 'toiles'):
            for tb, n, d in THEME[c]: poser('lead', piano_elec(n, d * B + 0.8), t0 + tb * B, 0.1, 0.42)
        # toiles : une seconde voix sur la note de l'accord juste sous la mélodie (jamais à moins d'une tierce), sans monter le volume
        if s == 'toiles':
            for tb, n, d in THEME[c]:
                dessous = max(x for x in [m + 12 * o for m in ACC[c] for o in (1, 2)] if x < n)
                if n - dessous >= 3: poser('lead', piano_elec(dessous, d * B + 0.6), t0 + tb * B + 0.01, -0.25, 0.22)


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
            for tb in (0, 2, 2.5): poser('batt', grosse_caisse(0.32, 54, 90), t0 + sw(tb) * B, 0, 0.8 if tb != 2.5 else 0.55)
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
            for k in range(8): poser('lead', piano_elec(ACP[c][[0, 1, 2, 1][k % 4]] + 12), t0 + sw(k / 2) * B, 0.3 if k % 2 else -0.3, 0.3)
            poser('basse', basse_douce(RAC[c], 4 * B), t0, 0, 0.7)
            for tb in (1, 3): poser('batt', doigts(), t0 + tb * B, 0.1, 0.5)
        # mélodie au piano électrique : entre au milieu du premier couplet, présente au refrain
        if (s == 'A' and b >= 6) or s == 'B':
            for tb, n, d in HOOK[c]: poser('lead', piano_elec(n), t0 + tb * B, 0.1, 0.45)
        if s == 'montee':
            for i in range(8): poser('batt', doigts(), t0 + i * B / 2, 0.1, 0.4 + 0.07 * i)
        if s == 'fin':
            poser('harm', nappe([48, 52, 55, 60, 64], duree - t0), t0, 0, 0.8)
            for j, n in enumerate(ACC[0]): poser('harm', guitare(n, 2.6), t0 + j * 0.02, -0.2, 0.55)
            poser('lead', piano_elec(72, 2.4), t0, 0.3, 0.4)
            poser('basse', basse_douce(36, 2.4), t0, 0, 0.9)
            poser('batt', grosse_caisse(0.32, 54, 90), t0, 0, 0.8)


# ---------- mélange ----------
(site if style == 'site' else reel)()
niveau = {'site': {'batt': 0, 'basse': 0.34, 'harm': 0.5, 'lead': 0.6}, 'reel': {'batt': 0.8, 'basse': 0.36, 'harm': 0.5, 'lead': 0.55}}[style]

def reverb(x, d=1.8):  # réponse impulsionnelle synthétique (bruit qui décroît), réverbération chaude
    t = np.arange(int(SR * d)) / SR
    ri = rng.standard_normal(len(t)) * np.exp(-t * 3.2); ri[0] = 0
    taille = 1 << int(np.ceil(np.log2(x.shape[1] + len(ri))))
    f = np.fft.rfftfreq(taille, 1 / SR)
    chaud = 1 / (1 + (f / 2500) ** 2)
    ri_f = np.fft.rfft(ri, taille) * chaud
    y = np.stack([np.fft.irfft(np.fft.rfft(c, taille) * ri_f, taille)[: x.shape[1]] for c in x])
    return y / (np.max(np.abs(y)) + 1e-9) * np.max(np.abs(x)) * 0.5

brillant = bus['harm'] * niveau['harm'] + bus['lead'] * niveau['lead']
mix = bus['batt'] * niveau['batt'] + bus['basse'] * niveau['basse'] + brillant + reverb(brillant) * (0.35 if style == 'site' else 0.15)

t = np.arange(N) / SR
env = np.minimum(1, t / 0.05) * np.minimum(1, (duree - t) / (2.0 if style == 'site' else 1.0))  # la vidéo du site s'éteint sur 2 s
def adoucir(x):  # passe-bas doux au-dessus de 11 kHz
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(np.fft.rfft(x) / np.sqrt(1 + (f / 11000) ** 4), len(x))
st = np.stack([adoucir(mix[0]) * env, adoucir(mix[1]) * env], axis=1)
st = np.tanh(st / np.max(np.abs(st)) * 1.6) / np.tanh(1.6) * 0.85  # écrête en douceur : le son reste plein sans claquer
with wave.open(sortie, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print(sortie, f'{style} {duree:.1f} s')
