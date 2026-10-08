import fs from 'fs';
const OUT='/Users/claudiupopadiuc/Documents/GitHub/lindadenise/design/logos/';
const C={O:'#F28A1E',OL:'#FFB347',OLL:'#FFD9A3',OD:'#D96F0C',G:'#3E9A47',DG:'#2B6E3A',GL:'#CFE8CF',W:'#fff',INK:'#2B3B2B'};
const f=n=>Math.round(n*100)/100;
const svg=(body,extra='')=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"${extra}>${body}</svg>\n`;

// ---------- Lotus ----------
const PET='M0,0 C-27,-18 -29,-60 0,-94 C29,-60 27,-18 0,0 Z';
const VEIN='M0,-10 C-4,-36 -3,-62 0,-82';
function petal(angle,scale,fill,vein){return `<g transform="rotate(${angle}) scale(${scale})"><path d="${PET}" fill="${fill}"/><path d="${VEIN}" fill="none" stroke="${vein}" stroke-width="3" stroke-linecap="round" opacity=".55"/></g>`;}
function lotus({x=100,y=140,s=1,back=C.OL,mid=C.O,front='#F7992B',vein=C.OLL}={}){
 return `<g transform="translate(${x},${y}) scale(${s})">${petal(-80,.78,back,vein)}${petal(80,.78,back,vein)}${petal(-52,.92,mid,vein)}${petal(52,.92,mid,vein)}${petal(-24,1,front,vein)}${petal(24,1,front,vein)}${petal(0,1.06,mid,vein)}</g>`;
}
function pad(x,y,w,fill){ // feuille de nenuphar vue de cote + rides
 return `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w*.2}" fill="${fill}"/>`;
}
function ripples(y,col,sw=5){return `<path d="M34,${y} Q67,${y-9} 100,${y} T166,${y}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/><path d="M62,${y+14} Q100,${y+5} 138,${y+14}" fill="none" stroke="${col}" stroke-width="${sw-1.5}" stroke-linecap="round" opacity=".6"/>`;}

const logo1=svg(`${pad(100,152,78,C.G)}${lotus({y:150})}${ripples(172,C.G)}`);
const logo2=svg(`<circle cx="100" cy="100" r="95" fill="${C.G}"/><circle cx="100" cy="100" r="88" fill="none" stroke="#fff" stroke-width="2" opacity=".45"/>${pad(100,142,58,C.DG)}${lotus({y:140,s:.74,back:'#DDF0DD',mid:C.OL,front:'#FFC27A',vein:'#fff'})}${ripples(160,'#fff',4)}`);

// ---------- Monogramme ----------
const Lp='M60,34 C57,70 58,112 62,146 C63,156 72,159 84,158 C112,156 140,157 162,152';
const Dp='M114,52 C162,42 190,78 178,114 C170,140 144,152 116,146 C112,114 112,82 114,52 Z';
const leafTip='M150,40 C160,22 182,20 190,28 C184,46 166,54 150,40 Z';
const logo3=svg(`<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="14"><path d="${Lp}" stroke="${C.G}"/><path d="${Dp}" stroke="${C.O}"/></g><path d="${leafTip}" fill="${C.G}" transform="translate(-8,6)"/>`);
const logo4=svg(`<circle cx="100" cy="100" r="95" fill="${C.O}"/><circle cx="100" cy="100" r="88" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/><g transform="translate(22,22) scale(.78)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="15"><path d="${Lp}"/><path d="${Dp}"/></g><path d="M138,22 C168,18 184,40 182,64 C158,68 138,50 138,22 Z" fill="${C.G}"/><path d="M144,30 C158,40 170,52 176,60" stroke="${C.GL}" stroke-width="3" fill="none" stroke-linecap="round"/>`);

// ---------- Feuille de tilleul (pointe en haut) ----------
const leafBody='M100,20 C128,56 176,80 166,128 C160,158 124,170 100,150 C76,170 40,158 34,128 C24,80 72,56 100,20 Z';
function tilleulLeaf(extra=''){return `<path d="${leafBody}" fill="${C.G}"/><path d="M100,150 L100,44 M100,128 C84,116 72,104 62,94 M100,128 C116,116 128,104 138,94 M100,100 C88,92 80,84 74,76 M100,100 C112,92 120,84 126,76" fill="none" stroke="${C.GL}" stroke-width="4" stroke-linecap="round"/><path d="M100,150 C100,166 94,178 88,188" fill="none" stroke="${C.DG}" stroke-width="6" stroke-linecap="round"/>${extra}`;}
const flowers=`<path d="M138,60 C158,52 168,66 164,86" fill="none" stroke="${C.DG}" stroke-width="4" stroke-linecap="round"/><ellipse cx="170" cy="72" rx="9" ry="14" fill="${C.GL}" transform="rotate(20 170 72)" opacity="0"/><circle cx="164" cy="92" r="7" fill="${C.O}"/><circle cx="154" cy="84" r="6" fill="${C.OL}"/><circle cx="174" cy="82" r="6" fill="${C.OL}"/>`;
const logo5=svg(tilleulLeaf('')+'' ).replace('</svg>',`<path d="M144,68 C170,54 188,66 183,92" fill="none" stroke="${C.DG}" stroke-width="4" stroke-linecap="round"/><circle cx="182" cy="98" r="8" fill="${C.O}"/><circle cx="170" cy="94" r="6.5" fill="${C.OL}"/><circle cx="190" cy="86" r="6" fill="${C.OL}"/></svg>`);

// ---------- Ecureuil ----------
function bez(p,t){const u=1-t;return [u**3*p[0][0]+3*u*u*t*p[1][0]+3*u*t*t*p[2][0]+t**3*p[3][0],u**3*p[0][1]+3*u*u*t*p[1][1]+3*u*t*t*p[2][1]+t**3*p[3][1]];}
function dbez(p,t){const u=1-t;return [3*u*u*(p[1][0]-p[0][0])+6*u*t*(p[2][0]-p[1][0])+3*t*t*(p[3][0]-p[2][0]),3*u*u*(p[1][1]-p[0][1])+6*u*t*(p[2][1]-p[1][1])+3*t*t*(p[3][1]-p[2][1])];}
function tail(p,wf,n=48){const L=[],R=[];for(let i=0;i<=n;i++){const t=i/n,[x,y]=bez(p,t),[dx,dy]=dbez(p,t),l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l,w=wf(t)/2;L.push([x+nx*w,y+ny*w]);R.push([x-nx*w,y-ny*w]);}
 const pts=L.concat(R.reverse());return 'M'+pts.map(q=>f(q[0])+','+f(q[1])).join(' L')+' Z';}
const TP=[[118,160],[184,174],[196,92],[146,56]];
const tailW=t=>20+27*Math.sin(Math.PI*t)**0.7*(1-.3*t)+4*t;
function ear(H,r,ang,fill,inner){const d=ang*Math.PI/180,cx=f(H[0]+(r+3)*Math.cos(d)),cy=f(H[1]-(r+3)*Math.sin(d)),rot=90-ang;
 const ix=f(H[0]+(r+4)*Math.cos(d)),iy=f(H[1]-(r+4)*Math.sin(d));
 return `<ellipse cx="${cx}" cy="${cy}" rx="9" ry="12.5" fill="${fill}" transform="rotate(${rot} ${cx} ${cy})"/><ellipse cx="${ix}" cy="${iy}" rx="4.6" ry="7.5" fill="${inner}" transform="rotate(${rot} ${ix} ${iy})"/>`;}
function squirrel({x=0,y=0,s=1}={}){
 const H=[84,80],r=25;
 return `<g transform="translate(${x},${y}) scale(${s})">
<path d="${tail(TP,tailW)}" fill="${C.O}" stroke="${C.O}" stroke-width="3" stroke-linejoin="round"/>
<circle cx="${f(bez(TP,1)[0])}" cy="${f(bez(TP,1)[1])}" r="${f(tailW(1)/2+1.5)}" fill="${C.O}"/><path d="M${bez(TP,.2).map(f)} ${Array.from({length:30},(_,i)=>'L'+bez(TP,.2+i*.025).map(f)).join(' ')}" fill="none" stroke="${C.OL}" stroke-width="7" stroke-linecap="round" opacity=".6"/>
<ellipse cx="106" cy="132" rx="30" ry="38" fill="${C.O}" transform="rotate(-6 106 132)"/>
<circle cx="120" cy="148" r="21" fill="${C.O}" stroke="${C.OD}" stroke-width="3" opacity="1"/>
<ellipse cx="92" cy="136" rx="15" ry="26" fill="${C.OLL}"/>
${ear(H,r,121,C.O,C.OLL)}${ear(H,r,63,C.O,C.OLL)}
<circle cx="${H[0]}" cy="${H[1]}" r="${r}" fill="${C.O}"/>
<ellipse cx="68" cy="89" rx="12" ry="9.5" fill="${C.OLL}"/>
<circle cx="76" cy="75" r="4.6" fill="${C.INK}"/><circle cx="77.4" cy="73.6" r="1.4" fill="#fff"/>
<circle cx="58" cy="87" r="3.6" fill="${C.INK}"/>
<path d="M62,96 Q68,99 74,95" fill="none" stroke="${C.OD}" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="76" cy="121" rx="9" ry="10" fill="${C.G}"/><path d="M66,114 C66,104 86,104 86,114 Z" fill="${C.DG}"/><path d="M76,104 L77,99" stroke="${C.DG}" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="66" cy="119" rx="5.5" ry="7" fill="${C.OL}" transform="rotate(-15 66 119)"/><ellipse cx="87" cy="119" rx="5.5" ry="7" fill="${C.OL}" transform="rotate(15 87 119)"/>
<ellipse cx="94" cy="170" rx="21" ry="7.5" fill="${C.OD}"/><ellipse cx="130" cy="170" rx="19" ry="7.5" fill="${C.OD}"/>
</g>`;}
const logo6=svg(squirrel({x:10,y:10,s:.88}));
const logo7=svg(`<circle cx="100" cy="100" r="95" fill="#EAF5EA"/><path d="M40,152 C76,142 124,142 160,150" fill="none" stroke="${C.DG}" stroke-width="9" stroke-linecap="round"/>
<g transform="translate(160,150) rotate(36) scale(.26) translate(-100,-188)">${tilleulLeaf('')}</g><g transform="translate(40,153) rotate(-36) scale(.23) translate(-100,-188)">${tilleulLeaf('')}</g>
${squirrel({x:14,y:14,s:.72})}`);
// 8 : ecureuil sur un lotus
const logo8=svg(`<circle cx="100" cy="100" r="95" fill="#EAF5EA"/>${pad(100,160,70,C.G)}${lotus({y:160,s:.82})}<g>${squirrel({x:42,y:16,s:.5})}</g>${ripples(180,C.G,4)}`);
const all={ '01-lotus':logo1,'02-lotus-badge':logo2,'03-monogramme-ld':logo3,'04-monogramme-badge':logo4,'05-tilleul':logo5,'06-ecureuil':logo6,'07-ecureuil-branche':logo7,'08-ecureuil-lotus':logo8};
for(const [k,v] of Object.entries(all)) fs.writeFileSync(OUT+k+'.svg',v);
console.log('ok');
