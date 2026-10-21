// Vérifie, sur des milliers de tirages, que chaque générateur donne des questions justes (réponse unique, calcul exact)
import * as M from '../js/content/maths.js';
const num = s => parseFloat(String(s).replace(/[\s\u202f]/g,'').replace(',','.'));
const evalDecomp = t => t.split(' + ').reduce((a,p)=>{ const [x,y]=p.split('/'); return a + (y? num(x)/num(y) : num(x)); },0);
const eq=(a,b)=>Math.abs(a-b)<1e-9;
const ROUNDS = 1500;

export function run(failFn) {
let n=0;
const fail=(g,q,why)=>failFn(`${g} : ${why} — « ${q.text} » options=${JSON.stringify(q.options)} réponse=${q.answer}`);


for(let i=0;i<ROUNDS;i++){
 for(const [name,fn] of Object.entries(M)){
  if(!name.startsWith('generate')||name==='generateOptions') continue;
  const q=fn(); n++;
  const k=q.kind||'qcm';
  if(k==='qcm'){ if(new Set(q.options).size!==q.options.length||q.options.length!==4||!q.options.includes(q.answer)) fail(name,q,'options'); }
  if(!q.explanation) fail(name,q,'no explanation');
  if(name==='generateDecompositionQuestion'){
    const m=q.text.match(/pour (.+) \?$/);
    if(m){ const target=num(m[1]); const good=q.options.filter(o=>eq(evalDecomp(o),target)); if(good.length!==1||good[0]!==q.answer) fail(name,q,'decomp->'+good.length); }
    else { const m2=q.text.match(/: (.+) \?$/); const v=evalDecomp(m2[1]); const good=q.options.filter(o=>eq(num(o),v)); if(good.length!==1||good[0]!==q.answer) fail(name,q,'nombre<-'+good.length); }
  }
  if(name==='generateDigitRankQuestion'){ const m=q.text.match(/Dans (.+), quel est le chiffre des (.+) \?/); const s=m[1].replace(/ /g,''); const [ip,dp]=s.split(','); const idx={milliers:ip.length-4,centaines:ip.length-3,dizaines:ip.length-2,unités:ip.length-1}; let exp; if(m[2] in idx) exp=ip[idx[m[2]]]; else exp=dp[{dixièmes:0,centièmes:1,millièmes:2}[m[2]]]; if(exp!==q.answer) fail(name,q,'digit exp '+exp); }
  if(name==='generateDigitValueQuestion'){ const m=q.text.match(/Dans (.+), quelle est la valeur du chiffre des (.+) \?/); const dp=m[1].split(',')[1]; const r={dixièmes:[0,10],centièmes:[1,100],millièmes:[2,1000]}[m[2]]; if(q.answer!==`${dp[r[0]]}/${r[1]}`) fail(name,q,'value'); }
  if(name==='generateDecimalFractionQuestion'){ const a=q.text.match(/égale à (.+) \?/); if(a){ const [x,y]=q.answer.split('/'); if(!eq(num(x)/num(y),num(a[1]))) fail(name,q,'frac'); const bads=q.options.filter(o=>{const [x2,y2]=o.split('/'); return eq(num(x2)/num(y2),num(a[1]))}); if(bads.length!==1) fail(name,q,'frac dup'); } else { const b=q.text.match(/fraction (\d+)\/(\d+)/); if(!eq(num(q.answer),num(b[1])/num(b[2]))) fail(name,q,'dec'); if(q.options.filter(o=>eq(num(o),num(b[1])/num(b[2]))).length!==1) fail(name,q,'dec dup'); } }
  if(name==='generatePriorityQuestion'){ const e=q.text.replace('Calcule : ','').replace(/×/g,'*').replace(/−/g,'-'); if(eval(e)!==parseInt(q.answer)) fail(name,q,'prio'); }
  if(name==='generateMultipleQuestion'){ const d=+q.text.match(/multiple de (\d+)/)[1]; if(q.options.filter(o=>+o%d===0).length!==1) fail(name,q,'mult'); }
  if(name==='generateDivisibilityQuestion'){ const d=+q.text.match(/divisible par (\d+)/)[1]; if(q.options.filter(o=>+o%d===0).length!==1) fail(name,q,'div'); }
  if(name==='generateEuclideanQuestion'){ const m=q.text.match(/de (\d+) par (\d+) : quel est le (\w+)/); const a=+m[1],b=+m[2]; const exp=m[3]==='quotient'?Math.floor(a/b):a%b; if(exp!==+q.answer) fail(name,q,'euclid'); }
  if(name==='generateOrderDecimalsQuestion'){ const v=q.items.map(num); if(v.some((x,i)=>i&&x<=v[i-1])) fail(name,q,'order'); }
  if(name==='generateDecimalOperationQuestion'){ const m=q.text.match(/Calcule : (.+) ([+−]) (.+)/); const r=m[2]==='+'?num(m[1])+num(m[3]):num(m[1])-num(m[3]); if(!eq(r,num(q.answer))||r<=0) fail(name,q,'ops'); }
  if(name==='generatePercentQuestion'){ const m=q.text.match(/(\d+) % de (\d+)/); if(+m[1]*+m[2]/100!==+q.answer) fail(name,q,'pct'); }
  if(name==='generatePerimeterAreaQuestion'){ const a=q.text; let exp; let m; if((m=a.match(/carré a un côté de (\d+)/))) exp=a.includes('aire')?m[1]*m[1]:4*m[1]; else { m=a.match(/mesure (\d+) cm de long et (\d+)/); exp=a.includes('aire')?m[1]*m[2]:2*(+m[1]+ +m[2]); } if(exp!==+q.answer) fail(name,q,'geo'); }
  if(name==='generateDurationQuestion' && k==='qcm'){ const m=q.text.match(/commence à (\d+) h (\d+) et dure (\d+) h (\d+) min/); const t=(+m[1]*60+ +m[2]+ +m[3]*60+ +m[4])%1440; const exp=`${Math.floor(t/60)} h ${String(t%60).padStart(2,'0')}`; if(exp!==q.answer) fail(name,q,'time'); }
 }
}

return `${n} questions générées vérifiées`;
}
