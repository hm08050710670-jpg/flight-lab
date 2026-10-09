const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const html = require('fs').readFileSync(path.resolve(__dirname, '../app/index.html'), 'utf8');
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body>' + html + '</body></html>');
  await page.waitForTimeout(300);
  const out = [];
  const isVisible = sel => page.isVisible(sel);
  // initial
  out.push('init: candWrap hidden=' + await page.$eval('#candWrap', e => e.hidden) + ' goQ1 disabled=' + await page.$eval('#goQ1', e => e.disabled));
  // 9 classes x contact x wind
  const curves = ['L','S','R'], starts = ['L','C','R'];
  const contacts = ['center','toe','heel','unknown'], winds = ['calm'];
  let count = 0;
  for (const c of curves) for (const s of starts) {
    await page.click(`.zones button[data-curve="${c}"]`);
    if (await page.$eval('#candWrap', e => e.hidden)) out.push('FAIL candWrap hidden after curve ' + c);
    if (!(await page.$eval('#goQ1', e => e.disabled))) out.push('FAIL goQ1 enabled before start');
    await page.click(`.card[data-start="${s}"]`);
    await page.click('#goQ1');
    for (const ct of contacts) for (const w of winds) {
      await page.$eval(`#contactOpts .opt[data-contact="${ct}"]`,e=>e.click());
      await page.click('#goQ2');
      const head = await page.textContent('#rHead');
      const eyebrow = await page.textContent('#rEyebrow');
      const altHidden = await page.$eval('#altWrap', e => e.hidden);
      const expAlt = false;
      if (altHidden !== expAlt) out.push(`FAIL alt visibility ${s}${c}`);
      const expHead = w !== 'calm' ? '風を除いて、確認したい。' : ct === 'unknown' ? '打点がわかると、絞れます。' : ct === 'center' ? null : '打点も、曲がりの要因に。';
      if (expHead && head !== expHead) out.push(`FAIL head ${s}${c} ${ct} ${w}: ${head}`);
      if (!expHead && !/軌道/.test(head)) out.push(`FAIL center head ${s}${c}: ${head}`);
      count++;
      if (ct === 'center' && w === 'calm') out.push(`${s}${c}: [${eyebrow}] ${head} | face=${await page.textContent('#kvFace')} | path=${await page.textContent('#kvPath')}`);
      // back to q1 keeping answers
      await page.click('#backResult');
      if ((await page.textContent('#roMain')) === '') out.push('FAIL contact not retained');
    }
    // alt toggle + play for RR/LL
    if (s+c === 'RR' || s+c === 'LL') {
      await page.click('#goQ2');
      await page.click('#alt button[data-alt="1"]');
      out.push(`${s}${c} altB: path=${await page.textContent('#kvPath')} face=${await page.textContent('#kvFace')}`);
      await page.click('#play'); await page.waitForTimeout(1800);
      await page.screenshot({ path: `shot_${s}${c}_altB.png`, fullPage: true });
      await page.click('#backResult');
    }
    // restart
    await page.click('#goQ2');
    await page.click('#restart');
    if (!(await page.$eval('#candWrap', e => e.hidden))) out.push('FAIL restart did not clear');
  }
  out.push('combos tested: ' + count);
  // left-handed check
  await page.$eval('#handL',e=>e.click());
  await page.click('.zones button[data-curve="R"]'); await page.click('.card[data-start="C"]'); await page.click('#goQ1');
  await page.screenshot({ path: 'shot_q1_LH.png', fullPage: true });
  await page.$eval('#contactOpts .opt[data-contact="heel"]',e=>e.click()); await page.click('#goQ2');
  out.push('LH CR heel: ' + await page.textContent('#rSub') + ' | ' + await page.textContent('#kvPath'));
  await page.$eval('#handR',e=>e.click());
  out.push('RH CR heel: ' + await page.textContent('#rSub') + ' | ' + await page.textContent('#kvPath'));
  // curve change clears start
  await page.click('#restart');
  await page.click('.zones button[data-curve="R"]'); await page.click('.card[data-start="C"]');
  await page.click('.zones button[data-curve="L"]');
  out.push('after curve change goQ1 disabled=' + await page.$eval('#goQ1', e => e.disabled));
  await page.screenshot({ path: 'shot_flight.png', fullPage: true });
  await page.click('.card[data-start="C"]');
  await page.screenshot({ path: 'shot_flight_sel.png', fullPage: true });
  await page.click('#goQ1'); await page.$eval('#contactOpts .opt[data-contact="center"]',e=>e.click()); await page.click('#goQ2');
  await page.screenshot({ path: 'shot_result_CL.png', fullPage: true });
  // widths overflow check
  for (const w of [320, 390, 440]) {
    await page.setViewportSize({ width: w, height: 800 });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    out.push(`width ${w}: scrollWidth=${sw}`);
  }
  // keyboard: tab to a zone button and press Enter
  await page.click('#restart');
  await page.focus('.zones button[data-curve="S"]'); await page.keyboard.press('Enter');
  out.push('keyboard select S: pressed=' + await page.$eval('.zones button[data-curve="S"]', e => e.getAttribute('aria-pressed')));
  console.log(out.join('\n'));
  console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
