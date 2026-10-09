// Génère src/components/mascotte.svg : Tilleul, le chat roux aux yeux verts, inspiré de Tiroux dans les dessins de Linda.
// Usage : node scripts/generer-mascotte.mjs
// Deux poses : assis (m-assis) et couché en boule (m-couche-pose). Un contour unique par grande partie (filtre),
// parties animées séparément (classes m-*), animations dans src/components/Mascotte.astro.
import fs from 'node:fs';

const f = (n) => Math.round(n * 10) / 10;

// Pattes avant (vue de face) : sommet caché sous la tête, léger évasement vers la patte, bas arrondi
const JAMBE_G = 'M112,236 C112,218 142,218 142,236 C143,268 143,300 146,326 C150,340 150,352 140,358 C128,362 112,360 108,350 C104,340 110,330 114,322 C116,296 112,266 112,236 Z';
const JAMBE_D = 'M188,236 C188,218 158,218 158,236 C157,268 157,300 154,326 C150,340 150,352 160,358 C172,362 188,360 192,350 C196,340 190,330 186,322 C184,296 188,266 188,236 Z';

// ---------- queue : courbe de Bézier épaissie, rayures perpendiculaires ----------
function queue(P, largeur, pas) {
  const bez = (t) => { const u = 1 - t; return [0, 1].map((k) => u ** 3 * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t ** 3 * P[3][k]); };
  const dv = (t) => { const u = 1 - t; return [0, 1].map((k) => 3 * u * u * (P[1][k] - P[0][k]) + 6 * u * t * (P[2][k] - P[1][k]) + 3 * t * t * (P[3][k] - P[2][k])); };
  const pt = (t, r) => { const [x, y] = bez(t), [dx, dy] = dv(t), l = Math.hypot(dx, dy); return [x + (-dy / l) * (largeur(t) / 2) * r, y + (dx / l) * (largeur(t) / 2) * r]; };
  const N = 70;
  const L = [], R = [];
  for (let i = 0; i <= N; i++) { L.push(pt(i / N, 1)); R.push(pt(i / N, -1)); }
  const ray = largeur(1) / 2;
  const contour = 'M' + L.map((p) => f(p[0]) + ',' + f(p[1])).join(' L') + ' A' + f(ray) + ',' + f(ray) + ' 0 0 0 ' + f(R[N][0]) + ',' + f(R[N][1]) + ' L' + [...R].reverse().map((p) => f(p[0]) + ',' + f(p[1])).join(' L') + ' Z';
  const ligne = (r, a, b, n = 50) => 'M' + Array.from({ length: n + 1 }, (_, i) => pt(a + (b - a) * i / n, r).map(f).join(',')).join(' L');
  const bandes = pas.map((t) => `M${pt(t, 1.4).map(f).join(',')} L${pt(t, -1.4).map(f).join(',')}`).join(' ');
  return { contour, ligne, bandes };
}
const qAssis = queue([[206, 318], [308, 332], [340, 236], [290, 148]], (t) => 34 - 9 * t, [0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.82]);
const qCouche = queue([[284, 350], [250, 378], [172, 378], [92, 360]], () => 24, [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86]);

// ---------- tête (réutilisée dans les deux poses) ----------
const tete = `<g filter="url(#m-contour)">
<g class="m-oreille m-oreille-g">
<path d="M86,106 C74,78 70,50 80,26 C106,36 130,56 140,76 Z" fill="url(#m-pelage)"/>
<path d="M94,94 C88,76 86,58 90,44 C106,52 120,64 126,78 Z" fill="#F9B8A8"/>
</g>
<g class="m-oreille m-oreille-d">
<path d="M214,106 C226,78 230,50 220,26 C194,36 170,56 160,76 Z" fill="url(#m-pelage)"/>
<path d="M206,94 C212,76 214,58 210,44 C194,52 180,64 174,78 Z" fill="#F9B8A8"/>
</g>
<path d="M150,64 C202,62 240,94 242,136 C244,176 206,206 150,206 C94,206 56,176 58,136 C60,94 98,62 150,64 Z" fill="url(#m-pelage)"/>
<path d="M150,144 C168,134 198,142 202,162 C206,184 180,198 150,198 C120,198 94,184 98,162 C102,142 132,134 150,144 Z" fill="url(#m-creme)"/>
<path d="M82,104 C92,84 112,72 136,70 C118,78 102,92 94,112 Z" fill="#FFC27E" opacity=".5"/>
<path d="M150,72 L150,92 M132,76 L136,92 M168,76 L164,92" fill="none" stroke="#B24E12" stroke-width="4" stroke-linecap="round" opacity=".55"/>
<g fill="#FF8E7A" filter="url(#m-flou)" opacity=".45"><path d="M84,160 C84,152 104,152 104,160 C104,168 84,168 84,160 Z"/><path d="M196,160 C196,152 216,152 216,160 C216,168 196,168 196,160 Z"/></g>
<g class="m-yeux">
<ellipse cx="112" cy="124" rx="19" ry="21" fill="#fff"/><ellipse cx="188" cy="124" rx="19" ry="21" fill="#fff"/>
<g class="m-regard">
<ellipse cx="112" cy="126" rx="15" ry="17" fill="url(#m-oeil)"/><ellipse cx="188" cy="126" rx="15" ry="17" fill="url(#m-oeil)"/>
<ellipse cx="112" cy="127" rx="6.4" ry="11" fill="#1B2A14"/><ellipse cx="188" cy="127" rx="6.4" ry="11" fill="#1B2A14"/>
<circle cx="117" cy="118" r="5.4" fill="#fff"/><circle cx="193" cy="118" r="5.4" fill="#fff"/>
<circle cx="107" cy="134" r="2.4" fill="#fff" opacity=".9"/><circle cx="183" cy="134" r="2.4" fill="#fff" opacity=".9"/>
</g>
<ellipse class="m-paupiere" cx="112" cy="124" rx="21" ry="23" fill="#F3922F"/><ellipse class="m-paupiere" cx="188" cy="124" rx="21" ry="23" fill="#F3922F"/>
</g>
<g class="m-yeux-clos" style="display:none" fill="none" stroke="#6B2E12" stroke-width="3.8" stroke-linecap="round"><path d="M92,126 C102,138 122,138 132,126"/><path d="M168,126 C178,138 198,138 208,126"/><path d="M96,132 l-5,5 M132,132 l5,5 M168,132 l-5,5 M204,132 l5,5" stroke-width="2.8"/></g>
<path d="M142,150 C142,145 158,145 158,150 C158,157 150,161 150,161 C150,161 142,157 142,150 Z" fill="#F27C8C"/>
<path class="m-bouche-fermee" d="M150,161 L150,168 M134,172 C140,184 150,180 150,168 C150,180 160,184 166,172" fill="none" stroke="#6B2E12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<g class="m-bouche-ouverte" style="display:none"><path d="M134,168 C140,196 160,196 166,168 C158,174 142,174 134,168 Z" fill="#8A2E1B" stroke="#6B2E12" stroke-width="2.6" stroke-linejoin="round"/><path d="M142,184 C146,192 154,192 158,184 C154,180 146,180 142,184 Z" fill="#FF8A80"/></g>
</g>
<g stroke="#8B3E12" stroke-width="2" stroke-linecap="round" fill="none" opacity=".6"><path d="M98,162 L50,152 M98,168 L48,174 M202,162 L250,152 M202,168 L252,174"/></g>`;

const contourFiltre = (id, region = '') => `<filter id="${id}"${region}><feMorphology in="SourceAlpha" operator="dilate" radius="2.6" result="e"/><feFlood flood-color="#8B3E12"/><feComposite in2="e" operator="in" result="t"/><feMerge><feMergeNode in="t"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 380" class="mascotte-svg" role="img" aria-label="Tilleul, le chat de Linda">
<defs>
<linearGradient id="m-pelage" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9A653"/><stop offset="1" stop-color="#E3722A"/></linearGradient>
<linearGradient id="m-creme" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8EC"/><stop offset="1" stop-color="#FFE0B8"/></linearGradient>
<linearGradient id="m-patte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9A653"/><stop offset=".6" stop-color="#EE8A38"/><stop offset=".78" stop-color="#FFF3E0"/><stop offset="1" stop-color="#FFE0B8"/></linearGradient>
<radialGradient id="m-cuisse" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FAB064"/><stop offset="1" stop-color="#E3722A"/></radialGradient>
<radialGradient id="m-oeil" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#9BE37C"/><stop offset="1" stop-color="#2F9A47"/></radialGradient>
${contourFiltre('m-contour', ' x="-6%" y="-6%" width="112%" height="112%"')}
${contourFiltre('m-contour-large', ' filterUnits="userSpaceOnUse" x="-40" y="-40" width="440" height="460"')}
<filter id="m-flou"><feGaussianBlur stdDeviation="3.2"/></filter>
<clipPath id="m-leg-g"><path d="${JAMBE_G}"/></clipPath>
<clipPath id="m-leg-d"><path d="${JAMBE_D}"/></clipPath>
<clipPath id="m-queue-clip"><path d="${qAssis.contour}"/></clipPath>
<clipPath id="m-queue-couche-clip"><path d="${qCouche.contour}"/></clipPath>
</defs>
<ellipse class="m-ombre" cx="150" cy="364" rx="112" ry="8" fill="#2B6E3A" opacity=".14"/>

<g class="m-assis">

<g class="m-queue" filter="url(#m-contour)">
<path d="${qAssis.contour}" fill="url(#m-pelage)"/>
<g clip-path="url(#m-queue-clip)" fill="none" stroke-linecap="butt">
<path d="${qAssis.bandes}" stroke="#C25A18" stroke-width="8" opacity=".75"/>
<path d="${qAssis.ligne(0.55, 0.04, 0.96)}" stroke="#FFC98A" stroke-width="6" opacity=".6" stroke-linecap="round"/>
</g>
</g>

<g class="m-corps"><g filter="url(#m-contour)">
<path d="M104,176 C98,200 98,222 106,242 L194,242 C202,222 202,200 196,176 Z" fill="url(#m-pelage)"/>
<path d="M108,206 C82,238 72,292 84,326 C90,346 106,356 130,356 L170,356 C194,356 210,346 216,326 C228,292 218,238 192,206 Z" fill="url(#m-pelage)"/>
<path d="M110,214 C94,244 90,292 100,328 C104,338 110,346 118,350 C102,306 100,254 114,222 Z" fill="#B24E12" opacity=".28"/>
<path d="M150,214 C132,222 126,262 130,298 C134,322 146,332 150,332 C154,332 166,322 170,298 C174,262 168,222 150,214 Z" fill="url(#m-creme)"/>
<path d="M96,246 C108,248 116,254 120,262 M92,270 C104,270 112,274 116,282 M204,246 C192,248 184,254 180,262 M208,270 C196,270 188,274 184,282" fill="none" stroke="#B24E12" stroke-width="4" stroke-linecap="round" opacity=".5"/>
<path d="M70,348 C68,336 90,332 106,338 C120,344 118,358 102,360 C84,362 72,358 70,348 Z" fill="url(#m-creme)"/>
<path d="M230,348 C232,336 210,332 194,338 C180,344 182,358 198,360 C216,362 228,358 230,348 Z" fill="url(#m-creme)"/>
<path d="M82,346 l-1,6 M92,344 l0,7 M102,346 l1,6 M218,346 l1,6 M208,344 l0,7 M198,346 l-1,6" stroke="#C07A4A" stroke-width="2.2" stroke-linecap="round" fill="none"/>
</g>
<g class="m-jambe m-jambe-g">
<path d="${JAMBE_G}" fill="url(#m-pelage)"/>
<g clip-path="url(#m-leg-g)"><path d="M96,328 C108,318 118,334 128,326 C138,336 148,322 160,332 L160,372 L96,372 Z" fill="url(#m-creme)"/></g>
<path d="M120,346 l-1,9 M131,347 l0,9" stroke="#C07A4A" stroke-width="2.4" stroke-linecap="round" fill="none"/>
<path d="M118,244 C117,272 118,300 120,320" fill="none" stroke="#FFC98A" stroke-width="4" stroke-linecap="round" opacity=".6"/>
<path d="M112,250 C112,272 113,298 114,322 C110,330 104,340 108,350 C112,360 128,362 140,358 C150,352 150,340 146,326 C143,300 143,272 142,250" fill="none" stroke="#8B3E12" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g class="m-jambe m-jambe-d">
<path d="${JAMBE_D}" fill="url(#m-pelage)"/>
<g clip-path="url(#m-leg-d)"><path d="M204,328 C192,318 182,334 172,326 C162,336 152,322 140,332 L140,372 L204,372 Z" fill="url(#m-creme)"/></g>
<path d="M180,346 l1,9 M169,347 l0,9" stroke="#C07A4A" stroke-width="2.4" stroke-linecap="round" fill="none"/>
<path d="M182,244 C183,272 182,300 180,320" fill="none" stroke="#FFC98A" stroke-width="4" stroke-linecap="round" opacity=".5"/>
<path d="M188,250 C188,272 187,298 186,322 C190,330 196,340 192,350 C188,360 172,362 160,358 C150,352 150,340 154,326 C157,300 157,272 158,250" fill="none" stroke="#8B3E12" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>

<g class="m-tete"><g transform="translate(150,206) scale(0.92) translate(-150,-206)">
${tete}
</g></g>

</g>

<g class="m-couche-pose" style="display:none">
<g class="m-cq-corps" filter="url(#m-contour-large)">
<path d="M98,322 C84,262 132,224 202,220 C272,216 324,254 318,316 C314,346 272,358 202,358 C142,358 102,348 98,322 Z" fill="url(#m-pelage)"/>
<path d="M104,330 C132,346 200,352 262,346 C292,342 308,334 316,322 C312,346 272,358 202,358 C142,358 106,350 104,330 Z" fill="#B24E12" opacity=".22"/>
<path d="M124,256 C152,230 214,220 266,242" fill="none" stroke="#FFC98A" stroke-width="7" stroke-linecap="round" opacity=".6"/>
<path d="M150,236 C142,254 142,272 148,290 M186,228 C180,250 180,272 186,292 M222,230 C218,252 220,274 228,292" fill="none" stroke="#B24E12" stroke-width="4.5" stroke-linecap="round" opacity=".5"/>
</g>
<g class="m-cq-queue" filter="url(#m-contour-large)">
<path d="${qCouche.contour}" fill="url(#m-pelage)"/>
<g clip-path="url(#m-queue-couche-clip)" fill="none">
<path d="${qCouche.bandes}" stroke="#C25A18" stroke-width="7" opacity=".75"/>
<path d="${qCouche.ligne(0.5, 0.04, 0.96)}" stroke="#FFC98A" stroke-width="5" opacity=".6" stroke-linecap="round"/>
</g>
</g>
<g class="m-cq-hanche" fill="none" stroke-linecap="round">
<path d="M240,254 C230,284 238,318 266,342" stroke="#B24E12" stroke-width="3.6" opacity=".32"/>
<path d="M262,236 C292,242 310,266 312,296" stroke="#FFD08A" stroke-width="7" opacity=".5"/>
<path d="M272,300 C284,312 298,312 308,304" stroke="#B24E12" stroke-width="3" opacity=".28"/>
</g>
<g class="m-cq-pied" stroke-linejoin="round" stroke-linecap="round">
<path d="M298,334 L264,334 A7.5,7.5 0 0 0 255,345 A6,6 0 0 0 255,356 A7.5,7.5 0 0 0 264,364 L288,364 C306,364 314,352 310,344 C307,337 304,334 298,334 Z" fill="url(#m-creme)" stroke="#8B3E12" stroke-width="3.4"/>
<path d="M255,345 l9,0.6 M255,356 l9,-0.4" fill="none" stroke="#C07A4A" stroke-width="2.2"/>
</g>
<g class="m-cq-tete">
<g filter="url(#m-contour-large)">
<path d="M110,342 C110,332 130,330 156,332 C176,334 184,344 178,356 C172,366 130,368 118,362 C112,358 110,350 110,342 Z" fill="url(#m-creme)"/>
</g>
<g stroke-linejoin="round" stroke-linecap="round">
<path d="M118,333 L72,332 A7.5,7.5 0 0 0 63,343 A7,7 0 0 0 63,354 A7.5,7.5 0 0 0 72,364 C90,366 108,366 114,362 C126,356 126,338 118,333 Z" fill="url(#m-creme)" stroke="#8B3E12" stroke-width="3.4"/>
<path d="M63,343 l10,0.6 M63,354 l10,-0.4" fill="none" stroke="#C07A4A" stroke-width="2.2"/>
</g>
<g transform="translate(2,168) rotate(-8 150 134) scale(0.84)">
${tete}
</g>
</g>
<g class="m-zzz" aria-hidden="true" fill="none" stroke="#2B6E3A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
<path class="m-z m-z1" d="M236,170 h20 l-20 22 h20"/><path class="m-z m-z2" d="M268,138 h16 l-16 18 h16"/><path class="m-z m-z3" d="M294,108 h12 l-12 14 h12"/>
</g>
</g>
</svg>
`;
fs.writeFileSync('src/components/mascotte.svg', svg);
