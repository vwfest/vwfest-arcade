// Arcade Room: play-in-page panel (iframes, lazy) + top-3 boards. All server text is written with textContent (no innerHTML).
(() => {
  const API = 'https://race.vwfestmemecoin.com/api';
  const GAMES = {
    zombies: { title: 'DUST & DEAD', src: 'https://vwfest.github.io/vwfest-zombies/' },
    drag: { title: 'Drag Strip', src: 'https://vwfest.github.io/vwfest-drag/?embed=1' },
  };
  const $ = (id) => document.getElementById(id);
  const player = $('player'), frame = $('frame');
  function open(key) {
    const g = GAMES[key]; if (!g) return;
    frame.replaceChildren();
    const f = document.createElement('iframe');
    f.src = g.src; f.title = g.title;
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-pointer-lock allow-popups');   // no top navigation, no forms, no downloads
    f.setAttribute('allow', 'fullscreen; autoplay');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    f.setAttribute('allowfullscreen', '');
    frame.append(f);
    $('playerTitle').textContent = g.title; $('bNew').href = g.src.replace('?embed=1', '');
    player.classList.remove('hidden'); player.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => f.focus(), 400);
  }
  document.querySelectorAll('.playhere').forEach((b) => b.addEventListener('click', () => open(b.dataset.game)));
  $('bClose').addEventListener('click', () => { frame.replaceChildren(); player.classList.add('hidden'); });
  $('bFull').addEventListener('click', () => { const f = frame.querySelector('iframe'); if (f && f.requestFullscreen) f.requestFullscreen().catch(() => {}); else if (frame.requestFullscreen) frame.requestFullscreen().catch(() => {}); });

  // boards
  const fmtMs = (ms) => { const m = Math.floor(ms / 60000), s = (ms % 60000) / 1000; return m + ':' + s.toFixed(2).padStart(5, '0'); };
  const FORMAT = {
    race: (r) => fmtMs(r.time_ms),
    drag: (r) => (r.score / 1000).toFixed(3) + ' s',
    zombies: (r) => 'Round ' + (r.score | 0),
  };
  const URLS = { race: API + '/top', drag: API + '/arcade/drag/top', zombies: API + '/arcade/zombies/top' };
  function render(ol, key, rows) {
    ol.replaceChildren();
    const li0 = (t) => { const li = document.createElement('li'); li.className = 'muted'; li.textContent = t; ol.append(li); };
    if (!rows) return li0('Leaderboard unavailable right now.');
    if (!rows.length) return li0('No entries yet. Be first.');
    for (const r of rows.slice(0, 3)) { const li = document.createElement('li'), n = document.createElement('b'), v = document.createElement('span'); n.textContent = String(r.nickname); v.textContent = FORMAT[key](r); li.append(n, v); ol.append(li); }
  }
  document.querySelectorAll('.top[data-board]').forEach((ol) => {
    const key = ol.dataset.board;
    fetch(URLS[key]).then((r) => r.json()).then((j) => render(ol, key, j.ok ? j.top : null)).catch(() => render(ol, key, null));
  });
})();
