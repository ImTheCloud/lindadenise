// Prepare les photos des toiles : redresse la perspective, garde seulement la toile au ratio A3,
// ecrit les images de public/toiles et le fichier src/data/toiles.json.
// Usage : npm run toiles [dossier]   (par defaut ~/Downloads, photos « Titre.jpeg »)
// Les photos d'origine ne sont jamais copiees dans le depot. Pas de filigrane : ce sont des photos
// de toiles physiques, en definition limitee.
// « vendue » se change a la main dans src/data/toiles.json : ce script garde la valeur existante.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';

const SOURCE = process.argv[2] ?? path.join(os.homedir(), 'Downloads');
const SORTIE_IMG = path.resolve('public/toiles');
const SORTIE_JSON = path.resolve('src/data/toiles.json');

// Toutes les toiles sont au format A3 portrait (29,7 x 42 cm).
const LARGEUR = 1000;
const HAUTEUR = Math.round((LARGEUR * 420) / 297);
const TAILLES = [400, 800, 1000];

// [fichier = titre FR, titre NL, dessin du site (id) ou null, rotation, coins de la toile dans la photo
//  (haut-gauche, haut-droite, bas-droite, bas-gauche), description FR, description NL]
// Coins : detectes une fois par ordinateur (OpenCV) puis verifies et corriges a l'oeil.
// Rotation : trois toiles ont ete photographiees couchees (-90 = quart de tour a gauche).
const TOILES = [
  ['Bois de Hal', 'Hallerbos', 'jacinthe-sauvage-dans-le-bois', -90, [[10, 92], [1544, 58], [1542, 1168], [10, 1150]],
    'des troncs d’arbres au-dessus d’un tapis de jacinthes bleues', 'boomstammen boven een tapijt van blauwe hyacinten'],
  ['Bouleaux en hiver', 'Berken in de winter', 'bouleaux-en-hiver', 0, [[85, 20], [1117, 26], [1126, 1502], [57, 1512]],
    'des bouleaux blancs et noirs dans la neige, sous un ciel bleu', 'zwart-witte berken in de sneeuw, onder een blauwe lucht'],
  ['Chat au repos', 'Rustende kat', null, 0, [[41, 12], [1139, 12], [1141, 1586], [34, 1558]],
    'un chat gris allongé près d’un arbre vert et d’un mur rose', 'een grijze kat die ligt bij een groene boom en een roze muur'],
  ["Chat à l'île de Bréhat", 'Kat op het eiland Bréhat', 'chats-en-bretagne', 90, [[10, 47], [1589, 63], [1589, 1184], [10, 1159]],
    'la mer et ses bateaux, des maisons et un chat dans la verdure', 'de zee met bootjes, huizen en een kat in het groen'],
  ['Chats camouflés', 'Verstopte katten', 'reve-de-chats-quebecois-en-hiver', 0, [[67, 9], [1111, 9], [1131, 1534], [23, 1528]],
    'trois chats dessinés au trait, cachés dans l’herbe sous un arbre', 'drie getekende katten, verstopt in het gras onder een boom'],
  ['Fleurs bleues', 'Blauwe bloemen', null, -90, [[37, 59], [1589, 80], [1589, 1175], [17, 1174]],
    'de grandes fleurs bleues sur un fond clair', 'grote blauwe bloemen op een lichte achtergrond'],
  ['Frangipanier', 'Frangipani', 'frangipanier', 0, [[109, 10], [1189, 11], [1170, 1586], [62, 1528]],
    'un frangipanier en fleurs blanches et jaunes sous un ciel bleu', 'een frangipani met witte en gele bloemen onder een blauwe lucht'],
  ['Iris', 'Iris', 'iris-bleus', 0, [[77, 10], [1187, 10], [1176, 1589], [53, 1589]],
    'des iris bleu foncé au milieu de longues feuilles vertes', 'donkerblauwe irissen tussen lange groene bladeren'],
  ['Jonquilles', 'Paasbloemen', null, 0, [[49, 11], [1155, 11], [1168, 1564], [60, 1587]],
    'des jonquilles jaunes au pied de grands arbres', 'gele paasbloemen aan de voet van hoge bomen'],
  ["L'oiseau", 'De vogel', null, 0, [[72, 14], [1157, 15], [1164, 1582], [50, 1554]],
    'un oiseau posé sur une branche, entouré de feuillage vert', 'een vogel op een tak, omringd door groen blad'],
  ['La clôture', 'Het hek', null, 0, [[69, 23], [1138, 52], [1141, 1570], [44, 1570]],
    'un arbre derrière une clôture en bois, dans un jardin', 'een boom achter een houten hek, in een tuin'],
  ['Le chemin de forêt', 'Het bospad', null, 0, [[33, 73], [1082, 65], [1121, 1577], [36, 1577]],
    'un chemin qui serpente entre les arbres', 'een pad dat tussen de bomen kronkelt'],
  ['Le tournesol', 'De zonnebloem', 'tournesol', 0, [[39, 16], [1122, 16], [1150, 1587], [10, 1587]],
    'un grand tournesol jaune et ses feuilles vertes', 'een grote gele zonnebloem met groene bladeren'],
  ['Mauves', 'Kaasjeskruid', null, 0, [[12, 10], [1111, 10], [1122, 1586], [12, 1559]],
    'des fleurs de mauve violettes parmi les feuilles', 'paarse bloemen van kaasjeskruid tussen de bladeren'],
  ['Montagne et tournesols', 'Berg en zonnebloemen', null, 0, [[42, 58], [1120, 52], [1118, 1561], [65, 1561]],
    'un champ de tournesols au pied d’une montagne enneigée', 'een veld zonnebloemen aan de voet van een besneeuwde berg'],
  ['Printemps', 'Lente', null, 0, [[58, 35], [1148, 10], [1184, 1589], [62, 1589]],
    'des arbres aux couleurs tendres du printemps', 'bomen in de zachte kleuren van de lente'],
  ['Sous bois', 'Onder de bomen', null, 0, [[67, 14], [1156, 15], [1145, 1583], [31, 1560]],
    'un sous-bois aux couleurs d’automne', 'een bos in herfstkleuren'],
  ['Sweet', 'Sweet', 'coucou', 0, [[34, 17], [1129, 17], [1160, 1584], [38, 1584]],
    'un chat gris qui regarde par-dessus une nappe fleurie', 'een grijze kat die over een tafelkleed met bloemen kijkt'],
  ['Timé gambade', 'Timé huppelt', null, 0, [[20, 19], [1072, 19], [1106, 1531], [20, 1531]],
    'un chat blanc qui gambade entre les arbres', 'een witte kat die tussen de bomen huppelt'],
  ["Timé s'amuse", 'Timé speelt', null, 0, [[76, 22], [1154, 21], [1189, 1552], [83, 1579]],
    'un petit chat blanc qui joue sous de grands arbres', 'een kleine witte kat die speelt onder hoge bomen'],
  ['Tournesols', 'Zonnebloemen', 'prelude-a-amsterdam', 0, [[62, 78], [1130, 72], [1136, 1589], [63, 1589]],
    'des tournesols sous un soleil jaune et un ciel bleu', 'zonnebloemen onder een gele zon en een blauwe lucht'],
  ['Vieux cerisier', 'Oude kersenboom', 'arbre-a-saint-brieuc', 0, [[67, 10], [1181, 10], [1181, 1589], [60, 1589]],
    'un vieux cerisier au tronc tordu dans l’herbe haute', 'een oude kersenboom met een kromme stam in het hoge gras'],
  ['narcisses', 'Narcissen', 'joie-de-paques', 0, [[113, 129], [1054, 118], [1071, 1476], [103, 1473]],
    'des narcisses jaunes autour d’une branche', 'gele narcissen rond een tak'],
];

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Homographie qui envoie les coins du rectangle de sortie sur les coins de la toile dans la photo.
function homographie(dst, src) {
  const A = [];
  for (let i = 0; i < 4; i++) {
    const [u, v] = dst[i];
    const [x, y] = src[i];
    A.push([u, v, 1, 0, 0, 0, -u * x, -v * x, x]);
    A.push([0, 0, 0, u, v, 1, -u * y, -v * y, y]);
  }
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k];
    }
  }
  return [...A.map((l, i) => l[8] / l[i]), 1];
}

// Redresse la toile (interpolation bilineaire) et applique une legere correction des blancs.
async function redresser(fichier, coins, rotation) {
  const { data, info } = await sharp(fichier).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const debout = rotation === 0;
  const W = debout ? LARGEUR : HAUTEUR;
  const H = debout ? HAUTEUR : LARGEUR;
  const h = homographie([[0, 0], [W, 0], [W, H], [0, H]], coins);
  const sortie = Buffer.alloc(W * H * 3);
  for (let v = 0; v < H; v++) {
    for (let u = 0; u < W; u++) {
      const d = h[6] * u + h[7] * v + h[8];
      const x = Math.min(info.width - 1.001, Math.max(0, (h[0] * u + h[1] * v + h[2]) / d));
      const y = Math.min(info.height - 1.001, Math.max(0, (h[3] * u + h[4] * v + h[5]) / d));
      const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
      const i00 = (y0 * info.width + x0) * 3, i10 = i00 + 3, i01 = i00 + info.width * 3, i11 = i01 + 3;
      const o = (v * W + u) * 3;
      for (let k = 0; k < 3; k++) {
        sortie[o + k] = Math.round(
          (data[i00 + k] * (1 - fx) + data[i10 + k] * fx) * (1 - fy) + (data[i01 + k] * (1 - fx) + data[i11 + k] * fx) * fy,
        );
      }
    }
  }
  // Blancs : chaque couleur est eclaircie au plus de 10 %, pour que le blanc de la toile redevienne blanc.
  const gains = [0, 1, 2].map((k) => {
    const valeurs = new Uint32Array(256);
    for (let i = k; i < sortie.length; i += 3) valeurs[sortie[i]]++;
    let cumul = 0, p = 255;
    for (; p > 0; p--) { cumul += valeurs[p]; if (cumul > (W * H) / 200) break; }
    return Math.min(1.1, Math.max(1, 250 / p));
  });
  for (let i = 0; i < sortie.length; i++) sortie[i] = Math.min(255, Math.round(sortie[i] * gains[i % 3]));
  const image = sharp(sortie, { raw: { width: W, height: H, channels: 3 } });
  return debout ? image.png().toBuffer() : image.rotate(rotation).png().toBuffer();
}

fs.mkdirSync(SORTIE_IMG, { recursive: true });
const anciennes = fs.existsSync(SORTIE_JSON) ? JSON.parse(fs.readFileSync(SORTIE_JSON, 'utf8')) : [];
const vendue = (id) => anciennes.find((t) => t.id === id)?.vendue ?? false;

const sortie = [];
for (const [fichier, nl, dessin, rotation, coins, descFr, descNl] of TOILES) {
  const source = path.join(SOURCE, `${fichier}.jpeg`);
  if (!fs.existsSync(source)) { console.log('Introuvable :', source); continue; }
  const id = slug(fichier);
  const image = await redresser(source, coins, rotation);
  for (const largeur of TAILLES) {
    const base = path.join(SORTIE_IMG, `${id}-${largeur}`);
    const taille = sharp(image).resize({ width: largeur });
    await taille.clone().avif({ quality: 55, effort: 5 }).toFile(`${base}.avif`);
    await taille.clone().webp({ quality: 80 }).toFile(`${base}.webp`);
    if (largeur === 800) await taille.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`${base}.jpg`);
  }
  sortie.push({ id, titre: { fr: majuscule(fichier), nl }, description: { fr: descFr, nl: descNl }, dessin, vendue: vendue(id) });
}

fs.writeFileSync(SORTIE_JSON, JSON.stringify(sortie, null, 2) + '\n');
console.log(`${sortie.length} toiles preparees.`);
