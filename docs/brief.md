# Brief : site de Linda Denise

## Le projet

Portfolio de dessins numériques de Linda Denise, avec aperçus protégés par un filigrane de copyright. Dans un second temps, achat d'un dessin en téléchargement (5 € l'unité).

## Qui

Linda Denise, Belgique, ancienne professeure de cuisine et d'économie domestique. Elle découvre le dessin au doigt sur smartphone il y a quelques années. Projet passion, création intuitive et instinctive.

Sur le site, elle apparaît uniquement sous le nom **Linda Denise**. Le nom de famille figure seulement dans les mentions légales (voir `docs/prive/`).

## Ce qu'elle veut transmettre

La beauté de la nature et les chats. Esthétique, apaisant, naïf, joyeux, coloré, vibrant, singulier. Chaque œuvre est inspirée par ce qu'elle voit dans la nature (arbres, forêt, fleurs, jardin) ou par des photos de chats d'un ami québécois.

## Identité visuelle

- Fond blanc, orange et vert
- Logo : forme de lotus, ou les lettres LD ; le tilleul (« Linda » en néerlandais) ; l'écureuil, animal qu'elle aime

## Catalogue

72 dessins reçus (JPG, titrés). Rubriques prévues : Chats, Nature, Fleurs, autres à définir après tri, et plus tard Psaumes (aucun dessin pour l'instant).

## Vente

- Fichiers numériques uniquement, pas d'impression
- **10 € le dessin** (prix indicatif, affiché sur le site)
- Pour l'instant : bouton « Recevoir ce dessin » qui mène au formulaire de contact, Linda répond personnellement
- Plus tard : paiement Stripe (Bancontact), reçu par email, téléchargement sécurisé
- Licence : **usage privé uniquement**, pas d'usage commercial (page « Licence d'utilisation »)
- Le paiement en ligne ne démarre qu'après vérification de son statut légal, que Linda gère elle-même (voir `docs/prive/`)

## Langues

Français par défaut, néerlandais en second (`/nl/`).

## Identité visuelle retenue

- Logo : lotus en pastille verte (piste 2). Les autres pistes sont gardées dans `design/logos/`.
- Écriture dessinée partout (Gochi Hand pour les titres, Itim pour le texte), dans l'esprit des lettres LD du logo 3.
- Mascotte : Tilleul (même nom en français et en néerlandais), chat roux aux yeux verts inspiré de Tiroux, un des chats des dessins de Linda. Dessiné en SVG, animé par parties : il salue, parle, cligne des yeux, suit le pointeur du regard, s'endort sans activité, ronronne et fait des cœurs quand on le touche. Textes écrits à l'avance (pas d'IA). L'ancien écureuil (Noisette) est conservé dans le tag git `v1-ecureuil`.
- Décor : étang dessiné avec lotus qui flottent, feuilles de tilleul qui tombent.
- Photo de Linda sur l'accueil et la page À propos.

## Textes d'accueil (pistes, à réécrire)

- Une bulle de sérénité visuelle pour décompresser, méditer
- Offrir un dessin qui touchera celui ou celle qui le reçoit
- Trouver le dessin qui donne vie à sa maison

## Administration

Linda doit pouvoir ajouter, modifier et supprimer ses dessins elle-même, surtout depuis son téléphone.

## Domaine

`lindadenise.be`, à acheter en fin de projet.

## Phases

1. Vitrine : portfolio filigrané, rubriques, À propos, contact (fait, à valider avec Linda)
2. Admin : ajouter, modifier, supprimer les dessins (Supabase)
3. Boutique : paiement et téléchargement, une fois le statut légal confirmé
