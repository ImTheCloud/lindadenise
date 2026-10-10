// Tilleul, le chat du site : animé en direct, redessiné à chaque image.
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
const contourDe = (formes: Forme[], ep = EP) => `<path d="${formes.map((x) => x.d).join('')}" fill="${CONTOUR}" stroke="${CONTOUR}" stroke-width="${f(ep)}" stroke-linejoin="round"/>`;
const remplissages = (formes: Forme[]) => formes.map((x) => `<path d="${x.d}" fill="${x.fond}"/>${x.apres ?? ''}`).join('');
function silhouette(formes: Forme[], ep = EP, masqueContour = ''): string {
  const contour = contourDe(formes, ep);
  return (masqueContour ? `<g mask="url(#${masqueContour})">${contour}</g>` : contour) + remplissages(formes);
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

// Polygones : un ovale échantillonné, un arc d'ovale (angles en radians, y vers le bas)
const ovalePts = (c: V, rx: number, ry: number, n = 28): V[] => Array.from({ length: n }, (_, i) => add(c, { x: rx * Math.cos((TAU * i) / n), y: ry * Math.sin((TAU * i) / n) }));
const arcPts = (c: V, rx: number, ry: number, t0: number, t1: number, n: number): V[] => Array.from({ length: n + 1 }, (_, i) => { const t = lerp(t0, t1, i / n); return add(c, { x: rx * Math.cos(t), y: ry * Math.sin(t) }); });
const polygone = (p: V[]) => (p.length > 2 ? `M${p.map(pt).join('L')}Z` : '');

// Partie d'un polygone quelconque située dans un polygone convexe (Sutherland-Hodgman). Sert à découper l'iris,
// la pupille et les reflets par la partie visible de l'œil sans clipPath : une découpe que le navigateur doit
// recalculer à chaque image le fait scintiller.
function couper(sujet: V[], convexe: V[]): V[] {
  let aire = 0;
  convexe.forEach((a, i) => { const b = convexe[(i + 1) % convexe.length]; aire += a.x * b.y - b.x * a.y; });
  const signe = aire >= 0 ? 1 : -1;
  let sortie = sujet;
  for (let i = 0; i < convexe.length && sortie.length; i++) {
    const a = convexe[i], b = convexe[(i + 1) % convexe.length];
    const cote = (q: V) => signe * ((b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x));
    const entree = sortie;
    sortie = [];
    entree.forEach((q, j) => {
      const r = entree[(j + 1) % entree.length], cq = cote(q), cr = cote(r);
      if (cq >= 0) sortie.push(q);
      if ((cq >= 0) !== (cr >= 0)) sortie.push(mix(q, r, cq / (cq - cr)));
    });
  }
  return sortie;
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
const CLES = ['hx', 'hy', 'sx', 'sy', 'arc', 'cx', 'cy', 'incl', 'tour', 'avX', 'avY', 'av2X', 'av2Y', 'arX', 'arY', 'ar2X', 'qBase', 'qCourbe', 'qVague', 'yeux', 'resp'] as const;
type Cle = (typeof CLES)[number];
type Pose = Record<Cle, number>;

const DEBOUT: Pose = { hx: -36, hy: -58, sx: 34, sy: -62, arc: 5, cx: 14, cy: -33, incl: 0, tour: 0.7, avX: 38, avY: -7, av2X: 45, av2Y: -7, arX: -30, arY: -7, ar2X: -23, qBase: -2.1, qCourbe: 0.12, qVague: 0.08, yeux: 1, resp: 0.012 };
const ASSIS: Pose = { hx: -20, hy: -27, sx: 15, sy: -66, arc: -3, cx: 9, cy: -31, incl: 0, tour: 0.6, avX: 22, avY: -7, av2X: 29, av2Y: -7, arX: 10, arY: -7, ar2X: 16, qBase: 2.35, qCourbe: 0.17, qVague: 0.1, yeux: 1, resp: 0.012 };
const COUCHE: Pose = { hx: -36, hy: -27, sx: 30, sy: -29, arc: 8, cx: 20, cy: -26, incl: -4, tour: 0.6, avX: 66, avY: -6, av2X: 73, av2Y: -6, arX: -4, arY: -6, ar2X: 3, qBase: 2.75, qCourbe: 0.12, qVague: 0.06, yeux: 1, resp: 0.016 };
const DORT: Pose = { ...COUCHE, cx: 30, cy: -12, incl: 12, tour: 0.35, qCourbe: 0.06, qVague: 0.015, yeux: 0, resp: 0.035 };
const ETIRE: Pose = { ...DEBOUT, hx: -34, hy: -60, sx: 36, sy: -33, arc: -10, cx: 22, cy: -18, incl: -8, tour: 0.6, avX: 80, avY: -6, av2X: 87, av2Y: -6, arX: -28, ar2X: -21, qBase: -1.9, qCourbe: 0.06, yeux: 0 };
// à l'affût : arrière-train haut, poitrail au ras du sol ; en plein bond : tout le corps étiré
const GUETTE: Pose = { ...DEBOUT, hx: -32, hy: -44, sx: 30, sy: -34, arc: -4, cx: 22, cy: -20, incl: 4, tour: 0.9, avX: 46, av2X: 52, arX: -24, ar2X: -18, qBase: 3.05, qCourbe: 0.07, qVague: 0.22 };
const BOND: Pose = { ...DEBOUT, hx: -44, hy: -54, sx: 44, sy: -58, arc: 2, cx: 12, cy: -33, incl: 8, tour: 0.9, avX: 86, avY: -12, av2X: 92, av2Y: -12, arX: -80, arY: -14, ar2X: -74, qBase: 3.05, qCourbe: 0.03, qVague: 0.02 };
const RAIDEUR: Partial<Record<Cle, number>> = { cx: 60, cy: 60, incl: 50, yeux: 140, qBase: 14, qCourbe: 14, avX: 80, av2X: 80, arX: 80, ar2X: 80, avY: 80, av2Y: 80, arY: 80 };

// toilette : assis, tête baissée vers la patte ; bâillement : couché, tête levée
const TOILETTE: Pose = { ...ASSIS, cy: -22, incl: 9 };
const BAILLE: Pose = { ...COUCHE, cx: 21, cy: -30, incl: -14 };

type Etat = 'marche' | 'debout' | 'assis' | 'couche' | 'dort' | 'etire' | 'guette' | 'bond' | 'toilette' | 'baille';
const POSES: Record<Etat, Pose> = { marche: DEBOUT, debout: DEBOUT, assis: ASSIS, couche: COUCHE, dort: DORT, etire: ETIRE, guette: GUETTE, bond: BOND, toilette: TOILETTE, baille: BAILLE };
const DUREES: Record<Etat, [number, number]> = { marche: [0, 0], debout: [1, 2.5], assis: [6, 10], couche: [6, 9], dort: [12, 20], etire: [2.2, 2.2], guette: [1.4, 2.2], bond: [0, 0], toilette: [7.2, 7.2], baille: [2.6, 2.6] };

// Toilette : la patte avant monte à la bouche, se fait lécher, passe sur l'oreille, puis redescend.
// Positions du pied dans le repère du corps (le chat assis a la tête en 24,-88 ; la tête se baisse pour l'oreille).
const T_BOUCHE = { x: 46, y: -66 };
const T_OREILLE = { x: 34, y: -100 };
const T_REPOS = { x: 22, y: -7 };
function toilette(tt: number) {
  let pied: V, bascule = 0; // bascule : 0 la patte est à la bouche, 1 elle est à l'oreille
  if (tt < 0.7) pied = mix(T_REPOS, T_BOUCHE, lisse(tt / 0.7));
  else if (tt < 3.4) pied = T_BOUCHE;
  else if (tt < 4.3) { bascule = lisse((tt - 3.4) / 0.9); pied = mix(T_BOUCHE, T_OREILLE, bascule); }
  else if (tt < 6.3) { bascule = 1; pied = T_OREILLE; }
  else { bascule = 1 - lisse((tt - 6.3) / 0.9); pied = mix(T_REPOS, T_OREILLE, bascule); }
  const leche = tt > 0.7 && tt < 3.4, essuie = tt > 4.3 && tt < 6.3;
  const lick = Math.sin(TAU * 2.2 * (tt - 0.7)), frotte = Math.sin(TAU * 1.5 * (tt - 4.3));
  if (leche) pied = add(pied, { x: lick * 1.4, y: lick * 2.2 });
  if (essuie) pied = add(pied, { x: frotte * 3, y: frotte * 5 });
  return { pied, langue: leche ? 0.5 + 0.5 * lick : 0, cy: lerp(-22, -11, bascule), incl: lerp(9, 15, bascule) + (essuie ? frotte * 1.5 : 0), oreille: essuie ? 8 + 8 * frotte : 0 };
}

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

interface Visage { tour: number; yeux: number; regard: V; pupille: number; joie: boolean; miaou: number; baille: number; langue: number; oreilles: [number, number] }

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
    const o = clamp(v.yeux, 0, 1), creux0 = 0.12 * ry, creuxFerme = 0.32 * ry, c0 = { x: cx, y: cy };
    let visible: V[], haut: string;
    if (o >= 0.5) {
      const u = (o - 0.5) / 0.5, yh = lerp(cy, cy - ry, u), dh = rx * Math.sqrt(Math.max(0, 1 - ((yh - cy) / ry) ** 2)), creux = lerp(creux0, 0.5, u);
      const th = Math.atan2((yh - cy) / ry, dh / rx);
      visible = dh < 0.5 ? ovalePts(c0, rx, ry, 48) : [...arcPts({ x: cx, y: yh }, dh, creux, Math.PI, 0, 12), ...arcPts(c0, rx, ry, th, Math.PI - th, 36)];
      haut = `M${f(cx - rx)},${f(cy)}A${f(rx)},${f(ry)} 0 0 1 ${f(cx - dh)},${f(yh)}A${f(dh)},${f(creux)} 0 0 0 ${f(cx + dh)},${f(yh)}A${f(rx)},${f(ry)} 0 0 1 ${f(cx + rx)},${f(cy)}`;
    } else {
      const u = o / 0.5, creuxH = lerp(creuxFerme, creux0, u), creuxB = lerp(creuxFerme, ry, u);
      visible = [...arcPts(c0, rx, creuxH, Math.PI, 0, 20), ...arcPts(c0, rx, creuxB, 0, Math.PI, 20)];
      haut = `M${f(cx - rx)},${f(cy)}A${f(rx)},${f(creuxH)} 0 0 0 ${f(cx + rx)},${f(cy)}`;
    }
    if (o > 0.02) {
      const d = polygone(visible), dans = (forme: V[]) => polygone(couper(visible, forme));
      const ix = cx + v.regard.x * rx * 0.3, iy = cy + 1.2 + v.regard.y * ry * 0.22;
      // presque fermé, le blanc s'efface dans le trait sombre au lieu de rester en filet ;
      // un œil vu de biais est rempli par l'iris (pas de filet blanc d'un pixel qui scintillerait)
      s += `<path d="${d}" fill="${TRAIT_OEIL}" stroke="${TRAIT_OEIL}" stroke-width="2.4" stroke-linejoin="round"/><g opacity="${f(clamp((o - 0.02) / 0.18, 0, 1))}"><path d="${d}" fill="#fff"/>`;
      s += `<path d="${dans(ovalePts({ x: ix, y: iy }, rx * Math.min(1.05, 0.84 + 0.35 * (1 - fs)), ry * 0.84))}" fill="url(#t-oeil)"/>`;
      s += `<path d="${dans(ovalePts({ x: ix, y: iy + 0.5 }, 4.3 * fs * v.pupille, 9 + 1.5 * (v.pupille - 1)))}" fill="#1B2A14"/>`;
      s += `<path d="${dans(ovalePts({ x: ix + 4 * fs, y: iy - 4.6 }, 3.8 * fs, 3.8, 16))}" fill="#fff"/><path d="${dans(ovalePts({ x: ix - 3.2 * fs, y: iy + 5 }, 1.7 * fs, 1.7, 12))}" fill="#fff" opacity=".9"/></g>`;
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
  if (v.baille > 0.02) {
    // bâillement : bouche grande ouverte, langue au fond
    const k = v.baille, ry = 11 * k, o = rot({ x: 0, y: 17.5 + ry, z: RZ + 1.5 });
    s += `<ellipse cx="${f(o.x)}" cy="${f(o.y)}" rx="${f(8 * cn * (0.7 + 0.3 * k))}" ry="${f(ry)}" fill="#8A2E1B" stroke="#6B2E12" stroke-width="2.2"/>`;
    s += `<ellipse cx="${f(o.x)}" cy="${f(o.y + ry * 0.45)}" rx="${f(5 * cn * k)}" ry="${f(ry * 0.45)}" fill="#FF8A80"/>`;
  }
  if (v.langue > 0.02) {
    // petite langue qui sort pour lécher la patte
    const o = rot({ x: 4, y: 19 + 2 * v.langue, z: RZ + 1.5 });
    s += `<ellipse cx="${f(o.x)}" cy="${f(o.y)}" rx="${f(3.4 * cn)}" ry="${f(5 * v.langue)}" fill="#FF8A80" stroke="#C9524A" stroke-width="1.4"/>`;
  }
  s += `<path d="M${pt(m0)}L${pt(m1)}M${pt(mg)}Q${pt(cg)} ${pt(m1)}Q${pt(cd)} ${pt(md)}" fill="none" stroke="#6B2E12" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;

  // moustaches, hors du contour
  let mo = '';
  for (const cote of [-1, 1]) for (let j = 0; j < 3; j++) {
    const a = rot({ x: cote * 13, y: 15.5 + j * 3.2, z: RZ - 1 }), b = rot({ x: cote * 64, y: 15 + j * 10, z: RZ - 24 });
    mo += `M${pt(a)}Q${pt(add(mix(a, b, 0.5), { x: 0, y: -3 }))} ${pt(b)}`;
  }
  return { formes, details: s, moustaches: `<path d="${mo}" fill="none" stroke="${CONTOUR}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>` };
}

// ---------- dessin fixe ----------
// Les découpes (rayures) et les masques des pattes restent les mêmes éléments : on ne change que leurs mesures
// à chaque image. Les recréer à chaque image fait clignoter certains navigateurs.

const DEFS = `<defs>
<linearGradient id="t-pelage" gradientUnits="userSpaceOnUse" x1="0" y1="-95" x2="0" y2="0"><stop offset="0" stop-color="#FBB062"/><stop offset="1" stop-color="#E06C24"/></linearGradient>
<linearGradient id="t-tete" gradientUnits="userSpaceOnUse" x1="0" y1="-60" x2="0" y2="46"><stop offset="0" stop-color="#FAAA58"/><stop offset="1" stop-color="#E5742A"/></linearGradient>
<linearGradient id="t-creme" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8EC"/><stop offset="1" stop-color="#FFE0B8"/></linearGradient>
<radialGradient id="t-oeil" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#9BE37C"/><stop offset="1" stop-color="#2F9A47"/></radialGradient>
<radialGradient id="t-ombre" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="36" gradientTransform="scale(1 .5)"><stop offset="0" stop-color="#7A2E0A" stop-opacity=".3"/><stop offset="1" stop-color="#7A2E0A" stop-opacity="0"/></radialGradient>
<radialGradient id="t-fondu"><stop offset=".45" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
<clipPath id="t-c-corps"><path/></clipPath>
<mask id="t-m-pattes" maskUnits="userSpaceOnUse" x="-300" y="-300" width="600" height="600"><rect x="-300" y="-300" width="600" height="600" fill="#fff"/><g clip-path="url(#t-c-corps)"><circle fill="url(#t-fondu)"/><circle fill="url(#t-fondu)"/><circle fill="url(#t-fondu)"/><circle fill="url(#t-fondu)"/></g></mask>
<mask id="t-m-hors-corps" maskUnits="userSpaceOnUse" x="-300" y="-300" width="600" height="600"><rect x="-300" y="-300" width="600" height="600" fill="#fff"/><g clip-path="url(#t-c-corps)"><rect x="-300" y="-300" width="600" height="600" fill="#000"/></g></mask>
${[0, 1, 2, 3].map((k) => `<mask id="t-m-cache-${k}" maskUnits="userSpaceOnUse" x="-300" y="-300" width="600" height="600"><rect x="-300" y="-300" width="600" height="600" fill="#fff"/><path fill="#000"/></mask>`).join('')}
<filter id="t-flou"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="t-flou-ombre" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>`;

// ---------- le chat ----------

// Le décor de la page (étang, feuilles) : le chat le lit tel qu'il est à l'écran, positions en pixels de la fenêtre
export interface FeuilleDecor { el: HTMLElement; x: number; y: number }
export interface Decor {
  lotus(): V[];
  feuilles(): FeuilleDecor[];
}

export interface Reperes { x: number; sol: number; s: number; tete: V }
export interface Options {
  decor: Decor;
  libre: boolean; // page de jeu : il se promène partout (sinon seulement devant l'étang de l'accueil)
  reduit: boolean; // mouvement réduit : il reste assis, sans marcher
  dort: boolean; // il démarre endormi (silence demandé)
  toucher(): void; // le visiteur l'a touché
  suit(r: Reperes): void; // appelé à chaque image : où il est à l'écran
}

const HAUT = 280; // hauteur de la bande où il vit
const CALME = 2500; // ms sans geste du visiteur avant qu'il se promène
const APPROCHE = 130; // distance (unités du dessin) à laquelle il se tapit d'une feuille
const PORTEE = 125; // hauteur (en unités du dessin) à laquelle une feuille est à sa portée : il bondit quand elle y passe

export class Chat {
  // ce que la page peut régler
  parle = false; // sa bouche bouge pendant qu'il parle
  retenu = false; // une bulle est ouverte : il ne part pas se promener
  private auto: boolean;
  private fige: boolean;
  private dodo: boolean; // silence demandé : il dort tant qu'on ne le touche pas
  private calque: SVGGElement;
  private fixes: { corps: Element; ronds: Element[]; caches: Element[] };
  private W = 0;
  private H = HAUT;
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
  private etat: Etat = 'assis';
  private cibleX = 0;
  private phase = 0;
  private attente = 0;
  private t = 0;
  private avant = 0;
  private dernierDessin = 0;
  private raf = 0;
  private geste = -Infinity; // dernier geste du visiteur (défilement, clavier, doigt)
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
  private feuille: { el: HTMLElement; x: number; y: number; op: number } | null = null; // vraie feuille du décor qu'il chasse
  private chasseT = 0;
  private lotus: V | null = null; // lotus qu'il regarde, assis au bord de l'étang
  private pupille = new Ressort(1, 60);
  private bondDe = 0;
  private bondA = 0;
  private bondT = 0;
  private tete: V = { x: 0, y: 0 };

  constructor(private scene: SVGSVGElement, private o: Options) {
    scene.innerHTML = `${DEFS}<g class="t-dessin"></g>`;
    this.calque = scene.querySelector<SVGGElement>('.t-dessin')!;
    const q = (sel: string) => scene.querySelector(sel)!;
    this.fixes = { corps: q('#t-c-corps path'), ronds: [...scene.querySelectorAll('#t-m-pattes circle')], caches: [0, 1, 2, 3].map((k) => q(`#t-m-cache-${k} path`)) };
    this.fige = o.reduit;
    this.auto = !o.reduit;
    this.dodo = o.dort;
    this.mesurer();
    this.x = this.W - 120 * this.s;
    this.cibleX = this.x;
    addEventListener('resize', () => { this.mesurer(); if (this.fige) this.stabiliser(); });
    const suivre = (e: PointerEvent) => { this.pointeur = { x: e.clientX, y: e.clientY - this.haut }; };
    addEventListener('pointermove', suivre, { passive: true });
    addEventListener('pointerdown', suivre, { passive: true });
    // seul le chat réagit au doigt ; défilement, clavier et doigt posé disent au chat que le visiteur est occupé
    scene.addEventListener('pointerdown', (e) => { if ((e.target as Element).closest('.t-chat')) this.caresse(); });
    for (const nom of ['scroll', 'wheel', 'keydown', 'touchstart']) addEventListener(nom, () => { this.geste = performance.now(); }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.lancer(); });
    if (o.dort) { this.etat = 'dort'; this.attente = 15; }
    else this.mettre('assis');
    this.poser(this.etat);
    this.stabiliser();
    this.lancer();
  }

  get dort() {
    return this.etat === 'dort' || this.etat === 'baille' || this.etat === 'couche';
  }

  // Silence demandé : il se couche, bâille, s'endort et reste endormi
  dormir() {
    this.dodo = true;
    this.feuille = null;
    this.lotus = null;
    if (!this.dort) { this.mettre('couche'); this.attente = 1.4; }
    if (this.fige) { this.mettre('dort'); this.stabiliser(); }
  }

  // Touché : sursaut de joie ; endormi, il se réveille et s'étire
  caresse() {
    this.o.toucher();
    if (this.etat === 'guette' || this.etat === 'bond') return;
    const dormait = this.etat === 'dort' || this.etat === 'baille';
    this.dodo = false;
    this.lotus = null;
    if (dormait || this.etat === 'couche') {
      this.mettre(dormait ? 'etire' : 'assis');
      this.joie = 1.2;
      if (this.fige) { this.mettre('assis'); this.stabiliser(); }
      return;
    }
    if (this.fige) return;
    this.joie = 1.6;
    this.miaou = 0.5;
    this.coupDoeil = 2;
    if (this.sautY === 0) this.sautV = 300;
    this.faireDesCoeurs();
  }

  // Petit saut de joie pour dire bonjour
  salue() {
    if (this.fige || this.dort || this.sautY > 0) return;
    this.joie = 1.2;
    this.sautV = 300;
  }

  private get haut() {
    return innerHeight - this.H;
  }

  private lancer() {
    if (this.fige || this.raf) return;
    this.avant = 0;
    this.raf = requestAnimationFrame((t) => this.boucle(t));
  }

  // Repose le chat dans une pose, sans transition (au démarrage)
  private poser(e: Etat) {
    for (const c of CLES) { this.r[c].x = POSES[e][c]; this.r[c].v = 0; }
  }

  // On laisse les ressorts (queue, tête) se stabiliser, puis on dessine une seule image : au démarrage, ou en mouvement réduit
  private stabiliser() {
    let svg = '';
    for (let i = 0; i < 90; i++) svg = this.image(1 / 30);
    this.calque.innerHTML = svg;
    this.o.suit({ x: this.x, sol: this.haut + this.sol, s: this.s, tete: { x: this.tete.x, y: this.haut + this.tete.y } });
  }

  private chasser(f: FeuilleDecor) {
    this.lotus = null;
    this.feuille = { el: f.el, x: f.x, y: f.y - this.haut, op: 1 };
    this.chasseT = 0;
    const d = Math.sign(f.x - this.x) || 1;
    this.cibleX = this.dansEcran(f.x - d * APPROCHE * this.s);
    if (Math.abs(this.cibleX - this.x) < 12) this.mettre('guette');
    else this.etat = 'marche';
  }

  private abandonner() {
    this.feuille = null;
    if (this.etat === 'marche') this.cibleX = this.x;
    else if (this.etat === 'guette') this.mettre('assis');
  }

  private bondir() {
    this.bondDe = this.x;
    this.bondA = this.dansEcran(this.feuille!.x - this.sens * 58 * this.s);
    this.bondT = 0;
    this.mettre('bond');
  }

  // Attrapée : la feuille disparaît du décor jusqu'à son prochain passage
  private attraper() {
    const el = this.feuille?.el;
    this.feuille = null;
    if (!el) return;
    el.style.visibility = 'hidden';
    el.addEventListener('animationiteration', () => { el.style.visibility = ''; }, { once: true });
  }

  private mesurer() {
    this.W = innerWidth;
    this.s = clamp(this.W / 1150, 0.72, 1.05);
    this.H = HAUT;
    this.sol = this.H - 4;
    this.scene.style.height = `${this.H}px`;
    this.scene.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
    this.x = this.fige ? this.W - 120 * this.s : this.dansEcran(this.x);
    this.cibleX = this.dansEcran(this.cibleX);
  }

  private mettre(e: Etat) {
    this.etat = e;
    if (e !== 'assis' && e !== 'marche') this.lotus = null;
    const [a, b] = DUREES[e];
    this.attente = lerp(a, b, Math.random());
  }

  private calme() {
    return performance.now() - this.geste > CALME;
  }

  // Hors de la page de jeu, il ne marche que sur l'herbe devant l'étang (accueil, étang visible en bas de l'écran) ; ailleurs il reste sur place
  private promener() {
    if (this.o.libre || this.o.decor.lotus().length) this.marcher();
    else this.mettre('assis');
  }

  // Ordres de la page de jeu
  ordre(o: 'marche' | 'assis' | 'couche' | 'dort' | 'etire' | 'toilette' | 'chasse') {
    this.dodo = false;
    this.feuille = null;
    this.lotus = null;
    if (o === 'marche') this.marcher();
    else if (o === 'chasse') this.chasserUneFeuille();
    else if (o === 'dort') this.dormir();
    else { this.mettre(o); this.attente = 25; }
    if (this.fige) { if (o === 'dort') this.mettre('dort'); else if (this.etat === 'marche') this.mettre('assis'); this.stabiliser(); }
  }

  private marcher() {
    this.lotus = null;
    let x = this.x;
    if (this.W < 700) {
      // sur téléphone : de courtes promenades
      const d = (Math.random() < 0.5 ? -1 : 1) * lerp(0.12, 0.3, Math.random()) * this.W;
      x = this.dansEcran(this.x + d);
      if (Math.abs(x - this.x) < 50 * this.s) x = this.dansEcran(this.x - d);
    } else {
      const marge = 100 * this.s;
      for (let i = 0; i < 12 && Math.abs(x - this.x) < this.W * 0.25; i++) x = lerp(marge, this.W - marge, Math.random());
    }
    this.cibleX = this.dansEcran(x);
    this.etat = 'marche';
  }

  // toute destination reste à l'écran, même sur un petit téléphone
  private dansEcran(x: number) {
    return clamp(x, 70 * this.s, this.W - 70 * this.s);
  }

  // Une feuille du décor est assez haute pour qu'il ait le temps de la guetter : il va se placer et se tapir
  private chasserUneFeuille() {
    if (!this.o.libre && !this.o.decor.lotus().length) return false;
    const portee = this.haut + this.sol - PORTEE * this.s;
    const chute = 0.055 * innerHeight; // vitesse de chute des feuilles, en pixels par seconde
    const f = this.o.decor.feuilles()
      .filter((l) => {
        // elle doit être encore assez haute quand il sera en place : trajet, demi-tour et affût
        const delai = Math.max(0, Math.abs(l.x - this.x) - APPROCHE * this.s) / (VMAX * this.s) + 3;
        return l.y > 0 && l.y + chute * delai < portee && l.x > 70 * this.s && l.x < this.W - 70 * this.s;
      })
      .sort((a, b) => b.y - a.y)[0];
    if (!f) return false;
    this.chasser(f);
    return true;
  }

  // Assis au bord de l'étang, il regarde un lotus
  private allerAuLotus() {
    const l = this.o.decor.lotus().filter((p) => p.x > 100 * this.s && p.x < this.W - 100 * this.s);
    if (!l.length) return false;
    const p = l[Math.floor(Math.random() * l.length)];
    const cote = this.x < p.x ? -1 : 1;
    this.cibleX = this.dansEcran(p.x + cote * 75 * this.s);
    this.lotus = { x: p.x, y: p.y - this.haut };
    this.etat = 'marche';
    return true;
  }

  // Pilote automatique : une petite vie de chat. Quand le visiteur est occupé, il reste tranquille.
  private suivant() {
    if (this.dodo) {
      this.mettre(this.etat === 'couche' ? 'baille' : this.etat === 'baille' || this.etat === 'dort' ? 'dort' : 'couche');
      return;
    }
    if (this.retenu || !this.calme()) {
      if (this.etat === 'dort') this.mettre('etire');
      else if (this.etat !== 'couche') this.mettre('assis');
      else this.mettre('baille');
      return;
    }
    const r = Math.random();
    const decor = () => (r < 0.5 ? this.chasserUneFeuille() || this.allerAuLotus() : this.allerAuLotus() || this.chasserUneFeuille());
    switch (this.etat) {
      case 'debout': if (r < 0.3) this.mettre('assis'); else if (r < 0.4) this.mettre('couche'); else if (r < 0.6 && decor()) break; else this.promener(); break;
      case 'assis': if (r < 0.3) this.promener(); else if (r < 0.5) this.mettre('toilette'); else if (r < 0.65) this.mettre('couche'); else if (!decor()) this.promener(); break;
      case 'toilette': this.mettre('assis'); break;
      case 'couche': if (r < 0.6) this.mettre('baille'); else this.mettre('debout'); break;
      case 'baille': this.mettre('dort'); break;
      case 'dort': this.mettre('etire'); break;
      case 'etire': this.promener(); break;
    }
  }

  private faireDesCoeurs() {
    for (let i = 0; i < 4; i++) this.coeurs.push({ dx: (Math.random() - 0.5) * 70, vie: 1 + i * 0.12 });
  }

  private boucle(t: number) {
    this.raf = 0;
    if (document.hidden) return; // onglet caché : plus rien ne tourne (visibilitychange relance)
    // endormi, il est redessiné quinze fois par seconde seulement
    const dormant = this.etat === 'dort' && this.r.yeux.x < 0.05;
    if (!(dormant && t - this.dernierDessin < 66)) {
      const dt = Math.min(dormant ? 0.07 : 1 / 30, (t - (this.avant || t)) / 1000);
      this.avant = t;
      this.dernierDessin = t;
      this.calque.innerHTML = this.image(dt);
      this.o.suit({ x: this.x, sol: this.haut + this.sol, s: this.s, tete: { x: this.tete.x, y: this.haut + this.tete.y } });
    }
    this.raf = requestAnimationFrame((u) => this.boucle(u));
  }

  private image(dt: number): string {
    const s = this.s;
    this.t += dt;
    const cap = Math.cos(this.phi) >= 0 ? 1 : -1; // côté vers lequel le corps est tourné

    // déplacement : il freine pour s'arrêter pile ; pendant un demi-tour en marchant, sa vitesse suit son orientation
    if (this.etat === 'marche') {
      // le visiteur défile ou tape : il s'arrête là où il est (une bulle ouverte le retient aussi)
      if ((this.retenu || !this.calme()) && this.cibleX !== this.x && this.etat === 'marche') { this.feuille = null; this.lotus = null; this.cibleX = this.x; }
      const d = this.cibleX - this.x;
      if (Math.abs(d) > 4 && Math.sign(d) !== this.sens) this.sens = Math.sign(d);
      if (this.retour >= 0 && this.enArc) this.vx = this.vArc * Math.cos(this.phi);
      else {
        const tourne = this.retour >= 0 || cap !== this.sens;
        const voulu = tourne ? 0 : this.sens * Math.min(VMAX, Math.sqrt(2 * ACCEL * Math.max(0, Math.abs(d) / s - 1)));
        this.vx += clamp(voulu - this.vx, -ACCEL * dt, ACCEL * dt);
        if (!tourne && Math.abs(d) < 3 && Math.abs(this.vx) < 6) { this.vx = 0; this.mettre(this.feuille ? 'guette' : this.lotus ? 'assis' : 'debout'); if (this.lotus) this.attente = lerp(9, 15, Math.random()); }
      }
    } else {
      this.vx += clamp(-this.vx, -2 * ACCEL * dt, 2 * ACCEL * dt);
      this.attente -= dt;
      if (this.etat === 'guette') {
        // il fait face à la feuille, tapi, et attend qu'elle soit à sa portée
        const fe = this.feuille;
        if (!fe) this.mettre('debout');
        else {
          this.sens = Math.sign(fe.x - this.x) || this.sens;
          if (this.attente <= 0 && fe.y >= this.sol - PORTEE * s && this.retour < 0 && cap === this.sens) this.bondir();
        }
      } else if (this.etat === 'bond') {
        this.bondT += dt;
        const u = Math.min(1, this.bondT / 0.65);
        this.x = lerp(this.bondDe, this.bondA, lisse(u));
        this.sautY = Math.sin(Math.PI * u) * 70 * s;
        if (u >= 1) {
          this.sautY = 0;
          this.attraper();
          this.joie = 1.6;
          this.faireDesCoeurs();
          this.mettre('assis');
        }
      } else if ((this.auto || this.dodo) && this.attente <= 0) this.suivant();
    }
    this.x += this.vx * s * dt;

    // la vraie feuille du décor : il la suit des yeux ; si elle est perdue, il y renonce
    const fe = this.feuille;
    if (fe) {
      const r = fe.el.getBoundingClientRect();
      fe.x = r.left + r.width / 2;
      fe.y = r.top + r.height / 2 - this.haut;
      fe.op = Number(getComputedStyle(fe.el).opacity);
      this.chasseT += dt;
      if (this.etat !== 'bond' && (fe.op < 0.3 || fe.y > this.sol + 10 || this.chasseT > 30 || this.retenu || !this.calme())) this.abandonner();
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
    let cible: Pose = POSES[this.etat];
    const gesteToilette = this.etat === 'toilette' ? toilette(DUREES.toilette[0] - this.attente) : null;
    // la patte avant du côté visible (la plus proche du visiteur) est celle qui monte
    const kLeve = cphi >= 0 ? 0 : 1;
    if (gesteToilette) {
      const g = gesteToilette;
      cible = { ...cible, cy: g.cy, incl: g.incl, ...(kLeve === 0 ? { avX: g.pied.x, avY: g.pied.y } : { av2X: g.pied.x, av2Y: g.pied.y }) };
    }
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
    const contourCorps = enveloppe(vues3d, vues3d[NC / 2].c), dCorps = courbe(contourCorps, true);

    // pattes : la marche décale les pieds, un pied qui se déplace hors de la marche se lève un peu
    const pied = (x: number, y: number, o: number, rv: Ressort): V => {
      const g = foulee((this.phase + o) % 1);
      return { x: x + g.x * w, y: Math.min(-7, y + g.y * hauteurPas - Math.min(9, Math.abs(rv.v) * 0.12)) };
    };
    const ancreAv = add(S, { x: -2, y: 9 }), ancreAr = add(H, { x: 5, y: 6 });
    const pattes = [
      { j: patte(ancreAv, pied(p.avX, p.avY, 0.25, this.r.avX), 26, 26, 1), z: FLANC, r: [12, 9.5, 9] },
      { j: patte(add(ancreAv, { x: 4, y: -2 }), pied(p.av2X, p.av2Y, 0.75, this.r.av2X), 26, 26, 1), z: -FLANC, r: [11.5, 9, 8.6] },
      { j: patte(ancreAr, pied(p.arX, p.arY, 0, this.r.arX), 22, 27, -1), z: FLANC, r: [12, 9.5, 9] },
      { j: patte(add(ancreAr, { x: 4, y: -2 }), pied(p.ar2X, p.arY, 0.5, this.r.ar2X), 22, 27, -1), z: -FLANC, r: [11.5, 9, 8.6] },
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
    this.tete = teteMonde;
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
    else if (this.feuille && !this.dort) regarder(this.feuille);
    else if (this.lotus && this.etat === 'assis') regarder(this.lotus);
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
    // bâillement : bouche grande ouverte (qui s'ouvre puis se referme), yeux plissés, oreilles un peu en arrière
    const baille = this.etat === 'baille' ? Math.sin(Math.PI * clamp(1 - this.attente / DUREES.baille[0], 0, 1)) ** 0.7 : 0;
    const repos = this.etat === 'dort' ? 12 : 8 * baille + (gesteToilette?.oreille ?? 0);
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

    // ombre au sol
    const milieu = proj(mix(H, S, 0.5)), ombre = 1 - Math.min(0.45, leve / 160);
    const largeurOmbre = Math.hypot(((S.x - H.x) / 2 + 42) * cphi, 36 * sphi) * ombre;
    let svg = `<ellipse cx="${f(this.x + milieu.x * sv)}" cy="${f(this.sol - 1)}" rx="${f(largeurOmbre * sv)}" ry="${f(6.5 * sv)}" fill="#2B6E3A" opacity=".18" filter="url(#t-flou-ombre)"/>`;

    // une patte, projetée ; plus elle est loin derrière le corps, plus elle est sombre
    const profCorps = prof(mix(H, S, 0.5));
    const vues = pattes.map((pa, k) => {
      const { A, J, P } = pa.j, z = pa.z;
      const a = proj(A, z), jj = proj(J, z), pp = proj(P, z), [r1, r2, r3] = pa.r;
      // sur un même côté, la patte avant passe devant la patte arrière
      const profondeur = prof(mix(A, P, 0.5), z) + (k < 2 ? 0.01 : 0), profAncre = prof(A, z);
      const doigts = [proj({ x: P.x + 3, y: P.y + 2 }, z - 3), proj({ x: P.x + 7, y: P.y + 1 }, z + 3)];
      const pied = proj({ x: P.x + 3, y: P.y }, z), rxPied = Math.hypot(10.5 * cphi, 8 * sphi);
      const formes: Forme[] = [
        { d: os(a, r1, jj, r2), fond: 'url(#t-pelage)' },
        { d: os(jj, r2, pp, r3), fond: 'url(#t-pelage)', apres: `<path d="${os(mix(pp, jj, 0.42), r3, pp, r3)}" fill="url(#t-creme)"/>` },
        { d: ovale(pied, rxPied, 7.2), fond: '#FFF3E2', apres: `<path d="${doigts.map((q) => `M${pt(q)}v4.5`).join('')}" stroke="${CONTOUR}" stroke-width="1.8" stroke-linecap="round" opacity=".5"/>` },
      ];
      // une patte reste du côté où elle est attachée : celles du côté caché passent derrière le corps (plus sombres),
      // celles du côté visible devant. Devant, la patte est opaque et seul son contour s'efface vers l'attache :
      // rien ne se voit à travers.
      const visible = z * cphi > 0;
      const sombre = 0.1 * clamp((profCorps - profondeur) / 12, 0, 1);
      // patte arrière : hors du corps, son contour est toujours tracé ; sur le buste, il est tracé comme celui des pattes
      // avant, mais s'estompe d'un coup doux quand il passe de face (au lieu d'être balayé par le corps qui passe devant)
      const surBuste = lisse((Math.abs(cphi) - 0.55) / 0.4);
      const arriere = `<g opacity="${f(surBuste)}"><g mask="url(#t-m-pattes)"><g clip-path="url(#t-c-corps)">${contourDe(formes)}</g></g></g><g mask="url(#t-m-hors-corps)">${contourDe(formes)}</g>${remplissages(formes)}`;
      const dessin = visible ? (k < 2 ? silhouette(formes, EP, 't-m-pattes') : arriere) : silhouette(formes) + (sombre > 0.005 ? `<g fill="${CONTOUR}" opacity="${sombre.toFixed(3)}">${formes.map((x) => `<path d="${x.d}"/>`).join('')}</g>` : '');
      // pattes avant et arrière traitées de la même façon : le contour s'efface vers l'attache
      return { k, profondeur, profAncre, visible, dessin, ancre: proj(add(A, { x: 0, y: -6 }), z), rayon: 24 };
    }).sort((a, b) => a.profondeur - b.profondeur);
    // une patte du côté visible est cachée par la partie du corps plus proche du visiteur ; cette partie grandit doucement
    // à mesure qu'il se tourne (aucune patte ne change de plan d'un coup)
    const derriere = vues.filter((v) => !v.visible), devant = vues.filter((v) => v.visible);
    const tranches = boules.map((b) => ({ c: proj(b.c), r: b.r, prof: prof(b.c) }));
    this.fixes.caches.forEach((cache, i) => {
      const v = devant.find((x) => x.k === i);
      const devantElle = v ? tranches.map((t) => ({ c: t.c, r: t.r, w: clamp((t.prof - v.profAncre) / 4, 0, 1) })).filter((t) => t.w * t.r > 0.5) : [];
      if (!v || !devantElle.length) { mesures(cache, { d: '' }); return; }
      const centre = devantElle.reduce((m, t) => (t.w * t.r > m.w * m.r ? t : m)).c;
      mesures(cache, { d: courbe(enveloppe(devantElle.map((t) => ({ c: t.c, r: (t.r + EP / 2) * t.w })), centre), true) });
    });
    // le contour du haut des pattes de devant s'efface vers l'attache, là où le corps est derrière
    this.fixes.ronds.forEach((rond, i) => {
      const v = devant.find((x) => x.k === i);
      mesures(rond, v ? { cx: f(v.ancre.x), cy: f(v.ancre.y), r: v.rayon } : { r: 0 });
    });

    const rayuresQueue = [0.28, 0.44, 0.6, 0.76, 0.92].map((t) => { const i = Math.round(t * NQ), c = qp[i], no = tq.nor[i]; const r = lerp(8.5, 6.2, i / NQ) - 0.6; return `M${pt(add(c, mul(no, r)))}L${pt(sub(c, mul(no, r)))}`; }).join('');
    const queue = silhouette([{ d: dQueue, fond: 'url(#t-pelage)', apres: `<path d="${rayuresQueue}" stroke="${RAYURE}" stroke-width="5" opacity=".6"/>` }]);

    // corps : ventre et plastron crème, rayures du dos, reflet, touffes du poitrail, ombre de la tête ;
    // le ventre, les rayures et le reflet sont dessinés pour le profil et s'estompent quand il passe de face.
    // Tout tombe dans le corps par le calcul (pas de découpe que le navigateur referait à chaque image)
    const ventre: V[] = [];
    for (let i = 5; i <= NC; i++) ventre.push(proj(sub(col[i], mul(nor[i], rB[i] - 0.8))));
    for (let i = NC; i >= 5; i--) ventre.push(proj(sub(col[i], mul(nor[i], rB[i] - lerp(3, rB[i] * 0.95, lisse((i / NC - 0.25) / 0.75))))));
    const fin = col[NC], noF = nor[NC], tgF = { x: -noF.y, y: noF.x };
    const angF = Math.atan2(tgF.y, tgF.x);
    const plastron = proj(sub(add(fin, mul(tgF, 12)), mul(noF, 8)));
    const rayures = [0.1, 0.22, 0.34, 0.46, 0.58, 0.7].map((t) => {
      const i = Math.round(t * NC), c = col[i], no = nor[i], tg = { x: -no.y, y: no.x };
      const b = add(c, mul(no, rH[i] - 0.8)), tip = add(add(c, mul(no, rH[i] - (15 - t * 5))), mul(tg, -3));
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
      + `<g opacity="${f(cphi * cphi)}"><path d="${courbe(ventre, true)}" fill="url(#t-creme)"/>`
      + `<path d="${rayures}" fill="${RAYURE}" opacity=".55"/><path d="${reflet}" fill="none" stroke="#FFD59A" stroke-width="4.5" stroke-linecap="round" opacity=".5"/></g>`
      + `<path d="${polygone(couper(contourCorps, ovalePts(plastron, 20)))}" fill="url(#t-creme)"/>`
      + `<path transform="translate(${pt(ombreTete)})" d="${polygone(couper(contourCorps, ovalePts(ombreTete, 36, 18)).map((q) => sub(q, ombreTete)))}" fill="url(#t-ombre)"/>`;

    // à la toilette, la patte levée passe devant le visage : elle est dessinée après la tête
    const corpsTransform = `translate(${f(this.x)},${f(this.sol - leve)}) scale(${sv.toFixed(4)})`;
    const levee = gesteToilette ? devant.find((v) => v.k === kLeve) : undefined;
    svg += `<g class="t-chat" transform="${corpsTransform}">`;
    svg += derriere.map((v) => v.dessin).join('') + queue + corps;
    svg += devant.filter((v) => v !== levee).map((v) => `<g mask="url(#t-m-cache-${v.k})">${v.dessin}</g>`).join('');
    svg += '</g>';

    const visage = tete({ tour: this.tour.x, yeux: clamp(p.yeux, 0, 1) * paupiere, regard: { x: this.regardX.x, y: this.regardY.x }, pupille: this.pupille.pas(this.feuille && !this.dort ? 1.7 : 1, dt), joie: this.joie > 0 || baille > 0.2, miaou: this.parle ? 0.05 + 0.2 * Math.abs(Math.sin(this.t * 9)) : this.miaou, baille, langue: gesteToilette?.langue ?? 0, oreilles });
    svg += `<g class="t-chat" transform="translate(${pt(teteMonde)}) scale(${(sv * TETE).toFixed(4)}) rotate(${f(p.incl * cphi)})">${silhouette(visage.formes, EP / TETE)}${visage.details}${visage.moustaches}</g>`;
    if (levee) svg += `<g class="t-chat" transform="${corpsTransform}"><g mask="url(#t-m-cache-${levee.k})">${levee.dessin}</g></g>`;

    // zzz quand il dort, cœurs quand on le caresse
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
    return svg;
  }
}
