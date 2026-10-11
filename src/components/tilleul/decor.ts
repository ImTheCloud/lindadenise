// Le décor où vit Tilleul, lu dans la page puis gardé en mémoire : rien n'est mesuré à chaque image.
// Repères : [data-decor] (la scène : haut de l'accueil, page de jeu), .etang et ses .flotte (lotus, Etang.astro),
// [data-tilleul-rail] (le bord de l'étang, où se pose la bande du chat). Les feuilles qu'il peut chasser
// sont donnés par la page de jeu (lien.ts). Les positions sont relevées au chargement, quand la taille change, et quand
// le défilement s'arrête.
import { HAUT, type Decor } from './chat';
import { lien } from './lien';

export function lireDecor(): Decor & { rail: HTMLElement | null; leve: number } {
  const scene = document.querySelector<HTMLElement>('[data-decor]');
  const rail = scene?.querySelector<HTMLElement>('[data-tilleul-rail]') ?? null;
  const etangEl = scene?.querySelector<HTMLElement>('.etang') ?? null;
  // sans « overflow: clip », la bande ne colle pas au bas de l'écran : elle reste au bord de l'étang
  const colle = CSS.supports('overflow', 'clip');
  let defile = scrollY, vh = innerHeight, arret: number | undefined;
  // positions dans le document
  let etang = { haut: 0, bas: 0 }, railBas = 0;
  let lotus: { x: number; y: number }[] = [];

  const relever = () => {
    defile = scrollY;
    vh = innerHeight;
    if (rail) railBas = rail.getBoundingClientRect().bottom + defile;
    if (etangEl) {
      const r = etangEl.getBoundingClientRect();
      etang = { haut: r.top + defile, bas: r.bottom + defile };
      lotus = [...etangEl.querySelectorAll('.flotte')].map((g) => {
        const b = g.getBoundingClientRect();
        return { x: b.left + b.width / 2, y: b.top + b.height * 0.3 + defile };
      });
    }
  };
  relever();
  if (scene) new ResizeObserver(relever).observe(scene);
  addEventListener('resize', relever);
  // la position de la page est relue quand le défilement s'arrête : jamais de lecture de mise en page pendant qu'on défile
  addEventListener('scroll', () => { window.clearTimeout(arret); arret = window.setTimeout(() => { defile = scrollY; }, 120); }, { passive: true });

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
    feuilles: () => lien.feuilles?.() ?? [],
    curiosite: () => lien.curiosite?.() ?? null,
  };
}
