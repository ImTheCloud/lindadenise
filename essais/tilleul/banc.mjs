// Banc d'essai hors navigateur : fait tourner le moteur du chat image par image et enregistre des planches SVG.
// Usage : node --experimental-transform-types essais/tilleul/banc.mjs <scenario> [dossier]
// Scénarios : poses, demitour, yeux, transitions, chasse, caresse. Les planches SVG s'ouvrent dans un navigateur,
// ou se convertissent en image avec : qlmanage -t -s 1000 -o <dossier> <dossier>/<scenario>.svg
import fs from 'node:fs';
import os from 'node:os';

const [, , scenario = 'poses', dossier = os.tmpdir()] = process.argv;
globalThis.innerWidth = 900;
globalThis.innerHeight = 700;
globalThis.addEventListener = () => {};
globalThis.matchMedia = () => ({ matches: false });
let file = [];
globalThis.requestAnimationFrame = (f) => { file.push(f); return 1; };

const fakes = {};
const fake = (sel) => (fakes[sel] ??= { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } });
const calque = { innerHTML: '' };
const scene = {
  innerHTML: '', style: {}, attrs: {},
  setAttribute(k, v) { this.attrs[k] = v; },
  addEventListener() {},
  querySelector(sel) { return sel === '.t-dessin' ? calque : fake(sel); },
  querySelectorAll(sel) { return [0, 1, 2, 3].map((i) => fake(sel + i)); },
};

const { Chat } = await import(new URL('./chat.ts', import.meta.url).href);
let t = 1000;
const c = new Chat(scene);
const pas = (sec) => { for (let i = 0; i < Math.round(sec * 60); i++) { t += 1000 / 60; const fs2 = file; file = []; fs2.forEach((f) => f(t)); } };

// une image : défs (avec les mesures des découpes) + dessin
const image = () => {
  let defs = scene.innerHTML.replace('<g class="t-dessin"></g>', '');
  for (const id of ['t-oeil-g', 't-oeil-d', 't-c-corps', 't-c-queue']) defs = defs.replace(`<clipPath id="${id}"><path/></clipPath>`, `<clipPath id="${id}"><path d="${fake('#' + id + ' path').attrs.d ?? ''}"/></clipPath>`);
  let k = 0;
  defs = defs.replace(/<circle fill="url\(#t-fondu\)"\/>/g, () => { const a = fake('#t-m-pattes circle' + k++).attrs; return `<circle fill="url(#t-fondu)" cx="${a.cx ?? 0}" cy="${a.cy ?? 0}" r="${a.r ?? 0}"/>`; });
  const x = parseFloat(calque.innerHTML.match(/class="t-chat" transform="translate\(([-\d.]+)/)[1]);
  return { defs, dessin: calque.innerHTML, x, legende: c.etat };
};

// planche : chaque image recadrée sur le chat, identifiants renommés pour ne pas se mélanger
const planche = (images, nom, larg = 300, haut = 230, cols = 3) => {
  const vb = scene.attrs.viewBox.split(' ').map(Number);
  const L = 300, Hh = Math.round((L * haut) / larg), lignes = Math.ceil(images.length / cols);
  let corps = '';
  images.forEach((im, i) => {
    const r = (s) => s.replace(/id="t-/g, `id="t${i}-`).replace(/url\(#t-/g, `url(#t${i}-`);
    const cx = im.centre ?? im.x;
    corps += `<svg x="${(i % cols) * L}" y="${Math.floor(i / cols) * (Hh + 22)}" width="${L}" height="${Hh}" viewBox="${cx - larg / 2} ${im.y0 ?? vb[3] - haut} ${larg} ${haut}">${r(im.defs)}<rect x="-9999" y="-9999" width="99999" height="99999" fill="#fff"/>${r(im.dessin)}</svg>`;
    corps += `<text x="${(i % cols) * L + 6}" y="${Math.floor(i / cols) * (Hh + 22) + Hh + 16}" font-size="13" font-family="Helvetica">${i + 1}. ${im.legende}</text>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * L}" height="${lignes * (Hh + 22)}"><rect width="100%" height="100%" fill="#f4f4f4"/>${corps}</svg>`;
  fs.writeFileSync(`${dossier}/${nom}.svg`, svg);
};

c.auto = false;
const sc = {
  poses() {
    c.taille(1.4); pas(5);
    const im = [];
    for (const [o, d] of [['debout', 2], ['assis', 3], ['couche', 3], ['dort', 3], ['etire', 2]]) { c.ordre(o); pas(d); im.push(image()); }
    c.ordre('marche'); pas(0.9); im.push(image());
    planche(im, 'poses', 330, 230, 2);
  },
  demitour() {
    c.taille(1.4); pas(5); c.ordre('debout'); pas(1.5);
    c.etat = 'marche'; c.cibleX = c.x + 300;
    const x0 = c.x, im = [];
    for (let i = 0; i < 9; i++) { pas(0.11); const m = image(); m.centre = x0; m.legende = `t=${((i + 1) * 0.11).toFixed(2)}s`; im.push(m); }
    planche(im, 'demitour', 360, 230, 3);
  },
  yeux() {
    c.taille(3); pas(5); c.ordre('debout'); pas(2);
    const im = [];
    c.ordre('dort');
    for (let i = 0; i < 6; i++) { pas(0.06); const m = image(); m.legende = `dort +${((i + 1) * 0.06).toFixed(2)}s`; im.push(m); }
    pas(2); c.ordre('etire');
    for (let i = 0; i < 6; i++) { pas(0.06); const m = image(); m.legende = `etire +${((i + 1) * 0.06).toFixed(2)}s`; im.push(m); }
    // recadrage sur la tête
    for (const m of im) { const g = m.dessin.match(/class="t-chat" transform="translate\(([-\d.]+),([-\d.]+)\) scale\(([\d.]+)\) rotate/); m.centre = +g[1]; m.y0 = +g[2] - 55; }
    planche(im, 'yeux', 150, 100, 3);
  },
};
sc.transitions = () => {
  c.taille(1.3); pas(5); c.ordre('debout'); pas(1.5);
  const im = [];
  for (const o of ['assis', 'couche', 'dort', 'etire', 'debout', 'assis', 'debout']) {
    c.ordre(o); c.attente = 99;
    for (const d of [0.2, 0.25]) { pas(d); const m = image(); m.legende = `vers ${o} +${d === 0.2 ? '0.20' : '0.45'}s`; im.push(m); }
  }
  planche(im, 'transitions', 330, 200, 4);
};
sc.chasse = () => {
  c.taille(1.2); pas(5); c.ordre('debout'); pas(1);
  c.lacherFeuille();
  const im = []; let n = 0;
  const vus = new Set();
  while (n++ < 900) {
    pas(1 / 60);
    const cle = c.etat;
    if (!vus.has(cle) || (cle === 'bond' && c.bondT > 0.3 && !vus.has('bond2')) || (cle === 'guette' && c.attente < 0.3 && !vus.has('guette2'))) {
      if (vus.has(cle)) vus.add(cle + '2'); else vus.add(cle);
      const m = image(); m.legende = cle + ' ' + (n / 60).toFixed(1) + 's'; im.push(m);
    }
    if (cle === 'assis' && vus.has('bond')) { pas(0.5); const m = image(); m.legende = 'apres'; im.push(m); break; }
  }
  const x = im[im.length - 1].x;
  planche(im.map((m) => ({ ...m, centre: x })), 'chasse', 520, 260, 3);
};
sc.caresse = () => {
  c.taille(1.5); pas(5); c.ordre('assis'); pas(3);
  c.caresse();
  const im = [];
  for (let i = 0; i < 6; i++) { pas(0.12); const m = image(); m.legende = `caresse +${((i + 1) * 0.12).toFixed(2)}s`; im.push(m); }
  planche(im, 'caresse', 300, 300, 3);
};
sc[scenario]();
console.log('ok', scenario);
