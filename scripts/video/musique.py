# Musique originale, composee et synthetisee ici (numpy seulement) : marimba, piano doux,
# cordes pincees (Karplus-Strong) et nappe. Fa majeur, 76 BPM, grille F - Dm - Bb - C.
# Usage : python musique.py duree_en_secondes sortie.wav
import sys, wave
import numpy as np

SR = 44100
duree = float(sys.argv[1]); sortie = sys.argv[2]
BPM = 76; TEMPS = 60 / BPM; MESURE = 4 * TEMPS
N = int(SR * duree)
gauche = np.zeros(N); droite = np.zeros(N)
rng = np.random.default_rng(3)

def hz(n):  # numero MIDI -> frequence
    return 440 * 2 ** ((n - 69) / 12)

def poser(signal, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= N: return
    s = signal[: N - i] * gain
    gauche[i:i + len(s)] += s * np.sqrt((1 - pan) / 2)
    droite[i:i + len(s)] += s * np.sqrt((1 + pan) / 2)

def marimba(n, d=1.2):
    t = np.arange(int(SR * d)) / SR; f = hz(n)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 12) + 0.08 * np.sin(2 * np.pi * f * 9.9 * t) * np.exp(-t * 30)
    return s * np.minimum(1, t * 400)

def piano(n, d=2.5):
    t = np.arange(int(SR * d)) / SR; f = hz(n)
    s = sum(a * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * (1.1 + k * 0.7)) for k, a in [(1, 1), (2, 0.45), (3, 0.22), (4, 0.1), (5, 0.05)])
    return s * np.minimum(1, t * 200)

def pince(n, d=2.0):
    p = int(SR / hz(n)); tampon = np.convolve(rng.uniform(-1, 1, p + 6), np.ones(7) / 7, 'valid')[:p] * 2.2; s = np.zeros(int(SR * d))
    for i in range(len(s)):
        s[i] = tampon[i % p]
        tampon[i % p] = 0.5 * (tampon[i % p] + tampon[(i + 1) % p]) * 0.996
    return s * np.minimum(1, np.arange(len(s)) / (SR * 0.004))

def nappe(notes, d):
    t = np.arange(int(SR * d)) / SR; s = np.zeros_like(t)
    for n in notes:
        for det in (-0.12, 0.12):
            f = hz(n) * 2 ** (det / 12)
            s += np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 2 * f * t)
    env = np.minimum(1, t / 0.9) * np.minimum(1, (d - t) / 0.9)
    return s * env / len(notes)

# grille : F, Dm, Bb, C (notes MIDI)
ACCORDS = [[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55]]
BASSES = [41, 38, 34, 36]
# melodie pentatonique (temps dans la mesure, note, duree en temps), sur 4 mesures, puis variation
MELODIE = [
    [(0, 72, 1.5), (1.5, 69, 0.5), (2, 72, 1), (3, 74, 1)],
    [(0, 74, 1.5), (1.5, 72, 0.5), (2, 69, 2)],
    [(0, 70, 1), (1, 69, 1), (2, 65, 1), (3, 67, 1)],
    [(0, 67, 2), (2, 64, 1), (3, 67, 1)],
    [(0, 77, 1.5), (1.5, 76, 0.5), (2, 74, 1), (3, 72, 1)],
    [(0, 74, 1), (1, 72, 1), (2, 69, 2)],
    [(0, 70, 1.5), (1.5, 72, 0.5), (2, 74, 1), (3, 72, 1)],
    [(0, 72, 2), (2, 67, 2)],
]
mesures = int((duree - 2.5) // MESURE)
for m in range(mesures):
    t0 = m * MESURE; c = m % 4
    poser(nappe(ACCORDS[c], MESURE + 0.6), t0, 0, 0.11)
    for b in range(4):  # basse douce et arpege de cordes pincees
        poser(piano(BASSES[c], 1.6), t0 + b * TEMPS, -0.1, 0.16 if b % 2 == 0 else 0.09)
    for k, n in enumerate([0, 1, 2, 1, 0, 1, 2, 1]):
        poser(pince(ACCORDS[c][n] + 12, 1.4), t0 + k * TEMPS / 2, 0.35 if k % 2 else -0.35, 0.13)
    if m >= 1:  # la melodie entre a la deuxieme mesure
        for b, n, d in MELODIE[(m - 1) % 8]:
            inst = marimba if (m // 4) % 2 == 0 else piano
            poser(inst(n, d * TEMPS + 1.2), t0 + b * TEMPS, 0.15, 0.32 if inst is marimba else 0.26)
# accord final tenu
tf = mesures * MESURE
poser(nappe([53, 57, 60, 65], duree - tf), tf, 0, 0.13)
poser(piano(65, 3), tf, 0.1, 0.3); poser(piano(41, 3), tf, -0.1, 0.22)

# reverberation : reponse impulsionnelle synthetique (bruit qui decroit)
def reverb(x, d=2.2):
    t = np.arange(int(SR * d)) / SR
    ri = rng.standard_normal(len(t)) * np.exp(-t * 3.0); ri[0] = 0
    taille = 1 << int(np.ceil(np.log2(len(x) + len(ri))))
    f = np.fft.rfftfreq(taille, 1 / SR)
    chaud = 1 / (1 + (f / 2500) ** 2)  # reverberation chaude, sans souffle aigu
    y = np.fft.irfft(np.fft.rfft(x, taille) * np.fft.rfft(ri, taille) * chaud, taille)[: len(x)]
    return y / np.max(np.abs(y)) * np.max(np.abs(x)) * 0.5
gauche = gauche + reverb(gauche) * 0.55
droite = droite + reverb(droite) * 0.55

t = np.arange(N) / SR
env = np.minimum(1, t / 1.5) * np.minimum(1, (duree - t) / 2.5)
def adoucir(x):  # passe-bas doux au-dessus de 7 kHz
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(np.fft.rfft(x) / np.sqrt(1 + (f / 7000) ** 4), len(x))
st = np.stack([adoucir(gauche) * env, adoucir(droite) * env], axis=1)
st = st / np.max(np.abs(st)) * 0.8
with wave.open(sortie, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print(sortie, f'{duree:.1f} s, {mesures} mesures')
