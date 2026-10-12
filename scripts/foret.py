# Musique de forêt du site (calme, en boucle), composée et synthétisée ici : numpy seulement, aucune bibliothèque sous licence.
# Nappes douces (ré majeur : ré - si mineur - sol - la), petites notes de kalimba pentatoniques avec écho, vent léger,
# quelques chants d'oiseaux lointains, réverbération longue. Tout est calculé « en cercle » : la fin rejoint le début,
# la boucle ne s'entend pas.
# Usage : python3 scripts/foret.py sortie.wav   puis   ffmpeg -i sortie.wav -ac 2 -c:a aac -b:a 80k -movflags +faststart public/audio/foret.m4a
import sys, wave
import numpy as np

SR = 44100
DUREE = 96.0
N = int(SR * DUREE)
rng = np.random.default_rng(11)
sortie = sys.argv[1]
mix = {k: np.zeros((2, N)) for k in ('nappe', 'notes', 'vent', 'oiseaux')}


def hz(n):
    return 440 * 2 ** ((n - 69) / 12)


def poser(nom, s, t, pan=0.0, gain=1.0):
    i = int(t * SR) % N
    idx = (np.arange(len(s)) + i) % N  # en cercle : ce qui dépasse la fin revient au début
    mix[nom][0, idx] += s * gain * np.sqrt((1 - pan) / 2)
    mix[nom][1, idx] += s * gain * np.sqrt((1 + pan) / 2)


def passe_bas(x, fc):  # filtre du premier ordre, appliqué deux fois pour adoucir
    a = np.exp(-2 * np.pi * fc / SR)
    for _ in range(2):
        y = np.empty_like(x); acc = 0.0
        for k in range(len(x)):
            acc = (1 - a) * x[k] + a * acc; y[k] = acc
        x = y
    return x


# ---------- nappes : un accord toutes les 12 s, fondus qui se chevauchent ----------
accords = [[50, 57, 62, 66, 69], [47, 54, 62, 66, 71], [43, 50, 59, 62, 66], [45, 52, 61, 64, 69]] * 2
for k, notes in enumerate(accords):
    d = 18.0
    t = np.arange(int(SR * d)) / SR
    env = np.clip(t / 5.0, 0, 1) ** 2 * np.clip((d - t) / 6.0, 0, 1) ** 2
    for j, n in enumerate(notes):
        for de in (-0.07, 0.0, 0.07):  # trois voix un peu désaccordées : le son respire
            f = hz(n) * 2 ** (de / 12)
            s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * (1 + np.sin(2 * np.pi * 0.07 * t + j))
            poser('nappe', s * env * 0.045, k * 12.0, pan=(j - 2) * 0.28)

# ---------- kalimba : notes rares, gamme pentatonique de ré, avec écho ----------
gamme = [74, 76, 78, 81, 83, 86, 88]  # ré mi fa# la si ré mi
t = 1.5
while t < DUREE - 1:
    n = int(rng.choice(gamme)); pan = rng.uniform(-0.6, 0.6)
    d = 3.2; tt = np.arange(int(SR * d)) / SR
    f = hz(n)
    s = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 2.2) + 0.35 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt * 7) + 0.1 * np.sin(2 * np.pi * 5.4 * f * tt) * np.exp(-tt * 18)
    s *= np.clip(tt / 0.004, 0, 1)
    for e, g in enumerate((1.0, 0.45, 0.2)):  # écho
        poser('notes', s, t + e * 0.62, pan=pan * (1 - 0.3 * e), gain=0.1 * g)
    t += rng.choice([1.8, 2.6, 3.4, 5.2, 7.5])

# ---------- vent : bruit adouci, qui monte et descend lentement ----------
v = passe_bas(rng.standard_normal(N), 380)
tt = np.arange(N) / SR
for side in (0, 1):
    lent = 0.55 + 0.45 * np.sin(2 * np.pi * (1 / 24.0) * tt + side * 1.7) * np.sin(2 * np.pi * (1 / 16.0) * tt + side)
    mix['vent'][side] = np.roll(v, side * 40000) * lent * 0.55

# ---------- oiseaux lointains : petits chants de quelques notes ----------
t = 6.0
while t < DUREE - 3:
    pan = rng.uniform(-0.8, 0.8); base = rng.uniform(2600, 4200)
    for k in range(int(rng.integers(3, 6))):
        d = 0.11; tc = np.arange(int(SR * d)) / SR
        glisse = base * (1 + 0.35 * (tc / d) * rng.choice([-1, 1])) * (1 + 0.04 * k)
        s = np.sin(2 * np.pi * np.cumsum(glisse) / SR) * np.sin(np.pi * tc / d) ** 2
        poser('oiseaux', s, t + k * 0.17, pan=pan, gain=0.05)
    t += rng.uniform(9, 16)

# ---------- réverbération longue (circulaire) puis mélange ----------
def reverbe(x, duree=3.2, mouille=0.5):
    n = int(SR * duree)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 2.4)
    ir = passe_bas(ir, 3500)
    ir /= np.sqrt(np.sum(ir ** 2))
    pad = np.zeros(N); pad[:n] = ir
    return (1 - mouille) * x + mouille * np.fft.irfft(np.fft.rfft(x) * np.fft.rfft(pad), N)

sortie_st = np.zeros((2, N))
for nom, g, m in (('nappe', 1.0, 0.45), ('notes', 1.0, 0.55), ('vent', 0.35, 0.0), ('oiseaux', 1.0, 0.6)):
    for c in (0, 1):
        sortie_st[c] += reverbe(mix[nom][c], mouille=m) * g

sortie_st /= np.max(np.abs(sortie_st))
sortie_st *= 0.5  # crête à -6 dB : musique de fond, discrète
data = (sortie_st.T * 32767).astype('<i2')
with wave.open(sortie, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
