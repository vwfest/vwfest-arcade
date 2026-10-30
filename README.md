# $VWFEST Arcade Room

A free, static landing page for the $VWFEST community games (for holders and enthusiasts alike, built for fun and community gatherings).

**Live:** https://vwfest.github.io/vwfest-arcade/

| Game | Link | Embed |
|---|---|---|
| VW Fest Race | https://race.vwfestmemecoin.com | link only (the race server sends `X-Frame-Options: DENY`) |
| DUST & DEAD | https://vwfest.github.io/vwfest-zombies/ | iframe (sandboxed) |
| Drag Strip | https://vwfest.github.io/vwfest-drag/ | iframe (sandboxed, `?embed=1`) |
| VW FEST HOLD'EM | https://vwfest.github.io/vwfest-holdem/ | link only (new tab; free multiplayer poker, play chips only, own game server) |
| GUESS THE CHART | https://guess-the-chart.onrender.com | link only (new tab; own accounts + wallet check) |

Plain HTML/CSS/JS, no build step, no third-party scripts. A strict Content-Security-Policy is set in `index.html`. Top-3 boards are read from `https://race.vwfestmemecoin.com` (CORS allowlisted to this origin).