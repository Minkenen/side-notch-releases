// The live demo on the download page: the real Side Notch panel running in the browser, with a stand-in for the
// Electron bridge that gives it made-up English sample data (nothing personal, nothing sent anywhere).
// The page around it (site/index.html) talks to it with postMessage: it tells the panel when the line is pointed
// at, and hears where the line is and whether the panel is open. scripts/build-live-demo.mjs puts it in site/live/.
(function () {
  // no camera in the demo: the mirror box just says there's none
  try { Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: () => Promise.reject(new Error('No camera in the demo')), enumerateDevices: () => Promise.resolve([]), addEventListener() {}, removeEventListener() {} } }); } catch (e) { /* keep going */ }
  const up = (m) => { try { parent.postMessage(Object.assign({ sn: true }, m), '*'); } catch (e) { /* not framed */ } };
  let clips = null, msgs = null;
  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.snEdge) emit('edge');
    if (d.snClose) emit('dropOnly');
    // for the hero video: something gets copied, a message arrives
    if (d.snCopy) { const item = { id: Date.now(), t: 'text', text: d.snCopy }; clips = [item].concat(clips || []); emit('clip', { items: clips, added: item }); }
    if (d.snMsg) { const m = Object.assign({ id: 'v' + Date.now(), at: Date.now(), read: false }, d.snMsg); msgs = [m].concat(msgs || []); emit('messages', { items: msgs }); }
  });
  const now = Date.now(), day = (h, m, d) => { const x = new Date(); x.setDate(x.getDate() + (d || 0)); x.setHours(h, m || 0, 0, 0); return x.toISOString(); };
  const art = (a, b) => { const c = document.createElement('canvas'); c.width = c.height = 300; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 300, 300); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, 300, 300); g.globalAlpha = .35; g.fillStyle = '#fff'; g.beginPath(); g.arc(210, 90, 70, 0, 7); g.fill(); g.globalAlpha = .25; g.beginPath(); g.arc(90, 220, 110, 0, 7); g.fill(); return c.toDataURL('image/jpeg', .9); };
  const photo = (a, b, ar) => { const w = 420, h = Math.round(420 / ar); const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(0, h); g.lineTo(w * .3, h * .55); g.lineTo(w * .55, h * .75); g.lineTo(w * .8, h * .45); g.lineTo(w, h * .7); g.lineTo(w, h); g.fill(); g.fillStyle = 'rgba(255,240,200,.9)'; g.beginPath(); g.arc(w * .75, h * .25, h * .08, 0, 7); g.fill(); return c.toDataURL('image/jpeg', .9); };
  const subs = {}, on = (ch, cb) => { (subs[ch] = subs[ch] || []).push(cb); };
  const emit = (ch, d) => (subs[ch] || []).forEach((cb) => cb(d));
  const config = { city: 'Lisbon', clocks: [['Lisbon', 'Europe/Lisbon'], ['New York', 'America/New_York'], ['Tokyo', 'Asia/Tokyo']], autoClose: false, matchBg: false, mail: { user: 'you@example.com', host: 'imap.example.com', hasPass: true } };
  const state = {
    colMods: [['media', 'cal', 'weather', 'mail'], ['stocks', 'chords', 'clocks'], ['gallery', 'note', 'todo', 'bat']], cols: 3, pw: 330,
    topOn: ['clock', 'weather', 'battery'], lk: { preset: 'dark', t: 0, b: 0, g: 0 }, flip: true,
    notesN: [{ title: 'Trip ideas', body: 'Porto for a weekend\nTrain along the coast\nBook the tile workshop', date: new Date().toISOString() }], nIdx: 0,
    todos: [{ text: 'Send the slides to Maya', on: false, tag: 'Today' }, { text: 'Water the plants', on: true, tag: 'Today' }, { text: 'Renew the passport', on: false, tag: 'This week' }],
    localEvents: [], globeModuleV1: true, globeDrawerV2: true
  };
  const S = (sym, name, price, prev, spark) => ({ sym, label: name, name, price, prev, currency: 'USD', open: true, spark, changedAt: 0 });
  const wave = (b, n, amp) => Array.from({ length: 32 }, (_, i) => +(b + Math.sin(i / 3 + n) * amp + i * amp / 12).toFixed(2));
  window.sn = new Proxy({
    platform: /Win/i.test(navigator.platform) ? 'win32' : 'darwin', debugOpen: false,
    setUi: (b) => up({ ui: !!b }), panelOpen: (b) => up({ open: !!b }), lineRect: (r) => up({ line: r }),
    loadState: () => ({ state, config }), getConfig: () => config, on, ready: () => setTimeout(feed, 50),
    updateGet: () => ({ state: 'none' }), mindLoad: () => null, weatherSearch: async () => [], stocksSearch: async () => [],
    pathsOf: () => [], galleryFull: async () => null
  }, { get: (t, k) => (k in t ? t[k] : () => undefined) });
  function feed() {
    emit('config', config);
    emit('media', { app: 'Spotify', key: 'np', playing: true, title: 'Golden Hour Drive', artist: 'The Coastal Lights', duration: 214, position: 71, artwork: art('#FF8A5B', '#7A3FD0') });
    emit('volume', 64);
    emit('weather', { city: 'Lisbon', temp: 19.4, code: 1, isDay: true, hi: 21, lo: 14,
      hourly: [0, 1, 2, 3, 4, 5].map((k) => ({ time: day(new Date().getHours() + k), temp: 19 + (k < 3 ? k : 5 - k), code: k > 3 ? 2 : 1, isDay: true })),
      daily: [0, 1, 2, 3, 4].map((k) => ({ date: day(12, 0, k).slice(0, 10), code: [1, 2, 3, 61, 1][k], lo: 13 + (k % 2), hi: 20 + (k % 3) })) });
    emit('calendar', [
      { title: 'Design review', place: 'Studio 2', color: '#4CC2FF', start: day(10, 0), end: day(10, 45) },
      { title: 'Lunch with Sam', place: 'Café Rosa', color: '#6CCB5F', start: day(12, 30), end: day(13, 30) },
      { title: 'Team standup', place: '', color: '#B4A0FF', start: day(15, 0), end: day(15, 15) },
      { title: 'Climbing', place: 'Boulder Hall', color: '#FFB900', start: day(18, 30), end: day(20, 0) },
      { title: 'Dentist', place: '', color: '#FF6B6B', start: day(9, 0, 1), end: day(9, 30, 1) }
    ]);
    emit('mail', [
      { uid: 3, fromName: 'Maya Chen', subject: 'Slides for Thursday', date: new Date(now - 18 * 60e3).toISOString(), seen: false, preview: 'Looks great! Could we move the roadmap part before the demo?' },
      { uid: 2, fromName: 'Lisbon Rail', subject: 'Your tickets for Saturday', date: new Date(now - 3 * 3600e3).toISOString(), seen: false, preview: 'Porto Campanhã · 09:12 · Coach 4, seats 31–32' },
      { uid: 1, fromName: 'Alex Rivera', subject: 'Photos from the hike', date: new Date(now - 26 * 3600e3).toISOString(), seen: true, preview: 'Here they are. The one by the lighthouse is my favourite.' }
    ]);
    clips = [{ id: 3, t: 'link', text: 'https://example.com/recipes/pasta-al-limone', domain: 'example.com', title: 'recipes pasta al limone' }, { id: 2, t: 'color', text: '#7D7AFF' }, { id: 1, t: 'text', text: 'Meet at the north entrance at 7' }];
    emit('clip', { items: clips, added: null });
    msgs = [
      { id: 'm1', app: 'Discord', title: 'Jordan', subtitle: '#game-night', body: 'Starting at 8, bring snacks!', at: now - 5 * 60e3, read: false },
      { id: 'm2', app: 'Messages', title: 'Sam', subtitle: '', body: 'Table for two at 12:30 ✔️', at: now - 40 * 60e3, read: true }
    ];
    emit('messages', { items: msgs });
    emit('stocks', { at: now, idx: [S('^GSPC', 'S&P 500', 5871.2, 5840.6, wave(5840, 1, 12)), S('BTC-USD', 'BTC', 91240, 89980, wave(89900, 2, 600))],
      list: [S('AAPL', 'AAPL', 229.87, 227.4, wave(227, 0, 1.2)), S('NVDA', 'NVDA', 146.22, 148.9, wave(149, 3, -1.1)), S('MSFT', 'MSFT', 418.53, 415.2, wave(415, 4, 1.6)), S('TSLA', 'TSLA', 338.74, 341.0, wave(341, 5, -1.2)), S('AMZN', 'AMZN', 204.61, 202.3, wave(202, 6, 1))] });
    emit('sys', { model: 'MacBook Pro', cpu: 18, ram: 54, memTotal: 16, gpu: 12, watts: 9.5, down: 42, up: 6, battery: 82, charging: false });
    emit('batts', [{ name: 'Headphones', pct: 74, kind: 'headphones', charging: false }, { name: 'Mouse', pct: 41, kind: 'mouse', charging: false }]);
    const P = [['#F6B26B', '#5B3A8F', 1.5], ['#7CC6FE', '#1D3557', 0.75], ['#FFD6A5', '#E76F51', 1.33], ['#A8E6CF', '#2A6F5B', 1.5], ['#CDB4DB', '#3D2C5E', 1]];
    emit('gallery', P.map((p, i) => ({ path: 'demo:' + i, name: 'Photo ' + (i + 1), thumb: photo(p[0], p[1], p[2]), ar: p[2], date: (12 - i) + ' Nov', t: now - i * 864e5 })));
    emit('galleryStatus', { library: 'ok' });
    emit('tray', []);
    emit('apps', []);
  }
})();
