import { fr, type Dico } from './fr';
import { nl } from './nl';
import dessinsJson from '../data/dessins.json';

export type Lang = 'fr' | 'nl';
export type Rubrique = 'chats' | 'nature' | 'fleurs' | 'animaux';
export const RUBRIQUES: Rubrique[] = ['chats', 'nature', 'fleurs', 'animaux'];

export interface Dessin {
  id: string;
  rubrique: Rubrique;
  titre: { fr: string; nl: string };
  largeur: number;
  hauteur: number;
  une: boolean;
}
export const dessins = dessinsJson as Dessin[];

const dicos: Record<Lang, Dico> = { fr, nl };
export const t = (lang: Lang): Dico => dicos[lang];

const chemins = {
  accueil: { fr: '/', nl: '/nl/' },
  dessins: { fr: '/dessins/', nl: '/nl/tekeningen/' },
  apropos: { fr: '/a-propos/', nl: '/nl/over-mij/' },
  contact: { fr: '/contact/', nl: '/nl/contact/' },
  merci: { fr: '/merci/', nl: '/nl/bedankt/' },
  mentions: { fr: '/mentions-legales/', nl: '/nl/juridische-info/' },
  licence: { fr: '/licence/', nl: '/nl/gebruiksvoorwaarden/' },
  confidentialite: { fr: '/confidentialite/', nl: '/nl/privacy/' },
} as const;
export type Page = keyof typeof chemins;

export const chemin = (page: Page, lang: Lang) => chemins[page][lang];
export const cheminDessin = (id: string, lang: Lang) => `${chemins.dessins[lang]}${id}/`;
export const autreLangue = (lang: Lang): Lang => (lang === 'fr' ? 'nl' : 'fr');

export const parRubrique = (r: Rubrique) => dessins.filter((d) => d.rubrique === r);
export const SITE = 'https://lindadenise.be';
export const EMAIL = 'teugelslinda@yahoo.fr';
