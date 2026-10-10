// Coupe la vidéo des vraies toiles filmée au téléphone (brute, 25 Mo, hors du dépôt) en public/video/vraies-toiles.mp4.
// Pour chaque toile, le passage le plus net et le plus stable (repéré par ordinateur le 2026-10-11) : 2,5 s,
// fondus de 0,4 s, sans le son (bruits de manipulation). Deux passes : le montage, puis un léger débruitage
// et une compression plus forte pour rester sous 10 Mo.
// Usage : node scripts/video/vraies-toiles.mjs [vidéo brute]   (par défaut la vidéo WhatsApp du 2026-10-10 dans ~/Downloads)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SOURCE = process.argv[2] ?? path.join(os.homedir(), 'Downloads', 'WhatsApp Video 2026-10-10 at 12.30.18.mp4');
// début du passage de chaque toile, en secondes
const DEBUTS = [
  [0, 'frangipanier'], [5.05, 'mauves'], [9.77, 'chat-au-repos'], [12.97, 'le-chemin-de-foret'], [20.55, 'vieux-cerisier'],
  [23.08, 'tournesols'], [28.64, 'iris'], [38.75, 'l-oiseau'], [43.47, 'printemps'], [48.18, 'le-tournesol'], [51.5, 'narcisses'],
  [59.47, 'time-gambade'], [63.52, 'sweet'], [67.05, 'time-s-amuse'], [72.61, 'jonquilles'], [81.37, 'bouleaux-en-hiver'],
  [85.75, 'montagne-et-tournesols'], [90.47, 'chats-camoufles'], [95.19, 'fleurs-bleues'], [99.91, 'chat-a-l-ile-de-brehat'],
  [104.62, 'bois-de-hal'], [109.34, 'sous-bois'], [114.06, 'la-cloture'],
];
const D = 2.5;
const FONDU = 0.4;

const filtres = DEBUTS.map(([t], i) => `[0:v]trim=start=${t}:duration=${D},setpts=PTS-STARTPTS,fps=30,format=yuv420p[s${i}]`);
let courant = 's0';
for (let i = 1; i < DEBUTS.length; i++) {
  filtres.push(`[${courant}][s${i}]xfade=transition=fade:duration=${FONDU}:offset=${(i * (D - FONDU)).toFixed(2)}[x${i}]`);
  courant = `x${i}`;
}
const montage = path.join(os.tmpdir(), 'vraies-toiles-montage.mp4');
const h264 = (crf) => ['-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', SOURCE, '-filter_complex', filtres.join(';'), '-map', `[${courant}]`, '-an', ...h264('23'), montage], { stdio: 'inherit' });
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', montage, '-vf', 'hqdn3d=1.5:1.5:4:4', '-an', ...h264('27'), 'public/video/vraies-toiles.mp4'], { stdio: 'inherit' });
fs.rmSync(montage);
console.log('public/video/vraies-toiles.mp4 prête.');
