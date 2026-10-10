// Fabrique les vidéos « Les toiles » (motion design) : scene.html est rendue image par image dans Chrome,
// en temps virtuel (1/30 s par image), puis ffmpeg assemble l'image et la musique composée par musique.py.
//
// Outils (gratuits, hors du dépôt) : Google Chrome, ffmpeg (brew install ffmpeg), python3 avec numpy,
// et puppeteer-core installé sans toucher package.json : npm i --no-save puppeteer-core
//
// Depuis la racine du projet :
//   node scripts/video/rendu.mjs fr h /tmp/brut-fr-h.mp4          (h : 16:9, 39 s ; v : 9:16, 20 s)
//   python3 scripts/video/musique.py 39 /tmp/musique-long.wav       (20 pour la version courte)
//   python3 scripts/video/assembler.py /tmp/brut-fr-h.mp4 /tmp/musique-long.wav public/video/toiles-fr.mp4 26
// Version courte : sortie public/video/toiles-court-fr.mp4 ; NL : nl au lieu de fr, sorties en -nl.
// Images d'essai : node scripts/video/rendu.mjs fr h essai 2,9.5,24  (PNG dans le dossier courant)
import puppeteer from 'puppeteer-core';
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [lang, format, sortie, instants] = process.argv.slice(2);
const W = format === 'v' ? 1080 : 1920;
const H = format === 'v' ? 1920 : 1080;
const ici = path.dirname(new URL(import.meta.url).pathname);

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
const tilleul = execSync('npx --yes esbuild src/components/tilleul/chat.ts --bundle --format=iife --global-name=Tilleul --log-level=warning').toString();

const nav = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--allow-file-access-from-files', '--hide-scrollbars', '--force-color-profile=srgb'],
});
const page = await nav.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('Erreur dans la page :', e.message));
await page.evaluateOnNewDocument(horloge + tilleul);
await page.goto(`file://${ici}/scene.html?lang=${lang}&format=${format}`);
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
    if (v !== undefined) fs.writeFileSync(`essai-${lang}-${format}-${v}.png`, await capture());
  }
} else {
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', sortie], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) {
    await page.evaluate((t) => window.image(t), i / 30);
    const png = await capture();
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`${lang} ${format} : image ${i} sur ${N}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
}
await nav.close();
