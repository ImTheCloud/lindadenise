# Avancement du projet (à lire en début de conversation, à mettre à jour en fin de session)

Dernière mise à jour : 2026-10-11 (mission Toiles terminée, non publiée : voir la section « Mission Toiles » juste en dessous). Les règles et la stack sont dans `CLAUDE.md`, le cahier des charges dans `docs/brief.md`, la liste de fin de projet dans `docs/checklist-fin-de-projet.md`. Les infos personnelles et le statut légal de Linda sont dans `docs/prive/suivi-client.md` (non versionné). **Avant d'écrire un email à Linda** : lire `docs/prive/emails-linda.md` (non versionné) : règles (court, jamais de question à Linda : les poser à Claudiu, jamais parler de la suite, aucun mot technique), heures déjà annoncées, ce qu'elle sait déjà, emails envoyés.

## Mission Toiles (2026-10-11, non publiée)

Consigne complète : `docs/prive/prompt-toiles.md`. Trois phases, un commit `[skip ci]` à la fin de chacune.

- **Phase 1 : faite** (doublons, photos redressées, page Toiles FR + NL, menu, sélection de lot, vue « à l'échelle »).
- **Phase 2 : faite** (option toile sur les 76 fiches, licence et conditions, formulaire, documentation).
- **Phase 3 : faite** (vidéos motion design FR + NL, musique, intégration, documentation finale).

Démarrage : Remote Control activé. Le maintien du Mac éveillé (`request_keep_awake`) a été refusé par le mode automatique : la mission a continué sans.

**Où est le code** : page `src/components/pages/PageToiles.astro` (`/toiles/`, `/nl/doeken/`), textes `toiles` dans `src/i18n/fr.ts` et `nl.ts`, prix et remises dans `src/data/vente.ts` (prix 200 €, envoi 12 €, envoi offert dès 2, remises, délai des toiles sur commande), données `src/data/toiles.json`, images `public/toiles/` (AVIF + WebP en 400, 800 et 1000 px, JPEG 800 de repli), script `scripts/preparer-toiles.mjs` (`npm run toiles`, lit `~/Downloads`). Titres, traductions, descriptions et coins des photos se changent dans le script. **« vendue »** se change à la main dans `src/data/toiles.json` (le script garde la valeur).

**La page** : mur de galerie dessiné (enduit, lumière du haut, clou, ombres, bord aluminium, cartel sous chaque toile avec titre et prix), hauteurs et pentes légèrement différentes, relief et reflet qui suivent la souris ou le doigt (rien en mouvement réduit). Téléphone : une toile par écran, le défilement s'arrête doucement sur chacune. Clic : fiche plein écran (précédent / suivant, flèches du clavier, glisser du doigt, Échap), adresse `/toiles/#id` (les fiches des dessins y renvoient). « Voir à l'échelle » : la toile A3 dans un salon dessiné en centimètres (canapé, plante, règle de 50 cm, cotes 29,7 et 42 cm). Sélection : case dans la fiche, barre fixe en bas (nombre, remise, envoi, total, « Demander ces toiles »), gardée le temps de la visite (`sessionStorage`). Toile vendue : grisée, rond « Vendue ». Calculs vérifiés : 1 toile 212 €, 2 → 360 €, 3 → 480 €, 5 → 800 €.

**Photos** : les coins ont été trouvés par ordinateur (OpenCV, hors dépôt) puis vérifiés sur planche contact ; 4 photos corrigées à la main (Frangipanier et Iris posés contre un mur beige, Bouleaux en hiver, Timé gambade). Trois photos étaient prises couchées (Bois de Hal, Chat à l'île de Bréhat, Fleurs bleues) : remises droites (signature « LB » en bas à droite). Plusieurs photos coupent déjà un bord de la toile : on garde ce qui est visible, recadré au ratio A3 sans déformation. Correction des blancs limitée à +10 %.

**Phase 2** :
- Chaque fiche de dessin a une section « Ce dessin en toile » (lien « Aussi en toile » sous le bouton). Si une toile de ce dessin est disponible : « Déjà imprimée en toile : disponible tout de suite, 200 € + envoi » et lien vers sa fiche. Sinon : toile sur commande (impression sur aluminium, A3, même prix, mêmes frais, mêmes remises), « délai communiqué par Linda à la demande » tant que `DELAI_TOILE_SUR_COMMANDE` (dans `src/data/vente.ts`) est vide, bouton vers le formulaire (sujet « Toile sur commande »). Le crochet n'est **pas** promis pour les toiles sur commande. Phrase sur chaque fiche : le fichier s'imprime sur papier, une toile ne se fait que par Linda.
- Licence : « impression grand format » et « encadrer » remplacés par « imprimer sur papier pour votre usage privé, et encadrer cette impression » ; interdits ajoutés : impression sur toile, aluminium, Dibond, canevas, verre, bois ou tout support rigide, revente de reproductions ; phrase « Vous souhaitez une toile ? Elle est faite par Linda : demandez-la sur la page Toiles. » Même règle dans « Comment recevoir un dessin ? », « Ce que vous recevez » (accueil) et la case du formulaire.
- Nouvelle page **Conditions de vente des toiles** (`/conditions-toiles/`, `/nl/verkoopvoorwaarden-doeken/`, lien dans le pied de page, la page Toiles et le formulaire) : pièce unique, prix et remises (tirés de `vente.ts`), pas de paiement sur le site, Belgique uniquement, emballage par Linda, transporteur de son choix et détails par e-mail, « Les conditions de retour seront précisées avant tout paiement. », droit d'auteur. Aucune règle de retour, rétractation ou garantie inventée.
- Confidentialité : adresse de livraison (seulement pour une toile), durée (« le temps de traiter votre demande et l'envoi, puis supprimées »), stockage chez Netlify (États-Unis), sélection gardée dans le navigateur le temps de la visite. Mentions légales inchangées.
- Formulaire `contact` : liste « Votre demande » (question, dessin numérique, toile, toile sur commande, exposition ou dépôt), toiles à cocher (pré-cochées depuis la sélection), total calculé, adresse de livraison obligatoire pour une toile (code postal belge à 4 chiffres ; « Un autre pays » bloque l'envoi avec « Les toiles sont livrées uniquement en Belgique. »), case des conditions de vente pour une toile, message pré-écrit selon le sujet (jamais par-dessus ce que le visiteur a écrit). Liens : `?toiles=a,b`, `?sujet=toile-commande&dessin=id`, `?sujet=exposition`, `?dessin=id`. Envoi en arrière-plan inchangé, repli vers Merci. Merci : « pas d'e-mail automatique, la réponse vient de Linda ». Testé (envoi simulé, rien n'est parti) : 3 toiles → « 480 € (3 toiles · remise −20 % · envoi offert) ».

**Phase 3 (vidéos)** :
- **Les deux vidéos de Linda** regardées image par image : la nouvelle (WhatsApp du 2026-10-10, 117 s) est meilleure que l'ancienne `impressions.mp4` (71 s) : toiles montrées une par une, plus près, fond calme (mur beige, canapé), moins de tremblements ; l'ancienne montre des toiles posées au sol au milieu d'objets (peluches, plantes, câbles) et bouge beaucoup. Son de la nouvelle : seulement des bruits de manipulation, retiré. **Décision** : l'ancienne est supprimée ; la nouvelle est coupée en `public/video/vraies-toiles.mp4` (49 s, 8 Mo, sans son) : pour chacune des 23 toiles, le passage le plus net et le plus stable (repéré par ordinateur), 2,5 s chacun, fondus doux. Elle est sur la page Toiles (« Les vraies toiles, filmées une à une »).
- **Motion design** (fait par code, outils gratuits) : scène SVG animée (mur de galerie, toiles qui se peignent au pinceau, se balancent sur leur clou et reçoivent un reflet, grands coups de pinceau entre les scènes, feuilles de tilleul, poussières de lumière, étang et lotus, titres écrits lettre à lettre, sous-titres incrustés), avec **le vrai Tilleul du site** (moteur `chat.ts` inchangé, piloté par ses ordres habituels) qui arrive au bord de l'étang et regarde la toile. Rendue image par image dans Chrome, assemblée avec ffmpeg en H.264 1080p. Pas de voix.
  - `toiles-fr.mp4` / `toiles-nl.mp4` : 39 s, 16:9, 7,7 Mo, page Toiles (« Les toiles en musique »). Titre, « Des dessins faits au doigt, imprimés sur aluminium », « Format A3, 29,7 × 42 cm. Chaque toile est unique », l'histoire d'Ostende (les trois phrases validées), Tilleul, le prix (200 €, livraison en Belgique, remises de lot), fin.
  - `toiles-court-fr.mp4` / `toiles-court-nl.mp4` : 20 s, 9:16, 4,8 Mo, accueil (section « Aussi en grand format », texte mis à jour : 23 dessins sur aluminium A3, pièces uniques, bouton « Voir les toiles ») et réseaux.
  - **Musique originale** composée et synthétisée par code (numpy, aucune bibliothèque sous licence) : marimba, piano doux, cordes pincées, nappe ; fa majeur, 76 BPM, grille fa – ré mineur – si bémol – do ; fondus d'entrée et de sortie ; réverbération et aigus adoucis ; son normalisé à −16 LUFS (crête −1,5 dB).
- **Sur le site** (`src/components/Video.astro`) : affiche AVIF (repli WebP), la vidéo ne se charge qu'au clic (rien avant), lecture avec le son (le clic du visiteur), bouton « Couper le son » / « Remettre le son », sous-titres incrustés, jamais de lecture automatique.
- **Refaire les vidéos** (si un texte, le prix ou les remises changent) : sources dans `scripts/video/` (`scene.html`, `rendu.mjs`, `musique.py`, `assembler.py`, `vraies-toiles.mjs`), mode d'emploi en tête de `rendu.mjs`. Il faut Chrome, ffmpeg, python3 avec numpy et `npm i --no-save puppeteer-core`. Rendu : environ 4 minutes par vidéo.
- **Lighthouse** (version construite, mobile, 2026-10-11) : page Toiles FR et NL 97 / 100 / 100 / 100, accueil 99 / 100 / 100 / 100, fiche d'un dessin 99 / 100 / 100 / 100, contact 99 / 100 / 100 / 100. Deux corrections pour y arriver : les polices Gochi Hand et Itim sont préchargées dans `Base.astro` (le haut de la page Toiles changeait de hauteur quand elles arrivaient, et poussait le mur), et le dessin de Tilleul a sa hauteur (280 px) dès le premier affichage dans `Mascotte.astro` (CSS seulement, moteur inchangé).
- En fin de mission, macOS a refusé l'accès à `~/Downloads` à cette session : `vraies-toiles.mjs` n'a pas pu être relancé depuis le dépôt (la vidéo a été faite avec les mêmes réglages, en deux passes, juste avant).

### Toiles et dessins du site (comparaison du 2026-10-11)

Méthode : comparaison automatique (points communs OpenCV ORB + RANSAC, hors dépôt) avec les 80 originaux de `~/Desktop/DessinsLinda`, puis vérification à l'œil côte à côte. Une vraie correspondance donne plus de 1 200 points communs ; sans correspondance, jamais plus de 24.

| Toile | Dessin du site | Certitude |
|---|---|---|
| Bois de Hal | Jacinthe sauvage dans le bois | certaine (1 628 points) |
| Bouleaux en hiver | Bouleaux en hiver | certaine (1 245) |
| Chat à l'île de Bréhat | Chats en Bretagne | certaine (1 296) |
| Chats camouflés | Rêve de chats québécois en hiver | certaine (1 353, le titre est écrit sur la toile) |
| Frangipanier | Frangipanier | certaine (1 971) |
| Iris | Iris bleus | certaine (1 746) |
| Le tournesol | Tournesol | certaine (1 818) |
| Sweet | Coucou | certaine (1 395) |
| Tournesols | Prélude à Amsterdam | certaine (1 824) |
| Vieux cerisier | Arbre à Saint-Brieuc | certaine (1 917) |
| Narcisses | Joie de Pâques | certaine (1 305) |
| Chat au repos, Fleurs bleues, Jonquilles, L'oiseau, La clôture, Le chemin de forêt, Mauves, Montagne et tournesols, Printemps, Sous bois, Timé gambade, Timé s'amuse | aucun | certaine (24 points au plus) |

Les 11 toiles liées renvoient vers le dessin numérique, et la fiche du dessin propose « Déjà imprimée en toile ». Les 12 autres ne sont **pas** ajoutées au catalogue numérique (il faudrait l'accord de Linda et ses fichiers HD).

### Frais d'envoi (recherche du 2026-10-11)

Colis plat d'environ 30 × 42 cm bien emballé, jusqu'à 2 kg, en Belgique. Source principale : observatoire des prix de l'IBPT (régulateur belge), colis national de 2 kg livré à domicile, tarifs 2025 : PostNL 9,60 €, GLS 11,10 €, DPD 11,43 €, bpost Economy 11,60 €, UPS 11,64 €, Mondial Relay 13,39 €, bpost Standard 16,50 € (express exclus). **Moyenne : 12,18 €, arrondie à 12 €** (constante `FRAIS_ENVOI`). Pour comparaison, bpost en ligne avec un compte : 5,40 € à 6,95 € (blog Margeo, juillet 2026), et bpost annonce une hausse au 1er janvier 2027. Sources : https://bipt.be/operators/postal/observatory/price/parcel-up-to-2-kg , https://margeoapp.com/blog/vinted-belgique-frais-livraison . Le site dit seulement que le transporteur est choisi par Linda et que les détails arrivent par e-mail (rien sur la rapidité ni la marque).

### À valider (Claudiu)

- Frais d'envoi : 12 € (moyenne réelle) au lieu des 15 € attendus ; une ligne à changer dans `src/data/vente.ts` si besoin.
- Livraison offerte dès 2 toiles (valeur par défaut de la consigne).
- Titres NL : « Bois de Hal » traduit par son vrai nom néerlandais, **Hallerbos** ; « Jonquilles » → « Paasbloemen », « Mauves » → « Kaasjeskruid », « Sweet » reste « Sweet ». Le fichier « narcisses » est affiché avec une majuscule (« Narcisses »).
- Les descriptions des toiles (textes alternatifs) décrivent seulement ce qu'on voit sur la photo.
- Le bloc « Un mur pour mes toiles » est écrit à la première personne (Linda parle, comme sur la page À propos), signé « Linda ».
- Les 12 toiles sans dessin du site ne sont pas dans le catalogue numérique : à proposer à Linda (il faudrait ses fichiers HD).
- Le parquet, le canapé et la plante de la vue « à l'échelle » sont un décor dessiné ; seules les mesures de la toile (A3) et la règle de 50 cm sont exactes.
- Confidentialité : la page promet que les messages sont supprimés après traitement. Il faudra le faire (Netlify → Forms), ou changer la phrase.
- Délai des toiles sur commande : à renseigner dans `DELAI_TOILE_SUR_COMMANDE` (FR et NL) dès que Linda l'a donné.
- La page Conditions de vente ne dit rien des retours, de la rétractation ni de la garantie (Linda ne sait pas encore) : à compléter avant tout paiement.
- Vidéos : les regarder et les écouter en entier (FR et NL) ; la musique a été vérifiée par mesures (volume, spectre), pas à l'oreille. L'accord de Linda pour montrer ses toiles et Ostende dans les vidéos est à demander (voir ci-dessous).
- Le formulaire envoie maintenant le sujet en clair (« Une toile », etc.) et les champs `toiles`, `total`, `rue`, `code_postal`, `localite`, `pays`, `conditions_toile` : à vérifier dans Netlify au déploiement final.

### À poser à Linda (par Claudiu, jamais dans un e-mail de questions : voir `docs/prive/emails-linda.md`)

Épaisseur et poids d'une toile ; finition (mate ou brillante) ; type de crochet, et si les toiles faites sur commande en ont aussi un ; signature (au dos ou devant) ; transporteur choisi, délai d'expédition, assurance ; retours, rétractation, garantie ; statut de vendeur (particulier ou activité) et conditions légales de la vente à distance ; confirmation du tableau des correspondances ci-dessus ; si elle veut mettre les 23 toiles aussi en dessin numérique (alors fournir les originaux HD) ; délai et prix réels d'une toile sur commande, et à partir de combien de commandes elle en fait imprimer ; si elle veut proposer d'autres formats ; conditions d'un dépôt dans un lieu (commission, durée, assurance) et zones géographiques souhaitées pour les expositions ; accord pour montrer ses toiles et sa ville d'origine dans les vidéos.

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
