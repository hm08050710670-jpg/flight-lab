const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:390,height:844},colorScheme:'dark'});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
await p.click('.zones button[data-curve="R"]'); await p.click('.card[data-start="C"]'); await p.click('#goQ1'); await p.waitForTimeout(200);
await p.screenshot({path:'f_before.png',clip:{x:0,y:120,width:390,height:520}});
const box=await p.$eval('#facePhoto',e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});
const out=[];
for(const [fx,name] of [[0.2,'toe'],[0.5,'center'],[0.8,'heel']]){ await p.mouse.click(box.x+box.w*fx, box.y+box.h*0.6); await p.waitForTimeout(60); out.push(name+' RH -> '+await p.textContent('#roMain')+' next='+!(await p.$eval('#goQ2',e=>e.disabled))); }
await p.screenshot({path:'f_after.png',clip:{x:0,y:120,width:390,height:560}});
await p.$eval('#handL',e=>e.click()); await p.waitForTimeout(60); out.push('switch LH keeps -> '+await p.textContent('#roMain'));
for(const [fx,name] of [[0.2,'left side'],[0.8,'right side']]){ await p.mouse.click(box.x+box.w*fx, box.y+box.h*0.6); await p.waitForTimeout(60); out.push(name+' LH -> '+await p.textContent('#roMain')); }
await p.screenshot({path:'f_lh.png',clip:{x:0,y:120,width:390,height:560}});
await p.click('#faceUnk'); await p.waitForTimeout(60); out.push('unknown -> '+await p.textContent('#roMain')+' pressed='+await p.$eval('#faceUnk',e=>e.getAttribute('aria-pressed')));
await p.click('#roChg'); await p.waitForTimeout(60); out.push('retap -> hint shown='+!(await p.$eval('#faceHint',e=>e.hidden))+' next disabled='+await p.$eval('#goQ2',e=>e.disabled));
console.log(out.join('\n')); console.log('errors',errs); await b.close();})();
