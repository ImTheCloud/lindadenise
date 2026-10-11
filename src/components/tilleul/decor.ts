// Le décor où vit Tilleul, lu dans la page puis gardé en mémoire : rien n'est mesuré à chaque image.
// Repères : [data-decor] (la scène : haut de l'accueil, page de jeu), .etang et ses .flotte (lotus, Etang.astro),
// .feuille (feuilles qui tombent, Feuilles.astro), [data-tilleul-rail] (le bord de l'étang, où se pose la bande du chat).
// Les positions sont relevées au chargement, quand la taille change et quand on défile ; celles des feuilles qui tombent,
// au plus toutes les 200 ms (entre deux relevés, leur chute est prolongée).
import { HAUT, type Decor, type FeuilleDecor } from './chat';
import { lien } from './lien';

type Element2D = HTMLElement | SVGElement;
interface Releve { el: Element2D; x: number; y: number; vx: number; vy: number; op: number; t: number }

export function lireDecor(): Decor & { rail: HTMLElement | null; leve: number } {
  const scene = document.querySelector<HTMLElement>('[data-decor]');
  const rail = scene?.querySelector<HTMLElement>('[data-tilleul-rail]') ?? null;
  const etangEl = scene?.querySelector<HTMLElement>('.etang') ?? null;
  const feuillesEl = scene?.getElementsByClassName('feuille');
  // sans « overflow: clip », la bande ne colle pas au bas de l'écran : elle reste au bord de l'étang
  const colle = CSS.supports('overflow', 'clip');
  let defile = scrollY, vh = innerHeight, arret: number | undefined;
  // positions dans le document
  let boite = { haut: 0, bas: 0 }, etang = { haut: 0, bas: 0 }, railBas = 0;
  let lotus: { x: number; y: number }[] = [];
  let releves: Releve[] = [], dernier = -Infinity, nombre = -1;

  const relever = () => {
    if (!scene) return;
    defile = scrollY;
    vh = innerHeight;
    const doc = (r: DOMRect) => ({ haut: r.top + defile, bas: r.bottom + defile });
    boite = doc(scene.getBoundingClientRect());
    if (rail) railBas = rail.getBoundingClientRect().bottom + defile;
    if (etangEl) {
      etang = doc(etangEl.getBoundingClientRect());
      lotus = [...etangEl.querySelectorAll('.flotte')].map((g) => {
        const b = g.getBoundingClientRect();
        return { x: b.left + b.width / 2, y: b.top + b.height * 0.3 + defile };
      });
    }
    dernier = -Infinity;
  };
  relever();
  if (scene) new ResizeObserver(relever).observe(scene);
  addEventListener('resize', relever);
  // la position de la page est relue quand le défilement s'arrête (pendant qu'on défile, le chat reste tranquille) :
  // jamais de lecture de mise en page pendant le défilement
  addEventListener('scroll', () => { window.clearTimeout(arret); arret = window.setTimeout(() => { defile = scrollY; }, 120); }, { passive: true });

  // la scène couvre le milieu de l'écran : ses feuilles sont à regarder
  const auMilieu = () => boite.haut - defile < vh * 0.5 && boite.bas - defile > vh * 0.5;

  // Attrapée : la feuille disparaît jusqu'à son prochain passage
  const cacher = (el: Element2D) => {
    el.style.visibility = 'hidden';
    el.addEventListener('animationiteration', () => { el.style.visibility = ''; }, { once: true });
  };

  return {
    rail,
    leve: 0, // la bande est montée de tant de pixels (posée sur une barre fixe, page Toiles)
    haut() {
      if (!rail) return vh - HAUT - this.leve;
      const bas = railBas - defile;
      return (colle ? Math.min(vh, bas) : bas) - HAUT;
    },
    // les lotus ne sont à regarder que si l'étang est à l'écran (le chat vit sur son bord)
    lotus() {
      if (!etangEl || etang.haut - defile > vh - 70 || etang.bas - defile < 100) return [];
      return lotus.map((l) => ({ x: l.x, y: l.y - defile }));
    },
    // la page de jeu donne elle-même ses feuilles et ses papillons ; ailleurs, ce sont celles de Feuilles.astro
    feuilles() {
      if (lien.feuilles) return lien.feuilles();
      if (!feuillesEl || !auMilieu()) return [];
      const maintenant = performance.now();
      if (maintenant - dernier > 200 || feuillesEl.length !== nombre) {
        // relevé : position, opacité, et vitesse depuis le relevé précédent
        const avant = new Map(releves.map((r) => [r.el, r]));
        nombre = feuillesEl.length;
        dernier = maintenant;
        releves = ([...feuillesEl] as Element2D[]).filter((el) => el.style.visibility !== 'hidden').map((el) => {
          const b = el.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
          const p = avant.get(el), dt = p ? (maintenant - p.t) / 1000 : 0;
          const ok = p && dt > 0.05 && dt < 0.6;
          return { el, x, y, vx: ok ? (x - p.x) / dt : 0, vy: ok ? (y - p.y) / dt : 0, op: Number(getComputedStyle(el).opacity), t: maintenant };
        });
      }
      return releves.filter((r) => r.el.style.visibility !== 'hidden').map((r): FeuilleDecor => {
        const dt = (maintenant - r.t) / 1000;
        return { el: r.el, x: r.x + r.vx * dt, y: r.y + r.vy * dt, vy: r.vy || undefined, op: r.op, attraper: () => cacher(r.el) };
      });
    },
    curiosite: () => lien.curiosite?.() ?? null,
  };
}
