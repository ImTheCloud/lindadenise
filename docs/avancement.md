# Avancement du projet (à lire en début de conversation, à mettre à jour en fin de session)

Dernière mise à jour : 2026-10-10 (nouveau Tilleul intégré au site, non publié). Les règles et la stack sont dans `CLAUDE.md`, le cahier des charges dans `docs/brief.md`, la liste de fin de projet dans `docs/checklist-fin-de-projet.md`. Les infos personnelles et le statut légal de Linda sont dans `docs/prive/suivi-client.md` (non versionné). **Avant d'écrire un email à Linda** : lire `docs/prive/emails-linda.md` (non versionné) : règles (court, jamais de question à Linda : les poser à Claudiu, jamais parler de la suite, aucun mot technique), heures déjà annoncées, ce qu'elle sait déjà, emails envoyés.

## Où on en est

**Phase 1, vitrine : faite et en cours de validation par Claudiu** (Linda n'a encore rien vu, volontairement).

Fait et validé par Claudiu :
- Site FR + NL complet : accueil, galerie de 76 dessins avec filtres (Chats, Nature, Fleurs, Animaux), une page par dessin, À propos avec la photo de Linda, Contact, mentions légales, conditions d'utilisation, confidentialité, 404.
- Identité : logo lotus en pastille verte, écriture dessinée (Gochi Hand, Itim), orange et vert sur fond blanc, titre « Linda Denise » en deux couleurs (Linda vert, Denise orange), étang animé avec lotus et feuilles de tilleul.
- Achat : 10 € le dessin, bouton « Demander ce dessin » vers le formulaire (Netlify Forms), bloc « Comment recevoir un dessin ? », case d'acceptation des conditions dessinée, message pré-écrit. Pas de paiement en ligne.
- Mascotte **Tilleul** (même nom en FR et en NL, décision de Claudiu le 2026-10-10), chat roux aux yeux verts inspiré de Tiroux : **validée**. Poses assis et couché en boule, yeux qui suivent le pointeur, parle (bulle écrite lettre à lettre, bouche qui bouge), salut à chaque arrivée, réactions aux dessins et aux filtres, s'endort sans activité. Remplacée le 2026-10-10 par le nouveau Tilleul animé en direct (voir plus bas) ; l'ancien dessin et son script de génération sont supprimés (récupérables dans git).
- Accueil : section « Aussi en grand format » avec la vidéo de Linda (dessins imprimés), `public/video/impressions.mp4` (6 Mo, sans son, chargée au clic seulement) et son aperçu. Le texte invite à écrire pour un tirage, sans prix ni détail : l'offre d'impression reste à définir avec Linda (format, support, prix, statut légal).
- **Version publiée le 2026-10-10** (premier déploiement depuis Tilleul) : vitrine complète, FR + NL.
- Retours de Claudiu appliqués (mobile d'abord) : bascule FR/NL à côté du menu, étang avec plus de lotus et de roseaux sur mobile, rubriques compactes sur l'accueil, accroche qui présente Linda, texte « Rencontrez Linda » (reformulé à partir de son propre texte), vidéo précédée de son texte, e-mail dans le pied de page, fiche d'un dessin qui tient sur un écran de téléphone, liste « Vous pouvez » élargie (ajouts à faire valider avec le texte de licence : impression grand format, encadrer, conserver sans limite de durée).
- 2e série de retours : section « Pour commencer » supprimée (bouton « Voir tous les dessins » sous les rubriques), cartes de rubriques mobiles recentrées, filtres de la galerie compacts, bloc « Pourquoi 10 € ? », section vidéo réécrite (de vrais tableaux imprimés) avec le bouton sous la vidéo.
- 3e série de retours : couvertures des rubriques changées (Bréhat, Frangipanier, Caroline), cartes plus grandes, ton relu (plus de langage familier : « Aussi en grand format », messages d'erreur, Tilleul dit « Bonjour »), « il y a quatre ans » remplacé par « en 2022 » (année confirmée le 2026-10-10). **Décision : le néerlandais ne passe PAS au vouvoiement (« u »), on garde le « je » actuel.**
- Tilleul peut être mis en silence : bouton « Faire taire Tilleul » dans sa bulle ; il s'endort, ne parle plus, ne saute plus, et reste ainsi d'une visite à l'autre (localStorage). Un clic sur lui le réveille. Rubriques de l'accueil en cartes verticales sur grand écran.
- Tilleul discret : il ne parle plus qu'à la toute première visite et quand on le touche (plus de commentaires de sections, de dessins, de filtres ni d'ennui). Code et textes inutiles supprimés.
- Liste « Vous pouvez » (impression grand format, encadrer, conserver sans limite) : **validée par Claudiu** (2026-10-10).
- Fiche d'un dessin : clic sur l'image = zoom plein écran, précédent/suivant avec miniature, « D'autres dessins » = ceux qui suivent dans la rubrique (différents d'une fiche à l'autre).
- Mentions légales prêtes : `ADRESSE` et `NUMERO_ENTREPRISE` (vides) dans `src/i18n/index.ts`, affichés seulement une fois remplis.
- Images en AVIF + WebP, plan du site, robots.txt, Lighthouse 96-100 (à refaire à la fin).

## Publication

**Plus aucune publication avant la toute fin du projet, ou quand Claudiu le dit.** Les commits restent en `[skip ci]`. Les dessins sont dans l'ordre alphabétique des fichiers source (pas de tri dans la galerie, décision de Claudiu).

## Fin de projet

Tout ce qui reste à faire à la fin est dans `docs/checklist-fin-de-projet.md` (formulaire à valider après le déploiement final, relecture FR/NL, sécurité, SEO, Lighthouse, appareils). **Rappeler à Claudiu de la parcourir quand le projet approche de sa fin.**

## En attente

- **Validation du formulaire** : notification email réglée (2026-10-10). Le formulaire échoue en ligne (aucun formulaire détecté par Netlify) : il ne marchera qu'après le déploiement final, voir la checklist de fin de projet.
- **Statut légal de Linda** : elle se renseigne elle-même (pension, numéro d'entreprise). Tant que ce n'est pas réglé : pas de paiement en ligne. Détails dans `docs/prive/suivi-client.md`.
- **Textes à faire relire** : page de licence, mentions légales (adresse et numéro d'entreprise manquants). Le néerlandais ne sera pas relu (décision de Claudiu, 2026-10-10).
- Photo de Linda : on garde celle du site, pas d'autre photo.

## Plus tard, avec la phase 2 (admin), à ne pas oublier

- **Impression grand format** : vraie page de l'offre (format, support, prix, statut légal à définir avec Linda).
- **Livre d'or** avec modération par Linda dans l'admin.
- **Abonnement** : le visiteur peut s'abonner pour recevoir un email quand un nouveau dessin est ajouté (outil gratuit, page confidentialité à compléter, envoi déclenché depuis l'admin).
- Rappel automatique contre la mise en pause de Supabase gratuit.
- Décidé : pas de page Psaumes, pas de liens vers des réseaux.

## À la toute fin (ne pas oublier)

Image d'aperçu de partage (WhatsApp, Facebook), Lighthouse et contrastes, test sur vrais téléphones (petit Android, iPhone ancien, mouvement réduit), nettoyage du code inutilisé : voir `docs/checklist-fin-de-projet.md`.

## Prochaine étape

1. Claudiu valide ou ajuste le reste du site (design, textes).
2. **Phase 2 : espace admin** pour que Linda ajoute, modifie et supprime ses dessins depuis son téléphone (Supabase gratuit : base, stockage des aperçus, connexion de Linda seule). Prévoir un rappel automatique contre la mise en pause du projet gratuit.
3. **Phase 3 : boutique** Stripe (Bancontact) + téléchargement sécurisé, seulement après la réponse sur le statut légal.
4. Fin de projet : checklist (`docs/checklist-fin-de-projet.md`), achat du domaine `lindadenise.be`, mise en ligne en un seul déploiement, README à mettre à jour. Idées de fonctionnalités à proposer à Claudiu à ce moment-là : page Psaumes, livre d'or, liens réseaux, newsletter.

## Nouveau Tilleul animé (intégré au site le 2026-10-10, pas encore publié)

Souhait de Claudiu : un chat « ultra beau, stylé, qui fait des choses », qui se déplace. La performance n'est plus une contrainte. Rive et Spine écartés (export payant, fichiers que Claude ne peut pas modifier). Choix : animation calculée en direct, SVG redessiné à chaque image. **Le site publié garde l'ancien Tilleul** jusqu'à la prochaine publication (sur demande de Claudiu seulement). La page d'essai, le banc d'essai et le dossier `essais/` sont supprimés.

**Où est le code** : `src/components/tilleul/chat.ts` (le moteur), `src/components/tilleul/decor.ts` (lecture de l'étang et des feuilles de l'accueil), `src/components/Mascotte.astro` (bulle, silence, textes, invitation « Touchez-moi ! », bouton invisible pour le clavier). Textes dans `src/i18n` (FR et NL).

**Ce qu'il fait** : il marche (pas réglés sur la distance, sans glisser), fait demi-tour en marchant en passant face au visiteur, s'assoit, se couche, dort (zzz), s'étire. Nouveau : **toilette** (assis, patte à la bouche, petite langue, puis patte sur l'oreille, 7 s), **bâillement** avant de dormir (bouche ouverte, yeux plissés, oreilles en arrière), **étang** (sur l'accueil, quand l'étang est au bas de l'écran il s'assoit devant un lotus et le regarde), **chasse aux vraies feuilles** de `Feuilles.astro` (il se tapit à 130 unités, pattes arrière immobiles, bondit quand la feuille passe à portée ; la feuille attrapée disparaît jusqu'à son prochain passage). Touché : saut, cœurs, yeux plissés, et il parle (anecdote). La tête suit le pointeur et cligne.

**Sur le site** : il vit en bas de l'écran, sur toutes les pages ; seul son dessin réagit au doigt. Il ne parle qu'à la première visite, puis seulement quand on le touche. « Laisser Tilleul dormir » : il se couche, bâille, dort, silence mémorisé ; un toucher le réveille (il s'étire). Discret : il ne se promène que quand le visiteur ne défile ni ne tape depuis 2,5 s (défilement : il s'arrête et s'assoit) ; une bulle ouverte le retient. Ordinateur : toute la largeur de l'écran ; téléphone : petite taille (0,72) et courtes promenades. Endormi : redessiné 15 fois par seconde ; onglet caché : arrêt complet. Mouvement réduit : assis, une seule image, sans cœurs ni saut.

**Ajouts du 2026-10-10 (soir)** : hors page de jeu il ne marche que devant l'étang de l'accueil (plus de promenade par-dessus le texte quand on défile) ; page « Jouer avec Tilleul » (lien dans le pied de page) avec boutons marcher, s'asseoir, se coucher, dormir, s'étirer, toilette et « lâcher une feuille » (vraie feuille qui tombe, qu'il chasse) ; bouton zzz de la bulle placé du côté opposé à la pointe.

**Corrections suite aux retours (2026-10-10, soir)** : sur l'accueil le chat vit sur le bord de l'étang et monte avec la page quand on défile (`decor.decalage()`), au lieu de rester collé à l'écran ; sur la page de jeu il ignore le « visiteur occupé » (sinon un toucher sur un bouton annulait la marche) ; la bulle contient un bouton « Jouer avec moi » vers la page de jeu.

**À tester par Claudiu** (non vérifié à la main) : téléphone réel (taille, toucher, défilement), la toilette et le bâillement à l'œil, l'étang à différentes tailles d'écran (il n'y va que si l'étang est visible en bas), la chasse aux feuilles (fenêtre courte : la feuille s'estompe en fin de chute), la page en néerlandais.

**Comment il est construit** (à garder si on y retouche) :
- Squelette dans le plan du profil : colonne, pattes à deux os, queue en ressorts d'angle. Le corps est une chaîne de boules projetée selon l'angle du corps (`phi`) : c'est ce qui permet le demi-tour sans retourner le dessin.
- Un seul contour par forme : le contour du corps est une seule courbe calculée autour des boules. Plusieurs cercles superposés faisaient trembler le bord.
- Découpes (yeux, rayures) et masque des pattes fixes dans `<defs>` : on ne change que leurs mesures. Les recréer à chaque image fait scintiller. Tout le reste (iris, pupille, reflets, ventre, plastron) est calculé, pas découpé par le navigateur.
- Œil : seule la partie visible est peinte, sur un fond brun. L'iris remplit l'œil vu de biais, sans aucun filet blanc.
- Queue : un segment posé au sol reste du côté où il s'est posé (jamais de basculement). Elle reste toujours derrière le corps.
- Pattes : une patte reste du côté où elle est attachée ; celles du côté visible sont cachées progressivement par le corps (un masque par patte), pattes opaques, seul leur contour s'efface vers l'attache. Pendant la toilette, la patte levée (côté visible) est dessinée après la tête.
- Les feuilles du décor sont animées en CSS : le chat lit leur position à l'écran (`getBoundingClientRect`) à chaque image pendant la chasse, et les masque après la prise.

**Validé par Claudiu le 2026-10-10** : forme, demi-tour et pattes (avant et arrière). Retouches faites avant : oreilles, tête, queue, yeux (scintillement), contour, pattes arrière à l'affût.

**Ce que Claudiu aime et n'aime pas** (à respecter pour toute retouche) : rien qui scintille ou tremble ; aucune transparence (on ne doit jamais voir une patte ou un trait à travers une autre) ; aucun saut d'une image à l'autre ni trait qui apparaît, disparaît puis revient ; des gestes de vrai chat (regarde devant lui, ne bouge pas les pattes arrière avant de bondir) ; les traits de contour sur le corps sont plus beaux que sans.

**Idées pour plus tard** : ronronnement.

## Manière de travailler (rappels pratiques)

- **Voir le site** : `npm run dev` dans ce dossier (ou la configuration « site » de `.claude/launch.json`), puis http://localhost:4321 (la barre d'outils Astro est désactivée). Astro 7 n'accepte qu'un serveur de dev à la fois : `npx astro dev stop` arrête l'ancien.
- **Git** : git de GitHub Desktop (voir `CLAUDE.md`), commit et push à chaque modification, **toujours `[skip ci]` à la fin du message** pour ne pas déclencher de déploiement Netlify (15 crédits par déploiement, 300 par mois). Un seul commit sans `[skip ci]` pour publier, uniquement sur demande de Claudiu.
- **Netlify** : projet `lindadenise` branché sur GitHub (adresse `lindadenise.netlify.app`). La version en ligne est celle du 2026-10-10 (commit sans `[skip ci]`). L'ancien projet `lindadenise-ancien` est supprimé.
- **Catalogue** : titres, rubriques et traductions des dessins dans `scripts/preparer-dessins.mjs` (`npm run dessins`). Les originaux restent sur le Bureau de Claudiu (`~/Desktop/DessinsLinda`), jamais dans git.
- **Étiquette git** `v1-ecureuil` : ancienne version avec l'écureuil Noisette, au cas où.
- Le dépôt est public (choix assumé) : rien de personnel dedans.
