# Conformité légale du site : état des lieux et tâche de fin de projet

Question de Claudiu (2026-10-14) : le site peut-il être attaqué en justice, et respecte-t-il tout proprement sur le plan légal ?

**Cadre : le site est belge, il vend des dessins numériques (10 €) et des toiles (200 €) à des consommateurs, par échange avec Linda, sans paiement en ligne pour l'instant.** Droits visés : droit économique belge (Code de droit économique, vente à distance et information du consommateur), RGPD (données des formulaires), droit d'auteur, droit à l'image, et le statut de Linda comme vendeuse.

**Réserve honnête : ce document est une analyse de Claude, pas un avis juridique.** Il sert à savoir quoi vérifier et à ne rien oublier. Avant la première vente, les points marqués « bloquant » doivent être confirmés par un professionnel (guichet d'entreprises, comptable ou avocat) ; les textes précis (conditions de vente, rétractation, confidentialité) doivent être relus par lui.

## En bref

- **Aujourd'hui, le risque est faible** : pas de paiement en ligne, pas de cookie de suivi, pas de publicité, aucun tiers qui reçoit des données à part l'hébergeur, dessins et textes de Linda elle-même, polices libres.
- **Le risque devient réel à la première vente** (et dès que Linda répond à une commande en annonçant un prix, puisque la commande par formulaire est déjà une vente à distance) : il manque le statut de Linda, son adresse et son numéro d'entreprise, l'information sur le droit de rétractation, et une page de confidentialité plus complète.
- **Ce qui est déjà propre** : aucun cookie de suivi, polices hébergées sur le site, panier gardé sur l'appareil, formulaire avec cases d'acceptation des conditions, mentions légales avec l'identité de l'éditrice, aperçus filigranés, licence d'utilisation claire (usage privé, pas de toile, pas d'IA), droit d'auteur rappelé.

## À faire, par ordre de priorité

| # | Sujet | Où on en est | À faire | Qui | Quand |
|---|-------|--------------|---------|-----|-------|
| 1 | **Statut de Linda** (particulière ou vendeuse habituelle, numéro d'entreprise, TVA ou franchise, règles liées à sa situation de retraitée et à un éventuel statut d'artiste) | Elle se renseigne elle-même (détails dans `docs/prive/suivi-client.md`) | Obtenir la réponse écrite d'un guichet d'entreprises ou d'un comptable ; décider si elle s'inscrit à la Banque-Carrefour des Entreprises | Linda, aidée de Claudiu | **Bloquant avant toute vente** |
| 2 | **Mentions légales complètes** | Identité et e-mail présents ; `ADRESSE` et `NUMERO_ENTREPRISE` vides dans `src/i18n/index.ts` | Ajouter adresse postale, numéro d'entreprise, TVA ou mention de franchise, selon le #1 | Claudiu (après le #1) | **Bloquant avant toute vente** |
| 3 | **Information avant achat et droit de rétractation** (vente à distance à un consommateur) | Les règles de retour sont notées en privé, **pas affichées** (choix « pas de paiement en ligne ») | Afficher avant la première vente, dans les conditions de vente et le panier : identité du vendeur, prix toutes taxes comprises, frais et délai de livraison, 14 jours de rétractation pour une toile déjà imprimée (frais de renvoi, état de la toile), **exception pour la toile sur commande** (faite à la demande : à écrire clairement), **dessin numérique : le droit de rétractation se perd si le client demande l'envoi immédiat et le reconnaît expressément** (ajouter une case dédiée et le confirmer par e-mail), garantie légale de conformité, réclamations, médiation de consommation, droit belge | Claudiu rédige, un professionnel relit | **Bloquant avant la première vente**, et déjà conseillé tant que des commandes se concluent par e-mail |
| 4 | **Confidentialité (RGPD)** | Page courte et claire, mais incomplète | Y ajouter : qui est responsable du traitement (Linda), pourquoi et sur quelle base (répondre, exécuter la commande), qui reçoit les données (Netlify, les boîtes mail de Linda et de Claudiu), transfert vers les États-Unis et garanties, durée précise de conservation (ex. délai fixe après la demande, plus long pour une commande à cause de la comptabilité), tous les droits (accès, correction, suppression, opposition, limitation, portabilité), droit de plainte auprès de l'Autorité de protection des données, lien d'information près du formulaire, mention du stockage dans l'appareil (panier, choix de silence de Tilleul, salut) | Claudiu, relecture pro | Avant l'annonce publique du site |
| 5 | **Données reçues : qui y a accès** | Les notifications arrivent chez Claudiu, bientôt chez Linda | Noter le rôle de Claudiu (il reçoit des données de clients pour le compte de Linda) dans l'accord entre eux ; supprimer les messages traités dans Netlify Forms et dans les boîtes mail après le délai fixé ; vérifier que la page Confidentialité dit vrai | Claudiu | Dès la mise en ligne |
| 6 | **Accord écrit Claudiu et Linda** | Un accord sur les heures et le paiement existe (privé) | Y ajouter : licence de Linda pour publier ses dessins, son nom et sa photo sur le site et dans les vidéos ; à qui appartiennent le code, le dessin de Tilleul et la vidéo ; au nom de qui sont le domaine, Netlify et GitHub ; maintenance et responsabilité ; rôle de Claudiu pour les données | Claudiu et Linda | Avant la fin de projet |
| 7 | **Droit d'auteur des contenus** | Dessins et toiles : de Linda ; musiques composées par code (aucun échantillon) ; polices Gochi Hand, Itim, Lilita One sous licence libre (OFL), logiciels libres | **Psaumes : relever quelle traduction de la Bible est citée et si elle est protégée** (certaines traductions le sont) ; garder les fichiers de licence des polices ; photos des toiles : confirmer qui les a prises | Claudiu avec Linda | Avant la fin de projet |
| 8 | **Droit à l'image** | Photo de Linda sur la page À propos (choix de Linda) | Garder une trace écrite de son accord (e-mail suffit) | Claudiu | Avant l'annonce |
| 9 | **Nom de domaine `lindadenise.be`** | Pas encore acheté | Titulaire = Linda (ou à défaut, accord écrit) ; données du titulaire conformes à DNS Belgium | Claudiu et Linda | À l'achat |
| 10 | **Dépôt GitHub public** | Public par choix ; aucun original haute définition ni clé | Fait le 2026-10-14 : le statut de Linda et l'accord sur les heures sont retirés des fichiers visibles (ils restent dans l'historique git : voir plus bas) ; ne jamais y mettre de données de clients | Claudiu | Permanent |
| 11 | **Accessibilité** | Contrastes, clavier et mouvement réduit soignés | L'obligation européenne ne vise pas les micro-entreprises de services ; rester sur les bonnes pratiques et finir les tests (axe, VoiceOver) | Claudiu | Fin de projet |
| 12 | **Offre « 5 achetées, la 6e offerte »** | Conditions écrites clairement | Rien de plus ; garder l'offre sans prix barré ni pourcentage trompeur | Claudiu | Permanent |

## Les points qui exposent vraiment à un litige

1. **Vendre sans avoir réglé le statut de Linda** (#1) : risque administratif et fiscal pour elle, plus que pour le site.
2. **Ne pas donner l'information avant achat et le droit de rétractation** (#3) : c'est la règle de consommation la plus souvent sanctionnée. Le délai de rétractation est allongé (jusqu'à 12 mois) si l'information n'a pas été donnée.
3. **Mentions légales incomplètes** (#2) : obligation d'identification de tout vendeur en ligne.
4. **Données personnelles mal expliquées ou gardées trop longtemps** (#4, #5) : risque limité à un petit site, mais facile à éviter.
5. **Versets sous copyright** (#7) : risque faible, à vérifier une fois.

## Historique git : une décision pour Claudiu

Le dépôt est public. Avant le 2026-10-14, `docs/avancement.md` mentionnait la situation de retraitée de Linda (pension) et l'accord sur les heures payées. Ces lignes sont retirées des fichiers actuels, mais **elles restent lisibles dans l'historique git**. Deux options : (a) les laisser (risque faible, mais ce sont des infos privées de Linda), (b) réécrire l'historique (opération lourde qui change tous les commits ; à ne faire que si Claudiu le décide et après une sauvegarde).

## Ressources pour faire relire

Un guichet d'entreprises ou une fédération d'indépendants (pour le statut et la TVA), un comptable, un avocat (pour les conditions de vente), le site de l'Autorité de protection des données (modèle de registre des traitements), le SPF Économie (informations aux consommateurs, médiation de consommation). Ne plus renvoyer vers la plateforme européenne de règlement en ligne des litiges : elle est fermée depuis juillet 2025.

## Procédure de la tâche de fin de projet

1. Faire avancer le #1 (statut) : c'est lui qui décide du reste.
2. Écrire les conditions de vente complètes, la rétractation, la page de confidentialité complétée et les mentions légales (#2, #3, #4) : Claude rédige, Claudiu valide, un professionnel relit.
3. Mettre à jour l'accord entre Claudiu et Linda (#6) et les accords écrits (#7, #8).
4. Régler la suppression des messages et la durée de conservation (#5).
5. Relire toutes les pages légales en FR et en NL, puis publier.
6. Cocher cette liste dans `docs/checklist-fin-de-projet.md`.
