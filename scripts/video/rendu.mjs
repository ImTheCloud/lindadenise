// Fabrique la vidéo du site (carrée, 1080 × 1080, 57 s) : scene.html est rendue image par image dans Chrome,
// en temps virtuel (1/30 s par image), puis ffmpeg assemble l'image et la musique composée par musique.py.
// La toile filmée vient de public/video/vraies-toiles.mp4 (ses 2,1 premières secondes : Frangipanier), stabilisée ici.
//
// Outils (gratuits, hors du dépôt) : Chrome ou Chromium (variable CHROME si le chemin diffère), ffmpeg avec vidstab,
// python3 avec numpy, les dépendances du site (npm install : polices Gochi Hand et Itim) et puppeteer-core installé
// sans toucher package.json : npm i --no-save puppeteer-core
//
// Depuis la racine du dépôt :
//   node scripts/video/rendu.mjs fr /tmp/brut-fr.mp4
//   python3 scripts/video/musique.py site 57 /tmp/musique-site.wav
//   python3 scripts/video/assembler.py /tmp/brut-fr.mp4 /tmp/musique-site.wav public/video/site-fr.mp4 20
// NL : nl au lieu de fr, sortie site-nl.mp4 (même musique). Affiches : l'image à 1,5 s, réduite à 720 × 720.
// Images d'essai : node scripts/video/rendu.mjs fr essai 1.5,20,40.5  (PNG dans le dossier courant : le lancer depuis /tmp)
import puppeteer from 'puppeteer-core';
import { spawn, execSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [lang, sortie, instants] = process.argv.slice(2);
if (!['fr', 'nl'].includes(lang) || !sortie || (sortie === 'essai' && !instants)) {
  console.error('Usage : node scripts/video/rendu.mjs fr|nl sortie.mp4   ou   node scripts/video/rendu.mjs fr|nl essai 1.5,20');
  process.exit(1);
}
const W = 1080;
const H = 1080;
const ici = path.dirname(new URL(import.meta.url).pathname);
const depot = path.join(ici, '..', '..');
const chrome = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/google-chrome'].find((c) => c && fs.existsSync(c));

// Le plan filmé : stabilisé (caméra fixe), recadré autour de la toile, à la taille de l'image dans la carte (432 × 611)
const film = fs.mkdtempSync(path.join(os.tmpdir(), 'video-site-'));
process.on('exit', () => fs.rmSync(film, { recursive: true, force: true })); // même après une erreur
const brute = path.join(depot, 'public', 'video', 'vraies-toiles.mp4');
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { cwd: film });
ff('-t', '2.1', '-i', brute, '-vf', 'vidstabdetect=shakiness=6:accuracy=15:tripod=1:result=t.trf', '-f', 'null', '-');
ff('-t', '2.1', '-i', brute, '-vf', 'vidstabtransform=input=t.trf:tripod=1:optzoom=0:interpol=bicubic,crop=388:549:21:45,scale=432:611:flags=lanczos', '%03d.png');

// Temps virtuel : l'horloge n'avance que d'une image à la fois, le hasard est reproductible.
const horloge = `(() => {
  let maintenant = 0, file = [], graine = 7;
  window.requestAnimationFrame = (cb) => { file.push(cb); return file.length; };
  window.cancelAnimationFrame = () => {};
  performance.now = () => maintenant;
  Math.random = () => { graine |= 0; graine = (graine + 0x6d2b79f5) | 0; let t = Math.imul(graine ^ (graine >>> 15), 1 | graine); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  window.avancer = (ms) => { maintenant += ms; const l = file; file = []; l.forEach((cb) => cb(maintenant)); };
})();`;
// Le moteur de Tilleul du site, tel quel
const tilleul = execSync('npx --yes esbuild src/components/tilleul/chat.ts --bundle --format=iife --global-name=Tilleul --log-level=warning', { cwd: depot }).toString();

const nav = await puppeteer.launch({
  executablePath: chrome,
  headless: 'new',
  args: ['--allow-file-access-from-files', '--hide-scrollbars', '--force-color-profile=srgb', '--no-sandbox'],
});
const page = await nav.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('Erreur dans la page :', e.message));
page.on('console', (m) => console.log('page :', m.text()));
await page.evaluateOnNewDocument(horloge + tilleul);
await page.goto(`file://${ici}/scene.html?lang=${lang}&film=${encodeURIComponent(film)}`);
await page.evaluate(() => window.pret);
const duree = await page.evaluate(() => window.DUREE);
const cdp = await page.createCDPSession();
const capture = async () => Buffer.from((await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } })).data, 'base64');
const N = Math.round(duree * 30);

if (sortie === 'essai') {
  const voulus = instants.split(',').map(Number);
  for (let i = 0; i < N && i / 30 <= Math.max(...voulus); i++) {
    await page.evaluate((t) => window.image(t), i / 30);
    const v = voulus.find((x) => Math.abs(x - i / 30) < 1 / 60);
    if (v !== undefined) fs.writeFileSync(`essai-${lang}-${v}.png`, await capture());
  }
} else {
  const enc = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', sortie], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) {
    await page.evaluate((t) => window.image(t), i / 30);
    const png = await capture();
    if (!enc.stdin.write(png)) await new Promise((r) => enc.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`${lang} : image ${i} sur ${N}`);
  }
  enc.stdin.end();
  await new Promise((r) => enc.on('close', r));
}
await nav.close();
