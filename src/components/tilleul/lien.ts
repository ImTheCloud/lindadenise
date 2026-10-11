// Ce que le chat et la page de jeu partagent (Mascotte.astro et PageJeu.astro importent ce même module) :
// le chat, où il est à chaque image, et ce que la page fait tomber ou voler pour lui
import type { Chat, FeuilleDecor, Reperes } from './chat';

export const lien: {
  chat?: Chat;
  reperes?: Reperes;
  feuilles?: () => FeuilleDecor[]; // feuilles et papillons de la page de jeu, à l'écran
  curiosite?: () => { x: number; y: number } | null;
} = {};
