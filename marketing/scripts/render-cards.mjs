#!/usr/bin/env node
// Renders LinkedIn visuals for every tip in marketing/tips.json:
//   marketing/linkedin/<slug>/card.png   1200x1200 feed image
//   marketing/linkedin/<slug>/video.mp4  ~9s, 3 scenes (needs ffmpeg)
//   assets/images/learn/<slug>.png       1200x630 article hero / og:image
// Usage: node marketing/scripts/render-cards.mjs [slug ...] [--no-video]
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tips = JSON.parse(fs.readFileSync(path.join(root, 'marketing/tips.json'), 'utf-8'));
const args = process.argv.slice(2);
const noVideo = args.includes('--no-video');
const only = args.filter(a => !a.startsWith('--'));
const selected = only.length ? tips.filter(t => only.includes(t.slug)) : tips;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Highlight inline commands (/compact, CLAUDE.md, AGENTS.md) in the editor's function colour
const hl = s => esc(s).replace(/(\/[a-z]+|[A-Z]+\.md)/g, '<span class="cmd">$1</span>');

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:var(--w);height:var(--h);background:#1e1e1e;overflow:hidden}
body{font-family:'DejaVu Sans Mono','Consolas',monospace;color:#cccccc;display:flex;flex-direction:column}
.bar{height:calc(var(--u)*5.2);background:#252526;display:flex;align-items:center;border-bottom:1px solid #3c3c3c;flex:none}
.dots{display:flex;gap:calc(var(--u)*1.1);padding:0 calc(var(--u)*3)}
.dots i{width:calc(var(--u)*1.4);height:calc(var(--u)*1.4);border-radius:50%;background:#3c3c3c}
.tab{height:100%;display:flex;align-items:center;padding:0 calc(var(--u)*3);background:#1e1e1e;color:#ffffff;
  border-top:2px solid #007acc;font-size:calc(var(--u)*2)}
.tab b{color:#569cd6;font-weight:normal;margin-right:calc(var(--u)*1)}
.main{flex:1;display:flex;padding:calc(var(--u)*5) calc(var(--u)*6) calc(var(--u)*4) 0;min-height:0}
.gutter{width:calc(var(--u)*7);flex:none;color:#5a5a5a;text-align:right;padding-right:calc(var(--u)*2.4);
  font-size:calc(var(--u)*1.8);line-height:2.1;padding-top:calc(var(--u)*.6)}
.code{flex:1;display:flex;flex-direction:column;min-width:0}
.c{color:#6a9955;font-size:calc(var(--u)*2.1);margin-bottom:calc(var(--u)*2.6)}
h1{font-family:'DejaVu Sans','Segoe UI',sans-serif;font-weight:800;color:#ffffff;letter-spacing:-.02em;
  font-size:calc(var(--u)*var(--hs));line-height:1.1;margin-bottom:calc(var(--u)*3.6)}
ul{list-style:none;display:flex;flex-direction:column;gap:calc(var(--u)*1.7)}
li{font-size:calc(var(--u)*var(--ls));line-height:1.35;display:flex;gap:calc(var(--u)*1.6)}
li::before{content:'›';color:#4ec9b0;font-weight:bold}
.k{color:#9cdcfe}
.cmd{color:#dcdcaa}
.take{margin-top:auto;border-left:4px solid #4ec9b0;padding:calc(var(--u)*1.4) calc(var(--u)*2.4);
  background:#252526;color:#ffffff;font-family:'DejaVu Sans','Segoe UI',sans-serif;font-weight:700;
  font-size:calc(var(--u)*var(--ts));line-height:1.3}
.foot{height:calc(var(--u)*4.6);flex:none;background:#007acc;color:#fff;display:flex;align-items:center;
  justify-content:space-between;padding:0 calc(var(--u)*3);font-size:calc(var(--u)*1.8)}
.foot span:last-child{opacity:.85}
.scene-hook h1{font-size:calc(var(--u)*7.6);margin-top:auto;margin-bottom:auto}
.scene-take .take{margin:auto 0;font-size:calc(var(--u)*5);padding:calc(var(--u)*3) calc(var(--u)*3.4)}
`;

// Bold the label before the first ':' (e.g. "Outcome: ...") so list items scan quickly
const point = p => {
  const m = p.match(/^([A-Za-z /]{2,22}):\s(.*)$/);
  return m ? `<li><span><span class="k">${esc(m[1])}:</span> ${hl(m[2])}</span></li>` : `<li><span>${hl(p)}</span></li>`;
};

function html(t, { w, h, scene = 'full' }) {
  const u = w / 100; // 1 unit = 1% of width
  const wide = w / h > 1.5;
  const n = t.points.length;
  // Shrink type for wide (hero) format and for long lists
  const hs = wide ? 5.6 : (t.title.length > 50 ? 5.6 : 6.4);
  const ls = wide ? (n > 4 ? 2.1 : 2.4) : (n > 4 ? 3.0 : 3.4);
  const ts = wide ? 2.6 : 3.3;
  const lines = Array.from({ length: wide ? 12 : 22 }, (_, i) => i + 1).join('<br>');
  let body;
  if (scene === 'hook') {
    body = `<div class="code scene-hook"><div class="c">// tip ${String(t.n).padStart(2, '0')}</div><h1>${hl(t.hook)}</h1></div>`;
  } else if (scene === 'take') {
    body = `<div class="code scene-take"><div class="c">// the takeaway</div><div class="take">${hl(t.takeaway)}</div></div>`;
  } else {
    body = `<div class="code"><div class="c">// ${esc(t.hook)}</div><h1>${hl(t.title)}</h1>
      ${wide ? '' : `<ul>${t.points.map(point).join('')}</ul>`}<div class="take">${hl(t.takeaway)}</div></div>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    :root{--w:${w}px;--h:${h}px;--u:${u}px;--hs:${hs};--ls:${ls};--ts:${ts}}${CSS}</style></head><body>
    <div class="bar"><div class="dots"><i></i><i></i><i></i></div><div class="tab"><b>MD</b>tip-${String(t.n).padStart(2, '0')}.md</div></div>
    <div class="main"><div class="gutter">${lines}</div>${body}</div>
    <div class="foot"><span>aitoolreview.ai/guides</span><span>AI tips · ${String(t.n).padStart(2, '0')}/12</span></div>
  </body></html>`;
}

async function shot(browser, t, opts, out) {
  const page = await browser.newPage({ viewport: { width: opts.w, height: opts.h } });
  await page.setContent(html(t, opts));
  // Fail loudly if text overflows the frame instead of shipping a clipped card
  const overflow = await page.evaluate(() => document.querySelector('.code').scrollHeight > document.querySelector('.code').clientHeight + 2);
  if (overflow) console.warn(`  ! ${t.slug} (${opts.w}x${opts.h} ${opts.scene || 'full'}) text overflows, shorten the copy`);
  await page.screenshot({ path: out });
  await page.close();
}

function video(dir, frames) {
  // 3 scenes, 3s each, 0.5s crossfades
  const inputs = frames.flatMap(f => ['-loop', '1', '-t', '3.5', '-i', f]);
  const filter = '[0][1]xfade=transition=fade:duration=0.5:offset=3[a];[a][2]xfade=transition=fade:duration=0.5:offset=6,format=yuv420p[v]';
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filter, '-map', '[v]',
    '-r', '30', '-c:v', 'libx264', '-crf', '23', '-movflags', '+faststart', path.join(dir, 'video.mp4')]);
}

// Set CHROMIUM_PATH to use a system Chromium instead of Playwright's bundled one
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cards-'));
for (const t of selected) {
  const dir = path.join(root, 'marketing/linkedin', t.slug);
  fs.mkdirSync(dir, { recursive: true });
  await shot(browser, t, { w: 1200, h: 1200 }, path.join(dir, 'card.png'));
  await shot(browser, t, { w: 1200, h: 630 }, path.join(root, 'assets/images/learn', `${t.slug}.png`));
  if (!noVideo) {
    const frames = ['hook', 'full', 'take'].map(s => path.join(tmp, `${t.slug}-${s}.png`));
    for (const [i, s] of ['hook', 'full', 'take'].entries()) await shot(browser, t, { w: 1080, h: 1080, scene: s }, frames[i]);
    video(dir, frames);
  }
  console.log(`✓ ${t.slug}`);
}
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
