// Arcade Room page test (Playwright, headless). BASE defaults to the local server; set BASE=https://vwfest.github.io/vwfest-arcade/ for the live page.
const { chromium } = require('/workspace/vwfest-drag/node_modules/playwright'); const path = require('path'); const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8097/'; const OUT = path.join(__dirname, '..', 'screenshots'); fs.mkdirSync(OUT, { recursive: true });
const LIVE_API = !!process.env.LIVE_API;
let fails = 0; const ok = (c, m) => { console.log((c ? '  PASS ' : '  FAIL ') + m); if (!c) fails++; };
const args = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
(async () => {
  const b = await chromium.launch({ args });
  for (const [name, mobile] of [['desktop', false], ['mobile', true]]) {
    console.log(`\n== ${name} ==`);
    const ctx = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 900 } });
    if (!LIVE_API) await ctx.route('https://race.vwfestmemecoin.com/**', r => { const u = r.request().url(), h = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
      const body = u.endsWith('/arcade/drag/top') ? { ok: true, top: [{ nickname: 'DuneDan', score: 12610, aux: 180 }, { nickname: '<b>x</b>', score: 12990, aux: 200 }] } : u.endsWith('/arcade/zombies/top') ? { ok: true, top: [{ nickname: 'DeadEye', score: 12, aux: 22000 }] } : { ok: true, top: [{ nickname: 'GhiaGus', time_ms: 61234 }] };
      r.fulfill({ status: 200, headers: h, body: JSON.stringify(body) }); });
    const p = await ctx.newPage(); const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    const resp = await p.goto(BASE); ok(resp.status() === 200, 'page 200'); await p.waitForTimeout(800);
    ok(await p.evaluate(() => /ARCADE/.test(document.querySelector('h1').textContent)), 'hero title');
    ok(await p.evaluate(() => document.querySelectorAll('.card').length === 4), 'four game cards');
    ok(await p.evaluate(() => [...document.querySelectorAll('.card img')].every(i => i.complete && i.naturalWidth > 0)), 'every card has a loaded screenshot');
    const hrefs = await p.evaluate(() => [...document.querySelectorAll('.card a.btn')].map(a => a.href));
    ok(hrefs.includes('https://race.vwfestmemecoin.com/') && hrefs.includes('https://vwfest.github.io/vwfest-zombies/') && hrefs.includes('https://vwfest.github.io/vwfest-drag/') && hrefs.includes('https://guess-the-chart.onrender.com/'), 'Play links point at race / zombies / drag / guess-the-chart');
    ok(await p.evaluate(() => [...document.querySelectorAll('a[target=_blank]')].every(a => /noopener/.test(a.rel))), 'all new-tab links have rel=noopener');
    ok(await p.evaluate(() => [...document.querySelectorAll('a')].some(a => a.href === 'https://vwfestmemecoin.com/' && /Back/.test(a.textContent))), 'link back to vwfestmemecoin.com');
    ok(await p.evaluate(() => document.querySelectorAll('#g-chart .playhere').length === 0 && document.querySelector('#g-chart a.btn').target === '_blank'), 'GUESS THE CHART card is link-only, opens new tab');
    ok(await p.evaluate(() => document.querySelectorAll('#g-race .playhere').length === 0), 'race card is link-only (framing blocked by the race server)');
    if (!LIVE_API) { ok(await p.evaluate(() => document.querySelector('[data-board=drag] li b').textContent === 'DuneDan' && document.querySelectorAll('[data-board] b b').length === 0 && document.querySelectorAll('[data-board=drag] li').length === 2), 'top-3 boards render; nicknames are text, not HTML'); }
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal overflow');
    await p.screenshot({ path: `${OUT}/${name}-1-top.png` }); await p.screenshot({ path: `${OUT}/${name}-2-full.png`, fullPage: true });
    // play-in-page: zombies + drag iframes
    for (const g of ['drag', 'zombies']) {
      if (mobile) await p.tap(`.playhere[data-game=${g}]`); else await p.click(`.playhere[data-game=${g}]`);
      await p.waitForTimeout(500);
      const info = await p.evaluate(() => { const f = document.querySelector('#frame iframe'); return f && { sb: f.getAttribute('sandbox'), src: f.src, shown: !document.getElementById('player').classList.contains('hidden') }; });
      ok(info && info.shown && /vwfest\.github\.io\/vwfest-/.test(info.src), `${g}: play-in-page iframe opens`); ok(info && !/allow-top-navigation|allow-forms|allow-modals/.test(info.sb) && /allow-scripts/.test(info.sb), `${g}: iframe sandboxed (${info && info.sb})`);
      const fr = p.frames().find(f => f.url().includes('vwfest-' + g)); let loaded = false;
      if (fr) { await fr.waitForLoadState('load', { timeout: 40000 }).catch(() => {}); await p.waitForTimeout(g === 'zombies' ? 6000 : 3500); loaded = await fr.evaluate(() => !!document.querySelector('canvas')).catch(() => false); }
      ok(loaded, `${g}: game actually loads inside the frame (not blocked by X-Frame-Options/CSP)`);
      await p.screenshot({ path: `${OUT}/${name}-3-play-${g}.png` });
      await p.click('#bClose'); ok(await p.evaluate(() => document.getElementById('player').classList.contains('hidden') && !document.querySelector('#frame iframe')), `${g}: close removes the iframe`);
    }
    ok(errs.filter(e => !/Failed to load resource|net::ERR/.test(e)).length === 0, 'no console/page errors' + (errs.length ? ': ' + errs.slice(0, 2).join(' | ').slice(0, 300) : ''));
    await ctx.close();
  }
  await b.close(); console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0);
})();
