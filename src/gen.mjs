import { readFileSync, writeFileSync } from 'fs';
const d = JSON.parse(readFileSync(new URL('./mapdata.json', import.meta.url)));

const html = `<title>Sales Rep Territory Map</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{
    --bg:#e9edf1; --panel:#ffffff; --panel-2:#f4f7f9;
    --ink:#152431; --muted:#5d6d7a; --faint:#8a97a2;
    --line:#dbe3e9; --line-strong:#c7d1d9;
    --land:#e5ebef; --land-line:#c3ccd4; --land-hi:#d5dee4;
    --field:#0e7c7b; --trainer:#cf5f38; --team:#6d4a86; --prospect:#2f6f9f; --direct:#c23a86;
    --accent:#0e7c7b;
    --shadow:0 1px 2px rgba(20,40,60,.06),0 8px 24px rgba(20,40,60,.08);
    --radius:14px;
    --sans:"Segoe UI",-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;
  }
  @media (prefers-color-scheme:dark){
    :root{
      --bg:#0b1219; --panel:#111d27; --panel-2:#0e1922;
      --ink:#e9f1f6; --muted:#93a3b0; --faint:#657481;
      --line:#20303c; --line-strong:#2a3d4a;
      --land:#1a2833; --land-line:#2c404e; --land-hi:#233542;
      --field:#2bb9b3; --trainer:#e58256; --team:#a988c4; --prospect:#5b9bd5; --direct:#e274b4;
      --accent:#2bb9b3;
      --shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px rgba(0,0,0,.35);
    }
  }
  :root[data-theme="light"]{
    --bg:#e9edf1; --panel:#ffffff; --panel-2:#f4f7f9;
    --ink:#152431; --muted:#5d6d7a; --faint:#8a97a2;
    --line:#dbe3e9; --line-strong:#c7d1d9;
    --land:#e5ebef; --land-line:#c3ccd4; --land-hi:#d5dee4;
    --field:#0e7c7b; --trainer:#cf5f38; --team:#6d4a86; --prospect:#2f6f9f; --direct:#c23a86;
    --accent:#0e7c7b;
    --shadow:0 1px 2px rgba(20,40,60,.06),0 8px 24px rgba(20,40,60,.08);
  }
  :root[data-theme="dark"]{
    --bg:#0b1219; --panel:#111d27; --panel-2:#0e1922;
    --ink:#e9f1f6; --muted:#93a3b0; --faint:#657481;
    --line:#20303c; --line-strong:#2a3d4a;
    --land:#1a2833; --land-line:#2c404e; --land-hi:#233542;
    --field:#2bb9b3; --trainer:#e58256; --team:#a988c4; --prospect:#5b9bd5; --direct:#e274b4;
    --accent:#2bb9b3;
    --shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px rgba(0,0,0,.35);
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

  .layout{display:grid;grid-template-columns:320px 1fr;gap:16px;align-items:stretch;}
  @media (max-width:820px){.layout{grid-template-columns:1fr;}}

  .panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);}

  /* Roster */
  .roster{display:flex;flex-direction:column;overflow:hidden;}
  .search{padding:14px 14px 10px;border-bottom:1px solid var(--line);}
  .search input{width:100%;padding:9px 12px;border:1px solid var(--line-strong);border-radius:10px;
    background:var(--panel-2);color:var(--ink);font:inherit;font-size:13.5px;outline:none;}
  .search input:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 22%,transparent);}
  .legend{display:flex;gap:6px;padding:11px 14px;border-bottom:1px solid var(--line);flex-wrap:wrap;}
  .chip{display:inline-flex;align-items:center;gap:7px;padding:5px 10px;border-radius:20px;border:1px solid var(--line-strong);
    background:var(--panel-2);font-size:12px;cursor:pointer;color:var(--muted);user-select:none;transition:.15s;}
  .chip .dot{width:9px;height:9px;border-radius:50%;}
  .chip[aria-pressed="false"]{opacity:.4;}
  .chip:hover{border-color:var(--accent);color:var(--ink);}
  .chip .dot.field{background:var(--field)} .chip .dot.trainer{background:var(--trainer)} .chip .dot.team{background:var(--team)}
  .chip .dot.prospect{background:transparent;border:2px solid var(--prospect)}
  .chip .dot.direct{background:var(--direct)}

  .list{list-style:none;margin:0;padding:8px;overflow:auto;flex:1;min-height:120px;}
  .card{display:flex;gap:11px;padding:11px 11px;border-radius:11px;cursor:pointer;align-items:flex-start;
    border:1px solid transparent;transition:background .14s,border-color .14s;}
  .card:hover{background:var(--panel-2);}
  .card.active{background:color-mix(in srgb,var(--accent) 12%,var(--panel));border-color:color-mix(in srgb,var(--accent) 40%,transparent);}
  .pinico{width:12px;height:12px;border-radius:50%;margin-top:5px;flex:none;box-shadow:0 0 0 3px color-mix(in srgb,currentColor 22%,transparent);}
  .pinico.field{color:var(--field);background:var(--field)}
  .pinico.trainer{color:var(--trainer);background:var(--trainer)}
  .pinico.team{color:var(--team);background:var(--team)}
  .pinico.prospect{color:var(--prospect);background:transparent;border:2px solid var(--prospect);box-shadow:none}
  .pinico.direct{color:var(--direct);background:var(--direct)}
  .card .who{display:flex;flex-direction:column;gap:2px;min-width:0;}
  .card .nm{font-weight:650;font-size:14px;letter-spacing:-.01em;}
  .card .cy{font-size:12.5px;color:var(--ink);opacity:.85;}
  .card .rl{font-size:11.5px;color:var(--muted);}
  .card.hidden{display:none;}
  .empty{padding:24px 14px;color:var(--faint);font-size:13px;text-align:center;}

  /* Map */
  .mapwrap{position:relative;overflow:hidden;border-radius:var(--radius);}
  .mapwrap svg{display:block;width:100%;height:auto;background:linear-gradient(180deg,var(--panel),var(--panel-2));}
  .mapctl{position:absolute;top:12px;right:12px;display:flex;gap:6px;}
  .mapctl button{font:inherit;font-size:12px;font-weight:600;color:var(--muted);background:var(--panel);
    border:1px solid var(--line-strong);border-radius:9px;padding:6px 11px;cursor:pointer;box-shadow:var(--shadow);}
  .mapctl button:hover{color:var(--ink);border-color:var(--accent);}
  #vp{transition:transform .55s cubic-bezier(.22,.61,.36,1);transform-origin:0 0;}
  path.state{fill:var(--land);stroke:none;}
  path.borders{fill:none;stroke:var(--land-line);stroke-width:.7;stroke-linejoin:round;vector-effect:non-scaling-stroke;}
  path.nation{fill:none;stroke:var(--line-strong);stroke-width:1;vector-effect:non-scaling-stroke;}

  .pin{cursor:pointer;}
  .pin .halo{opacity:0;transform-box:fill-box;transform-origin:center;}
  .pin .core{stroke:var(--panel);stroke-width:2;transition:r .2s;}
  .pin.field .core{fill:var(--field)} .pin.trainer .core{fill:var(--trainer)} .pin.team .core{fill:var(--team)}
  .pin.prospect .core{fill:var(--panel);stroke:var(--prospect);stroke-width:2.5} .pin.direct .core{fill:var(--direct)}
  .pin.field .halo{fill:var(--field)} .pin.trainer .halo{fill:var(--trainer)} .pin.team .halo{fill:var(--team)}
  .pin.prospect .halo{fill:var(--prospect)} .pin.direct .halo{fill:var(--direct)}
  .pin .badge{fill:var(--panel);}
  .pin .badgetx{font:700 9px var(--sans);fill:var(--ink);text-anchor:middle;dominant-baseline:central;}
  .pin.dim{opacity:.18;pointer-events:none;}
  .pin.active .core,.pin:hover .core{r:9;}
  .pin.active .halo{opacity:.5;animation:pulse 1.8s ease-out infinite;}
  @keyframes pulse{0%{transform:scale(.6);opacity:.55}70%{opacity:0}100%{transform:scale(2.4);opacity:0}}
  @media (prefers-reduced-motion:reduce){.pin.active .halo{animation:none;opacity:.35}#vp{transition:none}}

  .tip{position:absolute;pointer-events:none;opacity:0;transform:translate(-50%,-118%);transition:opacity .12s;
    background:var(--ink);color:var(--panel);padding:8px 11px;border-radius:9px;font-size:12px;max-width:220px;
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
      <span class="eyebrow">Field Team · Coverage Map</span>
      <h1>Sales Rep Territory Map</h1>
      <span class="sub">Where the team sits across the country — click a rep to zoom to their pin.</span>
    </div>
    <div class="head-meta">
      <div class="stat"><b id="repCount">0</b><span>People</span></div>
      <div class="stat"><b id="locCount">0</b><span>Locations</span></div>
      <div class="stat"><b id="stateCount">0</b><span>States</span></div>
    </div>
  </header>

  <div class="layout">
    <aside class="panel roster">
      <div class="search"><input id="q" type="search" placeholder="Search name, city, or state…" aria-label="Search reps"></div>
      <div class="legend" id="legend">
        <button class="chip" data-g="direct" aria-pressed="true"><span class="dot direct"></span>Direct rep</button>
        <button class="chip" data-g="field" aria-pressed="true"><span class="dot field"></span>Indirect</button>
        <button class="chip" data-g="trainer" aria-pressed="true"><span class="dot trainer"></span>Trainer</button>
        <button class="chip" data-g="team" aria-pressed="true"><span class="dot team"></span>Team</button>
        <button class="chip" data-g="prospect" aria-pressed="true"><span class="dot prospect"></span>Prospect</button>
      </div>
      <ul class="list" id="list"></ul>
    </aside>

    <section class="panel mapwrap" id="mapwrap">
      <div class="mapctl"><button id="reset">Reset view</button></div>
      <svg viewBox="0 0 ${d.W} ${d.H}" role="img" aria-label="United States map with sales rep locations">
        <g id="vp">
          <path class="state" d="${d.statePaths}"></path>
          <path class="borders" d="${d.borderPath}"></path>
          <path class="nation" d="${d.nationPath}"></path>
          <g id="pins"></g>
        </g>
      </svg>
      <div class="tip" id="tip"></div>
    </section>
  </div>

  <footer>
    <span>Color-coded: <b style="color:var(--direct)">direct rep</b>, <b style="color:var(--field)">indirect</b>, <b style="color:var(--trainer)">trainer</b>, <b style="color:var(--team)">team</b>, <b style="color:var(--prospect)">prospect</b> (recruiting target, hollow pin).</span>
    <button class="theme" id="themeBtn">Toggle theme</button>
  </footer>
</div>

<script>
const DATA = ${JSON.stringify(d.reps)};
const stateOf = c => (c.split(',').pop()||'').trim().split(/[ /]/).pop();
const groupLabel = {direct:'Direct rep',field:'Indirect',trainer:'Trainer',team:'Team',prospect:'Prospect'};

const pinsG = document.getElementById('pins');
const listEl = document.getElementById('list');
const tip = document.getElementById('tip');
const wrap = document.getElementById('mapwrap');
const vp = document.getElementById('vp');
const W=${d.W}, H=${d.H};
let active = null;
const filters = {direct:true,field:true,trainer:true,team:true,prospect:true};

// --- render pins ---
DATA.forEach((r,i)=>{
  const g=document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('class','pin '+r.group);
  g.setAttribute('transform',\`translate(\${r.x} \${r.y})\`);
  g.dataset.idx=i;
  const isTeam = r.group==='team';
  g.innerHTML =
    \`<circle class="halo" r="7"></circle>\`+
    \`<circle class="core" r="6.5"></circle>\`+
    (isTeam? \`<circle class="badge" cx="6" cy="-6" r="6"></circle><text class="badgetx" x="6" y="-6">4</text>\`:'');
  pinsG.appendChild(g);
  g.addEventListener('mouseenter',()=>showTip(r));
  g.addEventListener('mousemove',()=>showTip(r));
  g.addEventListener('mouseleave',hideTip);
  g.addEventListener('click',e=>{e.stopPropagation();select(i,true);});
});

// --- render roster ---
DATA.forEach((r,i)=>{
  const li=document.createElement('li');
  li.className='card'; li.dataset.idx=i;
  li.innerHTML=\`<span class="pinico \${r.group}"></span>
    <span class="who"><span class="nm">\${r.name}</span>
    <span class="cy">\${r.city}</span>
    <span class="rl">\${r.role}</span></span>\`;
  li.addEventListener('click',()=>select(i,true));
  listEl.appendChild(li);
});

// --- tooltip ---
function showTip(r){
  const svg=wrap.querySelector('svg');
  const rect=svg.getBoundingClientRect();
  const wr=wrap.getBoundingClientRect();
  // apply current viewport transform to marker coords
  const m=vp.getCTM(); // maps user coords -> svg viewport px (within viewBox space)
  const sx = m.a*r.x + m.c*r.y + m.e;
  const sy = m.b*r.x + m.d*r.y + m.f;
  const px = rect.left - wr.left + sx/W*rect.width;
  const py = rect.top - wr.top + sy/H*rect.height;
  tip.style.left=px+'px'; tip.style.top=py-8+'px';
  tip.innerHTML=\`<div class="tn">\${r.name}</div><div>\${r.city}</div><div class="tr">\${r.role}</div>\`;
  tip.style.opacity=1;
}
function hideTip(){tip.style.opacity=0;}

// --- select / zoom ---
function select(i,zoom){
  active = active===i? null : i;
  document.querySelectorAll('.pin').forEach(p=>p.classList.toggle('active',+p.dataset.idx===active));
  document.querySelectorAll('.card').forEach(c=>c.classList.toggle('active',+c.dataset.idx===active));
  if(active===null){resetView();hideTip();return;}
  const r=DATA[active];
  const card=listEl.querySelector(\`.card[data-idx="\${i}"]\`);
  if(card) card.scrollIntoView({block:'nearest',behavior:'smooth'});
  if(zoom){
    const s=2.4;
    const tx=W/2 - r.x*s, ty=H/2 - r.y*s;
    vp.style.transform=\`translate(\${tx}px,\${ty}px) scale(\${s})\`;
  }
  // move a pin to front
  const g=pinsG.querySelector(\`.pin[data-idx="\${i}"]\`);
  if(g) pinsG.appendChild(g);
}
function resetView(){vp.style.transform='translate(0px,0px) scale(1)';}
document.getElementById('reset').addEventListener('click',()=>{active=null;
  document.querySelectorAll('.pin,.card').forEach(e=>e.classList.remove('active'));resetView();hideTip();});
wrap.querySelector('svg').addEventListener('click',()=>{if(active!==null){select(active,false);}});

// --- filters + search ---
function applyFilters(){
  const q=(document.getElementById('q').value||'').toLowerCase().trim();
  let shown=0;
  DATA.forEach((r,i)=>{
    const gOn=filters[r.group];
    const hit=!q || (r.name+' '+r.city+' '+r.role).toLowerCase().includes(q);
    const vis=gOn && hit;
    listEl.querySelector(\`.card[data-idx="\${i}"]\`).classList.toggle('hidden',!vis);
    pinsG.querySelector(\`.pin[data-idx="\${i}"]\`).classList.toggle('dim',!vis);
    if(vis) shown++;
  });
  let em=listEl.querySelector('.empty');
  if(shown===0){ if(!em){em=document.createElement('li');em.className='empty';em.textContent='No reps match.';listEl.appendChild(em);} }
  else if(em) em.remove();
}
document.getElementById('q').addEventListener('input',applyFilters);
document.getElementById('legend').addEventListener('click',e=>{
  const c=e.target.closest('.chip'); if(!c)return;
  const g=c.dataset.g; filters[g]=!filters[g];
  c.setAttribute('aria-pressed',filters[g]); applyFilters();
});

// --- stats ---
document.getElementById('repCount').textContent = DATA.reduce((n,r)=>n+(r.group==='team'?4:1),0);
document.getElementById('locCount').textContent = DATA.length;
document.getElementById('stateCount').textContent = new Set(DATA.map(r=>stateOf(r.city))).size;

// --- theme toggle ---
document.getElementById('themeBtn').addEventListener('click',()=>{
  const cur=document.documentElement.getAttribute('data-theme');
  const next = cur==='dark'?'light':(cur==='light'?'dark':(matchMedia('(prefers-color-scheme:dark)').matches?'light':'dark'));
  document.documentElement.setAttribute('data-theme',next);
});
</script>`;

writeFileSync(new URL('../index.html', import.meta.url), html);
console.log('wrote index.html', html.length, 'bytes');
