# Avancement du projet (à lire en début de conversation, à mettre à jour en fin de session)

Dernière mise à jour : 2026-10-10 (prototype du nouveau Tilleul, page 404 corrigée). Les règles et la stack sont dans `CLAUDE.md`, le cahier des charges dans `docs/brief.md`, la liste de fin de projet dans `docs/checklist-fin-de-projet.md`. Les infos personnelles et le statut légal de Linda sont dans `docs/prive/suivi-client.md` (non versionné). **Avant d'écrire un email à Linda** : lire `docs/prive/emails-linda.md` (non versionné) : règles (court, jamais de question à Linda : les poser à Claudiu, jamais parler de la suite, aucun mot technique), heures déjà annoncées, ce qu'elle sait déjà, emails envoyés.

## Où on en est

**Phase 1, vitrine : faite et en cours de validation par Claudiu** (Linda n'a encore rien vu, volontairement).

Fait et validé par Claudiu :
- Site FR + NL complet : accueil, galerie de 76 dessins avec filtres (Chats, Nature, Fleurs, Animaux), une page par dessin, À propos avec la photo de Linda, Contact, mentions légales, conditions d'utilisation, confidentialité, 404.
- Identité : logo lotus en pastille verte, écriture dessinée (Gochi Hand, Itim), orange et vert sur fond blanc, titre « Linda Denise » en deux couleurs (Linda vert, Denise orange), étang animé avec lotus et feuilles de tilleul.
- Achat : 10 € le dessin, bouton « Demander ce dessin » vers le formulaire (Netlify Forms), bloc « Comment recevoir un dessin ? », case d'acceptation des conditions dessinée, message pré-écrit. Pas de paiement en ligne.
- Mascotte **Tilleul** (même nom en FR et en NL, décision de Claudiu le 2026-10-10), chat roux aux yeux verts inspiré de Tiroux : **validée**. Poses assis et couché en boule, yeux qui suivent le pointeur, parle (bulle écrite lettre à lettre, bouche qui bouge), salut à chaque arrivée, réactions aux dessins et aux filtres, s'endort sans activité. Dessinée par `scripts/generer-mascotte.mjs` : ne plus y toucher sauf demande.
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

## En pause : nouveau Tilleul animé (prototype, état au 2026-10-10)

Souhait de Claudiu : un chat « ultra beau, stylé, qui fait des choses », qui se déplace. La performance n'est plus une contrainte. Rive et Spine écartés (export payant, fichiers que Claude ne peut pas modifier). Choix : animation calculée en direct, SVG redessiné à chaque image. **Le site publié garde l'ancien Tilleul** tant que le nouveau n'est pas validé.

**Où le voir** : `npm run dev`, puis http://localhost:4321/essai-tilleul/ (page servie en dev seulement, route ajoutée dans `astro.config.mjs`, jamais construite ni publiée). Boutons d'ordres, « Lâcher une feuille », pilote automatique, squelette, loupe. Code : `essais/tilleul.astro`, `essais/tilleul/chat.ts` (le moteur) et `essais/tilleul/banc.mjs` (banc d'essai).

**Ce qu'il fait** : il marche (pas réglés sur la distance, sans glisser), fait demi-tour en pivotant en volume face au visiteur, s'assoit (queue en crosse derrière), se couche, dort (zzz), s'étire (yeux fermés), chasse une feuille de tilleul (approche, se tapit, bondit). Touché : saut, cœurs, yeux plissés. La tête (82 % de la taille d'origine) suit le pointeur et cligne. Mouvement réduit demandé : il reste assis. Taille de base validée par Claudiu.

**Comment il est construit** (à garder si on y retouche) :
- Squelette dans le plan du profil : colonne, pattes à deux os, queue en ressorts d'angle. Le corps est une chaîne de boules projetée selon l'angle du corps (`phi`) : c'est ce qui permet le demi-tour sans retourner le dessin.
- Un seul contour par forme : le contour du corps est une seule courbe calculée autour des boules. Plusieurs cercles superposés faisaient trembler le bord.
- Découpes (yeux, rayures) et masque des pattes fixes dans `<defs>` : on ne change que leurs mesures. Les recréer à chaque image fait scintiller.
- Œil : seule la partie visible est peinte, sur un fond brun. L'iris remplit l'œil vu de biais, sans aucun filet blanc qui toucherait la fourrure.
- Queue : un segment posé au sol reste du côté où il s'est posé (jamais de basculement). Elle reste toujours derrière le corps.

**Corrigé suite aux retours de Claudiu** : oreilles coupées, tête trop grosse, queue vue par transparence, queue saccadée assis, demi-tour « téléporté », scintillement et traits blancs des yeux, contour qui tremble, pattes arrière qui bougeaient à l'affût, yeux pendant l'étirement.

**Reprise du 2026-10-10 (après-midi), faite** : demi-tour en marchant (petit arc vers le visiteur, de vrais pas, au lieu du pivot sur place, gardé seulement à l'affût) ; paupières en deux temps continus, le trait du dessus ne saute plus et l'œil fermé est un « ‿ » ; il regarde devant lui (3/4 dans sa direction) dans toutes les poses, avec un coup d'œil vers le visiteur toutes les 5 à 12 s et quand on le caresse ; « zzz » seulement une fois les yeux fermés ; destinations toujours à l'écran (téléphone compris) ; contour de chaque groupe tracé d'un seul trait (fin des bords qui s'additionnent).

**Banc d'essai hors navigateur** : `node --experimental-transform-types essais/tilleul/banc.mjs <scenario> [dossier]` (scénarios : poses, demitour, yeux, transitions, chasse, caresse) écrit des planches SVG image par image ; `qlmanage -t -s 1000 -o <dossier> <dossier>/<scenario>.svg` les convertit en image. Il ne dépend pas du navigateur intégré (qui ne dessine rien quand il est masqué). Validé ainsi : toutes les poses et transitions, demi-tour, fermeture des yeux, chasse, caresse ; 10 min de pilote automatique sur 375, 900 et 1600 px sans erreur, sans valeur invalide, sans basculement de queue ni sortie d'écran.

Demi-tour revu encore (« les pattes et l'arrière du buste font un truc bizarre ») : une patte reste du côté où elle est attachée ; celles du côté visible sont cachées progressivement par la partie du corps qui passe devant elles (un masque par patte) ; le fondu du haut des pattes est limité à la partie posée sur le corps (sinon on voyait le fond à travers) ; ventre, rayures et reflet du profil s'estompent de face.

Retours suivants appliqués (« on voit les traits des pattes cachées », « pattes arrière pas encore bonnes au demi-tour », « les yeux scintillent 2 s au réveil ») : pattes opaques, seul leur contour s'efface vers l'attache (plus rien ne se voit à travers) ; sur un même côté la patte avant passe devant l'arrière ; contour de la cuisse arrière estompé sur le dessus et l'arrière (plus de trait en travers du ventre), toute la cuisse se fond dans le corps quand il se tourne ; plus aucune découpe recalculée par le navigateur pour les yeux, les rayures, le ventre, le plastron, l'ombre sous la tête et la queue : tout est calculé (Sutherland-Hodgman pour l'iris, la pupille, les reflets). Seuls restent les masques des pattes.

**Validé par Claudiu le 2026-10-10** : demi-tour et pattes arrière. Pattes arrière : même cuisse fine et même contour que les pattes avant ; hors du corps leur contour est toujours tracé ; sur le buste, il s'estompe d'un coup doux quand il passe de face (au lieu d'être balayé par le corps).

**Ce que Claudiu aime et n'aime pas** (à respecter pour toute retouche) : rien qui scintille ou tremble ; aucune transparence (on ne doit jamais voir une patte ou un trait à travers une autre) ; aucun saut d'une image à l'autre ni trait qui apparaît, disparaît puis revient ; des gestes de vrai chat (regarde devant lui, ne bouge pas les pattes arrière avant de bondir) ; les traits de contour sur le corps sont plus beaux que sans.

**Décidé par Claudiu (2026-10-10)** : ajouter la toilette (se lèche la patte puis l'oreille), le bâillement avant de dormir, et l'étang de l'accueil (s'arrêter au bord, regarder un lotus, chasser les vraies feuilles du décor `Feuilles.astro`) ; puis intégrer le chat au site. Sur ordinateur, il se promène sur toute la largeur de l'écran. À faire dans une nouvelle conversation.

**Ensuite, une fois validé** : remplacer `Mascotte.astro` par le nouveau moteur en gardant la bulle, le bouton de silence, les textes et l'accueil, puis supprimer `essais/` et la route d'essai. Idées pour plus tard : toilette (se lèche la patte), ronronnement, aller jusqu'à l'étang, chasser les feuilles qui tombent déjà sur le site.

## Manière de travailler (rappels pratiques)

- **Voir le site** : `npm run dev` dans ce dossier (ou la configuration « site » de `.claude/launch.json`), puis http://localhost:4321 (la barre d'outils Astro est désactivée). Astro 7 n'accepte qu'un serveur de dev à la fois : `npx astro dev stop` arrête l'ancien.
- **Git** : git de GitHub Desktop (voir `CLAUDE.md`), commit et push à chaque modification, **toujours `[skip ci]` à la fin du message** pour ne pas déclencher de déploiement Netlify (15 crédits par déploiement, 300 par mois). Un seul commit sans `[skip ci]` pour publier, uniquement sur demande de Claudiu.
- **Netlify** : projet `lindadenise` branché sur GitHub (adresse `lindadenise.netlify.app`). La version en ligne est celle du 2026-10-10 (commit sans `[skip ci]`). L'ancien projet `lindadenise-ancien` est supprimé.
- **Catalogue** : titres, rubriques et traductions des dessins dans `scripts/preparer-dessins.mjs` (`npm run dessins`). Les originaux restent sur le Bureau de Claudiu (`~/Desktop/DessinsLinda`), jamais dans git.
- **Étiquette git** `v1-ecureuil` : ancienne version avec l'écureuil Noisette, au cas où.
- Le dépôt est public (choix assumé) : rien de personnel dedans.
