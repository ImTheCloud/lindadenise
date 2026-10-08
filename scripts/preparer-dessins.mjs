// Prepare le catalogue et les apercus filigranes a partir du dossier des originaux.
// Usage : npm run dessins [dossier]   (par defaut ~/Desktop/DessinsLinda)
// Les originaux ne sont JAMAIS copies dans le depot : seuls des apercus filigranes sortent d'ici.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';

const SOURCE = process.argv[2] ?? path.join(os.homedir(), 'Desktop', 'DessinsLinda');
const SORTIE_IMG = path.resolve('public/dessins');
const SORTIE_JSON = path.resolve('src/data/dessins.json');

// rubrique : chats | fleurs | nature | animaux
const CATALOGUE = [
  // Chats
  ['chats', 'Avec Timé', 'Met Timé'],
  ['chats', 'Bonheurs', 'Geluk'],
  ['chats', 'Chats en Bretagne', 'Katten in Bretagne'],
  ['chats', 'Coucou', 'Kiekeboe'],
  ['chats', "Grimpette dans l'arbre", 'Klimpartij in de boom'],
  ['chats', 'Haribo à Lisbonne', 'Haribo in Lissabon'],
  ['chats', 'Rêve de chats québécois en hiver', 'Droom van Quebecse katten in de winter'],
  ['chats', 'Le chat gris et le tournesol', 'De grijze kat en de zonnebloem'],
  ['chats', 'Poursuite dans les dunes', 'Achtervolging in de duinen'],
  ['chats', 'Près de la chute du diable', 'Bij de duivelsval'],
  ['chats', "Rêve d'amour", 'Liefdesdroom'],
  ['chats', 'Rêve de chats', 'Kattendroom'],
  ['chats', 'Soleil couchant', 'Zonsondergang'],
  ['chats', 'Sur le banc', 'Op het bankje'],
  ['chats', 'TiGas, Timé, Tiroux', 'TiGas, Timé, Tiroux'],
  ['chats', 'Timé à Bec-Hellouin', 'Timé in Bec-Hellouin'],
  ['chats', 'Timé à la montagne', 'Timé in de bergen'],
  ['chats', 'Timé a soif', 'Timé heeft dorst'],
  ['chats', 'Timé au clair de lune', 'Timé bij maanlicht'],
  ['chats', "Timé dans l'arbre", 'Timé in de boom'],
  ['chats', 'Timé dort en-dessous des sumacs', 'Timé slaapt onder de sumakken'],
  ['chats', 'Timé et Rouroux à la plage', 'Timé en Rouroux op het strand'],
  ['chats', 'Timé et TiGas au bord de la rivière', 'Timé en TiGas aan de rivier'],
  ['chats', 'Timé grimpe', 'Timé klimt'],
  ['chats', 'Timé jardinier', 'Timé de tuinier'],
  ['chats', 'Timé pose', 'Timé poseert'],
  ['chats', 'Timé, crépuscule à Ripon', 'Timé, schemering in Ripon'],
  ['chats', "Tiroux et le tonneau d'eau", 'Tiroux en de regenton'],
  ['chats', 'Tiroux et les arbres', 'Tiroux en de bomen'],
  ['chats', 'Tiroux et les couleurs', 'Tiroux en de kleuren'],
  ['chats', 'Tiroux, le sage', 'Tiroux, de wijze'],
  ['chats', 'Trio de chats québécois', 'Trio Quebecse katten'],
  // Fleurs
  ['fleurs', 'Couleurs', 'Kleuren'],
  ['fleurs', 'Frangipanier', 'Frangipani'],
  ['fleurs', 'Grand-Bigard, tulipes', 'Grand-Bigard, tulpen'],
  ['fleurs', 'Joie de Pâques', 'Paasvreugde'],
  ['fleurs', 'Lys tigré', 'Tijgerlelie'],
  ['fleurs', 'Iris bleus', 'Blauwe irissen'],
  ['fleurs', 'Champ de tournesols', 'Veld vol zonnebloemen'],
  ['fleurs', 'Trois tournesols', 'Drie zonnebloemen'],
  ['fleurs', 'Prélude à Amsterdam', 'Voorspel in Amsterdam'],
  ['fleurs', 'Tournesol', 'Zonnebloem'],
  ['fleurs', "Trio d'amaryllis", 'Trio amaryllissen'],
  ['fleurs', 'Trio glaïeuls', 'Trio gladiolen'],
  // Nature
  ['nature', 'À la mer', 'Aan zee'],
  ['nature', 'Arbre à Saint-Brieuc', 'Boom in Saint-Brieuc'],
  ['nature', 'Arbre au bord de la rivière', 'Boom aan de rivier'],
  ['nature', 'Arbres', 'Bomen'],
  ['nature', 'Bec-Hellouin', 'Bec-Hellouin'],
  ['nature', 'Chapeau de soleil', 'Zonnehoed'],
  ['nature', 'Falaise Saint-Jacut-de-la-Mer', 'Klif van Saint-Jacut-de-la-Mer'],
  ['nature', 'Fenêtre sur le lac', 'Raam op het meer'],
  ['nature', "Feu de bois, l'été", 'Houtvuur in de zomer'],
  ['nature', 'Forêt à Banneux', 'Bos in Banneux'],
  ['nature', "L'île de Bréhat", 'Het eiland Bréhat'],
  ['nature', 'Le phare', 'De vuurtoren'],
  ['nature', 'Le vieux platane Bouddha', 'De oude plataan Boeddha'],
  ['nature', 'Marrons', 'Kastanjes'],
  ['nature', "Nichoir dans l'arbre", 'Vogelhuisje in de boom'],
  ['nature', 'Jacinthe sauvage dans le bois', 'Wilde hyacint in het bos'],
  ['nature', 'Bouleaux en hiver', 'Berken in de winter'],
  ['nature', 'Pleine lune et feu', 'Volle maan en vuur'],
  // Animaux
  ['animaux', '2 écureuils au bord de l\'eau', '2 eekhoorns aan het water'],
  ['animaux', 'Caroline', 'Caroline'],
  ['animaux', 'Cerf et feu', 'Hert en vuur'],
  ['animaux', 'Coccinelles', 'Lieveheersbeestjes'],
  ['animaux', 'Paon indien', 'Indische pauw'],
  ['animaux', 'Poulailler', 'Kippenhok'],
  ['animaux', 'Vaches dans le pré', 'Koeien in de wei'],
];

const A_LA_UNE = ['Trois tournesols', 'Lys tigré', 'Paon indien', 'Trio de chats québécois', "2 écureuils au bord de l'eau", 'Frangipanier', 'Le phare', 'Tiroux, le sage'];

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const titreDeFichier = (f) => f.replace(/\.jpg$/i, '').replace(/\s*_\d{6}_\d{6}(_\d)?(\s?\d|\s?\(\d\))?\s*$/, '').replace(/\s+/g, ' ').trim();

const fichiers = fs.readdirSync(SOURCE).filter((f) => /\.jpg$/i.test(f));
const parTitre = new Map();
for (const f of fichiers.sort()) {
  const cle = norm(titreDeFichier(f));
  if (!parTitre.has(cle)) parTitre.set(cle, f); // ignore les doublons (« Couleurs … 2 »)
}

const filigrane = (w, h) => {
  const taille = Math.round(w / 17);
  const pas = Math.round(w * 0.66);
  const texte = '© Linda Denise';
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
<defs><pattern id="p" width="${pas}" height="${Math.round(pas * 0.5)}" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
<text x="6" y="${taille + 4}" font-family="Helvetica, Arial, sans-serif" font-size="${taille}" font-weight="700" fill="#000" fill-opacity=".22" stroke="none" transform="translate(1.5,1.5)">${texte}</text>
<text x="6" y="${taille + 4}" font-family="Helvetica, Arial, sans-serif" font-size="${taille}" font-weight="700" fill="#fff" fill-opacity=".5">${texte}</text>
</pattern></defs><rect width="${w}" height="${h}" fill="url(#p)"/></svg>`);
};

// Chaque aperçu existe en AVIF (léger) et en WebP (repli pour les anciens navigateurs).
async function apercu(source, largeur, base, qualiteWebp, qualiteAvif) {
  const { data, info } = await sharp(source).resize({ width: largeur }).toBuffer({ resolveWithObject: true });
  const avecFiligrane = sharp(data).composite([{ input: filigrane(info.width, info.height) }]);
  await avecFiligrane.clone().webp({ quality: qualiteWebp }).toFile(base + '.webp');
  await avecFiligrane.clone().avif({ quality: qualiteAvif, effort: 5 }).toFile(base + '.avif');
  return { largeur: info.width, hauteur: info.height };
}

fs.mkdirSync(SORTIE_IMG, { recursive: true });
fs.mkdirSync(path.dirname(SORTIE_JSON), { recursive: true });

const sortie = [];
const manquants = [];
for (const [rubrique, fr, nl] of CATALOGUE) {
  const fichier = parTitre.get(norm(fr));
  if (!fichier) { manquants.push(fr); continue; }
  const id = slug(fr);
  const source = path.join(SOURCE, fichier);
  const grande = await apercu(source, 760, path.join(SORTIE_IMG, id), 76, 52);
  await apercu(source, 400, path.join(SORTIE_IMG, `${id}-vignette`), 66, 48);
  sortie.push({ id, rubrique, titre: { fr, nl }, largeur: grande.largeur, hauteur: grande.hauteur, une: A_LA_UNE.includes(fr) });
}

fs.writeFileSync(SORTIE_JSON, JSON.stringify(sortie, null, 2) + '\n');
const utilises = new Set(CATALOGUE.map(([, fr]) => norm(fr)));
const inutilises = [...parTitre.keys()].filter((k) => !utilises.has(k));
console.log(`${sortie.length} dessins prepares.`);
if (manquants.length) console.log('Introuvables dans la source :', manquants);
if (inutilises.length) console.log('Fichiers source non utilises :', inutilises);
