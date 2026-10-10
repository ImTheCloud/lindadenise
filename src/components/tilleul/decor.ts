// Le décor de l'accueil lu tel qu'il est à l'écran : l'étang (Etang.astro) et les feuilles qui tombent (Feuilles.astro)
// vivent dans la section du haut ; sur la page de jeu, les feuilles sont lâchées par les boutons. Sur les autres pages, ou quand cette section n'est plus visible, il n'y a rien à regarder.
import type { Decor, FeuilleDecor } from './chat';

const heros = () => document.querySelector<HTMLElement>('.heros');

export const decorAccueil: Decor = {
  // les lotus ne sont à regarder que si l'étang est à l'écran (le chat vit sur son bord)
  lotus() {
    const etang = heros()?.querySelector('.etang');
    if (!etang) return [];
    const r = etang.getBoundingClientRect();
    if (r.top > innerHeight - 70 || r.bottom < 100) return [];
    return [...etang.querySelectorAll('.flotte')].map((g) => {
      const b = g.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height * 0.3 };
    });
  },
  decalage() {
    const etang = heros()?.querySelector('.etang');
    return etang ? Math.max(0, innerHeight - etang.getBoundingClientRect().bottom) : 0;
  },
  feuilles() {
    const jeu = document.querySelector<HTMLElement>('[data-jeu]');
    const h = jeu ?? heros();
    if (!h) return [];
    const r = h.getBoundingClientRect();
    if (!jeu && (r.bottom < innerHeight * 0.5 || r.top > innerHeight * 0.5)) return [];
    return [...h.querySelectorAll<HTMLElement>('.feuille')].filter((el) => el.style.visibility !== 'hidden' && Number(getComputedStyle(el).opacity) > 0.5).map((el): FeuilleDecor => {
      const b = el.getBoundingClientRect();
      return { el, x: b.left + b.width / 2, y: b.top + b.height / 2 };
    });
  },
};
