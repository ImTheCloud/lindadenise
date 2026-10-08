import fs from 'fs';
const f=n=>Math.round(n*10)/10;
const mir=(d)=>d; // (les formes de droite sont écrites à la main)
// ---------- queue (plume en S, bord duveteux) ----------
const P=[[206,296],[330,322],[350,150],[240,84]];
const bez=(t)=>{const u=1-t;return [0,1].map(k=>u**3*P[0][k]+3*u*u*t*P[1][k]+3*u*t*t*P[2][k]+t**3*P[3][k]);};
const dv=(t)=>{const u=1-t;return [0,1].map(k=>3*u*u*(P[1][k]-P[0][k])+6*u*t*(P[2][k]-P[1][k])+3*t*t*(P[3][k]-P[2][k]));};
const w=(t)=>34+50*Math.sin(Math.PI*Math.pow(t,0.8));
const N=120;
const pt=(t,r,b=0)=>{const [x,y]=bez(t),[dx,dy]=dv(t),l=Math.hypot(dx,dy);const ww=w(t)/2+(r>0?b:0);return [x+(-dy/l)*ww*r,y+(dx/l)*ww*r];};
const bump=(i)=>i<4||i>N-4?0:5*Math.abs(Math.sin(i*0.5));
const L=[],R=[];for(let i=0;i<=N;i++){const t=i/N;L.push(pt(t,1,bump(i)));R.push(pt(t,-1));}
const ray=w(1)/2;
const contour='M'+L.map(p=>f(p[0])+','+f(p[1])).join(' L')+' A'+f(ray)+','+f(ray)+' 0 0 0 '+f(R[N][0])+','+f(R[N][1])+' L'+[...R].reverse().map(p=>f(p[0])+','+f(p[1])).join(' L')+' Z';
const ligne=(r,a,b,n=60)=>'M'+Array.from({length:n+1},(_,i)=>pt(a+(b-a)*i/n,r).map(f).join(',')).join(' L');

const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 370 350" class="noisette-svg" role="img" aria-label="Noisette, l'écureuil de Linda">
<defs>
<linearGradient id="n-pelage" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9A455"/><stop offset="1" stop-color="#E5772D"/></linearGradient>
<linearGradient id="n-queue-deg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#E06C25"/><stop offset=".6" stop-color="#F28D3C"/><stop offset="1" stop-color="#FBBE74"/></linearGradient>
<linearGradient id="n-creme" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8EC"/><stop offset="1" stop-color="#FFE0B8"/></linearGradient>
<filter id="n-contour" x="-6%" y="-6%" width="112%" height="112%"><feMorphology in="SourceAlpha" operator="dilate" radius="2.6" result="e"/><feFlood flood-color="#8B3E12"/><feComposite in2="e" operator="in" result="t"/><feMerge><feMergeNode in="t"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="n-flou"><feGaussianBlur stdDeviation="3.2"/></filter>
<clipPath id="n-queue-clip"><path d="${contour}"/></clipPath>
</defs>
<ellipse class="n-ombre" cx="150" cy="342" rx="104" ry="8" fill="#2B6E3A" opacity=".14"/>

<g class="n-queue" filter="url(#n-contour)">
<path d="${contour}" fill="url(#n-queue-deg)"/>
<g clip-path="url(#n-queue-clip)" fill="none" stroke-linecap="round">
<path d="${ligne(0.55,0.04,0.96)}" stroke="#FFD89C" stroke-width="15" opacity=".75"/>
<path d="${ligne(-0.2,0.08,0.94)}" stroke="#C45D1D" stroke-width="2.6" opacity=".45"/>
<path d="${ligne(0.1,0.1,0.9)}" stroke="#C45D1D" stroke-width="2.6" opacity=".38"/>
<path d="${ligne(-0.7,0.1,0.95)}" stroke="#C45D1D" stroke-width="7" opacity=".4"/>
</g>
</g>

<g class="n-corps" filter="url(#n-contour)">
<path d="M104,196 C84,230 76,278 90,314 C108,342 192,342 210,314 C224,278 216,230 196,196 Z" fill="url(#n-pelage)"/>
<path d="M104,200 C90,236 88,282 100,312 C106,322 112,326 118,328 C100,296 98,246 112,212 Z" fill="#C45D1D" opacity=".28"/>
<path d="M150,206 C124,214 112,254 116,292 C120,320 140,330 150,330 C160,330 180,320 184,292 C188,254 176,214 150,206 Z" fill="url(#n-creme)"/>
<path d="M92,322 C78,326 76,338 90,342 C106,346 126,342 128,334 C128,324 108,318 92,322 Z" fill="#F7A650"/>
<path d="M208,322 C222,326 224,338 210,342 C194,346 174,342 172,334 C172,324 192,318 208,322 Z" fill="#F7A650"/>
<path d="M92,336 l-1,5 M102,338 l0,5 M112,336 l1,5 M208,336 l1,5 M198,338 l0,5 M188,336 l-1,5" stroke="#B8561C" stroke-width="2.2" stroke-linecap="round"/>
</g>

<g class="n-gland" filter="url(#n-contour)">
<path d="M134,272 C132,298 142,312 150,316 C158,312 168,298 166,272 Z" fill="#C98A48"/>
<path d="M127,276 C127,256 173,256 173,276 C164,284 136,284 127,276 Z" fill="#7A4A24"/>
<path d="M150,262 L154,250" stroke="#5E3718" stroke-width="4" stroke-linecap="round"/>
<path d="M141,284 C140,296 143,304 146,308" stroke="#EDBE86" stroke-width="3.4" stroke-linecap="round" fill="none"/>
</g>

<g class="n-bras n-bras-g" filter="url(#n-contour)">
<path d="M112,184 C92,214 94,262 124,284 C138,292 148,280 140,270 C126,260 122,244 128,228 C132,214 128,196 122,184 Z" fill="url(#n-pelage)"/>
<path d="M124,274 C118,282 124,292 134,290 C144,288 146,278 140,272 C134,268 128,270 124,274 Z" fill="#F7A650"/>
<path d="M128,288 l-1,4 M135,290 l0,4 M142,286 l2,3" stroke="#B8561C" stroke-width="2" stroke-linecap="round"/>
</g>
<g class="n-bras n-bras-d" filter="url(#n-contour)"><g transform="translate(300,0) scale(-1,1)">
<path d="M112,184 C92,214 94,262 124,284 C138,292 148,280 140,270 C126,260 122,244 128,228 C132,214 128,196 122,184 Z" fill="url(#n-pelage)"/>
<path d="M124,274 C118,282 124,292 134,290 C144,288 146,278 140,272 C134,268 128,270 124,274 Z" fill="#F7A650"/>
<path d="M128,288 l-1,4 M135,290 l0,4 M142,286 l2,3" stroke="#B8561C" stroke-width="2" stroke-linecap="round"/>
</g></g>

<g class="n-tete">
<g filter="url(#n-contour)">
<g class="n-oreille n-oreille-g">
<path d="M112,86 C112,58 94,40 76,40 C64,40 58,52 60,68 C62,88 78,104 94,108 Z" fill="url(#n-pelage)"/>
<path d="M98,86 C98,68 88,56 76,54 C72,64 74,80 84,94 Z" fill="#F9C9A2"/>
</g>
<g class="n-oreille n-oreille-d">
<path d="M188,86 C188,58 206,40 224,40 C236,40 242,52 240,68 C238,88 222,104 206,108 Z" fill="url(#n-pelage)"/>
<path d="M202,86 C202,68 212,56 224,54 C228,64 226,80 216,94 Z" fill="#F9C9A2"/>
</g>
<path d="M150,62 C198,60 238,94 242,136 C244,176 208,208 150,208 C92,208 56,176 58,136 C62,94 102,60 150,62 Z" fill="url(#n-pelage)"/>
<path d="M150,128 C172,118 206,126 214,150 C220,174 190,198 150,198 C110,198 80,174 86,150 C94,126 128,118 150,128 Z" fill="url(#n-creme)"/>
<path d="M84,100 C92,82 112,70 134,68 C116,76 100,90 94,108 Z" fill="#FFC27E" opacity=".55"/>
<g fill="#FF8E7A" filter="url(#n-flou)" opacity=".5"><path d="M94,150 C94,142 112,142 112,150 C112,158 94,158 94,150 Z"/><path d="M188,150 C188,142 206,142 206,150 C206,158 188,158 188,150 Z"/></g>
<g class="n-yeux">
<ellipse cx="116" cy="118" rx="13.5" ry="15" fill="#2A1608"/><ellipse cx="184" cy="118" rx="13.5" ry="15" fill="#2A1608"/>
<ellipse cx="116" cy="121" rx="10" ry="11" fill="#5A2E14" opacity=".8"/><ellipse cx="184" cy="121" rx="10" ry="11" fill="#5A2E14" opacity=".8"/>
<circle cx="121" cy="111" r="5.4" fill="#fff"/><circle cx="189" cy="111" r="5.4" fill="#fff"/>
<circle cx="111" cy="126" r="2.4" fill="#fff"/><circle cx="179" cy="126" r="2.4" fill="#fff"/>
<ellipse class="n-paupiere" cx="116" cy="118" rx="15" ry="16" fill="#F59A4B"/><ellipse class="n-paupiere" cx="184" cy="118" rx="15" ry="16" fill="#F59A4B"/>
</g>
<path d="M142,139 C142,132 158,132 158,139 C158,147 150,151 150,151 C150,151 142,147 142,139 Z" fill="#4A2A18"/>
<ellipse cx="147" cy="136" rx="3" ry="1.6" fill="#fff" opacity=".6"/>
<path class="n-bouche-fermee" d="M150,151 L150,159 M130,160 C136,174 150,172 150,159 C150,172 164,174 170,160" fill="none" stroke="#4A2A18" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
<g class="n-bouche-ouverte" style="display:none"><path d="M132,158 C138,190 162,190 168,158 C160,164 140,164 132,158 Z" fill="#8A2E1B" stroke="#4A2A18" stroke-width="2.6" stroke-linejoin="round"/><path d="M142,176 C146,184 154,184 158,176 C154,172 146,172 142,176 Z" fill="#FF8A80"/></g>
<path d="M150,70 C146,82 140,88 140,88 M150,70 C154,82 160,88 160,88" fill="none" stroke="#C45D1D" stroke-width="3" stroke-linecap="round" opacity=".5"/>
</g>
<g stroke="#FFF3E0" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M100,152 L58,144 M100,158 L56,164 M200,152 L242,144 M200,158 L244,164"/></g>
</g>
</svg>
`;
fs.writeFileSync('src/components/noisette.svg',svg);
//
