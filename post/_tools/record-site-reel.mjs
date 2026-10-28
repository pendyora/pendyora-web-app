// Records a vertical 1080x1920 Reel of a web page, with timed captions and scripted scrolling.
// Usage: node record-site-reel.mjs <url> <out.mp4> <timeline.json>
// Needs: Google Chrome + ffmpeg on PATH.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const [url, out, timelinePath] = process.argv.slice(2);
const T = JSON.parse(readFileSync(timelinePath, 'utf8'));
const CSS_W = 405, CSS_H = 720, DSF = 1080 / CSS_W;          // 405x720 css px → 1080x1920 video
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9500 + Math.floor(Math.random() * 400);
const prof = mkdtempSync(join(tmpdir(), 'reel-'));
const frames = mkdtempSync(join(tmpdir(), 'reelf-'));
const proc = spawn(chrome, ['--headless=new', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`,
  `--window-size=${CSS_W},${CSS_H}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let targets;
for (let i = 0; i < 60; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pending = {}; const shots = [];
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
  if (m.method === 'Page.screencastFrame') {
    const { data, metadata, sessionId } = m.params;
    const f = join(frames, `f${String(shots.length).padStart(5, '0')}.jpg`);
    writeFileSync(f, Buffer.from(data, 'base64'));
    shots.push({ f, t: metadata.timestamp });
    ws.send(JSON.stringify({ id: ++id, method: 'Page.screencastFrameAck', params: { sessionId } }));
  }
};

// Overlay + choreography injected into the page before it loads.
const director = `(() => {
  const T = ${JSON.stringify(T)};
  addEventListener('DOMContentLoaded', () => {
    if (T.js) { try { (new Function(T.js))(); } catch (e) { console.error(e); } }
    const st = document.createElement('style');
    st.textContent = \`
      .reel-cap{position:fixed;left:50%;top:${T.captionTop ?? 132}px;z-index:9999;transform:translate(-50%,14px);opacity:0;
        width:max-content;max-width:340px;text-align:center;padding:12px 20px;
        font:500 23px/1.2 'Cormorant Garamond',Georgia,serif;color:#1B2633;letter-spacing:.01em;
        background:#F5EFEB;box-shadow:0 14px 34px -12px rgba(0,0,0,.55);transition:opacity .6s ease,transform .7s cubic-bezier(.2,.7,.2,1)}
      .reel-cap.on{opacity:1;transform:translate(-50%,0)}
      .reel-cap em{font-style:italic;color:#4E7486}
      .reel-cap small{display:block;font:500 9px/1.4 'Libre Franklin',sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#4E7486;margin-top:6px}
      html{scroll-behavior:auto!important}\`;
    document.head.appendChild(st);
    if (T.noOverlay) return;
    const cap = document.createElement('div'); cap.className = 'reel-cap'; document.body.appendChild(cap);
    const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    function glide(y, ms){ const y0 = scrollY, t0 = performance.now();
      (function step(n){ const k = Math.min(1,(n-t0)/ms); scrollTo(0, y0 + (y - y0)*ease(k)); if (k<1) requestAnimationFrame(step); })(t0); }
    function target(sel, off){ const el = document.querySelector(sel); return el ? el.getBoundingClientRect().top + scrollY + (off||0) : 0; }
    for (const c of (T.captions||[])) {
      setTimeout(()=>{ cap.innerHTML = c.html; cap.classList.add('on'); }, c.from*1000);
      setTimeout(()=>{ cap.classList.remove('on'); }, c.to*1000);
    }
    for (const s of (T.scroll||[])) setTimeout(()=>glide(target(s.sel, s.off), s.ms), s.at*1000);
  });
})();`;

await send('Emulation.setDeviceMetricsOverride', { width: CSS_W, height: CSS_H, deviceScaleFactor: DSF, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true });
await send('Page.enable');
await send('Page.addScriptToEvaluateOnNewDocument', { source: director });
await send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
await send('Page.navigate', { url });
await sleep(T.duration * 1000 + (T.waitStart ? 4000 : 600));
await send('Page.stopScreencast');
let startEpoch = null;
if (T.waitStart) { const r = await send('Runtime.evaluate', { expression: 'window.__reelStart || null', returnByValue: true }); startEpoch = r.result.result.value; }
ws.close(); proc.kill();

// Build a constant-30fps video from the variable-rate frames.
if (startEpoch) { const k = shots.findIndex(s => s.t >= startEpoch); if (k > 0) shots.splice(0, k - 1); }
const t0 = startEpoch || shots[0].t, end = t0 + T.duration;
let list = '';
shots.forEach((s, i) => {
  if (s.t > end) return;
  const next = Math.min(i + 1 < shots.length ? shots[i + 1].t : end, end);
  list += `file '${s.f.replace(/\\/g, '/')}'\nduration ${Math.max(0.001, next - s.t).toFixed(4)}\n`;
});
list += `file '${shots[shots.length - 1].f.replace(/\\/g, '/')}'\n`;
const listPath = join(frames, 'list.txt'); writeFileSync(listPath, list);
mkdirSync(dirname(out), { recursive: true });
const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listPath,
  '-vf', 'scale=1080:1920:flags=lanczos,fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
  '-movflags', '+faststart', '-t', String(T.duration), out], { stdio: 'inherit', shell: true });
console.log(`frames=${shots.length} exit=${ff.status} → ${out}`);
rmSync(frames, { recursive: true, force: true }); rmSync(prof, { recursive: true, force: true });
