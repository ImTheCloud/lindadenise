# Linda Denise : portfolio et boutique de dessins

## Le projet

Site de Linda Denise (retraitée belge, dessins numériques faits au doigt sur smartphone). Portfolio de dessins avec filigrane, puis vente de fichiers à 10 € (phase 3). Brief : `docs/brief.md`. Notes privées (identité, statut légal) : `docs/prive/`, non versionné.

## Règles non négociables

- **Le dépôt est public (choix assumé)** : ne pas le rendre privé. Jamais de clé API ni de dessin original en haute définition dans ce qui est versionné (ce serait un téléchargement gratuit). Les infos d'identité sont de toute façon affichées sur le site, dans les mentions légales.
- **Sur le site, elle est « Linda Denise »** partout, sauf dans les mentions légales où figure son nom de famille.
- **Les originaux haute définition ne vont jamais dans git** (dossier source : `~/Desktop/DessinsLinda`). Seuls des aperçus filigranés basse définition sont publics.
- **Ne jamais inventer d'information** sur Linda. Rien de provisoire visible sur le site.
- **Pas de paiement en ligne** tant que son statut légal n'est pas confirmé : Linda se renseigne elle-même (voir `docs/prive/suivi-client.md`).
- Textes en FR (par défaut) et NL. Vouvoiement, phrases courtes, ton apaisant, pas de superlatifs vides.
- Outils gratuits uniquement. Stripe est le seul coût (frais par vente, phase 3).
- Pas de cookies de suivi, polices hébergées sur le site.
- Linda n'est pas technique : l'admin doit être très simple, pensé pour son téléphone.
- Aucun code mort. Build sans erreur avant chaque commit.

## Git

Git système bloqué (licence Xcode) : utiliser celui de GitHub Desktop avec `GIT_EXEC_PATH` et `GIT_TEMPLATE_DIR`. Commit et push à chaque modification, messages en français sans accents, jamais de co-auteur.

## Stack

- **Astro 7** (statique, TypeScript), déployé sur Netlify (`netlify.toml`). Pas de framework CSS : `src/styles/global.css` (variables, boutons, cadres dessinés) + styles des composants.
- **Langues** : FR par défaut (`/`), NL sous `/nl/`. Textes dans `src/i18n/fr.ts` et `nl.ts` (même structure obligatoire, le type vient de fr.ts), chemins dans `src/i18n/index.ts`. Les pages sont des composants dans `src/components/pages/`, appelés par de petits fichiers dans `src/pages/` (FR) et `src/pages/nl/`.
- **Catalogue** : `src/data/dessins.json` et aperçus filigranés `public/dessins/`, générés par `npm run dessins` (`scripts/preparer-dessins.mjs`, source `~/Desktop/DessinsLinda`). Toute modification de titre, de rubrique ou de traduction se fait dans ce script, puis on relance.
- **Mascotte** : `src/components/Mascotte.astro` + `mascotte.svg`, ce dernier généré par `node scripts/generer-mascotte.mjs` (ne pas éditer le SVG à la main). Parties animées en CSS (classes `m-*`, pivots en unités du dessin), état dans `data-etat` (repos, parle, couche, dort) ; le saut est une classe `saut` ; habitudes en classes (etire, oreille, regarde-g, regarde-d). Chaque section de page porte `data-mascotte="clé"` ; les phrases sont dans `mascotte.sections` des dictionnaires.
- **Formulaire** : Netlify Forms (`name="contact"`), envoi en arrière-plan, repli vers la page Merci.
- **Polices** : Fontsource (Gochi Hand, Itim), hébergées sur le site.
- Prévu : Supabase gratuit (admin des dessins, connexion de Linda seule, droits par ligne) ; phase 3 Stripe Checkout (Bancontact) + fonctions Netlify. Piège : Supabase gratuit se met en pause après environ une semaine sans activité, prévoir un rappel automatique.
- Prix affiché : 10 € (constante dans les dictionnaires). Licence : usage privé uniquement.

## Design

Fond blanc, orange et vert, tout en dessin : bordures irrégulières, écriture manuscrite, étang et lotus animés, feuilles de tilleul, mascotte chat roux (Tilleul). Logo : lotus en pastille verte. Contraste : l'orange clair `#F28A1E` ne sert qu'en décor ; texte et boutons utilisent `--orange-fonce` / `--orange-titre`. Respecter `prefers-reduced-motion`. Mobile d'abord, grand écran soigné.
