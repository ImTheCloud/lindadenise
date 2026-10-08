// Génère src/components/mascotte.svg : Tilleul, le chat roux aux yeux verts, inspiré de Tiroux dans les dessins de Linda.
// Usage : node scripts/generer-mascotte.mjs
// Style : aplats avec ombres, un contour unique par grande partie (filtre), parties animées séparément (classes m-*).
import fs from 'node:fs';

const f = (n) => Math.round(n * 10) / 10;

// ---------- queue : courbe en S, rayures perpendiculaires ----------
const P = [[206, 318], [308, 332], [340, 236], [290, 148]];
const bez = (t) => { const u = 1 - t; return [0, 1].map((k) => u ** 3 * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t ** 3 * P[3][k]); };
const dv = (t) => { const u = 1 - t; return [0, 1].map((k) => 3 * u * u * (P[1][k] - P[0][k]) + 6 * u * t * (P[2][k] - P[1][k]) + 3 * t * t * (P[3][k] - P[2][k])); };
const w = (t) => 34 - 9 * t;
const pt = (t, r) => { const [x, y] = bez(t), [dx, dy] = dv(t), l = Math.hypot(dx, dy); return [x + (-dy / l) * (w(t) / 2) * r, y + (dx / l) * (w(t) / 2) * r]; };
const N = 70;
const L = [], R = [];
for (let i = 0; i <= N; i++) { L.push(pt(i / N, 1)); R.push(pt(i / N, -1)); }
const ray = w(1) / 2;
const contour = 'M' + L.map((p) => f(p[0]) + ',' + f(p[1])).join(' L') + ' A' + f(ray) + ',' + f(ray) + ' 0 0 0 ' + f(R[N][0]) + ',' + f(R[N][1]) + ' L' + [...R].reverse().map((p) => f(p[0]) + ',' + f(p[1])).join(' L') + ' Z';
const ligne = (r, a, b, n = 50) => 'M' + Array.from({ length: n + 1 }, (_, i) => pt(a + (b - a) * i / n, r).map(f).join(',')).join(' L');
const bandes = [0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.82].map((t) => `M${pt(t, 1.4).map(f).join(',')} L${pt(t, -1.4).map(f).join(',')}`).join(' ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" class="mascotte-svg" role="img" aria-label="Tilleul, le chat de Linda">
<defs>
<linearGradient id="m-pelage" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9A653"/><stop offset="1" stop-color="#E3722A"/></linearGradient>
<linearGradient id="m-creme" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8EC"/><stop offset="1" stop-color="#FFE0B8"/></linearGradient>
<radialGradient id="m-oeil" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#9BE37C"/><stop offset="1" stop-color="#2F9A47"/></radialGradient>
<filter id="m-contour" x="-6%" y="-6%" width="112%" height="112%"><feMorphology in="SourceAlpha" operator="dilate" radius="2.6" result="e"/><feFlood flood-color="#8B3E12"/><feComposite in2="e" operator="in" result="t"/><feMerge><feMergeNode in="t"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="m-contour-large" filterUnits="userSpaceOnUse" x="-40" y="-40" width="440" height="440"><feMorphology in="SourceAlpha" operator="dilate" radius="2.6" result="e"/><feFlood flood-color="#8B3E12"/><feComposite in2="e" operator="in" result="t"/><feMerge><feMergeNode in="t"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="m-flou"><feGaussianBlur stdDeviation="3.2"/></filter>
<clipPath id="m-queue-clip"><path d="${contour}"/></clipPath>
</defs>
<ellipse class="m-ombre" cx="150" cy="352" rx="108" ry="8" fill="#2B6E3A" opacity=".14"/>

<g class="m-pose-queue"><g class="m-queue" filter="url(#m-contour)">
<path d="${contour}" fill="url(#m-pelage)"/>
<g clip-path="url(#m-queue-clip)" fill="none" stroke-linecap="butt">
<path d="${bandes}" stroke="#C25A18" stroke-width="8" opacity=".75"/>
<path d="${ligne(0.55, 0.04, 0.96)}" stroke="#FFC98A" stroke-width="6" opacity=".6" stroke-linecap="round"/>
</g>
</g></g>

<g class="m-pose-corps"><g class="m-corps" filter="url(#m-contour)">
<path d="M108,206 C82,238 72,292 84,326 C90,346 106,352 130,352 L170,352 C194,352 210,346 216,326 C228,292 218,238 192,206 Z" fill="url(#m-pelage)"/>
<path d="M110,214 C94,244 90,292 100,328 C104,338 110,344 118,348 C102,306 100,254 114,222 Z" fill="#B24E12" opacity=".28"/>
<path d="M150,214 C132,222 126,262 130,298 C134,322 146,332 150,332 C154,332 166,322 170,298 C174,262 168,222 150,214 Z" fill="url(#m-creme)"/>
<path d="M96,246 C108,248 116,254 120,262 M92,270 C104,270 112,274 116,282 M94,296 C104,296 110,298 114,304 M204,246 C192,248 184,254 180,262 M208,270 C196,270 188,274 184,282 M206,296 C196,296 190,298 186,304" fill="none" stroke="#B24E12" stroke-width="4" stroke-linecap="round" opacity=".5"/>
<path d="M104,340 C102,324 122,318 138,324 C152,330 152,350 138,354 C122,358 106,354 104,340 Z" fill="url(#m-creme)"/>
<path d="M196,340 C198,324 178,318 162,324 C148,330 148,350 162,354 C178,358 194,354 196,340 Z" fill="url(#m-creme)"/>
<path d="M118,330 l-1,7 M127,332 l0,7 M136,332 l1,6 M182,330 l1,7 M173,332 l0,7 M164,332 l-1,6" stroke="#C07A4A" stroke-width="2.4" stroke-linecap="round" fill="none"/>
</g></g>

<g class="m-pose-tete"><g class="m-tete"><g transform="translate(150,206) scale(0.92) translate(-150,-206)">
<g filter="url(#m-contour)">
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
<g class="m-yeux-clos" style="display:none" fill="none" stroke="#6B2E12" stroke-width="3.6" stroke-linecap="round"><path d="M92,126 C102,138 122,138 132,126"/><path d="M168,126 C178,138 198,138 208,126"/><path d="M96,132 l-5,5 M132,132 l5,5 M168,132 l-5,5 M204,132 l5,5" stroke-width="2.6"/></g>
<path d="M142,150 C142,145 158,145 158,150 C158,157 150,161 150,161 C150,161 142,157 142,150 Z" fill="#F27C8C"/>
<path class="m-bouche-fermee" d="M150,161 L150,168 M134,172 C140,184 150,180 150,168 C150,180 160,184 166,172" fill="none" stroke="#6B2E12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<g class="m-bouche-ouverte" style="display:none"><path d="M134,168 C140,196 160,196 166,168 C158,174 142,174 134,168 Z" fill="#8A2E1B" stroke="#6B2E12" stroke-width="2.6" stroke-linejoin="round"/><path d="M142,184 C146,192 154,192 158,184 C154,180 146,180 142,184 Z" fill="#FF8A80"/></g>
</g>
<g stroke="#8B3E12" stroke-width="2" stroke-linecap="round" fill="none" opacity=".6"><path d="M98,162 L50,152 M98,168 L48,174 M202,162 L250,152 M202,168 L252,174"/></g>
</g></g></g>

<g class="m-bras-salut" style="display:none"><g class="m-bras-mouvement" filter="url(#m-contour-large)">
<path d="M118,254 L70,200" stroke="#F08A3A" stroke-width="32" stroke-linecap="round" fill="none"/>
<path d="M112,246 L78,208" stroke="#FFB867" stroke-width="8" stroke-linecap="round" fill="none" opacity=".7"/>
<circle cx="68" cy="198" r="17" fill="url(#m-creme)"/>
<path d="M60,190 l-4,-5 M68,188 l0,-7 M76,190 l4,-5" stroke="#C07A4A" stroke-width="2.4" stroke-linecap="round"/>
</g></g>

<g class="m-zzz" aria-hidden="true" fill="none" stroke="#2B6E3A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
<path class="m-z m-z1" d="M232,96 h18 l-18 20 h18"/><path class="m-z m-z2" d="M262,66 h14 l-14 16 h14"/><path class="m-z m-z3" d="M286,40 h10 l-10 12 h10"/>
</g>
</svg>
`;
fs.writeFileSync('src/components/mascotte.svg', svg);
