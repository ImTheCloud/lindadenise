// Le panier du visiteur : dessins numériques, toiles déjà imprimées, toiles sur commande (identifiant du dessin).
// Il est gardé sur l'appareil (localStorage), sans cookie ; sans stockage, il ne dure que le temps de la page.
// Aucun paiement : le panier sert à préparer la demande envoyée à Linda (formulaire de contact).
export type Genre = 'dessin' | 'toile' | 'commande';
export type Panier = Record<Genre, string[]>;

const CLE = 'panier';
const GENRES: Genre[] = ['dessin', 'toile', 'commande'];
let memoire: Panier | null = null;

const liste = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

export function lire(): Panier {
  try {
    const p = JSON.parse(localStorage.getItem(CLE) ?? 'null');
    return { dessin: liste(p?.dessin), toile: liste(p?.toile), commande: liste(p?.commande) };
  } catch {
    return memoire ?? { dessin: [], toile: [], commande: [] };
  }
}

function ecrire(p: Panier) {
  memoire = p;
  try { localStorage.setItem(CLE, JSON.stringify(p)); } catch { /* sans stockage : le panier reste en mémoire */ }
  window.dispatchEvent(new Event('panier-change'));
}

export const nombre = (p: Panier) => GENRES.reduce((n, g) => n + p[g].length, 0);

export function basculer(genre: Genre, id: string) {
  const p = lire();
  p[genre] = p[genre].includes(id) ? p[genre].filter((x) => x !== id) : [...p[genre], id];
  ecrire(p);
}

export function garder(valides: Record<Genre, Set<string>>) {
  const p = lire();
  const propre = Object.fromEntries(GENRES.map((g) => [g, p[g].filter((id) => valides[g].has(id))])) as Panier;
  if (GENRES.some((g) => propre[g].length !== p[g].length)) ecrire(propre);
  return propre;
}

export function vider() {
  ecrire({ dessin: [], toile: [], commande: [] });
}

// un autre onglet a changé le panier
window.addEventListener('storage', (e) => { if (e.key === CLE) window.dispatchEvent(new Event('panier-change')); });
