const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:390,height:700}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
await p.click('.zones button[data-curve="R"]'); await p.waitForTimeout(1800);
const snap=async()=>p.$eval('#bigFig',e=>e.innerHTML.length);
const a=await snap(); await p.waitForTimeout(600); const b2=await snap();
console.log('curve only: changes after done?', a!==b2);
await p.click('.card[data-start="C"]');
const seen=new Set(); for(let i=0;i<12;i++){ await p.waitForTimeout(300); seen.add(await snap()); }
console.log('after start: distinct frames over 3.6s =', seen.size);
await p.click('#goQ1'); await p.waitForTimeout(300); const c=await snap(); await p.waitForTimeout(500); console.log('on q1 stopped?', c===await snap());
await p.click('#backQ1'); const s2=new Set(); for(let i=0;i<6;i++){ await p.waitForTimeout(300); s2.add(await snap()); } console.log('back resumes loop?', s2.size>1);
console.log('errors',errs); await b.close();})();
