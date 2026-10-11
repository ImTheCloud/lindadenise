// Tilleul, le chat du site : animé en direct.
// Le squelette vit dans le plan du profil : colonne souple, pattes à deux os qui se posent au sol sans glisser,
// queue en chaîne de points qui suit sa forme avec un temps de retard. Le corps est un volume (une chaîne de boules) :
// pour faire demi-tour, tout pivote autour d'un axe vertical en passant face au visiteur, rien n'est retourné d'un coup.
// La tête a son propre petit repère 3D et se tourne vers le visiteur.
// Repère du corps : sol à y = 0, le chat regarde vers +x, z vers son flanc proche. La tête a son centre en 0,0.
// Le mouvement avance par pas fixes de 1/120 s ; l'image affichée est prise entre les deux derniers pas, au temps exact
// de l'écran. Le dessin est décrit à chaque image, puis reporté sur des éléments SVG créés une seule fois.

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

// ---------- éléments SVG ----------
// Le dessin est décrit à chaque image (balise, attributs, enfants), puis reporté sur des éléments créés une seule fois :
// seuls les attributs qui ont changé sont réécrits. Un élément garde sa place d'une image à l'autre (rien ne scintille,
// et un geste commencé sur le dessin finit sur le même élément). Une place vide (null) garde le rang des suivantes.
type Valeur = string | number;
interface Noeud { t: string; a: Record<string, Valeur>; c?: Enfant[]; k?: string }
type Enfant = Noeud | null;
const h = (t: string, a: Record<string, Valeur>, c?: Enfant[], k?: string): Noeud => ({ t, a, c, k });
const NS = 'http://www.w3.org/2000/svg';
const ecrits = new WeakMap<Element, Record<string, string>>(); // attributs déjà écrits sur chaque élément
const places = new WeakMap<Element, Map<string, Element>>(); // enfants de chaque groupe, par place (ou par nom)

const mesures = (el: Element, a: Record<string, Valeur>) => {
  const vieux = ecrits.get(el) ?? {};
  for (const k in a) { const v = String(a[k]); if (vieux[k] !== v) { el.setAttribute(k, v); vieux[k] = v; } }
  ecrits.set(el, vieux);
};

function peindre(parent: Element, enfants: Enfant[]) {
  const avant = places.get(parent), apres = new Map<string, Element>(), ordre: Element[] = [];
  enfants.forEach((e, i) => {
    if (!e) return;
    const cle = e.k ?? i + e.t;
    let el = avant?.get(cle);
    if (!el || el.localName !== e.t) el = document.createElementNS(NS, e.t);
    const vieux = ecrits.get(el), neuf: Record<string, string> = {};
    for (const n in e.a) { const v = String(e.a[n]); neuf[n] = v; if (vieux?.[n] !== v) el.setAttribute(n, v); }
    if (vieux) for (const n in vieux) if (!(n in neuf)) el.removeAttribute(n);
    ecrits.set(el, neuf);
    if (e.c || places.has(el)) peindre(el, e.c ?? []);
    apres.set(cle, el);
    ordre.push(el);
  });
  let ref = parent.firstElementChild;
  for (const el of ordre) {
    if (el === ref) ref = ref.nextElementSibling;
    else parent.insertBefore(el, ref);
  }
  while (ref) { const suite = ref.nextElementSibling; ref.remove(); ref = suite; }
  places.set(parent, apres);
}

// Contour : toutes les formes d'un groupe sont d'abord tracées ensemble en brun, d'un seul trait épais, puis remplies
// par-dessus. Les traits intérieurs disparaissent sous les remplissages : il ne reste que le tour de l'ensemble, aux angles
// arrondis. Un seul tracé pour tout le contour : des traits superposés additionneraient leurs bords et feraient scintiller.
const EP = 5.2;
interface Forme { d: string; fond: string; apres?: Enfant[] } // « apres » : toujours le même nombre de places pour une même forme
const contourDe = (formes: Forme[], ep = EP) => h('path', { d: formes.map((x) => x.d).join(''), fill: CONTOUR, stroke: CONTOUR, 'stroke-width': f(ep), 'stroke-linejoin': 'round' });
const remplissages = (formes: Forme[]): Enfant[] => formes.flatMap((x) => [h('path', { d: x.d, fill: x.fond }), ...(x.apres ?? [])]);
function silhouette(formes: Forme[], ep = EP, masqueContour = ''): Enfant[] {
  const contour = contourDe(formes, ep);
  return [masqueContour ? h('g', { mask: `url(#${masqueContour})` }, [contour]) : contour, ...remplissages(formes)];
}


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

// bâillement : couché, tête levée
const BAILLE: Pose = { ...COUCHE, cx: 21, cy: -30, incl: -14 };

type Etat = 'marche' | 'debout' | 'assis' | 'couche' | 'dort' | 'etire' | 'guette' | 'bond' | 'baille';
const POSES: Record<Etat, Pose> = { marche: DEBOUT, debout: DEBOUT, assis: ASSIS, couche: COUCHE, dort: DORT, etire: ETIRE, guette: GUETTE, bond: BOND, baille: BAILLE };
const DUREES: Record<Etat, [number, number]> = { marche: [0, 0], debout: [1, 2.5], assis: [6, 10], couche: [6, 9], dort: [12, 20], etire: [2.2, 2.2], guette: [1.4, 2.2], bond: [0, 0], baille: [2.6, 2.6] };

// Marche : le pas est réglé sur la distance parcourue, le pied au sol ne glisse jamais.
// Le trot (mini-jeu) garde la même mécanique, avec une foulée et une cadence plus grandes : k va de 0 (pas) à 1 (trot).
const VMAX = 62; // unités du dessin par seconde
const ACCEL = 140;
const CYCLE = 70; // distance parcourue pendant un cycle de pas
const APPUI = 0.62; // part du cycle où le pied est au sol
const LEVE = 11;
const TROT = { vmax: 190, accel: 420, cycle: 120, appui: 0.5, leve: 17 };
const cycle = (k: number) => lerp(CYCLE, TROT.cycle, k);
function foulee(p: number, k: number): V {
  const appui = lerp(APPUI, TROT.appui, k), balayage = appui * cycle(k), leve = lerp(LEVE, TROT.leve, k);
  if (p < appui) return { x: lerp(balayage / 2, -balayage / 2, p / appui), y: 0 };
  const q = (p - appui) / (1 - appui);
  return { x: lerp(-balayage / 2, balayage / 2, lisse(q)), y: -leve * Math.sin(Math.PI * q) };
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

interface Visage { tour: number; yeux: number; regard: V; pupille: number; joie: boolean; miaou: number; baille: number; oreilles: [number, number] }

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
    let rose: Enfant = null;
    if (deFace > 0) {
      const i1 = mix(b1, cen, 0.36), i2 = mix(b2, cen, 0.36), it = mix(tp, cen, 0.24);
      rose = h('path', { d: `M${pt(i1)}Q${pt(bombe(i1, it))} ${pt(it)}Q${pt(bombe(it, i2))} ${pt(i2)}Z`, fill: '#F9B8A8', opacity: f(clamp(deFace * 4, 0, 1)) });
    }
    return { d: `M${pt(b1)}Q${pt(bombe(b1, tp))} ${pt(tp)}Q${pt(bombe(tp, b2))} ${pt(b2)}Z`, fond: 'url(#t-tete)', apres: [rose] };
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
  const s: Enfant[] = [];

  // reflet du front et rayures
  const fr = surf(-0.3, -0.55);
  s.push(fr.z > 0 ? h('ellipse', { cx: f(fr.x), cy: f(fr.y), rx: f(14 * Math.max(0.2, face(-0.3))), ry: 8, fill: '#FFC27E', opacity: '.45' }) : null);
  let ray = '';
  for (const phi of [-0.22, 0, 0.22]) {
    const a = surf(phi, -0.98), b = surf(phi * 0.75, -0.6);
    if (b.z > 0) ray += `M${pt(a)}L${pt(b)}`;
  }
  s.push(h('path', { d: ray, fill: 'none', stroke: '#B24E12', 'stroke-width': 3.6, 'stroke-linecap': 'round', opacity: '.55' }));

  // museau crème : posé sur la sphère de la tête, il suit la rotation ; les joues roses s'effacent doucement de profil
  const creme: V[] = [];
  for (let k = 0; k <= 12; k++) { const phi = lerp(-0.66, 0.66, k / 12); creme.push(surf(phi, 0.2 + 0.07 * Math.cos((phi / 0.33) * Math.PI))); }
  for (let k = 1; k < 4; k++) creme.push(surf(0.66, lerp(0.27, 1.15, k / 4)));
  for (let k = 0; k <= 8; k++) creme.push(surf(lerp(0.66, -0.66, k / 8), 1.15));
  for (let k = 1; k < 4; k++) creme.push(surf(-0.66, lerp(1.15, 0.27, k / 4)));
  s.push(h('path', { d: courbe(creme, true), fill: 'url(#t-creme)' }));
  for (const cote of [-1, 1]) {
    const m = rot({ x: cote * 9.5, y: 17, z: RZ + 2 }), fs = clamp(face(cote * 0.2), 0.3, 1);
    s.push(h('ellipse', { cx: f(m.x), cy: f(m.y), rx: f(10.5 * fs), ry: 8, fill: '#FFFBF3' }));
    for (const [dx, dy] of [[-3, -1.5], [1, -2.5], [-1, 2]]) s.push(h('circle', { cx: f(m.x + dx * fs), cy: f(m.y + dy), r: 1.1, fill: '#C98B6A' }));
    const j = surf(cote * 0.8, 0.24), fj = face(cote * 0.8);
    s.push(fj > 0 ? h('ellipse', { cx: f(j.x), cy: f(j.y), rx: f(9 * Math.max(0.2, fj)), ry: 5, fill: '#FF8E7A', opacity: f(0.45 * clamp(fj * 5, 0, 1)), filter: 'url(#t-flou)' }) : null);
  }

  // yeux : seule la partie visible entre les paupières est peinte, posée sur un fond brun un peu plus grand,
  // pour qu'aucun bord blanc ne touche la fourrure (sinon un liseré blanc scintille quand la tête bouge).
  // Le trait du dessus suit toujours le haut de la partie visible : l'œil se ferme et s'ouvre d'un seul mouvement,
  // sans saut. Les bords de l'œil suivent la courbe de la tête. Chaque œil a son groupe : ses places ne bougent pas.
  const bordTete = (q: V3) => (q.z > 0 ? clamp(q.x, -W * 0.93, W * 0.93) : Math.sign(q.x) * W * 0.93);
  for (const cote of [-1, 1]) {
    const oeil: Enfant[] = [];
    const xg = bordTete(surf(cote * 0.43 - 0.23, 0.05)), xd = bordTete(surf(cote * 0.43 + 0.23, 0.05));
    const rx = Math.abs(xd - xg) / 2, ry = 13.5, cx = (xg + xd) / 2, cy = surf(cote * 0.43, 0.05).y, fs = rx / 11.5;
    if (rx >= 1 && v.joie) {
      oeil.push(h('path', { d: `M${f(cx - rx)},${f(cy + 3)}Q${f(cx)},${f(cy - ry)} ${f(cx + rx)},${f(cy + 3)}`, fill: 'none', stroke: TRAIT_OEIL, 'stroke-width': 3.4, 'stroke-linecap': 'round' }));
    } else if (rx >= 1) {
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
        oeil.push(h('path', { d, fill: TRAIT_OEIL, stroke: TRAIT_OEIL, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }), h('g', { opacity: f(clamp((o - 0.02) / 0.18, 0, 1)) }, [
          h('path', { d, fill: '#fff' }),
          h('path', { d: dans(ovalePts({ x: ix, y: iy }, rx * Math.min(1.05, 0.84 + 0.35 * (1 - fs)), ry * 0.84)), fill: 'url(#t-oeil)' }),
          h('path', { d: dans(ovalePts({ x: ix, y: iy + 0.5 }, 4.3 * fs * v.pupille, 9 + 1.5 * (v.pupille - 1))), fill: '#1B2A14' }),
          h('path', { d: dans(ovalePts({ x: ix + 4 * fs, y: iy - 4.6 }, 3.8 * fs, 3.8, 16)), fill: '#fff' }),
          h('path', { d: dans(ovalePts({ x: ix - 3.2 * fs, y: iy + 5 }, 1.7 * fs, 1.7, 12)), fill: '#fff', opacity: '.9' }),
        ]));
      } else oeil.push(null, null);
      oeil.push(h('path', { d: `${haut}M${f(cx + cote * rx)},${f(cy)}l${f(cote * 3.5 * fs)},${f(-3.5 * fs)}`, fill: 'none', stroke: TRAIT_OEIL, 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    }
    s.push(h('g', {}, oeil));
  }

  // truffe et bouche
  const cn = clamp(c, 0.45, 1);
  const n = rot({ x: 0, y: 8.5, z: RZ + 4.5 });
  s.push(h('path', { d: `M${f(n.x - 5.5 * cn)},${f(n.y - 2.5)}Q${f(n.x)},${f(n.y - 4.8)} ${f(n.x + 5.5 * cn)},${f(n.y - 2.5)}Q${f(n.x + 4 * cn)},${f(n.y + 3)} ${f(n.x)},${f(n.y + 4.5)}Q${f(n.x - 4 * cn)},${f(n.y + 3)} ${f(n.x - 5.5 * cn)},${f(n.y - 2.5)}Z`, fill: '#F27C8C' }));
  s.push(h('ellipse', { cx: f(n.x - 1.5 * cn), cy: f(n.y - 2), rx: f(1.8 * cn), ry: 1, fill: '#fff', opacity: '.7' }));
  const m0 = rot({ x: 0, y: 13, z: RZ + 3 }), m1 = rot({ x: 0, y: 16.5, z: RZ + 2.5 });
  const mg = rot({ x: -8.5, y: 19, z: RZ }), md = rot({ x: 8.5, y: 19, z: RZ });
  const cg = rot({ x: -3.5, y: 22.5, z: RZ + 2 }), cd = rot({ x: 3.5, y: 22.5, z: RZ + 2 });
  if (v.miaou > 0) {
    const o = rot({ x: 0, y: 21, z: RZ + 1.5 }), k = clamp(v.miaou * 4, 0, 1);
    s.push(h('ellipse', { cx: f(o.x), cy: f(o.y), rx: f(6.5 * cn), ry: f(6 * k), fill: '#8A2E1B', stroke: '#6B2E12', 'stroke-width': 2.2 }));
    s.push(h('ellipse', { cx: f(o.x), cy: f(o.y + 3 * k), rx: f(4 * cn), ry: f(2.4 * k), fill: '#FF8A80' }));
  } else s.push(null, null);
  if (v.baille > 0.02) {
    // bâillement : bouche grande ouverte, langue au fond
    const k = v.baille, ry = 11 * k, o = rot({ x: 0, y: 17.5 + ry, z: RZ + 1.5 });
    s.push(h('ellipse', { cx: f(o.x), cy: f(o.y), rx: f(8 * cn * (0.7 + 0.3 * k)), ry: f(ry), fill: '#8A2E1B', stroke: '#6B2E12', 'stroke-width': 2.2 }));
    s.push(h('ellipse', { cx: f(o.x), cy: f(o.y + ry * 0.45), rx: f(5 * cn * k), ry: f(ry * 0.45), fill: '#FF8A80' }));
  } else s.push(null, null);
  s.push(h('path', { d: `M${pt(m0)}L${pt(m1)}M${pt(mg)}Q${pt(cg)} ${pt(m1)}Q${pt(cd)} ${pt(md)}`, fill: 'none', stroke: '#6B2E12', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

  // moustaches, hors du contour
  let mo = '';
  for (const cote of [-1, 1]) for (let j = 0; j < 3; j++) {
    const a = rot({ x: cote * 13, y: 15.5 + j * 3.2, z: RZ - 1 }), b = rot({ x: cote * 64, y: 15 + j * 10, z: RZ - 24 });
    mo += `M${pt(a)}Q${pt(add(mix(a, b, 0.5), { x: 0, y: -3 }))} ${pt(b)}`;
  }
  return { formes, details: s, moustaches: h('path', { d: mo, fill: 'none', stroke: CONTOUR, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: '.55' }) };
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

// Le décor de la page (étang, feuilles), tenu à jour par decor.ts : positions en pixels de l'écran, gardées en mémoire
// (le chat ne lit jamais la mise en page lui-même)
// une feuille : position à l'écran, vitesse de chute (pixels par seconde), et ce qui arrive quand il l'attrape
export interface FeuilleDecor { el: object; x: number; y: number; vy?: number; attraper?(): void }
export interface Decor {
  haut?(): number; // où est le haut de la bande du chat à l'écran (par défaut : collée au bas de l'écran)
  lotus(): V[];
  feuilles(): FeuilleDecor[];
  curiosite?(): V | null; // ce qui attire son regard quand il ne fait rien (une feuille qui tombe)
}

// Repères donnés à la page à chaque image, dans la bande du chat : la boîte entoure le corps et la tête (zone à toucher)
export interface Reperes { s: number; tete: V; boite: { x: number; y: number; l: number; h: number }; haut: number }
export interface Options {
  decor: Decor;
  libre: boolean; // page de jeu : il se promène partout (sinon seulement devant l'étang de l'accueil)
  reduit: boolean; // mouvement réduit : il reste assis, sans marcher
  dort: boolean; // il démarre endormi (silence demandé)
  toucher(): void; // le visiteur l'a touché
  taire(): void; // un ordre arrive pendant qu'il parle : la bulle se ferme
  suit(r: Reperes): void; // appelé à chaque image : où il est
}
export type Ordre = 'marche' | 'assis' | 'couche' | 'dort' | 'etire' | 'chasse' | 'viens';
export interface Precision { x?: number; cible?: object } // « viens » : où aller (pixels de la bande) ; « chasse » : quelle feuille

export const HAUT = 280; // hauteur de la bande où il vit
const COIN = 175; // sa place dans le coin : distance au bord droit (unités du dessin), pour que pattes et queue restent à l'écran
const APPROCHE = 130; // distance (unités du dessin) à laquelle il se tapit d'une feuille
const PORTEE = 125; // hauteur (en unités du dessin) à laquelle une feuille est à sa portée : il bondit quand elle y passe
const PAS = 1 / 120; // pas de temps fixe du mouvement, en secondes
const ECART_MAX = 0.1; // au-delà (gros ralentissement), le temps perdu n'est pas rattrapé : pas de bond en avant

// Tout ce qu'il faut pour dessiner une image : l'état du chat à la fin d'un pas de mouvement
interface Cliche {
  x: number; leve: number; phi: number; proche: number; pietine: number; w: number; phase: number; t: number; trot: number;
  p: Pose; vPieds: number[]; q: number[];
  tour: number; regardX: number; regardY: number; oreilles: [number, number]; yeux: number; pupille: number;
  joie: boolean; miaou: number; baille: number; zzz: boolean;
  coeurs: { dx: number; vie: number }[];
}

// L'image affichée tombe entre deux pas : chaque mesure est prise au bon endroit entre les deux (u de 0 à 1)
function melanger(a: Cliche, b: Cliche, u: number): Cliche {
  if (u > 0.9999 || Math.abs(b.x - a.x) > 60) return b; // fin de pas, ou chat déplacé d'un coup (fenêtre redimensionnée)
  const l = (x: number, y: number) => x + (y - x) * u;
  const ang = (x: number, y: number) => x + ecart(y - x) * u;
  const p = {} as Pose;
  for (const k of CLES) p[k] = l(a.p[k], b.p[k]);
  let dp = b.phase - a.phase;
  if (dp < -0.5) dp += 1;
  return {
    ...b, x: l(a.x, b.x), leve: l(a.leve, b.leve), phi: l(a.phi, b.phi), proche: l(a.proche, b.proche), pietine: l(a.pietine, b.pietine),
    w: l(a.w, b.w), phase: (a.phase + dp * u + 1) % 1, t: l(a.t, b.t), trot: l(a.trot, b.trot), p,
    vPieds: b.vPieds.map((v, i) => l(a.vPieds[i], v)), q: b.q.map((v, i) => ang(a.q[i], v)),
    tour: l(a.tour, b.tour), regardX: l(a.regardX, b.regardX), regardY: l(a.regardY, b.regardY),
    oreilles: [l(a.oreilles[0], b.oreilles[0]), l(a.oreilles[1], b.oreilles[1])], yeux: l(a.yeux, b.yeux), pupille: l(a.pupille, b.pupille),
    miaou: l(a.miaou, b.miaou), baille: l(a.baille, b.baille),
    coeurs: a.coeurs.length === b.coeurs.length ? b.coeurs.map((c, i) => ({ dx: c.dx, vie: l(a.coeurs[i].vie, c.vie) })) : b.coeurs,
  };
}

// Corps pour une pose : hanche, épaule, colonne, rayons du dessus et du dessous de chaque boule, normales
function squelette(p: Pose, w: number, phase: number, t: number) {
  const H = { x: p.hx, y: p.hy + 1.8 * w * Math.sin(TAU * 2 * phase) };
  const S = { x: p.sx, y: p.sy + 1.8 * w * Math.sin(TAU * 2 * (phase + 0.25)) };
  const souffle = Math.sin((t * TAU) / 3.4) * p.resp;
  const col = colonne(H, S, p.arc + 1.2 * w * Math.sin(TAU * phase), NC);
  const rH = col.map((_, i) => { const u = i / NC; return (u < 0.45 ? lerp(27, 23.5, lisse(u / 0.45)) : lerp(23.5, 29, lisse((u - 0.45) / 0.55))) * (1 + souffle * 0.5); });
  const rB = col.map((_, i) => { const u = i / NC; return ((u < 0.45 ? lerp(26, 26.5, u / 0.45) : lerp(26.5, 29, lisse((u - 0.45) / 0.55))) + 3.5 * Math.sin(Math.PI * u)) * (1 + souffle); });
  const nor = col.map((_, i) => { const a = col[Math.max(0, i - 1)], b = col[Math.min(NC, i + 1)], l = dist(a, b) || 1; return { x: (b.y - a.y) / l, y: -(b.x - a.x) / l }; });
  // attache de la queue, sous la hanche
  const racine = add(add(H, mul(dir(Math.atan2(H.y - S.y, H.x - S.x)), rH[0] * 0.7)), mul(nor[0], 8));
  return { H, S, col, rH, rB, nor, racine };
}

export class Chat {
  // ce que la page peut régler
  parle = false; // sa bouche bouge pendant qu'il parle
  retenu = false; // il parle (bulle ouverte) : il ne marche pas, il reste assis ou garde sa pose jusqu'à la fin de la bulle
  // réglés aussi par la vidéo (scripts/video/scene.html)
  x = 0;
  cibleX = 0;
  etat: Etat = 'assis';
  private auto: boolean;
  private fige: boolean;
  private dodo: boolean; // silence demandé : il dort tant qu'on ne le touche pas
  private ordonne = false; // il suit un ordre du visiteur (page de jeu) : arrivé, il reste un moment avant de repartir
  private vite = false; // il trotte (feuille lointaine)
  private presse = 0; // temps restant pendant lequel il change de pose plus vivement (ordre du visiteur)
  private enAttente: [Ordre, Precision] | null = null; // ordre donné en plein bond, suivi à l'atterrissage
  private actif = true; // faux quand sa bande est hors de l'écran
  private calque: SVGGElement;
  private fixes: { corps: Element; ronds: Element[]; caches: Element[] };
  private W = 0;
  private vh = 0;
  private H = HAUT;
  private sol = 0;
  private s = 1;
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
  private phase = 0;
  private attente = 0;
  private t = 0;
  private horloge = 0; // temps affiché (s)
  private simT = 0; // temps simulé (s), toujours un pas au plus en avance sur l'affichage
  private avant = 0;
  private dernierDessin = 0;
  private raf = 0;
  private saut = false; // la prochaine image ne mélange pas deux pas (redimensionnement)
  private allure = new Ressort(0, 60);
  private trot = new Ressort(0, 30);
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
  private feuille: { el: object; x: number; y: number; attraper?(): void } | null = null; // feuille qu'il chasse
  private chasseT = 0;
  private lotus: V | null = null; // lotus qu'il regarde, assis au bord de l'étang
  private pupille = new Ressort(1, 60);
  private bondDe = 0;
  private bondA = 0;
  private bondT = 0;
  private c0!: Cliche; // avant-dernier pas
  private c1!: Cliche; // dernier pas

  constructor(private scene: SVGSVGElement, private o: Options) {
    scene.innerHTML = `${DEFS}<g class="t-dessin"></g>`;
    this.calque = scene.querySelector<SVGGElement>('.t-dessin')!;
    const q = (sel: string) => scene.querySelector(sel)!;
    this.fixes = { corps: q('#t-c-corps path'), ronds: [...scene.querySelectorAll('#t-m-pattes circle')], caches: [0, 1, 2, 3].map((k) => q(`#t-m-cache-${k} path`)) };
    this.fige = o.reduit;
    this.auto = !o.reduit;
    this.dodo = o.dort;
    this.mesurer();
    this.x = this.W - COIN * this.s;
    this.cibleX = this.x;
    addEventListener('resize', () => { this.mesurer(); this.saut = true; if (this.fige) this.stabiliser(); });
    const suivre = (e: PointerEvent) => { this.pointeur = { x: e.clientX, y: e.clientY - this.haut }; };
    addEventListener('pointermove', suivre, { passive: true });
    addEventListener('pointerdown', suivre, { passive: true });
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

  // Sa bande est sortie de l'écran (accueil défilé) : plus rien ne tourne jusqu'à son retour
  veille(cache: boolean) {
    this.actif = !cache;
    this.lancer();
  }

  // Silence demandé : il se couche, bâille, s'endort et reste endormi
  dormir() {
    this.dodo = true;
    this.feuille = null;
    this.lotus = null;
    if (!this.dort) { this.mettre('couche'); this.attente = 1.4; }
    else if (this.etat === 'couche') this.attente = Math.min(this.attente, 0.8); // déjà couché : il bâille tout de suite
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
    this.faireDesCoeurs();
    // sur le site, chaque caresse lui fait prendre une autre pose (jamais la marche) ; sur la page de jeu, un saut de joie
    if (!this.o.libre) {
      const suite: Etat[] = ['assis', 'couche', 'etire', 'debout'];
      this.mettre(suite[(suite.indexOf(this.etat) + 1) % suite.length]);
    } else if (this.sautY === 0) this.sautV = 300;
  }

  // Petit saut de joie pour dire bonjour
  salue() {
    if (this.fige || this.dort || this.sautY > 0) return;
    this.joie = 1.2;
    this.sautV = 300;
  }

  // Ce qu'il fait, pour la page de jeu (le bouton de l'action en cours est allumé), et ce qu'il chasse
  get action() {
    if (this.feuille || this.etat === 'guette' || this.etat === 'bond') return 'chasse';
    // il va dormir (il se couche, bâille puis s'endort) : c'est déjà « dormir »
    return this.dodo ? 'dort' : this.etat;
  }

  get cible() {
    return this.feuille?.el ?? null;
  }

  // Ordres du visiteur : ils passent avant le pilote automatique et avant la bulle ouverte. En plein bond, l'ordre attend
  // l'atterrissage. Un ordre impossible (rien à chasser) est dit par un petit miaou, la tête vers le visiteur.
  ordre(o: Ordre, q: Precision = {}) {
    if (this.retenu) this.o.taire(); // soit il parle, soit il obéit
    if (this.etat === 'bond') { this.enAttente = [o, q]; return true; }
    const ok = this.executer(o, q);
    if (!ok && !this.fige) { this.miaou = 0.6; this.coupDoeil = 1.6; }
    return ok;
  }

  private executer(o: Ordre, q: Precision) {
    this.dodo = false;
    this.feuille = null;
    this.lotus = null;
    this.ordonne = true;
    this.vite = false;
    let ok = true;
    if (o === 'marche') this.marcher();
    else if (o === 'viens') { this.cibleX = this.dansEcran(q.x ?? this.x); this.etat = 'marche'; }
    else if (o === 'chasse') ok = this.chasserUneFeuille(q.cible);
    else if (o === 'dort') { this.dormir(); this.presse = 1.5; if (this.etat === 'couche') this.attente = Math.min(this.attente, 0.6); }
    else { this.mettre(o); this.attente = 25; this.presse = 1.5; }
    if (!ok) this.ordonne = this.vite = false;
    if (this.fige) { if (o === 'dort') this.mettre('dort'); else if (this.etat === 'marche') this.mettre('assis'); this.stabiliser(); }
    return ok;
  }

  private get haut() {
    return this.o.decor.haut?.() ?? this.vh - this.H;
  }

  private lancer() {
    if (this.fige || this.raf || !this.actif) return;
    this.avant = 0;
    this.raf = requestAnimationFrame((t) => this.boucle(t));
  }

  // Repose le chat dans une pose, sans transition (au démarrage)
  private poser(e: Etat) {
    for (const c of CLES) { this.r[c].x = POSES[e][c]; this.r[c].v = 0; }
  }

  // On laisse les ressorts (queue, tête) se stabiliser, puis on dessine une seule image : au démarrage, ou en mouvement réduit
  private stabiliser() {
    for (let i = 0; i < 90; i++) this.pas(1 / 30);
    this.c0 = this.c1;
    this.dessiner(this.c1);
  }

  private chasser(f: FeuilleDecor) {
    this.lotus = null;
    this.feuille = { el: f.el, x: f.x, y: f.y - this.haut, attraper: f.attraper };
    this.chasseT = 0;
    const d = Math.sign(f.x - this.x) || 1;
    this.cibleX = this.dansEcran(f.x - d * APPROCHE * this.s);
    if (Math.abs(this.cibleX - this.x) < 12) this.mettre('guette');
    else this.etat = 'marche';
  }

  private abandonner() {
    this.feuille = null;
    this.ordonne = this.vite = false;
    if (this.etat === 'marche') this.cibleX = this.x;
    else if (this.etat === 'guette') this.mettre('assis');
  }

  private bondir() {
    this.bondDe = this.x;
    this.bondA = this.dansEcran(this.feuille!.x - this.sens * 58 * this.s);
    this.bondT = 0;
    this.mettre('bond');
  }

  // Attrapée : la feuille quitte le décor (decor.ts dit comment)
  private attraper() {
    const fe = this.feuille;
    this.feuille = null;
    fe?.attraper?.();
  }

  private mesurer() {
    this.W = document.documentElement.clientWidth || innerWidth;
    this.vh = innerHeight;
    this.s = clamp(this.W / 1150, 0.72, 1.05);
    this.H = HAUT;
    this.sol = this.H - 4;
    this.scene.style.height = `${this.H}px`;
    this.scene.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
    this.x = this.fige ? this.W - COIN * this.s : this.dansEcran(this.x);
    this.cibleX = this.dansEcran(this.cibleX);
  }

  private mettre(e: Etat) {
    this.etat = e;
    if (e !== 'assis' && e !== 'marche') this.lotus = null;
    const [a, b] = DUREES[e];
    this.attente = lerp(a, b, Math.random());
  }

  // Une promenade vers l'autre côté de l'écran (il fait demi-tour en marchant à chaque fois)
  private marcher() {
    this.lotus = null;
    const bord = 70 * this.s + Math.random() * this.W * 0.12;
    this.cibleX = this.dansEcran(this.x < this.W / 2 ? this.W - bord : bord);
    this.etat = 'marche';
  }

  // toute destination reste à l'écran, même sur un petit téléphone
  private dansEcran(x: number) {
    return clamp(x, 70 * this.s, this.W - 70 * this.s);
  }

  // Une feuille du décor (ou celle qu'on lui montre) est assez haute pour qu'il ait le temps de la guetter :
  // il va se placer et se tapir. Sur la page de jeu, il trotte vers une feuille lointaine.
  private chasserUneFeuille(cible?: object) {
    const portee = this.haut + this.sol - PORTEE * this.s;
    const loin = (l: FeuilleDecor) => Math.max(0, Math.abs(l.x - this.x) - APPROCHE * this.s);
    const vitesse = (l: FeuilleDecor) => (this.o.libre && loin(l) > 250 ? TROT.vmax : VMAX) * this.s;
    const f = this.o.decor.feuilles()
      .filter((l) => {
        // elle doit être encore assez haute quand il sera en place : trajet, demi-tour et début d'affût
        const delai = loin(l) / vitesse(l) + 2;
        // une feuille montrée par le visiteur : il y va toujours
        return cible ? l.el === cible : l.y > 0 && l.y + (l.vy ?? 0) * delai < portee && l.x > 70 * this.s && l.x < this.W - 70 * this.s;
      })
      .sort((a, b) => b.y - a.y)[0];
    if (!f) return false;
    this.vite = this.o.libre && loin(f) > 250;
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

  // Pilote automatique. Sur le site, il reste dans son coin et change de pose (jamais de marche) ; quand il parle, il garde
  // sa pose. Sur la page de jeu, une petite vie de chat : promenades, poses, étang, feuilles.
  private suivant() {
    this.ordonne = this.vite = false;
    if (this.dodo) {
      this.mettre(this.etat === 'couche' ? 'baille' : this.etat === 'baille' || this.etat === 'dort' ? 'dort' : 'couche');
      return;
    }
    if (this.retenu) { this.attente = 0.4; return; } // il parle : il garde sa pose
    if (!this.o.libre) {
      const r = Math.random();
      switch (this.etat) {
        case 'assis': this.mettre(r < 0.45 ? 'couche' : r < 0.75 ? 'etire' : 'debout'); break;
        case 'couche': this.mettre(r < 0.6 ? 'baille' : 'assis'); break;
        case 'baille': this.mettre('dort'); break;
        case 'dort': this.mettre('etire'); break;
        case 'debout': this.mettre(r < 0.7 ? 'assis' : 'couche'); break;
        default: this.mettre('assis');
      }
      return;
    }
    const r = Math.random();
    const decor = () => (r < 0.5 ? this.chasserUneFeuille() || this.allerAuLotus() : this.allerAuLotus() || this.chasserUneFeuille());
    switch (this.etat) {
      case 'debout': if (r < 0.3) this.mettre('assis'); else if (r < 0.4) this.mettre('couche'); else if (r < 0.6 && decor()) break; else this.marcher(); break;
      case 'assis': if (r < 0.3) this.marcher(); else if (r < 0.55) this.mettre('couche'); else if (!decor()) this.marcher(); break;
      case 'couche': if (r < 0.6) this.mettre('baille'); else this.mettre('debout'); break;
      case 'baille': this.mettre('dort'); break;
      case 'dort': this.mettre('etire'); break;
      case 'etire': this.marcher(); break;
    }
  }

  // Arrivé là où il allait : il se tapit (feuille), s'assoit (lotus) ou reste debout ; après un ordre, il reste un moment
  private arrivee() {
    this.vx = 0;
    this.vite = false;
    this.mettre(this.feuille ? 'guette' : this.lotus ? 'assis' : 'debout');
    if (this.lotus) this.attente = lerp(9, 15, Math.random());
    if (this.ordonne && !this.feuille) { this.attente = Math.max(this.attente, 6); this.ordonne = false; }
  }

  private faireDesCoeurs() {
    for (let i = 0; i < 4; i++) this.coeurs.push({ dx: (Math.random() - 0.5) * 70, vie: 1 + i * 0.12 });
  }

  // Une image : le mouvement avance par pas fixes jusqu'au temps de l'écran (sans rattraper un long arrêt),
  // puis l'image est dessinée entre les deux derniers pas
  private boucle(t: number) {
    this.raf = 0;
    if (document.hidden || !this.actif) return; // onglet caché ou bande hors de l'écran : plus rien ne tourne
    // endormi, il est redessiné quinze fois par seconde seulement
    const dormant = this.etat === 'dort' && this.r.yeux.x < 0.05;
    if (!(dormant && t - this.dernierDessin < 66)) {
      this.horloge += this.avant ? Math.min(ECART_MAX, (t - this.avant) / 1000) : 0;
      this.avant = t;
      this.dernierDessin = t;
      while (this.simT < this.horloge - 1e-6) { this.pas(PAS); this.simT += PAS; }
      this.dessiner(this.saut ? this.c1 : melanger(this.c0, this.c1, 1 - (this.simT - this.horloge) / PAS));
      this.saut = false;
    }
    this.raf = requestAnimationFrame((u) => this.boucle(u));
  }

  // Un pas de mouvement : déplacement, pose, queue, regard, petites habitudes. Rien n'est dessiné ici.
  private pas(dt: number) {
    const s = this.s;
    this.t += dt;
    const cap = Math.cos(this.phi) >= 0 ? 1 : -1; // côté vers lequel le corps est tourné
    const k = this.trot.pas(this.vite ? 1 : 0, dt);
    const vmax = lerp(VMAX, TROT.vmax, k), accel = lerp(ACCEL, TROT.accel, k);

    // il parle : il s'arrête et s'assoit (il repartira quand la bulle sera fermée)
    if (this.retenu && this.etat === 'marche') { this.feuille = null; this.lotus = null; this.mettre('assis'); }
    // déplacement : il freine pour s'arrêter pile ; pendant un demi-tour en marchant, sa vitesse suit son orientation
    if (this.etat === 'marche') {
      const d = this.cibleX - this.x;
      if (Math.abs(d) > 4 && Math.sign(d) !== this.sens) this.sens = Math.sign(d);
      if (this.retour >= 0 && this.enArc) this.vx = this.vArc * Math.cos(this.phi);
      else {
        const tourne = this.retour >= 0 || cap !== this.sens;
        const voulu = tourne ? 0 : this.sens * Math.min(vmax, Math.sqrt(2 * accel * Math.max(0, Math.abs(d) / s - 1)));
        this.vx += clamp(voulu - this.vx, -accel * dt, accel * dt);
        if (!tourne && Math.abs(d) < 3 && Math.abs(this.vx) < 6) this.arrivee();
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
          // il attend la fin de son affût, sauf si la feuille arrive près du sol : alors il bondit tout de suite
          const basse = fe.y >= this.sol - 60 * s;
          if ((this.attente <= 0 || basse) && fe.y >= this.sol - PORTEE * s && this.retour < 0 && cap === this.sens) this.bondir();
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
          this.ordonne = false;
          if (this.enAttente) { const [o, q] = this.enAttente; this.enAttente = null; this.ordre(o, q); }
        }
      } else if ((this.auto || this.dodo) && this.attente <= 0) this.suivant();
    }
    this.x += this.vx * s * dt;

    // la vraie feuille du décor : il la suit des yeux ; si elle est perdue, il y renonce
    const fe = this.feuille;
    if (fe) {
      const l = this.o.decor.feuilles().find((x) => x.el === fe.el);
      if (l) { fe.x = l.x; fe.y = l.y - this.haut; }
      this.chasseT += dt;
      if (this.etat !== 'bond' && (!l || fe.y > this.sol + 10 || this.chasseT > 30)) this.abandonner();
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
    const cphi = Math.cos(this.phi);
    const proj = (q: V): V => ({ x: q.x * cphi, y: q.y });

    // pose : chaque réglage glisse vers celui de l'état voulu
    const cible = POSES[this.etat];
    const p = {} as Pose;
    // après un ordre du visiteur, la pose change 1,8 fois plus vite (même mouvement, plus vif)
    this.presse = Math.max(0, this.presse - dt);
    const dp = this.presse > 0 ? dt * 1.8 : dt;
    for (const c of CLES) {
      const r = this.r[c];
      // l'angle de la queue prend le chemin le plus court (sinon elle balaie le dos en passant par l'avant)
      p[c] = r.pas(c === 'qBase' ? r.x + ecart(cible[c] - r.x) : cible[c], dp);
    }
    const vit = this.retour >= 0 && this.enArc && this.etat === 'marche' ? this.vArc : Math.abs(this.vx);
    const w = this.allure.pas(clamp((vit / VMAX) * 1.4, 0, 1), dt);
    this.phase = (this.phase + (vit * dt) / cycle(k) + pietine * dt * 1.6) % 1;
    const { S, racine } = squelette(p, w, this.phase, this.t);

    // queue : chaque segment suit le précédent avec un temps de retard (ressorts d'angle) ;
    // un segment qui touche le sol s'y couche du côté où il était au pas précédent, sans jamais basculer
    const om = this.etat === 'marche' ? TAU * 1.5 : this.etat === 'guette' ? TAU * 2.2 : TAU / 2.6;
    for (let i = 0; i < NQ; i++) {
      let c = i === 0 ? this.qa[0] + ecart(p.qBase - this.qa[0]) : this.qa[i - 1] + p.qCourbe;
      c += p.qVague * Math.sin(this.t * om - i * 0.55) * (i === 0 ? 0.5 : 1);
      const kq = lerp(150, 55, i / (NQ - 1));
      this.qv[i] += (kq * (c - this.qa[i]) - 1.5 * Math.sqrt(kq) * this.qv[i]) * dt;
      this.qa[i] += this.qv[i] * dt;
    }
    let bout = racine;
    for (let i = 0; i < NQ; i++) {
      let a = this.qa[i];
      if (bout.y + Math.sin(a) * LQ > -6.5) {
        const a1 = Math.asin(clamp((-6.5 - bout.y) / LQ, -1, 1)), a2 = Math.PI - a1, avant = this.qRendu[i];
        a = Math.abs(ecart(a1 - avant)) <= Math.abs(ecart(a2 - avant)) ? a1 : a2;
        a = this.qa[i] + ecart(a - this.qa[i]);
        this.qa[i] = a;
        this.qv[i] *= 0.6;
      }
      this.qRendu[i] = a;
      bout = add(bout, mul(dir(a), LQ));
    }

    // tête : regarde le visiteur ; pendant un demi-tour elle regarde déjà vers la nouvelle direction
    const tc = proj(add(S, { x: p.cx, y: p.cy + 1.3 * w * Math.sin(TAU * 2 * (this.phase + 0.1)) }));
    const teteMonde = { x: this.x + tc.x * sv, y: this.sol - leve + tc.y * sv };
    // regard : devant lui la plupart du temps ; de temps en temps (et quand on le caresse),
    // un coup d'œil vers le visiteur, ou vers le pointeur s'il y en a un
    this.prochainCoupDoeil -= dt;
    if (this.retenu && !this.o.libre) this.coupDoeil = Math.max(this.coupDoeil, 0.2); // il regarde le visiteur pendant qu'il parle
    if (this.prochainCoupDoeil <= 0) { this.coupDoeil = 1.4 + Math.random() * 1.2; this.prochainCoupDoeil = this.coupDoeil + 5 + Math.random() * 7; }
    this.coupDoeil = Math.max(0, this.coupDoeil - dt);
    let tourCible = p.tour * cphi, rx = 0.5 * cap, ry = 0;
    const curieux = this.o.decor.curiosite?.();
    const regarder = (q: V) => {
      const dx = q.x - teteMonde.x, dy = q.y - teteMonde.y;
      tourCible = clamp(dx / 420, -0.8, 0.8);
      rx = clamp(dx / 260, -1, 1);
      ry = clamp(dy / 220, -1, 1);
    };
    if (this.retour >= 0) { const nouveau = this.phiA === 0 ? 1 : -1; tourCible = 0.85 * nouveau; rx = 0.7 * nouveau; }
    else if (this.feuille && !this.dort) regarder(this.feuille);
    else if (this.lotus && this.etat === 'assis') regarder(this.lotus);
    else if (curieux && this.etat !== 'dort' && this.etat !== 'marche') regarder({ x: curieux.x, y: curieux.y - this.haut });
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
    const repos = this.etat === 'dort' ? 12 : 8 * baille;
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

    this.c0 = this.c1;
    this.c1 = {
      x: this.x, leve, phi: this.phi, proche, pietine, w, phase: this.phase, t: this.t, trot: k, p,
      vPieds: [this.r.avX.v, this.r.av2X.v, this.r.arX.v, this.r.ar2X.v], q: [...this.qRendu],
      tour: this.tour.x, regardX: this.regardX.x, regardY: this.regardY.x, oreilles, yeux: clamp(p.yeux, 0, 1) * paupiere,
      pupille: this.pupille.pas(this.feuille && !this.dort ? 1.7 : 1, dt), joie: this.joie > 0 || baille > 0.2,
      miaou: this.parle ? 0.05 + 0.2 * Math.abs(Math.sin(this.t * 9)) : this.miaou, baille,
      zzz: this.etat === 'dort' && p.yeux < 0.05, coeurs: this.coeurs.map((c) => ({ ...c })),
    };
  }

  // Le dessin d'une image, reporté sur les éléments SVG existants
  private dessiner(c: Cliche) {
    const s = this.s, p = c.p, w = c.w, leve = c.leve;
    const cap = Math.cos(c.phi) >= 0 ? 1 : -1;
    const sv = s * (1 + 0.07 * c.proche);
    const cphi = Math.cos(c.phi), sphi = Math.sin(c.phi);
    // projection à l'écran et profondeur (positive = plus près du visiteur) d'un point du profil, décalé de z vers le flanc proche
    const proj = (q: V, z = 0): V => ({ x: q.x * cphi - z * sphi, y: q.y });
    const prof = (q: V, z = 0) => q.x * sphi + z * cphi;
    const hauteurPas = Math.max(w, c.pietine * 0.8);

    // corps : une chaîne de boules le long de la colonne (de profil un boudin, de face une boule)
    const { H, S, col, rH, rB, nor, racine } = squelette(p, w, c.phase, c.t);
    const boules = col.map((q, i) => ({ c: sub(q, mul(nor[i], (rB[i] - rH[i]) / 2)), r: (rH[i] + rB[i]) / 2 }));
    const vues3d = boules.map((b) => ({ c: proj(b.c), r: b.r }));
    const contourCorps = enveloppe(vues3d, vues3d[NC / 2].c), dCorps = courbe(contourCorps, true);

    // pattes : la marche décale les pieds, un pied qui se déplace hors de la marche se lève un peu
    const pied = (x: number, y: number, o: number, v: number): V => {
      const g = foulee((c.phase + o) % 1, c.trot);
      return { x: x + g.x * w, y: Math.min(-7, y + g.y * hauteurPas - Math.min(9, Math.abs(v) * 0.12)) };
    };
    const ancreAv = add(S, { x: -2, y: 9 }), ancreAr = add(H, { x: 5, y: 6 });
    const pattes = [
      { j: patte(ancreAv, pied(p.avX, p.avY, 0.25, c.vPieds[0]), 26, 26, 1), z: FLANC, r: [12, 9.5, 9] },
      { j: patte(add(ancreAv, { x: 4, y: -2 }), pied(p.av2X, p.av2Y, 0.75, c.vPieds[1]), 26, 26, 1), z: -FLANC, r: [11.5, 9, 8.6] },
      { j: patte(ancreAr, pied(p.arX, p.arY, 0, c.vPieds[2]), 22, 27, -1), z: FLANC, r: [12, 9.5, 9] },
      { j: patte(add(ancreAr, { x: 4, y: -2 }), pied(p.ar2X, p.arY, 0.5, c.vPieds[3]), 22, 27, -1), z: -FLANC, r: [11.5, 9, 8.6] },
    ];

    // queue
    const pos: V[] = [racine];
    for (let i = 0; i < NQ; i++) pos.push(add(pos[i], mul(dir(c.q[i]), LQ)));
    const qp = pos.map((q) => proj(q));
    const tq = tube(qp, qp.map((_, i) => lerp(8.5, 6.2, i / NQ)));
    const dQueue = courbe(tq.contour, true);

    // tête
    const teteC = add(S, { x: p.cx, y: p.cy + 1.3 * w * Math.sin(TAU * 2 * (c.phase + 0.1)) });
    const tc = proj(teteC);
    const teteMonde = { x: c.x + tc.x * sv, y: this.sol - leve + tc.y * sv };

    // ---------- dessin ----------
    mesures(this.fixes.corps, { d: dCorps });

    // ombre au sol
    const milieu = proj(mix(H, S, 0.5)), ombre = 1 - Math.min(0.45, leve / 160);
    const largeurOmbre = Math.hypot(((S.x - H.x) / 2 + 42) * cphi, 36 * sphi) * ombre;
    const dOmbre = h('ellipse', { cx: f(c.x + milieu.x * sv), cy: f(this.sol - 1), rx: f(largeurOmbre * sv), ry: f(6.5 * sv), fill: '#2B6E3A', opacity: '.18', filter: 'url(#t-flou-ombre)' });

    // une patte, projetée ; plus elle est loin derrière le corps, plus elle est sombre
    const profCorps = prof(mix(H, S, 0.5));
    const vues = pattes.map((pa, k) => {
      const { A, J, P } = pa.j, z = pa.z;
      const a = proj(A, z), jj = proj(J, z), pp = proj(P, z), [r1, r2, r3] = pa.r;
      // sur un même côté, la patte avant passe devant la patte arrière
      const profondeur = prof(mix(A, P, 0.5), z) + (k < 2 ? 0.01 : 0), profAncre = prof(A, z);
      const doigts = [proj({ x: P.x + 3, y: P.y + 2 }, z - 3), proj({ x: P.x + 7, y: P.y + 1 }, z + 3)];
      const piedV = proj({ x: P.x + 3, y: P.y }, z), rxPied = Math.hypot(10.5 * cphi, 8 * sphi);
      const formes: Forme[] = [
        { d: os(a, r1, jj, r2), fond: 'url(#t-pelage)' },
        { d: os(jj, r2, pp, r3), fond: 'url(#t-pelage)', apres: [h('path', { d: os(mix(pp, jj, 0.42), r3, pp, r3), fill: 'url(#t-creme)' })] },
        { d: ovale(piedV, rxPied, 7.2), fond: '#FFF3E2', apres: [h('path', { d: doigts.map((q) => `M${pt(q)}v4.5`).join(''), stroke: CONTOUR, 'stroke-width': 1.8, 'stroke-linecap': 'round', opacity: '.5' })] },
      ];
      // une patte reste du côté où elle est attachée : celles du côté caché passent derrière le corps (plus sombres),
      // celles du côté visible devant. Devant, la patte est opaque et seul son contour s'efface vers l'attache :
      // rien ne se voit à travers.
      const visible = z * cphi > 0;
      const sombre = 0.1 * clamp((profCorps - profondeur) / 12, 0, 1);
      // patte arrière : hors du corps, son contour est toujours tracé ; sur le buste, il est tracé comme celui des pattes
      // avant, mais s'estompe d'un coup doux quand il passe de face (au lieu d'être balayé par le corps qui passe devant)
      const surBuste = lisse((Math.abs(cphi) - 0.55) / 0.4);
      const arriere = (): Enfant[] => [
        h('g', { opacity: f(surBuste) }, [h('g', { mask: 'url(#t-m-pattes)' }, [h('g', { 'clip-path': 'url(#t-c-corps)' }, [contourDe(formes)])])]),
        h('g', { mask: 'url(#t-m-hors-corps)' }, [contourDe(formes)]),
        ...remplissages(formes),
      ];
      const dessin: Enfant[] = visible
        ? k < 2 ? silhouette(formes, EP, 't-m-pattes') : arriere()
        : [...silhouette(formes), sombre > 0.005 ? h('g', { fill: CONTOUR, opacity: sombre.toFixed(3) }, formes.map((x) => h('path', { d: x.d }))) : null];
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

    const rayuresQueue = [0.28, 0.44, 0.6, 0.76, 0.92].map((t) => { const i = Math.round(t * NQ), q = qp[i], no = tq.nor[i]; const r = lerp(8.5, 6.2, i / NQ) - 0.6; return `M${pt(add(q, mul(no, r)))}L${pt(sub(q, mul(no, r)))}`; }).join('');
    const queue = silhouette([{ d: dQueue, fond: 'url(#t-pelage)', apres: [h('path', { d: rayuresQueue, stroke: RAYURE, 'stroke-width': 5, opacity: '.6' })] }]);

    // corps : ventre crème, rayures du dos, reflet, touffes du poitrail, ombre de la tête ;
    // le ventre, les rayures et le reflet sont dessinés pour le profil et s'estompent quand il passe de face.
    // Tout tombe dans le corps par le calcul (pas de découpe que le navigateur referait à chaque image)
    const ventre: V[] = [];
    for (let i = 5; i <= NC; i++) ventre.push(proj(sub(col[i], mul(nor[i], rB[i] - 0.8))));
    for (let i = NC; i >= 5; i--) ventre.push(proj(sub(col[i], mul(nor[i], rB[i] - lerp(3, rB[i] * 0.95, lisse((i / NC - 0.25) / 0.75))))));
    const fin = col[NC], noF = nor[NC], tgF = { x: -noF.y, y: noF.x };
    const angF = Math.atan2(tgF.y, tgF.x);
    const rayures = [0.1, 0.22, 0.34, 0.46, 0.58, 0.7].map((t) => {
      const i = Math.round(t * NC), q = col[i], no = nor[i], tg = { x: -no.y, y: no.x };
      const b = add(q, mul(no, rH[i] - 0.8)), tip = add(add(q, mul(no, rH[i] - (15 - t * 5))), mul(tg, -3));
      return `M${pt(proj(add(b, mul(tg, -5))))}L${pt(proj(tip))}L${pt(proj(add(b, mul(tg, 5))))}Z`;
    }).join('');
    const reflet = courbe(col.slice(2, 16).map((q, k) => proj(add(q, mul(nor[k + 2], rH[k + 2] - 5)))), false);
    let touffes = '';
    for (let k = 1; k <= 3; k++) {
      const a0 = angF + k * 0.32, r = rB[NC];
      touffes += `M${pt(proj(add(fin, mul(dir(a0 - 0.12), r))))}L${pt(proj(add(fin, mul(dir(a0 + 0.06), r + 7))))}L${pt(proj(add(fin, mul(dir(a0 + 0.12), r))))}Z`;
    }
    const ombreTete = proj(add(teteC, { x: -4, y: 28 }));
    const corps: Enfant[] = [
      ...silhouette([{ d: dCorps, fond: 'url(#t-pelage)' }, { d: touffes, fond: '#FFF3E2' }]),
      h('g', { opacity: f(cphi * cphi) }, [
        h('path', { d: courbe(ventre, true), fill: 'url(#t-creme)' }),
        h('path', { d: rayures, fill: RAYURE, opacity: '.55' }),
        h('path', { d: reflet, fill: 'none', stroke: '#FFD59A', 'stroke-width': 4.5, 'stroke-linecap': 'round', opacity: '.5' }),
      ]),
      h('path', { transform: `translate(${pt(ombreTete)})`, d: polygone(couper(contourCorps, ovalePts(ombreTete, 36, 18)).map((q) => sub(q, ombreTete))), fill: 'url(#t-ombre)' }),
    ];

    // Chaque patte garde son groupe d'une image à l'autre, même quand elle change de plan.
    const corpsTransform = `translate(${f(c.x)},${f(this.sol - leve)}) scale(${sv.toFixed(4)})`;
    const groupe = (v: (typeof vues)[number], masque: boolean) => h('g', masque ? { mask: `url(#t-m-cache-${v.k})` } : {}, v.dessin, `p${v.k}`);
    const visage = tete({ tour: c.tour, yeux: c.yeux, regard: { x: c.regardX, y: c.regardY }, pupille: c.pupille, joie: c.joie, miaou: c.miaou, baille: c.baille, oreilles: c.oreilles });

    // zzz quand il dort, cœurs quand on le caresse
    const zzz: Enfant[] = [];
    if (c.zzz) {
      for (let k = 0; k < 3; k++) {
        const u = (c.t * 0.33 + k / 3) % 1;
        const zx = teteMonde.x + cap * (30 + u * 26) * s, zy = teteMonde.y - (40 + u * 48) * s;
        zzz.push(h('path', { transform: `translate(${f(zx)},${f(zy)}) scale(${((0.8 + u * 0.7) * s).toFixed(3)})`, d: 'M-5,-5h10l-10,10h10', fill: 'none', stroke: '#2B6E3A', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: f(Math.sin(Math.PI * u) * 0.9) }));
      }
    }
    const coeurs = c.coeurs.map((co) => {
      const u = 1 - Math.min(1, co.vie);
      const cx = teteMonde.x + co.dx * u * s, cy = teteMonde.y - (50 + u * 90) * s;
      return h('path', { transform: `translate(${f(cx)},${f(cy)}) scale(${(s * (1.6 + u)).toFixed(3)})`, d: 'M0,4C-8,-3 -4,-10 0,-5C4,-10 8,-3 0,4Z', fill: '#F27C8C', opacity: f(Math.min(1, co.vie) * Math.min(1, u * 6)) });
    });

    peindre(this.calque, [
      dOmbre,
      h('g', { transform: corpsTransform }, [...derriere.map((v) => groupe(v, false)), h('g', {}, queue, 'queue'), h('g', {}, corps, 'corps'), ...devant.map((v) => groupe(v, true))]),
      h('g', { transform: `translate(${pt(teteMonde)}) scale(${(sv * TETE).toFixed(4)}) rotate(${f(p.incl * cphi)})` }, [...silhouette(visage.formes, EP / TETE), ...visage.details, visage.moustaches]),
      h('g', {}, zzz),
      h('g', {}, coeurs),
    ]);

    // zone à toucher : le corps et la tête (pas la queue), dans la bande
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity;
    for (const q of contourCorps) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); }
    const bas = this.sol - leve, rt = 50 * sv * TETE;
    const gauche = Math.min(c.x + x0 * sv, teteMonde.x - rt), droite = Math.max(c.x + x1 * sv, teteMonde.x + rt), dessus = Math.min(bas + y0 * sv, teteMonde.y - 1.3 * rt);
    this.o.suit({ s, tete: teteMonde, boite: { x: gauche, y: dessus, l: droite - gauche, h: bas + 4 - dessus }, haut: this.haut });
  }
}
