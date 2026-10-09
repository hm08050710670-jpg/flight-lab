const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:390,height:844},colorScheme:'dark'});
await p.setContent('<!doctype html><html><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
const count=async()=>p.$$eval('#bigFig > g',g=>g.length);
console.log('init base arrows:',await count());
for(const c of ['L','S','R']){ await p.click(`.zones button[data-curve="${c}"]`); await p.waitForTimeout(1700);
  console.log(c,'after curve:',await count());
  for(const st of ['L','C','R']){ await p.click(`.card[data-start="${st}"]`); await p.waitForTimeout(1700); console.log(' ',st+c,'arrows:',await count()); } }
await p.click('.zones button[data-curve="R"]'); await p.waitForTimeout(1700);
await p.screenshot({path:'fix.png',clip:{x:16,y:230,width:360,height:250}});
await b.close();})();
