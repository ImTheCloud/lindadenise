# Avancement du projet (à lire en début de conversation, à mettre à jour en fin de session)

Dernière mise à jour : 2026-10-11 (mission Tilleul terminée, non publiée : voir la section « Mission Tilleul » juste en dessous ; mission Toiles terminée avant). Les règles et la stack sont dans `CLAUDE.md`, le cahier des charges dans `docs/brief.md`, la liste de fin de projet dans `docs/checklist-fin-de-projet.md`. Les infos personnelles et le statut légal de Linda sont dans `docs/prive/suivi-client.md` (non versionné). **Avant d'écrire un email à Linda** : lire `docs/prive/emails-linda.md` (non versionné) : règles (court, jamais de question à Linda : les poser à Claudiu, jamais parler de la suite, aucun mot technique), heures déjà annoncées, ce qu'elle sait déjà, emails envoyés.

## Mission Tilleul : fluidité, clics, marche et vraie page de jeu (2026-10-11, non publiée)

Consigne complète : `docs/prive/prompt-tilleul.md`. Quatre phases, un commit `[skip ci]` à la fin de chacune.

- **Phase 1 : faite** (diagnostic chiffré, images de référence, tests des bugs).
- **Phase 2 : faite** (moteur et clics refaits, dessin inchangé).
- **Phase 3 : faite** (vraie page de jeu : arbre, étang, feuilles, papillons, mini-jeu).
- **Phase 4 : faite** (accueil, reste du site, téléphone, mouvement réduit, documentation).

Démarrage : le Mac reste éveillé (accordé). **Remote Control a été refusé par le mode automatique** : la session a continué sans. Serveur de dev ouvert au Wi-Fi (configuration `site-wifi` de `.claude/launch.json`, `astro dev --host`) : http://192.168.129.13:4321/ et http://192.168.129.13:4321/jouer/ (pare-feu du Mac désactivé, réponse vérifiée depuis l'adresse Wi-Fi).

### Phase 1 : diagnostic (moteur d'avant la refonte)

**Images de référence** (hors dépôt, dans le dossier de travail de la session) : 28 images rendues dans Chrome sans écran en temps virtuel (pas de 1/120 s, hasard fixé, clignements et coups d'œil coupés), moteur chargé tel quel : assis, debout, couché, dort, étire (2 instants), toilette (4 instants), bâille, cœurs (2 instants), tête vers la gauche / la droite / le haut, marche (4 instants du pas), demi-tour à 0 / 25 / 50 / 75 / 100 %, guette, bond (2 instants). Deux rendus successifs sont identiques au pixel près. **Seuil retenu** : un pixel est « visible » si un canal diffère de plus de 24 sur 255 ; une image est identique si elle a au plus 40 pixels visibles (sur 1600 × 560).

**Mesures** (version construite, Chrome sans écran ; ordinateur 1440 × 900 ; téléphone simulé 390 × 844, densité 3, processeur ralenti 4× ; ordre « marcher » toutes les 3 s ; visiteur déjà venu, sans bulle) :

| Page | Appareil | Images/s | 95e centile | > 33 ms | Tâches longues | Script du chat par image (moy. / 95e) | Mises en page forcées par image |
|---|---|---|---|---|---|---|---|
| Accueil | ordinateur | 60 | 16,7 ms | 0 | 0 | 1,55 / 2,1 ms | 0,85 |
| Accueil | téléphone | 58,6 | 16,7 ms | 1 | 0 | 4,2 / 5,3 ms | 1,7 |
| Jouer | ordinateur | 60 | 16,8 ms | 0 | 0 | 1,35 / 1,9 ms | 0 |
| Jouer | téléphone | 60 | 16,7 ms | 0 | 0 | 3,6 / 4,8 ms | 0,88 |

Première visite (bulle de bienvenue ouverte) : script 2,4 ms (ordinateur) et 4,1 ms (téléphone), **1,9 mise en page forcée par image** à l'accueil. Par image, côté navigateur (téléphone simulé) : analyse du HTML du chat 0,7 à 0,8 ms, recalcul de style 0,7 à 1 ms, mise en page 0,3 ms, peinture 0,6 ms, préparation 0,4 ms. Chrome sans écran tient 60 images/s, mais il ne montre pas le coût du dessin sur la carte graphique d'un vrai téléphone, ni le ralentissement réel d'un petit processeur (le ralentissement 4× est imprécis sur des tâches aussi courtes) : sur un vrai téléphone, ces 7 à 8 ms par image deviennent 20 ms et plus, d'où les saccades.

**Tests des bugs** (Chrome sans écran, temps réel) :

| Test | Ordinateur | Téléphone |
|---|---|---|
| « Marcher » sur `/jouer/`, première visite (bulle de bienvenue ouverte) | **échec : 0 px** | **échec : 0 px** |
| « Marcher » sur `/jouer/`, déjà venu | 515 px | **échec : 36 px** (promenades de 12 à 30 % de l'écran) |
| Toucher le chat 5 fois | 5/5, 3 à 15 ms | 5/5, 42 ms |
| « Lâcher une feuille » | **échec : jamais attrapée** (il a marché 1 062 px) | attrapée |
| « Se coucher » | 300 ms | 374 ms |

**Causes** (vérifiées dans le code et par les chiffres) :
- Confirmé : `chat.ts` réécrit tout le dessin à chaque image (`innerHTML`) : analyse HTML, recalcul de style de centaines de nœuds neufs et déchets mémoire à chaque image.
- Confirmé : lectures de mise en page dans la boucle, juste après des écritures : `Mascotte.astro` (`offsetWidth` / `offsetHeight` de la bulle et de l'invitation dans `placer()`), `decor.ts` (`getBoundingClientRect` de l'étang à chaque image, des lotus et des feuilles, `getComputedStyle` des feuilles) : 0,85 à 1,9 mise en page forcée par image.
- Confirmé : une bulle ouverte (`retenu`) arrête toute marche, même un ordre donné par le bouton : la bienvenue de la première visite et chaque anecdote bloquent « Marcher ».
- Confirmé : sur téléphone, « Marcher » ne fait qu'un petit pas (12 à 30 % de la largeur).
- Confirmé : « Lâcher une feuille » ne vérifie pas que la chasse est possible ; sur grand écran, la feuille est trop loin ou déjà trop basse quand il arrive, et rien ne le dit.
- Non reproduit dans Chrome : la caresse perdue (le moteur réagit au `pointerdown`, sur un nœud qui existe encore à cet instant). Risque réel sur Safari : le nœud touché est remplacé avant la fin du geste, et un `click` n'arrive jamais. La refonte le supprime de toute façon (zone de contact stable).
- Pas de temps : `dt` plafonné à 1/30 s et redessin à 15 images/s endormi, sans à-coup mesuré ; le décalage de l'étang appliqué par `transform` à chaque image reste lié à une lecture de mise en page (voir plus haut).

### Phase 2 : nouveau moteur (dessin inchangé)

**Ce qui a changé** :
- **Rendu** : le dessin est décrit à chaque image puis reporté sur des éléments SVG créés une seule fois (`peindre()` dans `chat.ts`) : seuls les attributs qui ont changé sont réécrits, chaque élément garde sa place (une place vide garde le rang des suivantes, chaque patte a son groupe nommé et se déplace sans être recréée). Plus aucun `innerHTML` dans la boucle. Masques et découpes de `<defs>` inchangés (attributs écrits seulement s'ils changent).
- **Boucle** : le mouvement avance par pas fixes de 1/120 s (`pas()`), le dessin (`dessiner()`) est fait une fois par image, entre les deux derniers pas, au temps exact de l'écran (`melanger()`). Après un ralentissement, au plus 0,1 s est rattrapé ; après un onglet caché, rien. Endormi : 15 images/s. Onglet caché ou bande hors de l'écran (accueil défilé) : arrêt complet (`veille()`, observée par `IntersectionObserver`).
- **Décor** (`decor.ts`, `lireDecor()`) : générique, repères `[data-decor]` (scène), `.etang` / `.flotte` (lotus), `.feuille`, `[data-tilleul-rail]`. Positions relevées au chargement, au redimensionnement (`ResizeObserver`) et au défilement ; feuilles qui tombent relevées au plus toutes les 200 ms, chute prolongée entre deux relevés. Le chat ne lit plus jamais la mise en page.
- **Accueil** : la bande du chat est posée dans un rail au bord de l'étang (`position: sticky`, `overflow: clip` sur `.heros`) : collée au bas de l'écran puis elle monte avec l'étang, défilée par le navigateur lui-même (plus de `transform` recalculé à chaque image, donc plus de retard sur le défilement). Sans `overflow: clip` (Safari avant 16), elle reste au bord de l'étang.
- **Toucher** : une zone stable (le bouton `.mascotte__corps`, invisible, au moins 44 px, qui suit le corps et la tête par `transform`) reçoit `pointerdown` / `pointerup` (appui bref sans glisser = caresse) et le clavier (`click` sans pointeur). Pas de double déclenchement, le doigt peut toujours faire défiler la page (`touch-action: manipulation`). Bulle et invitation placées par `transform` avec des tailles relevées par `ResizeObserver` (plus de lecture à chaque image).
- **Ordres** (`ordre(o, { x, vite })`, événement `tilleul-ordre` : un nom ou `{ ordre, x, vite }`) : un ordre du visiteur passe avant le pilote automatique et la bulle ; sur la page de jeu, la bulle ne retient jamais le chat. Ordre donné en plein bond : suivi à l'atterrissage. Ordre impossible (rien à chasser, pas d'étang) : petit miaou, tête vers le visiteur (vers le bouton touché). Nouveaux ordres : `viens` (aller à un endroit), `etang` (regarder un lotus). « Marcher » sur la page de jeu : vers l'autre côté de l'écran. **Trot** (`vite`) : même mécanique de pas, foulée et cadence plus grandes (125 unités/s, cycle 100, appui 50 %, pied levé 16) ; sur la page de jeu, il trotte vers une feuille lointaine.
- Retiré : le tracé du plastron crème, appelé avec une mesure manquante, n'a jamais été dessiné (tracé vide) : supprimé pour garder le dessin validé (voir « À valider »).
- Vidéos : `scene.html` adaptée (décor sans `decalage`) ; `node scripts/video/rendu.mjs fr h essai 27` rend bien l'image (chat dessiné).

**Comparaison avec les références** : avec un pas exact (1/128 s pour les deux moteurs, plus une première image d'1 ms), **26 images sur 28 identiques au pixel près**. Les deux autres ne diffèrent que par la position de la queue : « étire » (49 pixels, l'ancien moteur calculait sa toute première image avec un temps nul, ce qui amortissait la queue une fois de trop) et « dort » (l'ancien moteur calculait le sommeil par pas de 1/15 s). Au pas réel de 1/120 s : 22 sur 28 identiques, les autres sont les mêmes poses à un instant décalé par les arrondis.

**Mesures après** (mêmes conditions que la phase 1, visiteur déjà venu) :

| Page | Appareil | Images/s | 95e centile | > 33 ms | Tâches longues | Script du chat (moy. / 95e) | Mises en page forcées |
|---|---|---|---|---|---|---|---|
| Accueil | ordinateur | 60 | 16,7 ms | 0 | 0 | 1,5 / 2,4 ms (avant 1,55 / 2,1) | **0** (avant 0,85) |
| Accueil | téléphone | 60 | 16,8 ms | 0 | 0 | **1,8 / 2,7 ms** (avant 4,2 / 5,3) | **0** (avant 1,7) |
| Jouer | ordinateur | 60 | 16,8 ms | 0 | 0 | 1,1 / 1,6 ms (avant 1,35 / 1,9) | 0 |
| Jouer | téléphone | 60 | 16,8 ms | 0 | 0 | **1,6 / 2,4 ms** (avant 3,6 / 4,8) | **0** (avant 0,88) |

Première visite (bulle ouverte) : 0 mise en page forcée (avant 1,9). Travail du navigateur par image (téléphone simulé, accueil) : analyse HTML 0 (avant 0,73 ms), style 0,47 ms (avant 0,88), mise en page 0,2 ms, peinture 0,49 ms : environ 3,6 ms par image au lieu de 7,5.

**Tests** : 10 sur 10. Ordinateur : « Marcher » bulle ouverte 523 px (avant 0), déjà venu 519 px, toucher 5/5 en 4 à 13 ms, feuille attrapée (avant jamais), se coucher 304 ms. Téléphone : 250 px (avant 0), 238 px (avant 36), toucher 5/5 en 41 à 44 ms, feuille attrapée, se coucher 411 ms.

### Phase 3 : la vraie page de jeu (`/jouer/`, `/nl/spelen/`)

**Comment elle est faite** (`src/components/pages/PageJeu.astro`, `src/components/Arbre.astro`) :
- **Scène** d'un écran de haut : grand tilleul dessiné (`Arbre.astro` : couronne de boules au contour unique, reflets, fleurs crème, feuilles de tilleul au bord, tronc qui descend jusqu'à l'étang ; en haut sur téléphone, à gauche sur grand écran), panneau blanc au milieu, vrai étang (`Etang.astro`) en bas avec une bordure d'herbe dessinée. Tilleul vit au bord de l'étang comme à l'accueil (même rail, même décor `[data-decor]`).
- **Boutons** (grille de 3, grands, icône dessinée + un ou deux mots) : Marcher, S'asseoir, Se coucher, Dormir, S'étirer, Toilette, Une feuille, Un papillon, L'étang, puis « Attraper les feuilles ». Le bouton de ce que fait Tilleul est allumé (`aria-pressed`, lu sur `chat.action`). Un ordre impossible est dit gentiment sous les boutons (« Cette feuille tombe trop loin pour Tilleul. »…), le message s'efface seul.
- **Toucher l'herbe** (bande du bas, `.jeu__sol`) : Tilleul vient à cet endroit (ordre `viens`), une petite trace de patte montre l'endroit. Au clavier, pendant le mini-jeu : flèches gauche et droite.
- **Feuilles et papillons** : éléments posés une fois et déplacés par `transform` (aucune lecture de mise en page), dans une couche qui passe devant le panneau sans gêner les doigts. « Une feuille » : une feuille sort de la couronne et tombe lentement ; Tilleul la guette (au trot si elle est loin) et bondit ; une feuille qui touche l'eau fait un rond dans l'eau. « Un papillon » : il sort de l'arbre, volette, puis descend jouer à portée de Tilleul, qui se tapit et bondit : le papillon s'envole aussitôt, jamais touché. Un papillon passe aussi tout seul de temps en temps (toutes les 25 à 40 s). Tilleul suit des yeux la feuille la plus basse, sinon un papillon.
- **Partage** avec le chat : `src/components/tilleul/lien.ts` (le chat, ses repères, les feuilles et papillons que la page lui montre). L'ancien événement `tilleul-ordre` est supprimé. Forme de la feuille partagée : `src/components/tilleul/formes.ts` (aussi pour `Feuilles.astro`).
- **Mini-jeu « Attraper les feuilles »** : 30 secondes ; des feuilles tombent de la couronne, de plus en plus souvent (une toutes les 2,1 s au début, 1,1 s à la fin) et un peu plus vite. Le visiteur touche l'herbe : Tilleul y trotte (pilote automatique coupé pendant la partie). Une feuille qui arrive sur Tilleul = 1 point (petit bond, deux cœurs) ; une feuille qui touche l'eau est perdue. Score, secondes et record en grand ; record gardé sur l'appareil (`localStorage`, clé `tilleul-record`, repli sans stockage : gardé le temps de la visite). Fin : « Bravo ! Tilleul a attrapé 7 feuilles. C'est votre meilleur score. », boutons « Rejouer » et « Revenir ». Aucun son.
- **Mouvement réduit** (choix) : seuls les boutons de pose restent (s'asseoir, se coucher, dormir, s'étirer, toilette) ; Tilleul change de pose en une seule image ; ni feuille ni papillon ; le mini-jeu est remplacé par une phrase : « Les animations sont réduites sur cet appareil : Tilleul change de pose sans bouger. »

**Vérifié** : 9 tests sur 9, ordinateur et téléphone simulé (marcher avec ou sans bulle, toucher le chat, une feuille attrapée, un papillon guetté puis bondi avec son bouton allumé, l'étang, toucher l'herbe : arrivé à 33 px de l'endroit, mini-jeu complet joué par un joueur automatique : 10 feuilles sur ordinateur, 7 sur téléphone, record enregistré, se coucher). Pendant le mini-jeu avec un papillon : 60 images/s sur ordinateur et téléphone simulé, 95e centile 16,8 ms, 0 tâche longue, 0 mise en page forcée, script de toutes les animations 0,7 à 0,9 ms en moyenne par appel. Mouvement réduit : 5 boutons, aucune animation, aucune erreur (FR et NL). **Lighthouse mobile** (version construite) : `/jouer/` et `/nl/spelen/` 99 / 100 / 100 / 100, CLS 0.

### Phase 4 : accueil et reste du site

- **Partout, discret** : quand l'étang n'est pas à l'écran (autres pages, accueil défilé), Tilleul reste sur place et chaque pose dure trois fois plus longtemps. Il ne se promène qu'à l'accueil (devant l'étang) et sur la page de jeu. Il ne parle qu'à la première visite puis quand on le touche ; « Laisser Tilleul dormir » inchangé.
- **Il s'efface** (glisse sous le bord de l'écran, sans clic possible) pendant qu'on écrit dans un formulaire (sur téléphone, le clavier le poussait sur le champ) et quand le menu du téléphone est ouvert ; il revient ensuite.
- **Page Toiles** : quand la barre de sélection est affichée sous lui (téléphone), il monte s'asseoir dessus ; le bouton « Demander ces toiles » reste entièrement libre (vérifié). Repère : `data-tilleul-appui` sur la barre. Les fenêtres plein écran (zoom d'un dessin, fiche d'une toile) passent au-dessus de lui.
- **Accueil** : la bande colle à l'étang par le navigateur (voir phase 2) ; la position de la page n'est relue que quand le défilement s'arrête : **0 mise en page forcée pendant un défilement au doigt** (avant : 0,84 sur ordinateur, 1,66 sur téléphone simulé). Étang hors de l'écran : le chat ne travaille plus ; onglet caché : arrêt complet.
- **Téléphone** : zone à toucher 80 × 112 px (au moins 44 px), le doigt fait défiler la page même posé sur le chat (sauf sur la bande d'herbe de la page de jeu) ; sur l'accueil il se pose sur le collage, sans couvrir les boutons (vérifié en 390 × 844 et 375 × 667).
- **Mouvement réduit** : assis, une seule image, sans erreur, sur l'accueil, les dessins, les toiles, le contact, À propos, en FR et NL (vérifié).
- Réglage de la chasse : il bondit sans finir son affût si la feuille arrive près du sol ; la feuille lâchée sur la page de jeu tombe plutôt de son côté (8 feuilles sur 8 attrapées en essai).

**Lighthouse mobile final** (version construite, servie compressée comme chez Netlify) : accueil 99 / 100 / 100 / 100 (FR et NL), `/jouer/` et `/nl/spelen/` 100 / 100 / 100 / 100, `/toiles/` et `/nl/doeken/` 100 / 100 / 100 / 100 ; CLS 0 partout (avant la mission : 0,014 à 0,018).

### Résumé : avant / après (Chrome sans écran, téléphone simulé 390 × 844, processeur ralenti 4×)

| | Avant | Après |
|---|---|---|
| Script du chat par image, accueil | 4,2 ms (95e : 5,3) | 1,4 ms (95e : 2,2) |
| Mises en page forcées par image (accueil, bulle ouverte) | 1,9 | 0 |
| Mises en page forcées en défilant | 1,66 | 0 |
| Analyse HTML par image | 0,73 ms | 0 |
| Travail du navigateur par image (style, mise en page, peinture) | environ 3,4 ms | environ 1,2 ms |
| Images de plus de 33 ms en défilant | 1 | 0 |
| « Marcher » avec la bulle ouverte | 0 px | 236 à 520 px |
| Feuille lâchée (ordinateur) | jamais attrapée | attrapée (8 sur 8) |

Ordinateur, toutes pages : 60 images/s, 95e centile 16,8 ms, aucune tâche longue, script du chat 1,1 à 1,6 ms. Pendant le mini-jeu : 60 images/s, aucune tâche longue, aucune mise en page forcée.

**Outils de mesure** (hors dépôt, dans le dossier de travail de la session, à refaire si besoin) : images de référence en temps virtuel et comparaison au pixel, mesures de fluidité par trace Chrome, tests des ordres et du mini-jeu par Chrome sans écran.

### À tester par Claudiu (téléphone, http://192.168.129.13:4321/ avec `npm run dev -- --host`, ou la configuration « site-wifi »)

1. Accueil : défiler doucement puis vite ; Tilleul monte avec l'étang, sans à-coup ni retard.
2. Toucher Tilleul plusieurs fois (et glisser le doigt sur lui : la page doit défiler).
3. `/jouer/` : toucher l'herbe à gauche puis à droite ; « Un papillon » ; « Une feuille ».
4. `/jouer/` : une partie d'« Attraper les feuilles » (le record reste après rechargement).
5. `/toiles/` : choisir deux toiles (Tilleul sur la barre) ; `/contact/` : écrire dans un champ (Tilleul s'efface).

### À valider (mission Tilleul)

- Nom du mini-jeu : « Attraper les feuilles » (à l'infinitif comme les autres boutons, pour garder le vouvoiement), « Blaadjes vangen » en néerlandais. Bouton de retour : « Revenir » / « Terug ».
- Difficulté du mini-jeu (30 s, une feuille toutes les 2,1 s puis 1,1 s) : environ 7 à 10 feuilles attrapées par un joueur rapide. À ajuster après essai par Claudiu.
- Le papillon qu'on appelle descend toujours jouer près de Tilleul (pour que le bond arrive) ; les papillons qui passent seuls restent en haut et ne sont pas chassés.

- **Plastron crème** : le code prévoyait une tache crème sur le poitrail, jamais affichée (erreur de mesure). Retirée pour garder le dessin validé. Si Claudiu la veut, c'est une ligne à remettre (ovale de 20 × 20 sous le cou) : à regarder ensemble avant.
- Zone à toucher : un rectangle aux coins arrondis autour du corps et de la tête (pas la queue), d'au moins 44 px. Toucher juste à côté du chat, dans ce rectangle, compte comme une caresse.
- Sur Safari avant la version 16 (sans `overflow: clip`), le chat de l'accueil reste au bord de l'étang au lieu de coller au bas de l'écran quand l'étang est plus bas que l'écran.
- Pendant qu'on écrit dans un formulaire ou que le menu du téléphone est ouvert, Tilleul s'efface complètement (il revient ensuite).
- Sur les autres pages, une pose dure 18 à 30 s (assis) au lieu de 6 à 10 s.
- Sur la page de jeu, la bande d'herbe du bas ne fait pas défiler la page au doigt (elle sert à appeler Tilleul) ; la page tient dans un écran de téléphone courant.
- Mesures faites dans Chrome sans écran : elles ne remplacent pas un essai sur un vrai téléphone (surtout iPhone, et un Android modeste).

## Mission Toiles (2026-10-11, non publiée)

Consigne complète : `docs/prive/prompt-toiles.md`. Trois phases, un commit `[skip ci]` à la fin de chacune.

- **Phase 1 : faite** (doublons, photos redressées, page Toiles FR + NL, menu, sélection de lot, vue « à l'échelle »).
- **Phase 2 : faite** (option toile sur les 76 fiches, licence et conditions, formulaire, documentation).
- **Phase 3 : faite** (vidéos motion design FR + NL, musique, intégration, documentation finale).

**À regarder en premier (Claudiu)** : la page `/toiles/` sur téléphone (mur, fiche, « Voir à l'échelle », sélection), les deux films (accueil et page Toiles, avec le son), puis la liste « À valider » ci-dessous (frais d'envoi 12 €, titres NL, phrase sur la suppression des messages). Vérifié aussi en mode « réduire les animations » : toiles affichées tout de suite, aucun reflet, aucune vidéo chargée.

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
- Reproductibilité vérifiée le 2026-10-11 : `node scripts/video/vraies-toiles.mjs` et `npm run toiles`, relancés depuis le dépôt, redonnent exactement les fichiers livrés (aucune différence dans git).

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

> Moteur, toucher, ordres, décor et page de jeu ont été refaits le 2026-10-11 (section « Mission Tilleul » en haut de ce fichier). Ce qui suit reste vrai pour le dessin ; pour le fonctionnement, la mission Tilleul fait foi.

Souhait de Claudiu : un chat « ultra beau, stylé, qui fait des choses », qui se déplace. La performance n'est plus une contrainte. Rive et Spine écartés (export payant, fichiers que Claude ne peut pas modifier). Choix : animation calculée en direct, SVG redessiné à chaque image. **Le site publié garde l'ancien Tilleul** jusqu'à la prochaine publication (sur demande de Claudiu seulement). La page d'essai, le banc d'essai et le dossier `essais/` sont supprimés.

**Où est le code** : `src/components/tilleul/chat.ts` (le moteur), `src/components/tilleul/decor.ts` (le décor gardé en mémoire), `src/components/tilleul/lien.ts` (ce que la page de jeu partage avec le chat), `src/components/Mascotte.astro` (bulle, silence, textes, invitation « Touchez-moi ! », bouton invisible pour le clavier). Textes dans `src/i18n` (FR et NL).

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
- Les feuilles de l'accueil sont animées en CSS : `decor.ts` relève leur position au plus toutes les 200 ms et prolonge leur chute entre deux relevés ; celles de la page de jeu sont déplacées par la page, qui les donne au chat (`lien.ts`).

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
