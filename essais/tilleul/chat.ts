// Prototype du nouveau Tilleul : animé en direct, redessiné à chaque image.
// Le squelette vit dans le plan du profil : colonne souple, pattes à deux os qui se posent au sol sans glisser,
// queue en chaîne de points qui suit sa forme avec un temps de retard. Le corps est un volume (une chaîne de boules) :
// pour faire demi-tour, tout pivote autour d'un axe vertical en passant face au visiteur, rien n'est retourné d'un coup.
// La tête a son propre petit repère 3D et se tourne vers le visiteur.
// Repère du corps : sol à y = 0, le chat regarde vers +x, z vers son flanc proche. La tête a son centre en 0,0.

type V = { x: number; y: number };
type V3 = { x: number; y: number; z: number };

const f = (n: number) => Math.round(n * 100) / 100; // au centième : les mouvements lents restent continus
const pt = (p: V) => `${f(p.x)},${f(p.y)}`;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lisse = (t: number) => { const u = clamp(t, 0, 1); return u * u * (3 - 2 * u); };
const add = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: V, b: V): V => ({ x: a.x - b.x, y: a.y - b.y });
const mul = (a: V, k: number): V => ({ x: a.x * k, y: a.y * k });
const mix = (a: V, b: V, t: number): V => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
const dist = (a: V, b: V) => Math.hypot(b.x - a.x, b.y - a.y);
const dir = (a: number): V => ({ x: Math.cos(a), y: Math.sin(a) });
const TAU = Math.PI * 2;
const ecart = (a: number) => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;

const CONTOUR = '#8B3E12';
const RAYURE = '#C8571B';
const TRAIT_OEIL = '#5A2410';

// ---------- tracés ----------

// Courbe lisse passant par tous les points (Catmull-Rom)
function courbe(p: V[], fermee: boolean): string {
  const n = p.length;
  const at = (i: number) => (fermee ? p[(i + n) % n] : p[clamp(i, 0, n - 1)]);
  let d = `M${pt(p[0])}`;
  for (let i = 0; i < (fermee ? n : n - 1); i++) {
    const a = at(i - 1), b = at(i), c = at(i + 1), e = at(i + 2);
    d += `C${pt(add(b, mul(sub(c, a), 1 / 6)))} ${pt(sub(c, mul(sub(e, b), 1 / 6)))} ${pt(c)}`;
  }
  return fermee ? d + 'Z' : d;
}

const ovale = (c: V, rx: number, ry = rx) => `M${f(c.x - rx)},${f(c.y)}a${f(rx)},${f(ry)} 0 1 0 ${f(2 * rx)},0a${f(rx)},${f(ry)} 0 1 0 ${f(-2 * rx)},0Z`;

// Contour : toutes les formes d'un groupe sont d'abord tracées ensemble en brun, d'un seul trait épais, puis remplies
// par-dessus. Les traits intérieurs disparaissent sous les remplissages : il ne reste que le tour de l'ensemble, aux angles
// arrondis. Un seul tracé pour tout le contour : des traits superposés additionneraient leurs bords et feraient scintiller.
const EP = 5.2;
interface Forme { d: string; fond: string; apres?: string }
function silhouette(formes: Forme[], ep = EP): string {
  return `<path d="${formes.map((x) => x.d).join('')}" fill="${CONTOUR}" stroke="${CONTOUR}" stroke-width="${f(ep)}" stroke-linejoin="round"/>`
    + formes.map((x) => `<path d="${x.d}" fill="${x.fond}"/>${x.apres ?? ''}`).join('');
}

const mesures = (el: Element, a: Record<string, number | string>) => { for (const k in a) el.setAttribute(k, String(a[k])); };

// Os épais : enveloppe de deux cercles (rayon ra en A, rb en B)
function os(A: V, ra: number, B: V, rb: number): string {
  const d = dist(A, B);
  if (d < Math.abs(ra - rb) + 0.5) return ra > rb ? ovale(A, ra) : ovale(B, rb);
  const th = Math.atan2(B.y - A.y, B.x - A.x);
  const b = Math.asin((ra - rb) / d);
  const h = Math.PI / 2 - b;
  const Ah = add(A, mul(dir(th + h), ra)), Bh = add(B, mul(dir(th + h), rb));
  const Bb = add(B, mul(dir(th - h), rb)), Ab = add(A, mul(dir(th - h), ra));
  return `M${pt(Ah)}L${pt(Bh)}A${f(rb)},${f(rb)} 0 ${b < 0 ? 1 : 0} 0 ${pt(Bb)}L${pt(Ab)}A${f(ra)},${f(ra)} 0 ${b > 0 ? 1 : 0} 0 ${pt(Ah)}Z`;
}

// Tube le long d'une ligne, bouts arrondis (la queue) ; une ligne vue de bout garde la direction précédente
function tube(c: V[], r: number[]) {
  const n = c.length;
  const haut: V[] = [], bas: V[] = [], nor: V[] = [];
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    const l = dist(a, b);
    const no = l > 0.001 ? { x: (b.y - a.y) / l, y: -(b.x - a.x) / l } : nor[i - 1] ?? { x: 0, y: -1 };
    nor.push(no);
    haut.push(add(c[i], mul(no, r[i])));
    bas.push(sub(c[i], mul(no, r[i])));
  }
  const bout = (i: number, depart: number) => [1, 2, 3, 4, 5].map((k) => add(c[i], mul(dir(depart + (Math.PI * k) / 6), r[i])));
  const ang = (i: number) => Math.atan2(nor[i].y, nor[i].x);
  return { contour: [...haut, ...bout(n - 1, ang(n - 1)), ...[...bas].reverse(), ...bout(0, ang(0) + Math.PI)], nor };
}

// Contour d'une union de boules : depuis un point intérieur, le bord le plus lointain dans chaque direction.
// Une seule courbe, stable d'une image à l'autre (des cercles superposés feraient trembler le bord).
function enveloppe(boules: { c: V; r: number }[], centre: V, n = 120): V[] {
  return Array.from({ length: n }, (_, k) => {
    const u = dir((TAU * k) / n);
    let t = 0;
    for (const b of boules) {
      const m = sub(b.c, centre), q = m.x * u.x + m.y * u.y, disc = q * q - (m.x * m.x + m.y * m.y - b.r * b.r);
      if (disc >= 0) t = Math.max(t, q + Math.sqrt(disc));
    }
    return add(centre, mul(u, t));
  });
}

// Patte à deux os : articulation (coude ou genou) et pied atteignable ; sens +1 plie vers l'arrière
function patte(A: V, cible: V, l1: number, l2: number, sens: number) {
  const d0 = dist(A, cible);
  const u = d0 > 0.01 ? mul(sub(cible, A), 1 / d0) : { x: 0, y: 1 };
  const d = clamp(d0, Math.abs(l1 - l2) + 1, l1 + l2 - 0.5);
  const P = add(A, mul(u, d));
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const J = add(A, mul(dir(Math.atan2(u.y, u.x) + sens * Math.acos(cosA)), l1));
  J.y = Math.min(J.y, -8);
  return { A, J, P };
}

function bezier(a: V, b: V, c: V, d: V, t: number): V {
  const u = 1 - t;
  return add(add(mul(a, u * u * u), mul(b, 3 * u * u * t)), add(mul(c, 3 * u * t * t), mul(d, t * t * t)));
}

// Colonne : de la hanche H à l'épaule S, bombée de « arc » vers le haut
function colonne(H: V, S: V, arc: number, n: number): V[] {
  const u = sub(S, H), l = Math.hypot(u.x, u.y) || 1;
  const no = { x: u.y / l, y: -u.x / l };
  const P1 = add(add(H, mul(u, 1 / 3)), mul(no, arc)), P2 = add(add(H, mul(u, 2 / 3)), mul(no, arc));
  return Array.from({ length: n + 1 }, (_, i) => bezier(H, P1, P2, S, i / n));
}

// ---------- mouvement ----------

class Ressort {
  v = 0;
  constructor(public x: number, public k = 32, public amorti = 1) {}
  pas(cible: number, dt: number) {
    this.v += (this.k * (cible - this.x) - 2 * this.amorti * Math.sqrt(this.k) * this.v) * dt;
    this.x += this.v * dt;
    return this.x;
  }
}

// Une pose : hanche (h), épaule (s), cou (c), pieds avant (av) et arrière (ar), queue (q)
const CLES = ['hx', 'hy', 'sx', 'sy', 'arc', 'cx', 'cy', 'incl', 'tour', 'avX', 'avY', 'av2X', 'arX', 'arY', 'ar2X', 'qBase', 'qCourbe', 'qVague', 'yeux', 'resp'] as const;
type Cle = (typeof CLES)[number];
type Pose = Record<Cle, number>;

const DEBOUT: Pose = { hx: -36, hy: -58, sx: 34, sy: -62, arc: 5, cx: 14, cy: -33, incl: 0, tour: 0.7, avX: 38, avY: -7, av2X: 45, arX: -30, arY: -7, ar2X: -23, qBase: -2.1, qCourbe: 0.12, qVague: 0.08, yeux: 1, resp: 0.012 };
const ASSIS: Pose = { hx: -20, hy: -27, sx: 15, sy: -66, arc: -3, cx: 9, cy: -31, incl: 0, tour: 0.6, avX: 22, avY: -7, av2X: 29, arX: 10, arY: -7, ar2X: 16, qBase: 2.35, qCourbe: 0.17, qVague: 0.1, yeux: 1, resp: 0.012 };
const COUCHE: Pose = { hx: -36, hy: -27, sx: 30, sy: -29, arc: 8, cx: 20, cy: -26, incl: -4, tour: 0.6, avX: 66, avY: -6, av2X: 73, arX: -4, arY: -6, ar2X: 3, qBase: 2.75, qCourbe: 0.12, qVague: 0.06, yeux: 1, resp: 0.016 };
const DORT: Pose = { ...COUCHE, cx: 30, cy: -12, incl: 12, tour: 0.35, qCourbe: 0.06, qVague: 0.015, yeux: 0, resp: 0.035 };
const ETIRE: Pose = { ...DEBOUT, hx: -34, hy: -60, sx: 36, sy: -33, arc: -10, cx: 22, cy: -18, incl: -8, tour: 0.6, avX: 80, avY: -6, av2X: 87, arX: -28, ar2X: -21, qBase: -1.9, qCourbe: 0.06, yeux: 0 };
// à l'affût : arrière-train haut, poitrail au ras du sol ; en plein bond : tout le corps étiré
const GUETTE: Pose = { ...DEBOUT, hx: -32, hy: -44, sx: 30, sy: -34, arc: -4, cx: 22, cy: -20, incl: 4, tour: 0.9, avX: 46, av2X: 52, arX: -24, ar2X: -18, qBase: 3.05, qCourbe: 0.07, qVague: 0.22 };
const BOND: Pose = { ...DEBOUT, hx: -44, hy: -54, sx: 44, sy: -58, arc: 2, cx: 12, cy: -33, incl: 8, tour: 0.9, avX: 86, avY: -12, av2X: 92, arX: -80, arY: -14, ar2X: -74, qBase: 3.05, qCourbe: 0.03, qVague: 0.02 };
const RAIDEUR: Partial<Record<Cle, number>> = { cx: 60, cy: 60, incl: 50, yeux: 140, qBase: 14, qCourbe: 14, avX: 80, av2X: 80, arX: 80, ar2X: 80, avY: 80, arY: 80 };

export type Etat = 'marche' | 'debout' | 'assis' | 'couche' | 'dort' | 'etire' | 'guette' | 'bond';
const POSES: Record<Etat, Pose> = { marche: DEBOUT, debout: DEBOUT, assis: ASSIS, couche: COUCHE, dort: DORT, etire: ETIRE, guette: GUETTE, bond: BOND };
const DUREES: Record<Etat, [number, number]> = { marche: [0, 0], debout: [1, 2.5], assis: [6, 10], couche: [6, 9], dort: [12, 20], etire: [2.2, 2.2], guette: [1.4, 2.2], bond: [0, 0] };
const FEUILLE = 'M50,6 C64,28 88,40 83,64 C80,80 62,85 50,75 C38,85 20,80 17,64 C12,40 36,28 50,6 Z';

// Marche : le pas est réglé sur la distance parcourue, le pied au sol ne glisse jamais
const VMAX = 62; // unités du dessin par seconde
const ACCEL = 140;
const CYCLE = 70; // distance parcourue pendant un cycle de pas
const APPUI = 0.62; // part du cycle où le pied est au sol
const BALAYAGE = APPUI * CYCLE;
const LEVE = 11;
function foulee(p: number): V {
  if (p < APPUI) return { x: lerp(BALAYAGE / 2, -BALAYAGE / 2, p / APPUI), y: 0 };
  const q = (p - APPUI) / (1 - APPUI);
  return { x: lerp(-BALAYAGE / 2, BALAYAGE / 2, lisse(q)), y: -LEVE * Math.sin(Math.PI * q) };
}

const NQ = 11; // segments de la queue
const LQ = 11.5;
const NC = 20; // points de la colonne
const FLANC = 12; // écart des pattes de part et d'autre du corps
const DEMI_TOUR = 0.55; // durée du pivot sur place (à l'affût), en secondes
const ARC = 0.9; // durée du demi-tour en marchant, en secondes

// ---------- tête ----------

const RX = 50, RY = 44, RZ = 42;
const TETE = 0.82; // taille de la tête par rapport au corps

interface Visage { tour: number; yeux: number; regard: V; pupille: number; joie: boolean; miaou: number; oreilles: [number, number] }

function tete(v: Visage) {
  const th = v.tour * 0.95, c = Math.cos(th), sn = Math.sin(th);
  const rot = (p: V3): V3 => ({ x: p.x * c + p.z * sn, y: p.y, z: -p.x * sn + p.z * c });
  const surf = (phi: number, lam: number): V3 => rot({ x: RX * Math.sin(phi) * Math.cos(lam), y: RY * Math.sin(lam), z: RZ * Math.cos(phi) * Math.cos(lam) });
  const face = (phi: number) => Math.cos(phi + th);
  const W = Math.hypot(RX * c, RZ * sn);
  const sil = (a: number, k = 1): V => { const sa = Math.sin(a); return { x: W * Math.cos(a) * (1 + 0.08 * Math.max(0, sa)) * k, y: RY * sa * (sa < 0 ? 0.95 : 1.04) * k }; };

  // oreilles : toutes deux derrière la tête ; l'intérieur rose s'efface doucement quand l'oreille se présente de dos
  const oreille = (cote: number, angle: number): Forme => {
    const b1 = surf(cote * 0.2, -0.8), b2 = surf(cote * 1.0, -0.42);
    const tip = rot({ x: cote * RX * 0.84, y: -RY * 1.5, z: RZ * 0.18 });
    const m = mix(b1, b2, 0.5), a = (angle * Math.PI * cote) / 180;
    const tp = add(m, { x: (tip.x - m.x) * Math.cos(a) - (tip.y - m.y) * Math.sin(a), y: (tip.x - m.x) * Math.sin(a) + (tip.y - m.y) * Math.cos(a) });
    const cen = mul(add(add(b1, b2), tp), 1 / 3);
    const bombe = (p: V, q: V) => { const mi = mix(p, q, 0.5); return add(mi, mul(sub(mi, cen), 0.16)); };
    const deFace = ((tp.x - b1.x) * (b2.y - b1.y) - (tp.y - b1.y) * (b2.x - b1.x)) * cote / (dist(b1, tp) * dist(b1, b2));
    let apres = '';
    if (deFace > 0) {
      const i1 = mix(b1, cen, 0.36), i2 = mix(b2, cen, 0.36), it = mix(tp, cen, 0.24);
      apres = `<path d="M${pt(i1)}Q${pt(bombe(i1, it))} ${pt(it)}Q${pt(bombe(it, i2))} ${pt(i2)}Z" fill="#F9B8A8" opacity="${f(clamp(deFace * 4, 0, 1))}"/>`;
    }
    return { d: `M${pt(b1)}Q${pt(bombe(b1, tp))} ${pt(tp)}Q${pt(bombe(tp, b2))} ${pt(b2)}Z`, fond: 'url(#t-tete)', apres };
  };
  const loin = th >= 0 ? 1 : -1;

  // crâne et touffes des joues
  let touffes = '';
  for (const cote of [1, -1]) for (let j = 0; j < 3; j++) {
    const a0 = cote > 0 ? 0.32 + j * 0.3 : Math.PI - 0.32 - j * 0.3;
    touffes += `M${pt(sil(a0 - 0.13))}L${pt(sil(a0 + cote * 0.13, 1.17))}L${pt(sil(a0 + 0.13))}Z`;
  }
  const formes: Forme[] = [
    oreille(loin, v.oreilles[loin > 0 ? 1 : 0]),
    oreille(-loin, v.oreilles[loin > 0 ? 0 : 1]),
    { d: courbe(Array.from({ length: 40 }, (_, i) => sil((TAU * i) / 40)), true), fond: 'url(#t-tete)' },
    { d: touffes, fond: 'url(#t-tete)' },
  ];
  let s = '';

  // reflet du front et rayures
  const fr = surf(-0.3, -0.55);
  if (fr.z > 0) s += `<ellipse cx="${f(fr.x)}" cy="${f(fr.y)}" rx="${f(14 * Math.max(0.2, face(-0.3)))}" ry="8" fill="#FFC27E" opacity=".45"/>`;
  let ray = '';
  for (const phi of [-0.22, 0, 0.22]) {
    const a = surf(phi, -0.98), b = surf(phi * 0.75, -0.6);
    if (b.z > 0) ray += `M${pt(a)}L${pt(b)}`;
  }
  s += `<path d="${ray}" fill="none" stroke="#B24E12" stroke-width="3.6" stroke-linecap="round" opacity=".55"/>`;

  // museau crème : posé sur la sphère de la tête, il suit la rotation ; les joues roses s'effacent doucement de profil
  const creme: V[] = [];
  for (let k = 0; k <= 12; k++) { const phi = lerp(-0.66, 0.66, k / 12); creme.push(surf(phi, 0.2 + 0.07 * Math.cos((phi / 0.33) * Math.PI))); }
  for (let k = 1; k < 4; k++) creme.push(surf(0.66, lerp(0.27, 1.15, k / 4)));
  for (let k = 0; k <= 8; k++) creme.push(surf(lerp(0.66, -0.66, k / 8), 1.15));
  for (let k = 1; k < 4; k++) creme.push(surf(-0.66, lerp(1.15, 0.27, k / 4)));
  s += `<path d="${courbe(creme, true)}" fill="url(#t-creme)"/>`;
  for (const cote of [-1, 1]) {
    const m = rot({ x: cote * 9.5, y: 17, z: RZ + 2 }), fs = clamp(face(cote * 0.2), 0.3, 1);
    s += `<ellipse cx="${f(m.x)}" cy="${f(m.y)}" rx="${f(10.5 * fs)}" ry="8" fill="#FFFBF3"/>`;
    s += [[-3, -1.5], [1, -2.5], [-1, 2]].map(([dx, dy]) => `<circle cx="${f(m.x + dx * fs)}" cy="${f(m.y + dy)}" r="1.1" fill="#C98B6A"/>`).join('');
    const j = surf(cote * 0.8, 0.24), fj = face(cote * 0.8);
    if (fj > 0) s += `<ellipse cx="${f(j.x)}" cy="${f(j.y)}" rx="${f(9 * Math.max(0.2, fj))}" ry="5" fill="#FF8E7A" opacity="${f(0.45 * clamp(fj * 5, 0, 1))}" filter="url(#t-flou)"/>`;
  }

  // yeux : seule la partie visible entre les paupières est peinte, posée sur un fond brun un peu plus grand,
  // pour qu'aucun bord blanc ne touche la fourrure (sinon un liseré blanc scintille quand la tête bouge).
  // Le trait du dessus suit toujours le haut de la partie visible : l'œil se ferme et s'ouvre d'un seul mouvement,
  // sans saut. Les bords de l'œil suivent la courbe de la tête.
  const yeux: { cote: number; d: string }[] = [];
  const bordTete = (q: V3) => (q.z > 0 ? clamp(q.x, -W * 0.93, W * 0.93) : Math.sign(q.x) * W * 0.93);
  for (const cote of [-1, 1]) {
    const xg = bordTete(surf(cote * 0.43 - 0.23, 0.05)), xd = bordTete(surf(cote * 0.43 + 0.23, 0.05));
    const rx = Math.abs(xd - xg) / 2, ry = 13.5, cx = (xg + xd) / 2, cy = surf(cote * 0.43, 0.05).y, fs = rx / 11.5;
    if (rx < 1) continue;
    if (v.joie) {
      s += `<path d="M${f(cx - rx)},${f(cy + 3)}Q${f(cx)},${f(cy - ry)} ${f(cx + rx)},${f(cy + 3)}" fill="none" stroke="${TRAIT_OEIL}" stroke-width="3.4" stroke-linecap="round"/>`;
      continue;
    }
    // fermeture en deux temps continus : la paupière descend jusqu'au milieu de l'œil (bord légèrement creusé),
    // puis le trait devient une courbe d'un coin à l'autre qui se creuse jusqu'au « ‿ » du sommeil,
    // pendant que la paupière du bas remonte à sa rencontre
    const o = clamp(v.yeux, 0, 1), creux0 = 0.12 * ry, creuxFerme = 0.32 * ry;
    let d: string, haut: string;
    if (o >= 0.5) {
      const u = (o - 0.5) / 0.5, yh = lerp(cy, cy - ry, u), dh = rx * Math.sqrt(Math.max(0, 1 - ((yh - cy) / ry) ** 2)), creux = lerp(creux0, 0.5, u);
      const bord = `A${f(dh)},${f(creux)} 0 0 0 ${f(cx + dh)},${f(yh)}`;
      d = dh < 0.5 ? ovale({ x: cx, y: cy }, rx, ry) : `M${f(cx - dh)},${f(yh)}${bord}A${f(rx)},${f(ry)} 0 1 1 ${f(cx - dh)},${f(yh)}Z`;
      haut = `M${f(cx - rx)},${f(cy)}A${f(rx)},${f(ry)} 0 0 1 ${f(cx - dh)},${f(yh)}${bord}A${f(rx)},${f(ry)} 0 0 1 ${f(cx + rx)},${f(cy)}`;
    } else {
      const u = o / 0.5, creuxH = lerp(creuxFerme, creux0, u), creuxB = lerp(creuxFerme, ry, u);
      d = `M${f(cx - rx)},${f(cy)}A${f(rx)},${f(creuxH)} 0 0 0 ${f(cx + rx)},${f(cy)}A${f(rx)},${f(creuxB)} 0 0 1 ${f(cx - rx)},${f(cy)}Z`;
      haut = `M${f(cx - rx)},${f(cy)}A${f(rx)},${f(creuxH)} 0 0 0 ${f(cx + rx)},${f(cy)}`;
    }
    if (o > 0.02) {
      yeux.push({ cote, d });
      const ix = cx + v.regard.x * rx * 0.3, iy = cy + 1.2 + v.regard.y * ry * 0.22;
      // presque fermé, le blanc s'efface dans le trait sombre au lieu de rester en filet
      s += `<path d="${d}" fill="${TRAIT_OEIL}" stroke="${TRAIT_OEIL}" stroke-width="2.4" stroke-linejoin="round"/><g opacity="${f(clamp((o - 0.02) / 0.18, 0, 1))}"><path d="${d}" fill="#fff"/><g clip-path="url(#t-oeil-${cote > 0 ? 'd' : 'g'})">`;
      // un œil vu de biais est rempli par l'iris : pas de filet blanc d'un pixel qui scintillerait
      s += `<ellipse cx="${f(ix)}" cy="${f(iy)}" rx="${f(rx * Math.min(1.05, 0.84 + 0.35 * (1 - fs)))}" ry="${f(ry * 0.84)}" fill="url(#t-oeil)"/>`;
      s += `<ellipse cx="${f(ix)}" cy="${f(iy + 0.5)}" rx="${f(4.3 * fs * v.pupille)}" ry="${f(9 + 1.5 * (v.pupille - 1))}" fill="#1B2A14"/>`;
      s += `<ellipse cx="${f(ix + 4 * fs)}" cy="${f(iy - 4.6)}" rx="${f(3.8 * fs)}" ry="3.8" fill="#fff"/><ellipse cx="${f(ix - 3.2 * fs)}" cy="${f(iy + 5)}" rx="${f(1.7 * fs)}" ry="1.7" fill="#fff" opacity=".9"/></g></g>`;
    }
    s += `<path d="${haut}M${f(cx + cote * rx)},${f(cy)}l${f(cote * 3.5 * fs)},${f(-3.5 * fs)}" fill="none" stroke="${TRAIT_OEIL}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  // truffe et bouche
  const cn = clamp(c, 0.45, 1);
  const n = rot({ x: 0, y: 8.5, z: RZ + 4.5 });
  s += `<path d="M${f(n.x - 5.5 * cn)},${f(n.y - 2.5)}Q${f(n.x)},${f(n.y - 4.8)} ${f(n.x + 5.5 * cn)},${f(n.y - 2.5)}Q${f(n.x + 4 * cn)},${f(n.y + 3)} ${f(n.x)},${f(n.y + 4.5)}Q${f(n.x - 4 * cn)},${f(n.y + 3)} ${f(n.x - 5.5 * cn)},${f(n.y - 2.5)}Z" fill="#F27C8C"/>`;
  s += `<ellipse cx="${f(n.x - 1.5 * cn)}" cy="${f(n.y - 2)}" rx="${f(1.8 * cn)}" ry="1" fill="#fff" opacity=".7"/>`;
  const m0 = rot({ x: 0, y: 13, z: RZ + 3 }), m1 = rot({ x: 0, y: 16.5, z: RZ + 2.5 });
  const mg = rot({ x: -8.5, y: 19, z: RZ }), md = rot({ x: 8.5, y: 19, z: RZ });
  const cg = rot({ x: -3.5, y: 22.5, z: RZ + 2 }), cd = rot({ x: 3.5, y: 22.5, z: RZ + 2 });
  if (v.miaou > 0) {
    const o = rot({ x: 0, y: 21, z: RZ + 1.5 }), k = clamp(v.miaou * 4, 0, 1);
    s += `<ellipse cx="${f(o.x)}" cy="${f(o.y)}" rx="${f(6.5 * cn)}" ry="${f(6 * k)}" fill="#8A2E1B" stroke="#6B2E12" stroke-width="2.2"/>`;
    s += `<ellipse cx="${f(o.x)}" cy="${f(o.y + 3 * k)}" rx="${f(4 * cn)}" ry="${f(2.4 * k)}" fill="#FF8A80"/>`;
  }
  s += `<path d="M${pt(m0)}L${pt(m1)}M${pt(mg)}Q${pt(cg)} ${pt(m1)}Q${pt(cd)} ${pt(md)}" fill="none" stroke="#6B2E12" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;

  // moustaches, hors du contour
  let mo = '';
  for (const cote of [-1, 1]) for (let j = 0; j < 3; j++) {
    const a = rot({ x: cote * 13, y: 15.5 + j * 3.2, z: RZ - 1 }), b = rot({ x: cote * 64, y: 15 + j * 10, z: RZ - 24 });
    mo += `M${pt(a)}Q${pt(add(mix(a, b, 0.5), { x: 0, y: -3 }))} ${pt(b)}`;
  }
  return { formes, details: s, yeux, moustaches: `<path d="${mo}" fill="none" stroke="${CONTOUR}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>` };
}

// ---------- dessin fixe ----------
// Les découpes (yeux, rayures) et le masque des pattes restent les mêmes éléments : on ne change que leurs mesures
// à chaque image. Les recréer à chaque image fait clignoter certains navigateurs.

const DEFS = `<defs>
<linearGradient id="t-pelage" gradientUnits="userSpaceOnUse" x1="0" y1="-95" x2="0" y2="0"><stop offset="0" stop-color="#FBB062"/><stop offset="1" stop-color="#E06C24"/></linearGradient>
<linearGradient id="t-tete" gradientUnits="userSpaceOnUse" x1="0" y1="-60" x2="0" y2="46"><stop offset="0" stop-color="#FAAA58"/><stop offset="1" stop-color="#E5742A"/></linearGradient>
<linearGradient id="t-creme" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8EC"/><stop offset="1" stop-color="#FFE0B8"/></linearGradient>
<radialGradient id="t-oeil" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#9BE37C"/><stop offset="1" stop-color="#2F9A47"/></radialGradient>
<radialGradient id="t-fondu"><stop offset=".45" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
<clipPath id="t-oeil-g"><path/></clipPath><clipPath id="t-oeil-d"><path/></clipPath>
<clipPath id="t-c-corps"><path/></clipPath><clipPath id="t-c-queue"><path/></clipPath>
<mask id="t-m-pattes" maskUnits="userSpaceOnUse" x="-300" y="-300" width="600" height="600"><rect x="-300" y="-300" width="600" height="600" fill="#fff"/><g clip-path="url(#t-c-corps)"><circle fill="url(#t-fondu)"/><circle fill="url(#t-fondu)"/><circle fill="url(#t-fondu)"/><circle fill="url(#t-fondu)"/></g></mask>
${[0, 1, 2, 3].map((k) => `<mask id="t-m-cache-${k}" maskUnits="userSpaceOnUse" x="-300" y="-300" width="600" height="600"><rect x="-300" y="-300" width="600" height="600" fill="#fff"/><path fill="#000"/></mask>`).join('')}
<filter id="t-flou"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="t-flou-doux" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="t-flou-ombre" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>`;

// ---------- le chat ----------

export class Chat {
  auto = true;
  squelette = false;
  private calque: SVGGElement;
  private fixes: { corps: Element; queue: Element; oeilG: Element; oeilD: Element; ronds: Element[]; caches: Element[] };
  private W = 0;
  private H = 280;
  private loupe = 1;
  private sol = 0;
  private s = 1;
  private x = 0;
  private vx = 0;
  private sens = -1; // direction voulue
  // rotation du corps autour de l'axe vertical : 0 de profil vers la droite, π vers la gauche, π/2 face au visiteur
  private phi = Math.PI;
  private phiDe = Math.PI;
  private phiA = Math.PI;
  private retour = -1; // temps écoulé dans un demi-tour, -1 hors demi-tour
  private enArc = false; // demi-tour en marchant (sinon pivot sur place)
  private vArc = 0; // vitesse de marche pendant ce demi-tour
  private coupDoeil = 0; // temps restant d'un coup d'œil vers le visiteur
  private prochainCoupDoeil = 4;
  private etat: Etat = 'marche';
  private cibleX = 0;
  private phase = 0;
  private attente = 0;
  private t = 0;
  private avant = 0;
  private allure = new Ressort(0, 60);
  private r = Object.fromEntries(CLES.map((c) => [c, new Ressort(DEBOUT[c], RAIDEUR[c] ?? 32)])) as Record<Cle, Ressort>;
  private qa = Array.from({ length: NQ }, (_, i) => DEBOUT.qBase + i * DEBOUT.qCourbe);
  private qv = new Array<number>(NQ).fill(0);
  private qRendu = [...this.qa];
  // orientation de la tête vue par le visiteur : 0 de face, positif vers la droite
  private tour = new Ressort(-DEBOUT.tour, 80);
  private regardX = new Ressort(0, 90);
  private regardY = new Ressort(0, 90);
  private oreille = new Ressort(0, 220, 0.3);
  private oreilleCote = 0;
  private prochaineOreille = 3;
  private cligne = 0;
  private prochainCligne = 2.5;
  private joie = 0;
  private miaou = 0;
  private sautY = 0;
  private sautV = 0;
  private coeurs: { dx: number; vie: number }[] = [];
  private pointeur: V | null = null;
  private feuille: { x0: number; x: number; y: number; t: number; posee: number } | null = null;
  private pupille = new Ressort(1, 60);
  private bondDe = 0;
  private bondA = 0;
  private bondT = 0;

  constructor(private scene: SVGSVGElement) {
    scene.innerHTML = `${DEFS}<g class="t-dessin"></g>`;
    this.calque = scene.querySelector<SVGGElement>('.t-dessin')!;
    const q = (sel: string) => scene.querySelector(sel)!;
    this.fixes = { corps: q('#t-c-corps path'), queue: q('#t-c-queue path'), oeilG: q('#t-oeil-g path'), oeilD: q('#t-oeil-d path'), ronds: [...scene.querySelectorAll('#t-m-pattes circle')], caches: [0, 1, 2, 3].map((k) => q(`#t-m-cache-${k} path`)) };
    this.mesurer();
    addEventListener('resize', () => this.mesurer());
    const suivre = (e: PointerEvent) => { this.pointeur = { x: e.clientX, y: e.clientY - (innerHeight - this.H) }; };
    addEventListener('pointermove', suivre, { passive: true });
    addEventListener('pointerdown', suivre, { passive: true });
    scene.addEventListener('pointerdown', (e) => { if ((e.target as Element).closest('.t-chat')) this.caresse(); });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.auto = false;
      this.x = this.W - 110 * this.s;
      this.mettre('assis');
    } else {
      // il entre par la droite
      this.x = this.W + 130 * this.s;
      this.cibleX = this.W * 0.68;
    }
    requestAnimationFrame((t) => this.boucle(t));
  }

  ordre(e: Etat) {
    if (e === 'marche') this.marcher();
    else this.mettre(e);
  }

  // Une feuille de tilleul tombe : il la guette, puis bondit dessus
  lacherFeuille() {
    const marge = 120 * this.s;
    let x = this.x;
    for (let i = 0; i < 12 && Math.abs(x - this.x) < 200 * this.s; i++) x = lerp(marge, this.W - marge, Math.random());
    this.feuille = { x0: x, x, y: -20, t: 0, posee: 0 };
    if (this.etat !== 'dort') this.chasser();
  }

  private chasser() {
    const fe = this.feuille!, d = Math.sign(fe.x0 - this.x) || 1;
    this.cibleX = this.dansEcran(fe.x0 - d * 200 * this.s);
    if (Math.abs(this.cibleX - this.x) < 12) this.mettre('guette');
    else this.etat = 'marche';
  }

  private bondir() {
    this.bondDe = this.x;
    this.bondA = this.dansEcran(this.feuille!.x - this.sens * 58 * this.s);
    this.bondT = 0;
    this.mettre('bond');
  }

  // Loupe de la page d'essai : agrandit le chat pour le regarder de près
  taille(k: number) {
    this.loupe = k;
    this.mesurer();
  }

  private mesurer() {
    this.W = innerWidth;
    this.s = clamp(this.W / 1150, 0.72, 1.05) * this.loupe;
    this.H = 280 * Math.max(1, this.loupe);
    this.sol = this.H - 4;
    this.scene.style.height = `${this.H}px`;
    this.scene.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
  }

  private mettre(e: Etat) {
    this.etat = e;
    const [a, b] = DUREES[e];
    this.attente = lerp(a, b, Math.random());
  }

  private marcher() {
    const marge = 100 * this.s;
    let x = this.x;
    for (let i = 0; i < 12 && Math.abs(x - this.x) < this.W * 0.25; i++) x = lerp(marge, this.W - marge, Math.random());
    this.cibleX = this.dansEcran(x);
    this.etat = 'marche';
  }

  // toute destination reste à l'écran, même sur un petit téléphone
  private dansEcran(x: number) {
    return clamp(x, 70 * this.s, this.W - 70 * this.s);
  }

  // Pilote automatique : une petite vie de chat
  private suivant() {
    const r = Math.random();
    switch (this.etat) {
      case 'debout': if (r < 0.35) this.mettre('assis'); else if (r < 0.5) this.mettre('couche'); else if (r < 0.62) this.lacherFeuille(); else this.marcher(); break;
      case 'assis': if (r < 0.45) this.marcher(); else if (r < 0.72) this.mettre('couche'); else this.lacherFeuille(); break;
      case 'couche': if (r < 0.6) this.mettre('dort'); else this.mettre('debout'); break;
      case 'dort': this.mettre('etire'); break;
      case 'etire': this.marcher(); break;
    }
  }

  private caresse() {
    if (this.etat === 'guette' || this.etat === 'bond') return;
    if (this.etat === 'dort' || this.etat === 'couche') { this.mettre('assis'); this.joie = 1.2; return; }
    this.joie = 1.6;
    this.miaou = 0.5;
    this.coupDoeil = 2;
    if (this.sautY === 0) this.sautV = 300;
    this.faireDesCoeurs();
  }

  private faireDesCoeurs() {
    for (let i = 0; i < 4; i++) this.coeurs.push({ dx: (Math.random() - 0.5) * 70, vie: 1 + i * 0.12 });
  }

  private boucle(t: number) {
    const dt = Math.min(1 / 30, (t - (this.avant || t)) / 1000);
    this.avant = t;
    this.calque.innerHTML = this.image(dt);
    requestAnimationFrame((u) => this.boucle(u));
  }

  private image(dt: number): string {
    const s = this.s;
    this.t += dt;
    const cap = Math.cos(this.phi) >= 0 ? 1 : -1; // côté vers lequel le corps est tourné

    // déplacement : il freine pour s'arrêter pile ; pendant un demi-tour en marchant, sa vitesse suit son orientation
    if (this.etat === 'marche') {
      const d = this.cibleX - this.x;
      if (Math.abs(d) > 4 && Math.sign(d) !== this.sens) this.sens = Math.sign(d);
      if (this.retour >= 0 && this.enArc) this.vx = this.vArc * Math.cos(this.phi);
      else {
        const tourne = this.retour >= 0 || cap !== this.sens;
        const voulu = tourne ? 0 : this.sens * Math.min(VMAX, Math.sqrt(2 * ACCEL * Math.max(0, Math.abs(d) / s - 1)));
        this.vx += clamp(voulu - this.vx, -ACCEL * dt, ACCEL * dt);
        if (!tourne && Math.abs(d) < 3 && Math.abs(this.vx) < 6) { this.vx = 0; this.mettre(this.feuille ? 'guette' : 'debout'); }
      }
    } else {
      this.vx += clamp(-this.vx, -2 * ACCEL * dt, 2 * ACCEL * dt);
      this.attente -= dt;
      if (this.etat === 'guette') {
        // il fait face à la feuille et attend qu'elle soit posée
        const fe = this.feuille;
        if (!fe) this.mettre('debout');
        else {
          this.sens = Math.sign(fe.x - this.x) || this.sens;
          if (this.attente <= 0 && fe.posee > 0 && this.retour < 0 && cap === this.sens) this.bondir();
        }
      } else if (this.etat === 'bond') {
        this.bondT += dt;
        const u = Math.min(1, this.bondT / 0.65);
        this.x = lerp(this.bondDe, this.bondA, lisse(u));
        this.sautY = Math.sin(Math.PI * u) * 70 * s;
        if (u >= 1) {
          this.sautY = 0;
          this.feuille = null;
          this.joie = 1.6;
          this.faireDesCoeurs();
          this.mettre('assis');
        }
      } else if (this.auto && this.attente <= 0) this.suivant();
    }
    this.x += this.vx * s * dt;

    // la feuille tombe en se balançant, puis s'en va si personne ne l'attrape
    const fe = this.feuille;
    if (fe) {
      fe.t += dt;
      if (!fe.posee) {
        fe.y += 55 * s * dt;
        fe.x = fe.x0 + Math.sin(fe.t * 1.9) * 28 * s;
        if (fe.y >= this.sol - 5 * s) { fe.y = this.sol - 5 * s; fe.posee = fe.t; }
      } else if (fe.t - fe.posee > 9) this.feuille = null;
    }

    // saut de joie
    if (this.etat !== 'bond' && (this.sautY > 0 || this.sautV > 0)) {
      this.sautV -= 1500 * dt;
      this.sautY += this.sautV * dt;
      if (this.sautY <= 0) { this.sautY = 0; this.sautV = 0; }
    }
    const leve = this.sautY;

    // demi-tour : en marchant, il décrit un petit arc vers le visiteur (il ralentit, passe de face en marchant,
    // repart de l'autre côté) ; à l'arrêt (à l'affût), il pivote sur place en piétinant.
    // La tête, plus rapide, regarde déjà vers la nouvelle direction.
    const vise = this.sens > 0 ? 0 : Math.PI;
    if (Math.abs(this.phi - vise) > 0.001 && (this.retour < 0 || this.phiA !== vise)) {
      const enMarche = this.etat === 'marche';
      if (enMarche || Math.abs(this.vx) < 4) {
        this.enArc = enMarche;
        this.vArc = Math.max(Math.abs(this.vx), VMAX * 0.6);
        this.retour = 0;
        this.phiDe = this.phi;
        this.phiA = vise;
      }
    }
    let pietine = 0, proche = 0;
    if (this.retour >= 0) {
      this.retour += dt;
      const u = this.enArc ? clamp(this.retour / ARC, 0, 1) : clamp((this.retour - 0.12) / DEMI_TOUR, 0, 1);
      this.phi = lerp(this.phiDe, this.phiA, lisse(u));
      if (this.enArc) proche = Math.sin(Math.PI * u);
      else pietine = Math.sin(Math.PI * u);
      if (u >= 1) this.retour = -1;
    }
    const sv = s * (1 + 0.07 * proche); // de face, au milieu de l'arc, il est un peu plus près
    const cphi = Math.cos(this.phi), sphi = Math.sin(this.phi);
    // projection à l'écran et profondeur (positive = plus près du visiteur) d'un point du profil, décalé de z vers le flanc proche
    const proj = (q: V, z = 0): V => ({ x: q.x * cphi - z * sphi, y: q.y });
    const prof = (q: V, z = 0) => q.x * sphi + z * cphi;

    // pose : chaque réglage glisse vers celui de l'état voulu
    const cible = POSES[this.etat];
    const p = {} as Pose;
    for (const c of CLES) {
      const r = this.r[c];
      // l'angle de la queue prend le chemin le plus court (sinon elle balaie le dos en passant par l'avant)
      p[c] = r.pas(c === 'qBase' ? r.x + ecart(cible[c] - r.x) : cible[c], dt);
    }
    const vit = this.retour >= 0 && this.enArc && this.etat === 'marche' ? this.vArc : Math.abs(this.vx);
    const w = this.allure.pas(clamp((vit / VMAX) * 1.4, 0, 1), dt);
    this.phase = (this.phase + (vit * dt) / CYCLE + pietine * dt * 1.6) % 1;
    const hauteurPas = Math.max(w, pietine * 0.8);

    // corps : une chaîne de boules le long de la colonne (de profil un boudin, de face une boule)
    const H = { x: p.hx, y: p.hy + 1.8 * w * Math.sin(TAU * 2 * this.phase) };
    const S = { x: p.sx, y: p.sy + 1.8 * w * Math.sin(TAU * 2 * (this.phase + 0.25)) };
    const souffle = Math.sin((this.t * TAU) / 3.4) * p.resp;
    const col = colonne(H, S, p.arc + 1.2 * w * Math.sin(TAU * this.phase), NC);
    const rH = col.map((_, i) => { const t = i / NC; return (t < 0.45 ? lerp(27, 23.5, lisse(t / 0.45)) : lerp(23.5, 29, lisse((t - 0.45) / 0.55))) * (1 + souffle * 0.5); });
    const rB = col.map((_, i) => { const t = i / NC; return ((t < 0.45 ? lerp(26, 26.5, t / 0.45) : lerp(26.5, 29, lisse((t - 0.45) / 0.55))) + 3.5 * Math.sin(Math.PI * t)) * (1 + souffle); });
    const nor = col.map((_, i) => { const a = col[Math.max(0, i - 1)], b = col[Math.min(NC, i + 1)], l = dist(a, b) || 1; return { x: (b.y - a.y) / l, y: -(b.x - a.x) / l }; });
    const boules = col.map((c, i) => ({ c: sub(c, mul(nor[i], (rB[i] - rH[i]) / 2)), r: (rH[i] + rB[i]) / 2 }));
    const vues3d = boules.map((b) => ({ c: proj(b.c), r: b.r }));
    const dCorps = courbe(enveloppe(vues3d, vues3d[NC / 2].c), true);

    // pattes : la marche décale les pieds, un pied qui se déplace hors de la marche se lève un peu
    const pied = (x: number, y: number, o: number, rv: Ressort): V => {
      const g = foulee((this.phase + o) % 1);
      return { x: x + g.x * w, y: Math.min(-7, y + g.y * hauteurPas - Math.min(9, Math.abs(rv.v) * 0.12)) };
    };
    const ancreAv = add(S, { x: -2, y: 9 }), ancreAr = add(H, { x: 5, y: 6 });
    const pattes = [
      { j: patte(ancreAv, pied(p.avX, p.avY, 0.25, this.r.avX), 26, 26, 1), z: FLANC, r: [12, 9.5, 9], fondu: { dx: 0, dy: -6, r: 24 } },
      { j: patte(add(ancreAv, { x: 4, y: -2 }), pied(p.av2X, p.avY, 0.75, this.r.av2X), 26, 26, 1), z: -FLANC, r: [11.5, 9, 8.6], fondu: { dx: 0, dy: -6, r: 24 } },
      { j: patte(ancreAr, pied(p.arX, p.arY, 0, this.r.arX), 22, 27, -1), z: FLANC, r: [19, 11, 9], fondu: { dx: -6, dy: -8, r: 30 } },
      { j: patte(add(ancreAr, { x: 4, y: -2 }), pied(p.ar2X, p.arY, 0.5, this.r.ar2X), 22, 27, -1), z: -FLANC, r: [18, 10.5, 8.6], fondu: { dx: -6, dy: -8, r: 30 } },
    ];

    // queue : chaque segment suit le précédent avec un temps de retard (ressorts d'angle) ;
    // un segment qui touche le sol s'y couche du côté où il était à l'image précédente, sans jamais basculer
    const om = this.etat === 'marche' ? TAU * 1.5 : this.etat === 'guette' ? TAU * 2.2 : TAU / 2.6;
    for (let i = 0; i < NQ; i++) {
      let c = i === 0 ? this.qa[0] + ecart(p.qBase - this.qa[0]) : this.qa[i - 1] + p.qCourbe;
      c += p.qVague * Math.sin(this.t * om - i * 0.55) * (i === 0 ? 0.5 : 1);
      const k = lerp(150, 55, i / (NQ - 1));
      this.qv[i] += (k * (c - this.qa[i]) - 1.5 * Math.sqrt(k) * this.qv[i]) * dt;
      this.qa[i] += this.qv[i] * dt;
    }
    const racine = add(add(H, mul(dir(Math.atan2(H.y - S.y, H.x - S.x)), rH[0] * 0.7)), mul(nor[0], 8));
    const pos: V[] = [racine];
    for (let i = 0; i < NQ; i++) {
      let a = this.qa[i];
      if (pos[i].y + Math.sin(a) * LQ > -6.5) {
        const a1 = Math.asin(clamp((-6.5 - pos[i].y) / LQ, -1, 1)), a2 = Math.PI - a1, avant = this.qRendu[i];
        a = Math.abs(ecart(a1 - avant)) <= Math.abs(ecart(a2 - avant)) ? a1 : a2;
        a = this.qa[i] + ecart(a - this.qa[i]);
        this.qa[i] = a;
        this.qv[i] *= 0.6;
      }
      this.qRendu[i] = a;
      pos.push(add(pos[i], mul(dir(a), LQ)));
    }
    const qp = pos.map((q) => proj(q));
    const tq = tube(qp, qp.map((_, i) => lerp(8.5, 6.2, i / NQ)));
    const dQueue = courbe(tq.contour, true);

    // tête : regarde le visiteur ; pendant un demi-tour elle regarde déjà vers la nouvelle direction
    const teteC = add(S, { x: p.cx, y: p.cy + 1.3 * w * Math.sin(TAU * 2 * (this.phase + 0.1)) });
    const tc = proj(teteC);
    const teteMonde = { x: this.x + tc.x * sv, y: this.sol - leve + tc.y * sv };
    // regard : devant lui la plupart du temps ; de temps en temps (et quand on le caresse),
    // un coup d'œil vers le visiteur, ou vers le pointeur s'il y en a un
    this.prochainCoupDoeil -= dt;
    if (this.prochainCoupDoeil <= 0) { this.coupDoeil = 1.4 + Math.random() * 1.2; this.prochainCoupDoeil = this.coupDoeil + 5 + Math.random() * 7; }
    this.coupDoeil = Math.max(0, this.coupDoeil - dt);
    let tourCible = p.tour * cphi, rx = 0.5 * cap, ry = 0;
    const regarder = (q: V) => {
      const dx = q.x - teteMonde.x, dy = q.y - teteMonde.y;
      tourCible = clamp(dx / 420, -0.8, 0.8);
      rx = clamp(dx / 260, -1, 1);
      ry = clamp(dy / 220, -1, 1);
    };
    if (this.retour >= 0) { const nouveau = this.phiA === 0 ? 1 : -1; tourCible = 0.85 * nouveau; rx = 0.7 * nouveau; }
    else if (this.feuille && this.etat !== 'dort') regarder(this.feuille);
    else if (this.coupDoeil > 0 && this.etat !== 'dort' && this.etat !== 'marche') {
      if (this.pointeur) regarder(this.pointeur);
      else { tourCible = 0; rx = 0; }
    }
    this.tour.pas(tourCible, dt);
    this.regardX.pas(rx, dt);
    this.regardY.pas(ry, dt);

    // petites habitudes : oreille qui frémit, clignement
    this.prochaineOreille -= dt;
    if (this.prochaineOreille <= 0) { this.oreilleCote = Math.random() < 0.5 ? 0 : 1; this.oreille.v += 420; this.prochaineOreille = 3 + Math.random() * 5; }
    this.oreille.pas(0, dt);
    const repos = this.etat === 'dort' ? 12 : 0;
    const oreilles: [number, number] = [repos + this.oreille.x * (this.oreilleCote === 0 ? 1 : 0.25), repos + this.oreille.x * (this.oreilleCote === 1 ? 1 : 0.25)];
    this.prochainCligne -= dt;
    if (this.prochainCligne <= 0) { this.cligne = 0.16; this.prochainCligne = 2.5 + Math.random() * 4; }
    let paupiere = 1;
    if (this.cligne > 0) { this.cligne -= dt; paupiere = Math.abs((1 - this.cligne / 0.16) * 2 - 1); }

    // joie, cœurs
    this.joie = Math.max(0, this.joie - dt);
    this.miaou = Math.max(0, this.miaou - dt);
    for (const c of this.coeurs) c.vie -= dt / 1.6;
    this.coeurs = this.coeurs.filter((c) => c.vie > 0);

    // ---------- dessin ----------
    mesures(this.fixes.corps, { d: dCorps });
    mesures(this.fixes.queue, { d: dQueue });

    // ombre au sol
    const milieu = proj(mix(H, S, 0.5)), ombre = 1 - Math.min(0.45, leve / 160);
    const largeurOmbre = Math.hypot(((S.x - H.x) / 2 + 42) * cphi, 36 * sphi) * ombre;
    let svg = `<ellipse cx="${f(this.x + milieu.x * sv)}" cy="${f(this.sol - 1)}" rx="${f(largeurOmbre * sv)}" ry="${f(6.5 * sv)}" fill="#2B6E3A" opacity=".18" filter="url(#t-flou-ombre)"/>`;

    // une patte, projetée ; plus elle est loin derrière le corps, plus elle est sombre
    const profCorps = prof(mix(H, S, 0.5));
    const vues = pattes.map((pa, k) => {
      const { A, J, P } = pa.j, z = pa.z;
      const a = proj(A, z), jj = proj(J, z), pp = proj(P, z), [r1, r2, r3] = pa.r;
      const profondeur = prof(mix(A, P, 0.5), z), profAncre = prof(A, z);
      const doigts = [proj({ x: P.x + 3, y: P.y + 2 }, z - 3), proj({ x: P.x + 7, y: P.y + 1 }, z + 3)];
      const formes: Forme[] = [
        { d: os(a, r1, jj, r2), fond: 'url(#t-pelage)' },
        { d: os(jj, r2, pp, r3), fond: 'url(#t-pelage)', apres: `<path d="${os(mix(pp, jj, 0.42), r3, pp, r3)}" fill="url(#t-creme)"/>` },
        { d: ovale(proj({ x: P.x + 3, y: P.y }, z), Math.hypot(10.5 * cphi, 8 * sphi), 7.2), fond: '#FFF3E2', apres: `<path d="${doigts.map((q) => `M${pt(q)}v4.5`).join('')}" stroke="${CONTOUR}" stroke-width="1.8" stroke-linecap="round" opacity=".5"/>` },
      ];
      const sombre = 0.16 * clamp((profCorps - profondeur) / 12, 0, 1);
      const dessin = silhouette(formes) + (sombre > 0.005 ? `<g fill="#6B2E12" opacity="${sombre.toFixed(3)}">${formes.map((x) => `<path d="${x.d}"/>`).join('')}</g>` : '');
      return { k, profondeur, profAncre, visible: z * cphi > 0, dessin, ancre: proj(add(A, { x: pa.fondu.dx, y: pa.fondu.dy }), z), rayon: pa.fondu.r };
    }).sort((a, b) => a.profondeur - b.profondeur);
    // une patte reste du côté où elle est attachée : celles du côté caché passent derrière le corps ; celles du côté visible
    // passent devant, sauf là où une partie du corps plus proche du visiteur les cache. Cette partie grandit doucement
    // à mesure qu'il se tourne : aucune patte ne change de plan d'un coup.
    const derriere = vues.filter((v) => !v.visible), devant = vues.filter((v) => v.visible);
    const tranches = boules.map((b) => ({ c: proj(b.c), r: b.r + EP / 2, prof: prof(b.c) }));
    this.fixes.caches.forEach((cache, i) => {
      const v = devant.find((x) => x.k === i);
      const devantElle = v ? tranches.map((t) => ({ c: t.c, r: t.r * clamp((t.prof - v.profAncre) / 4, 0, 1) })).filter((t) => t.r > 0.5) : [];
      const centre = devantElle.reduce((m, t) => (t.r > m.r ? t : m), { c: { x: 0, y: 0 }, r: 0 }).c;
      mesures(cache, { d: devantElle.length ? courbe(enveloppe(devantElle, centre), true) : '' });
    });
    // le haut des pattes de devant se fond dans le corps, sans contour ; seulement là où le corps est derrière
    // (le fondu est découpé par le corps), sinon on verrait le fond à travers la patte
    this.fixes.ronds.forEach((rond, i) => {
      const v = devant.find((x) => x.k === i);
      mesures(rond, v ? { cx: f(v.ancre.x), cy: f(v.ancre.y), r: v.rayon } : { r: 0 });
    });

    const rayuresQueue = [0.28, 0.44, 0.6, 0.76, 0.92].map((t) => { const i = Math.round(t * NQ), c = qp[i], no = tq.nor[i]; return `M${pt(add(c, mul(no, 11)))}L${pt(sub(c, mul(no, 11)))}`; }).join('');
    const queue = silhouette([{ d: dQueue, fond: 'url(#t-pelage)', apres: `<path d="${rayuresQueue}" stroke="${RAYURE}" stroke-width="5" opacity=".6" clip-path="url(#t-c-queue)"/>` }]);

    // corps : ventre et plastron crème, rayures du dos, reflet, touffes du poitrail, ombre de la tête ;
    // le ventre, les rayures et le reflet sont dessinés pour le profil et s'estompent quand il passe de face
    const ventre: V[] = [];
    for (let i = 5; i <= NC; i++) ventre.push(proj(sub(col[i], mul(nor[i], rB[i] + 3))));
    for (let i = NC; i >= 5; i--) ventre.push(proj(sub(col[i], mul(nor[i], rB[i] - lerp(3, rB[i] * 0.95, lisse((i / NC - 0.25) / 0.75))))));
    const fin = col[NC], noF = nor[NC], tgF = { x: -noF.y, y: noF.x };
    const angF = Math.atan2(tgF.y, tgF.x);
    const plastron = proj(sub(add(fin, mul(tgF, 12)), mul(noF, 8)));
    const rayures = [0.1, 0.22, 0.34, 0.46, 0.58, 0.7].map((t) => {
      const i = Math.round(t * NC), c = col[i], no = nor[i], tg = { x: -no.y, y: no.x };
      const b = add(c, mul(no, rH[i] + 2)), tip = add(add(c, mul(no, rH[i] - (15 - t * 5))), mul(tg, -3));
      return `M${pt(proj(add(b, mul(tg, -5))))}L${pt(proj(tip))}L${pt(proj(add(b, mul(tg, 5))))}Z`;
    }).join('');
    const reflet = courbe(col.slice(2, 16).map((c, k) => proj(add(c, mul(nor[k + 2], rH[k + 2] - 5)))), false);
    let touffes = '';
    for (let k = 1; k <= 3; k++) {
      const a0 = angF + k * 0.32, r = rB[NC];
      touffes += `M${pt(proj(add(fin, mul(dir(a0 - 0.12), r))))}L${pt(proj(add(fin, mul(dir(a0 + 0.06), r + 7))))}L${pt(proj(add(fin, mul(dir(a0 + 0.12), r))))}Z`;
    }
    const ombreTete = proj(add(teteC, { x: -4, y: 28 }));
    const corps = silhouette([{ d: dCorps, fond: 'url(#t-pelage)' }, { d: touffes, fond: '#FFF3E2' }])
      + `<g clip-path="url(#t-c-corps)"><g opacity="${f(cphi * cphi)}"><path d="${courbe(ventre, true)}" fill="url(#t-creme)"/>`
      + `<path d="${rayures}" fill="${RAYURE}" opacity=".55"/><path d="${reflet}" fill="none" stroke="#FFD59A" stroke-width="4.5" stroke-linecap="round" opacity=".5"/></g>`
      + `<path d="${ovale(plastron, 20)}" fill="url(#t-creme)"/>`
      + `<ellipse cx="${f(ombreTete.x)}" cy="${f(ombreTete.y)}" rx="36" ry="18" fill="#7A2E0A" opacity=".22" filter="url(#t-flou-doux)"/></g>`;

    svg += `<g class="t-chat" transform="translate(${f(this.x)},${f(this.sol - leve)}) scale(${sv.toFixed(4)})">`;
    svg += derriere.map((v) => v.dessin).join('') + queue + corps;
    svg += devant.map((v) => `<g mask="url(#t-m-cache-${v.k})"><g mask="url(#t-m-pattes)">${v.dessin}</g></g>`).join('');
    if (this.squelette) {
      const os2 = pattes.map(({ j, z }) => `M${pt(proj(j.A, z))}L${pt(proj(j.J, z))}L${pt(proj(j.P, z))}`).join('');
      svg += `<g fill="none" stroke="#1d6fd6" stroke-width="2" opacity=".9"><path d="${courbe(col.map((q) => proj(q)), false)}"/><path d="${os2}"/><path d="M${qp.map(pt).join('L')}"/></g>`;
      svg += `<g fill="#1d6fd6">${[proj(H), proj(S), ...pattes.flatMap(({ j, z }) => [proj(j.J, z), proj(j.P, z)]), ...qp].map((q) => `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="2.6"/>`).join('')}</g>`;
    }
    svg += '</g>';

    const visage = tete({ tour: this.tour.x, yeux: clamp(p.yeux, 0, 1) * paupiere, regard: { x: this.regardX.x, y: this.regardY.x }, pupille: this.pupille.pas(this.feuille && this.etat !== 'dort' ? 1.7 : 1, dt), joie: this.joie > 0, miaou: this.miaou, oreilles });
    for (const o of visage.yeux) mesures(o.cote > 0 ? this.fixes.oeilD : this.fixes.oeilG, { d: o.d });
    svg += `<g class="t-chat" transform="translate(${pt(teteMonde)}) scale(${(sv * TETE).toFixed(4)}) rotate(${f(p.incl * cphi)})">${silhouette(visage.formes, EP / TETE)}${visage.details}${visage.moustaches}</g>`;
    if (this.squelette) svg += `<circle cx="${f(teteMonde.x)}" cy="${f(teteMonde.y)}" r="3" fill="#1d6fd6"/>`;

    // zzz quand il dort, cœurs quand on le caresse, feuille qui tombe
    if (this.etat === 'dort' && p.yeux < 0.05) {
      for (let k = 0; k < 3; k++) {
        const u = (this.t * 0.33 + k / 3) % 1;
        const zx = teteMonde.x + cap * (30 + u * 26) * s, zy = teteMonde.y - (40 + u * 48) * s;
        svg += `<path transform="translate(${f(zx)},${f(zy)}) scale(${((0.8 + u * 0.7) * s).toFixed(3)})" d="M-5,-5h10l-10,10h10" fill="none" stroke="#2B6E3A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity="${f(Math.sin(Math.PI * u) * 0.9)}"/>`;
      }
    }
    for (const c of this.coeurs) {
      const u = 1 - Math.min(1, c.vie);
      const cx = teteMonde.x + c.dx * u * s, cy = teteMonde.y - (50 + u * 90) * s;
      svg += `<path transform="translate(${f(cx)},${f(cy)}) scale(${(s * (1.6 + u)).toFixed(3)})" d="M0,4C-8,-3 -4,-10 0,-5C4,-10 8,-3 0,4Z" fill="#F27C8C" opacity="${f(Math.min(1, c.vie) * Math.min(1, u * 6))}"/>`;
    }
    if (fe && this.feuille) {
      const a = fe.posee ? 78 : Math.sin(fe.t * 1.9 + 0.8) * 35;
      const op = fe.posee ? clamp(9 - (fe.t - fe.posee), 0, 1) : 1;
      svg += `<g transform="translate(${pt(fe)}) rotate(${f(a)}) scale(${(0.3 * s).toFixed(3)}) translate(-50,-45)" opacity="${f(op)}"><path d="${FEUILLE}" fill="#3E9A47" stroke="#2B6E3A" stroke-width="4"/><path d="M50,74 L50,26 M50,56 L36,42 M50,56 L64,42" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".6"/></g>`;
    }
    return svg;
  }
}
