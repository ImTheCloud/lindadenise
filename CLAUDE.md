# Linda Denise : portfolio et boutique de dessins

## Le projet

Site de Linda Denise (retraitée belge, dessins numériques faits au doigt sur smartphone). Portfolio de dessins avec filigrane, puis vente de fichiers à 5 € (phase 2). Brief : `docs/brief.md`. Notes privées (identité, statut légal) : `docs/prive/`, non versionné.

## Règles non négociables

- **Le dépôt est public** : jamais de nom de famille, d'email, de clé API, de dessin original ni de note légale dans ce qui est versionné.
- **Sur le site, elle est « Linda Denise »** ; le nom de famille n'apparaît que dans les mentions légales.
- **Les originaux haute définition ne vont jamais dans git** (dossier source : `~/Desktop/DessinsLinda`). Seuls des aperçus filigranés basse définition sont publics.
- **Ne jamais inventer d'information** sur Linda. Rien de provisoire visible sur le site.
- **Pas de paiement en ligne** tant que son statut légal n'est pas confirmé (voir `docs/prive/suivi-client.md`).
- Textes en FR (par défaut) et NL. Vouvoiement, phrases courtes, ton apaisant, pas de superlatifs vides.
- Outils gratuits uniquement. Stripe est le seul coût (frais par vente, phase 2).
- Pas de cookies de suivi, polices hébergées sur le site.
- Linda n'est pas technique : l'admin doit être très simple, pensé pour son téléphone.
- Aucun code mort. Build sans erreur avant chaque commit.

## Git

Git système bloqué (licence Xcode) : utiliser celui de GitHub Desktop avec `GIT_EXEC_PATH` et `GIT_TEMPLATE_DIR`. Commit et push à chaque modification, messages en français sans accents, jamais de co-auteur.

## Stack prévue

- Astro (statique, TypeScript), hébergé sur Netlify
- Supabase gratuit : table des dessins, stockage des aperçus, connexion de Linda seule, droits par ligne (RLS)
- Phase 2 : Stripe Checkout (Bancontact) + fonctions Netlify (webhook, lien de téléchargement temporaire)
- Piège : Supabase gratuit met le projet en pause après environ une semaine sans activité ; prévoir un rappel automatique

## Design

Fond blanc, orange et vert. Ambiance apaisante, naïve, joyeuse, colorée. Logo à créer (lotus, LD, tilleul, écureuil).
