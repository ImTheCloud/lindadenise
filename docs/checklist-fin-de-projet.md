# À faire avant et après la mise en ligne

Tout ce qui sert à évaluer et finaliser le site. À reprendre à la fin du projet.

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
- Relecture du néerlandais par un néerlandophone
- Mentions légales complètes (adresse, numéro d'entreprise selon le statut de Linda), conditions d'utilisation relues
- Titres des dessins : dernière relecture avec Linda
- Formulaire : notifications email dans Netlify, premier message « Non spam », test d'une vraie demande
- README à mettre à jour (le rappeler en fin de projet)

## Mise en ligne et crédits Netlify
- Netlify gratuit : 300 crédits par mois, 15 crédits par déploiement de production (voir `netlify-credits` dans la mémoire du projet)
- Pendant le développement, les commits portent `[skip ci]` : GitHub reçoit tout, Netlify ne construit rien
- À la fin : un seul commit sans `[skip ci]` pour publier
