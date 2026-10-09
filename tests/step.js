const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:390,height:700},colorScheme:'dark'});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
await p.waitForTimeout(200); await p.screenshot({path:'s_init.png'});
await p.click('.zones button[data-curve="R"]'); await p.waitForTimeout(1900); await p.screenshot({path:'s_sel.png'});
await p.click('.card[data-start="C"]'); await p.click('#goQ1'); await p.waitForTimeout(200);
const box=await p.$eval('#facePhoto',e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});
const out=[];
for(const [fy,name] of [[0.3,'high'],[0.55,'mid'],[0.8,'low']]){ await p.mouse.click(box.x+box.w*0.8, box.y+box.h*fy); await p.waitForTimeout(60); out.push(name+' -> '+await p.textContent('#roMain')+' / '+await p.textContent('#roSub')); }
await p.screenshot({path:'s_face.png'});
await p.click('#goQ2'); await p.click('#windOpts .opt[data-wind="calm"]'); await p.click('#goResult'); await p.waitForTimeout(200);
out.push('vertWrap hidden='+await p.$eval('#vertWrap',e=>e.hidden)+' '+await p.textContent('#kvVert'));
await p.click('#rDetails summary'); await p.waitForTimeout(100);
out.push('details has gear='+/バルジ/.test(await p.textContent('#rBody'))+' vert='+/上下の打点/.test(await p.textContent('#rBody')));
await p.screenshot({path:'s_result.png',fullPage:true});
console.log(out.join('\n')); console.log('errors',errs); await b.close();})();
