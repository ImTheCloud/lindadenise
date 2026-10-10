# À faire avant et après la mise en ligne

Tout ce qui sert à évaluer et finaliser le site. À reprendre à la fin du projet.

## Formulaire de contact (à ne pas oublier au déploiement final)
- Le formulaire échoue en ligne tant qu'aucun déploiement n'a eu lieu depuis l'activation de la détection (Netlify affiche 0 formulaire détecté). Décision de Claudiu (2026-10-10) : attendre le déploiement final.
- Après ce déploiement : vérifier dans Netlify (Forms) que `contact` est détecté, envoyer un message de test, vérifier l'email reçu (aussi dans les indésirables), marquer « Not spam » si besoin.
- La notification email est déjà réglée (Forms → Form submission notifications) sur l'adresse de Claudiu : y mettre ou y ajouter celle de Linda quand elle sera prête.
- Champ téléphone facultatif ajouté (2026-10-10).
- Champs ajoutés le 2026-10-11 (toiles) : `sujet`, `toiles`, `total`, `rue`, `code_postal`, `localite`, `pays`, `conditions_toile`. Vérifier qu'ils arrivent dans Netlify et dans l'email de notification.
- Confidentialité : la page dit que les messages sont supprimés une fois la demande traitée. Supprimer régulièrement les messages traités dans Netlify (Forms), ou changer la phrase.

## Boutique Stripe : à prévoir pour les dessins ET les toiles
- Seulement quand le statut légal de Linda est confirmé (Stripe Checkout, Bancontact).
- **Toute commande (toile ou dessin numérique) envoie automatiquement un e-mail de confirmation au client** avec les détails : récapitulatif, montant, frais d'envoi, délai, coordonnées de Linda ; pour une toile, le transporteur et le suivi.
- Toiles : remise de lot (−10 % dès 2 toiles, −20 % dès 3, toiles seulement), envoi offert dès 2 toiles, livraison en Belgique uniquement (adresse vérifiée), pièce unique : marquer la toile « vendue » automatiquement après paiement (aujourd'hui à la main dans `src/data/toiles.json`). Les règles sont déjà dans `src/data/vente.ts` (`calculLot`).
- Toiles sur commande : délai et prix réels à obtenir de Linda (`DELAI_TOILE_SUR_COMMANDE`).
- Conditions de vente des toiles (`/conditions-toiles/`) : écrire les retours, le droit de rétractation et la garantie quand Linda sait ce qui s'applique à son statut ; aujourd'hui la page dit seulement « Les conditions de retour seront précisées avant tout paiement. »

## Référencement (SEO) et Google
- Acheter `lindadenise.be`, brancher le DNS sur Netlify, activer HTTPS, rediriger `www`
- Remplacer l'adresse de test `lindadenise.netlify.app` : vérifier que canonical, sitemap et robots pointent bien vers `lindadenise.be`
- Search Console : ajouter la propriété, envoyer `sitemap-index.xml`, vérifier l'indexation FR et NL (hreflang)
- Titres et descriptions de chaque page, texte alternatif des images, balisage `VisualArtwork` des fiches
- Fiche Google Business si Linda le souhaite

## Aperçu de partage
- Tester l'aperçu sur WhatsApp, Facebook, LinkedIn (image `public/images/partage.png`)
- Une image de partage propre à la galerie et à l'À propos si utile

## Qualité technique
- Lighthouse (mobile et ordinateur) sur l'accueil, la galerie, une fiche, le contact : on refait les mesures à la fin
- Core Web Vitals (PageSpeed Insights) et WebPageTest sur connexion lente
- Liens cassés (tout le site, FR et NL) et validité du HTML
- En-têtes de sécurité (securityheaders.com) : à ajouter dans `netlify.toml` (Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS)
- Poids des images : remesurer après le passage en AVIF

## Accessibilité
- axe (extension navigateur), navigation au clavier seul, VoiceOver sur iPhone
- Contrastes (corrigés, à revérifier), simulation de daltonisme
- Vérifier que les animations se coupent avec « réduire les animations »

## Appareils
- iPhone (Safari) et Android (Chrome) réels, plus un grand écran d'ordinateur
- Vérifier la mascotte, le formulaire et le menu sur téléphone

## Contenu et légal
- Mentions légales complètes (adresse, numéro d'entreprise selon le statut de Linda), conditions d'utilisation et conditions de vente des toiles relues
- Titres des dessins : dernière relecture avec Linda
- Formulaire : notifications email dans Netlify, premier message « Non spam », test d'une vraie demande
- README à mettre à jour (le rappeler en fin de projet)

## Mise en ligne et crédits Netlify
- Netlify gratuit : 300 crédits par mois, 15 crédits par déploiement de production (voir `netlify-credits` dans la mémoire du projet)
- Pendant le développement, les commits portent `[skip ci]` : GitHub reçoit tout, Netlify ne construit rien
- À la fin : un seul commit sans `[skip ci]` pour publier

## Idées de nouvelles fonctionnalités à proposer à la fin (accord de Claudiu)
- Page Psaumes (rubrique vide pour l'instant, ou annonce « bientôt »)
- Livre d'or ou petit mot des visiteurs
- Liens vers Instagram / Facebook de Linda
- Message de bienvenue ou mot de Linda en vidéo / audio
- Newsletter ou alerte « nouveau dessin »
- Dessin du mois, favoris, partage d'un dessin par carte postale numérique
- Espace admin (ajouter, modifier, supprimer) et boutique Stripe : déjà prévus

## Relecture des textes (FR et NL)
- À refaire à la toute fin, tout le site : dictionnaires `src/i18n/fr.ts` et `nl.ts`, page 404, textes de la mascotte, formulaire, messages d'erreur, mentions légales, licence, confidentialité.
- Vérifier : orthographe, ton (vouvoiement en FR, « je » en NL), cohérence entre FR et NL, aucune information inventée sur Linda, textes à jour avec les nouvelles fonctions (admin, abonnement, boutique, mentions légales remplies).
- Première relecture complète faite le 2026-10-10.

## Sécurité (à faire en fin de projet, avec l'admin)
- En-têtes de sécurité dans `netlify.toml` (voir plus haut), à écrire une fois l'admin et Stripe en place : leurs domaines doivent être autorisés dans la Content-Security-Policy.
- Admin : connexion de Linda seule, droits par ligne (RLS) testés, aucune clé secrète dans le dépôt public, clé Supabase publique seulement côté site.
- Boutique : liens de téléchargement signés et à durée limitée, webhooks Stripe vérifiés, originaux jamais accessibles publiquement.
- Formulaire et abonnement : anti-spam, pas de données superflues.
- Test d'intrusion de base (accès direct aux fichiers, aux routes admin, aux originaux) avant la mise en ligne.
