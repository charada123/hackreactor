import { readFileSync, writeFileSync } from 'fs';
const d = JSON.parse(readFileSync(new URL('./futuredata.json', import.meta.url)));

const ABBR = {
  Alabama:'AL',Alaska:'AK',Arizona:'AZ',Arkansas:'AR',California:'CA',Colorado:'CO',Connecticut:'CT',
  Delaware:'DE',Florida:'FL',Georgia:'GA',Hawaii:'HI',Idaho:'ID',Illinois:'IL',Indiana:'IN',Iowa:'IA',
  Kansas:'KS',Kentucky:'KY',Louisiana:'LA',Maine:'ME',Maryland:'MD',Massachusetts:'MA',Michigan:'MI',
  Minnesota:'MN',Mississippi:'MS',Missouri:'MO',Montana:'MT',Nebraska:'NE',Nevada:'NV',
  'New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC',
  'North Dakota':'ND',Ohio:'OH',Oklahoma:'OK',Oregon:'OR',Pennsylvania:'PA','Rhode Island':'RI',
  'South Carolina':'SC','South Dakota':'SD',Tennessee:'TN',Texas:'TX',Utah:'UT',Vermont:'VT',
  Virginia:'VA',Washington:'WA','West Virginia':'WV',Wisconsin:'WI',Wyoming:'WY',
};

// Tonal ramp across a region's territories. Adjacent list positions are pushed
// to opposite ends of the ramp so neighbouring blocks stay distinguishable.
function shade(i, n) {
  if (n < 2) return 1;
  const half = Math.ceil(n / 2);
  const order = i % 2 === 0 ? i / 2 : half + (i - 1) / 2;
  return +(0.6 + (1.4 - 0.6) * (order / (n - 1))).toFixed(3);
}

// A territory's chips: whole states, plus split states marked (S)/(N).
const chipsFor = t => [
  ...t.states.map(st => ABBR[st] || st),
  ...(t.partial || []).map(q => `${ABBR[q.state] || q.state} (${q.side === 'south' ? 'S' : 'N'})`),
];

const regions = d.regions.map(r => ({
  ...r,
  abbrs: r.states.map(s => ABBR[s] || s).concat(r.hasDC ? ['DC'] : []),
  countLabel: `${r.states.length} states${r.hasDC ? ' + DC' : ''}`,
}));
const stateTotal = regions.reduce((n, r) => n + r.states.length, 0);

const html = `<title>Future Consideration Territories</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{
    --bg:#e9edf1; --panel:#ffffff; --panel-2:#f4f7f9;
    --ink:#152431; --muted:#5d6d7a; --faint:#8a97a2;
    --line:#dbe3e9; --line-strong:#c7d1d9;
    --land:#e5ebef; --land-line:#c3ccd4;
    --field:#0e7c7b; --trainer:#cf5f38; --team:#6d4a86; --prospect:#2f6f9f; --direct:#c23a86;
    --accent:#0e7c7b;
    --shadow:0 1px 2px rgba(20,40,60,.06),0 8px 24px rgba(20,40,60,.08);
    --radius:14px;
    --fill-op:.30; --fill-op-hi:.62;
    --sans:"Segoe UI",-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;
  }
  @media (prefers-color-scheme:dark){
    :root{
      --bg:#0b1219; --panel:#111d27; --panel-2:#0e1922;
      --ink:#e9f1f6; --muted:#93a3b0; --faint:#657481;
      --line:#20303c; --line-strong:#2a3d4a;
      --land:#1a2833; --land-line:#2c404e;
      --field:#2bb9b3; --trainer:#e58256; --team:#a988c4; --prospect:#5b9bd5; --direct:#e274b4;
      --accent:#2bb9b3;
      --shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px rgba(0,0,0,.35);
      --fill-op:.34; --fill-op-hi:.7;
    }
  }
  :root[data-theme="light"]{
    --bg:#e9edf1; --panel:#ffffff; --panel-2:#f4f7f9;
    --ink:#152431; --muted:#5d6d7a; --faint:#8a97a2;
    --line:#dbe3e9; --line-strong:#c7d1d9;
    --land:#e5ebef; --land-line:#c3ccd4;
    --field:#0e7c7b; --trainer:#cf5f38; --team:#6d4a86; --prospect:#2f6f9f; --direct:#c23a86;
    --accent:#0e7c7b;
    --shadow:0 1px 2px rgba(20,40,60,.06),0 8px 24px rgba(20,40,60,.08);
    --fill-op:.30; --fill-op-hi:.62;
  }
  :root[data-theme="dark"]{
    --bg:#0b1219; --panel:#111d27; --panel-2:#0e1922;
    --ink:#e9f1f6; --muted:#93a3b0; --faint:#657481;
    --line:#20303c; --line-strong:#2a3d4a;
    --land:#1a2833; --land-line:#2c404e;
    --field:#2bb9b3; --trainer:#e58256; --team:#a988c4; --prospect:#5b9bd5; --direct:#e274b4;
    --accent:#2bb9b3;
    --shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px rgba(0,0,0,.35);
    --fill-op:.34; --fill-op-hi:.7;
  }
  *{box-sizing:border-box}
  html,body{height:100%}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);
    -webkit-font-smoothing:antialiased;line-height:1.5;}
  .app{display:flex;flex-direction:column;min-height:100%;max-width:1280px;margin:0 auto;padding:20px;gap:16px;}

  header.head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;}
  .brand{display:flex;flex-direction:column;gap:4px;}
  .eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:700;}
  h1{margin:0;font-size:clamp(22px,3vw,30px);letter-spacing:-.02em;font-weight:750;text-wrap:balance;}
  .sub{color:var(--muted);font-size:13.5px;}
  .head-meta{display:flex;gap:22px;align-items:center;}
  .stat{display:flex;flex-direction:column;line-height:1.1;}
  .stat b{font-size:20px;font-variant-numeric:tabular-nums;letter-spacing:-.01em;}
  .stat span{font-size:11px;color:var(--faint);text-transform:uppercase;letter-spacing:.08em;margin-top:3px;}

  .navrow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
  .navlink{font-size:13px;font-weight:650;text-decoration:none;color:var(--muted);background:var(--panel-2);
    border:1px solid var(--line);border-radius:10px;padding:8px 14px;transition:.15s;}
  .navlink:hover{color:var(--ink);border-color:var(--accent);}
  .navlink.here{background:var(--panel);color:var(--ink);box-shadow:var(--shadow);border-color:var(--line-strong);}

  .layout{display:grid;grid-template-columns:340px 1fr;gap:16px;align-items:start;}
  @media (max-width:880px){.layout{grid-template-columns:1fr;}}

  .panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);}

  /* Region list */
  .roster{display:flex;flex-direction:column;overflow:hidden;}
  .search{padding:14px 14px 12px;border-bottom:1px solid var(--line);}
  .search input{width:100%;padding:9px 12px;border:1px solid var(--line-strong);border-radius:10px;
    background:var(--panel-2);color:var(--ink);font:inherit;font-size:13.5px;outline:none;}
  .search input:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 22%,transparent);}
  .list{list-style:none;margin:0;padding:8px;overflow:auto;flex:1;min-height:140px;}
  .rcard{padding:11px 12px;border-radius:11px;cursor:pointer;border:1px solid transparent;
    transition:background .14s,border-color .14s;}
  .rcard:hover{background:var(--panel-2);}
  .rcard.active{background:color-mix(in srgb,var(--accent) 10%,var(--panel));
    border-color:color-mix(in srgb,var(--accent) 40%,transparent);}
  .rcard.hidden{display:none;}
  .rtop{display:flex;align-items:center;gap:9px;}
  .swatch{width:11px;height:11px;border-radius:3px;flex:none;}
  .rname{font-weight:700;font-size:14.5px;letter-spacing:-.01em;}
  .rcount{margin-left:auto;font-size:11px;color:var(--faint);text-transform:uppercase;letter-spacing:.07em;
    font-variant-numeric:tabular-nums;}
  .abbrs{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;}
  .ab{font-size:11px;font-weight:650;color:var(--muted);background:var(--panel-2);
    border:1px solid var(--line);border-radius:6px;padding:2px 6px;letter-spacing:.02em;}
  .rpeople{margin-top:8px;font-size:11.5px;color:var(--muted);display:flex;flex-wrap:wrap;gap:4px 8px;}
  .rpeople .pn{display:inline-flex;align-items:center;gap:5px;}
  .rpeople .pd{width:7px;height:7px;border-radius:50%;flex:none;}
  .rpeople .pd.field{background:var(--field)} .rpeople .pd.trainer{background:var(--trainer)}
  .rpeople .pd.team{background:var(--team)} .rpeople .pd.direct{background:var(--direct)}
  .rpeople .pd.prospect{background:transparent;border:2px solid var(--prospect)}
  .rnone{margin-top:8px;font-size:11.5px;color:var(--faint);font-style:italic;}
  .subs{margin-top:8px;display:flex;flex-direction:column;gap:6px;}
  .sub{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
  .snumb{width:16px;height:16px;border-radius:5px;flex:none;display:inline-flex;align-items:center;
    justify-content:center;font-size:10px;font-weight:750;color:var(--panel);}
  .sname{font-size:12.5px;font-weight:650;}
  .sub .abbrs{margin-top:0;}
  .rcand{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line-strong);display:flex;
    align-items:baseline;gap:7px;flex-wrap:wrap;font-size:11.5px;}
  .rcand .lbl{font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--accent);}
  .rcand .cn{font-weight:650;color:var(--ink);}
  .rcand .cr{color:var(--muted);}
  .empty{padding:24px 14px;color:var(--faint);font-size:13px;text-align:center;}

  /* Map */
  .mapwrap{position:relative;overflow:hidden;border-radius:var(--radius);}
  .mapwrap svg{display:block;width:100%;height:auto;background:linear-gradient(180deg,var(--panel),var(--panel-2));}
  .mapctl{position:absolute;top:12px;right:12px;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;}
  .mapctl button{font:inherit;font-size:12px;font-weight:600;color:var(--muted);background:var(--panel);
    border:1px solid var(--line-strong);border-radius:9px;padding:6px 11px;cursor:pointer;box-shadow:var(--shadow);}
  .mapctl button:hover{color:var(--ink);border-color:var(--accent);}
  .mapctl button[aria-pressed="false"]{opacity:.5;}
  #vp{transition:transform .55s cubic-bezier(.22,.61,.36,1);transform-origin:0 0;}
  @media (prefers-reduced-motion:reduce){#vp{transition:none}}
  path.state{fill:var(--land);stroke:none;}
  path.borders{fill:none;stroke:var(--land-line);stroke-width:.7;stroke-linejoin:round;vector-effect:non-scaling-stroke;}
  path.nation{fill:none;stroke:var(--line-strong);stroke-width:1;vector-effect:non-scaling-stroke;}

  .rfill{fill-opacity:calc(var(--fill-op) * var(--k,1));stroke:none;cursor:pointer;transition:fill-opacity .18s;}
  .rfill.hover,.rfill.active{fill-opacity:calc(var(--fill-op-hi) * var(--k,1));}
  .rfill.dim{fill-opacity:.07;}
  .sborder{fill:none;stroke:var(--ink);stroke-opacity:.4;stroke-width:1.1;stroke-dasharray:4 3;
    vector-effect:non-scaling-stroke;stroke-linejoin:round;pointer-events:none;}
  .snum{fill:var(--ink);font:750 11px var(--sans);text-anchor:middle;dominant-baseline:central;pointer-events:none;
    paint-order:stroke;stroke:var(--panel);stroke-width:3.4px;stroke-linejoin:round;opacity:0;transition:opacity .25s;}
  .snum.show{opacity:.9;}
  .rborder{fill:none;stroke:var(--ink);stroke-opacity:.45;stroke-width:1.6;vector-effect:non-scaling-stroke;
    stroke-linejoin:round;pointer-events:none;}
  .rlabel{fill:var(--ink);font:750 13px var(--sans);text-anchor:middle;dominant-baseline:central;pointer-events:none;
    paint-order:stroke;stroke:var(--panel);stroke-width:3.6px;stroke-linejoin:round;letter-spacing:.02em;}
  .rlabel.dim{opacity:.3;}
  .rlabel.hide{opacity:0;}

  .pin{pointer-events:none;}
  .pin .core{stroke:var(--panel);stroke-width:2;}
  .pin.field .core{fill:var(--field)} .pin.trainer .core{fill:var(--trainer)} .pin.team .core{fill:var(--team)}
  .pin.direct .core{fill:var(--direct)}
  .pin.prospect .core{fill:var(--panel);stroke:var(--prospect);stroke-width:2.5}
  .pin.dim{opacity:.16;}

  .tip{position:absolute;pointer-events:none;opacity:0;transform:translate(-50%,-118%);transition:opacity .12s;
    background:var(--ink);color:var(--panel);padding:8px 11px;border-radius:9px;font-size:12px;max-width:240px;
    box-shadow:0 8px 24px rgba(0,0,0,.28);z-index:5;line-height:1.35;}
  .tip .tn{font-weight:700;font-size:12.5px;}
  .tip .tr{opacity:.8;font-size:11px;margin-top:2px;}
  .tip:after{content:"";position:absolute;left:50%;top:100%;transform:translateX(-50%);
    border:6px solid transparent;border-top-color:var(--ink);}

  footer{color:var(--faint);font-size:12px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:0 2px;}
  .theme{cursor:pointer;background:none;border:1px solid var(--line-strong);color:var(--muted);
    border-radius:8px;padding:4px 10px;font:inherit;font-size:12px;}
  .theme:hover{color:var(--ink);border-color:var(--accent);}
</style>

<div class="app">
  <header class="head">
    <div class="brand">
      <span class="eyebrow">Territory planning · Draft</span>
      <h1>Future Consideration Territories</h1>
      <span class="sub">A proposed five-region split of the country. Click a region to zoom in and see its states and who is already there.</span>
    </div>
    <div class="head-meta">
      <div class="stat"><b>${regions.length}</b><span>Regions</span></div>
      <div class="stat"><b>${stateTotal}</b><span>States</span></div>
      <div class="stat"><b>${d.reps.length}</b><span>Current pins</span></div>
    </div>
  </header>

  <nav class="navrow" aria-label="Map views">
    <a class="navlink" href="index.html">Current territory map</a>
    <a class="navlink here" href="future.html" aria-current="page">Future consideration</a>
  </nav>

  <div class="layout">
    <aside class="panel roster">
      <div class="search"><input id="q" type="search" placeholder="Search region or state…" aria-label="Search regions and states"></div>
      <ul class="list" id="list"></ul>
    </aside>

    <section class="panel mapwrap" id="mapwrap">
      <div class="mapctl">
        <button id="labelToggle" aria-pressed="true">Labels</button>
        <button id="pinToggle" aria-pressed="true">Team pins</button>
        <button id="reset">Reset view</button>
      </div>
      <svg viewBox="0 0 ${d.W} ${d.H}" role="img" aria-label="United States map divided into five proposed sales regions">
        <g id="vp">
          <path class="state" d="${d.statePaths}"></path>
          <g id="regions">
            ${regions.map(r => r.subs.length
              ? r.subs.map((t, i) => `<path class="rfill" data-key="${r.key}" d="${t.d}" fill="${r.color}" style="--k:${shade(i, r.subs.length)}"></path>`).join('')
              : `<path class="rfill" data-key="${r.key}" d="${r.d}" fill="${r.color}"></path>`).join('')}
          </g>
          <path class="borders" d="${d.borderPath}"></path>
          <path class="sborder" d="${d.subBorderPath}"></path>
          <path class="rborder" d="${d.regionBorderPath}"></path>
          <path class="nation" d="${d.nationPath}"></path>
          <g id="pins"></g>
          <g id="rlabels">
            ${regions.map(r => `<text class="rlabel" data-key="${r.key}" x="${r.x}" y="${r.y}">${r.name}</text>`).join('')}
            ${regions.flatMap(r => r.subs.map((t, i) =>
              `<text class="snum" data-key="${r.key}" x="${t.x}" y="${t.y}">${i + 1}</text>`)).join('')}
          </g>
        </g>
      </svg>
      <div class="tip" id="tip"></div>
    </section>
  </div>

  <footer>
    <span>Draft regional model for planning — not the current book of business. See the <a href="index.html" style="color:var(--accent)">current territory map</a> for today's assignments.</span>
    <button class="theme" id="themeBtn">Toggle theme</button>
  </footer>
</div>

<script>
const ABBR = ${JSON.stringify(ABBR)};
const REGIONS = ${JSON.stringify(regions.map(r => ({ key: r.key, name: r.name, color: r.color, abbrs: r.abbrs, countLabel: r.countLabel, states: r.states, candidates: r.candidates, subs: r.subs.map(t => ({ name: t.name, states: t.states, chips: chipsFor(t) })) })))};
const PEOPLE = ${JSON.stringify(d.reps.map(r => ({ name: r.name, city: r.city, role: r.role, group: r.group, state: r.state, region: r.region, x: r.x, y: r.y })))};
const W=${d.W}, H=${d.H};

const listEl = document.getElementById('list');
const pinsG = document.getElementById('pins');
const wrap = document.getElementById('mapwrap');
const vp = document.getElementById('vp');
const tip = document.getElementById('tip');
let active = null;

const peopleIn = key => PEOPLE.filter(p => p.region === key);

// --- region cards ---
REGIONS.forEach(r => {
  const who = peopleIn(r.key);
  const li = document.createElement('li');
  li.className = 'rcard'; li.dataset.key = r.key; li.tabIndex = 0;
  li.innerHTML =
    \`<div class="rtop"><span class="swatch" style="background:\${r.color}"></span>
       <span class="rname">\${r.name}</span>
       <span class="rcount">\${r.countLabel}</span></div>
     \${r.subs.length
       ? \`<div class="subs">\${r.subs.map((t,i)=>\`<div class="sub">
            <span class="snumb" style="background:\${r.color}">\${i+1}</span>
            <span class="sname">\${t.name}</span>
            <span class="abbrs">\${t.chips.map(a=>\`<span class="ab">\${a}</span>\`).join('')}</span>
          </div>\`).join('')}</div>\`
       : \`<div class="abbrs">\${r.abbrs.map(a=>\`<span class="ab">\${a}</span>\`).join('')}</div>\`}\` +
    (who.length
      ? \`<div class="rpeople">\${who.map(p=>\`<span class="pn"><span class="pd \${p.group}"></span>\${p.name}</span>\`).join('')}</div>\`
      : \`<div class="rnone">No one on the map here yet.</div>\`) +
    r.candidates.map(c=>\`<div class="rcand"><span class="lbl">Under consideration</span>
       <span class="cn">\${c.name}</span><span class="cr">\${c.role}</span></div>\`).join('');
  li.addEventListener('click', () => select(r.key));
  li.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();select(r.key);} });
  listEl.appendChild(li);
});

// --- pins for current team ---
PEOPLE.forEach(p => {
  const g = document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('class','pin '+p.group);
  g.setAttribute('transform',\`translate(\${p.x} \${p.y})\`);
  g.dataset.region = p.region;
  g.innerHTML = '<circle class="core" r="5.5"></circle>';
  pinsG.appendChild(g);
});

// --- tooltip ---
function showTip(key, evt){
  const r = REGIONS.find(x=>x.key===key); if(!r) return;
  const who = peopleIn(key);
  const wr = wrap.getBoundingClientRect();
  tip.style.left = (evt.clientX - wr.left) + 'px';
  tip.style.top = (evt.clientY - wr.top - 6) + 'px';
  tip.innerHTML = \`<div class="tn">\${r.name}</div><div>\${r.countLabel} · \${r.abbrs.join(' ')}</div>\` +
    \`<div class="tr">\${who.length ? who.length + ' on the map today' : 'No coverage on the map today'}</div>\` +
    (r.subs.length ? \`<div class="tr">\${r.subs.length} territories: \${r.subs.map(t=>t.name).join(' · ')}</div>\` : '') +
    r.candidates.map(c=>\`<div class="tr">Under consideration: \${c.name} · \${c.role}</div>\`).join('');
  tip.style.opacity = 1;
}
function hideTip(){ tip.style.opacity = 0; }

// --- select / zoom ---
function select(key){
  active = active === key ? null : key;
  document.querySelectorAll('.rcard').forEach(c=>c.classList.toggle('active', c.dataset.key===active));
  document.querySelectorAll('.rfill').forEach(p=>{
    p.classList.toggle('active', p.dataset.key===active);
    p.classList.toggle('dim', active!==null && p.dataset.key!==active);
  });
  const subdivided = new Set(REGIONS.filter(r=>r.subs.length).map(r=>r.key));
  document.querySelectorAll('.rlabel').forEach(t=>{
    t.classList.toggle('dim', active!==null && t.dataset.key!==active);
    t.classList.toggle('hide', t.dataset.key===active && subdivided.has(active));
  });
  document.querySelectorAll('.snum').forEach(t=>t.classList.toggle('show', t.dataset.key===active));
  document.querySelectorAll('.pin').forEach(g=>g.classList.toggle('dim', active!==null && g.dataset.region!==active));
  if(active === null){ resetView(); return; }
  const boxes = [...fillsFor(active)].map(el=>el.getBBox());
  const x0=Math.min(...boxes.map(b=>b.x)), y0=Math.min(...boxes.map(b=>b.y));
  const x1=Math.max(...boxes.map(b=>b.x+b.width)), y1=Math.max(...boxes.map(b=>b.y+b.height));
  const b = {x:x0, y:y0, width:x1-x0, height:y1-y0};
  const pad = 24;
  const s = Math.min(6, Math.max(1, Math.min(W/(b.width+pad*2), H/(b.height+pad*2))));
  const tx = W/2 - (b.x + b.width/2)*s, ty = H/2 - (b.y + b.height/2)*s;
  vp.style.transform = \`translate(\${tx}px,\${ty}px) scale(\${s})\`;
  const card = listEl.querySelector(\`.rcard[data-key="\${active}"]\`);
  if(card) card.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function resetView(){ vp.style.transform = 'translate(0px,0px) scale(1)'; }

const fillsFor = key => document.querySelectorAll(\`.rfill[data-key="\${key}"]\`);
document.querySelectorAll('.rfill').forEach(p=>{
  p.addEventListener('mouseenter', e=>{ fillsFor(p.dataset.key).forEach(x=>x.classList.add('hover')); showTip(p.dataset.key, e); });
  p.addEventListener('mousemove', e=>showTip(p.dataset.key, e));
  p.addEventListener('mouseleave', ()=>{ fillsFor(p.dataset.key).forEach(x=>x.classList.remove('hover')); hideTip(); });
  p.addEventListener('click', e=>{ e.stopPropagation(); select(p.dataset.key); });
});
document.getElementById('reset').addEventListener('click', ()=>{ if(active!==null) select(active); hideTip(); });
wrap.querySelector('svg').addEventListener('click', ()=>{ if(active!==null) select(active); });

// --- search ---
document.getElementById('q').addEventListener('input', e=>{
  const q = (e.target.value||'').toLowerCase().trim();
  let shown = 0;
  REGIONS.forEach(r=>{
    const hay = (r.name+' '+r.states.join(' ')+' '+r.abbrs.join(' ')+' '+
      r.candidates.map(c=>c.name+' '+c.role).join(' ')+' '+
      r.subs.map(t=>t.name+' '+t.states.join(' ')+' '+t.chips.join(' ')).join(' ')).toLowerCase();
    const vis = !q || hay.includes(q);
    listEl.querySelector(\`.rcard[data-key="\${r.key}"]\`).classList.toggle('hidden', !vis);
    if(vis) shown++;
  });
  let em = listEl.querySelector('.empty');
  if(shown===0){ if(!em){ em=document.createElement('li'); em.className='empty'; em.textContent='No region matches.'; listEl.appendChild(em); } }
  else if(em) em.remove();
});

// --- layer toggles ---
function toggler(btnId, targetId){
  let on = true;
  const btn = document.getElementById(btnId);
  btn.addEventListener('click', ()=>{
    on = !on;
    btn.setAttribute('aria-pressed', on);
    document.getElementById(targetId).style.display = on ? '' : 'none';
  });
}
toggler('labelToggle','rlabels');
toggler('pinToggle','pins');

// --- theme toggle ---
document.getElementById('themeBtn').addEventListener('click', ()=>{
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur==='dark' ? 'light' : (cur==='light' ? 'dark' : (matchMedia('(prefers-color-scheme:dark)').matches ? 'light' : 'dark'));
  document.documentElement.setAttribute('data-theme', next);
});
</script>`;

writeFileSync(new URL('../future.html', import.meta.url), html);
console.log('wrote future.html', html.length, 'bytes');
