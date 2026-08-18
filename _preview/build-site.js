const fs=require('fs');
const A='./assets/', F='./mofigs/';
const engine=fs.readFileSync(A+'engine.js','utf8');
const plls=fs.readFileSync(A+'plls.js','utf8');
const dtkrt=fs.readFileSync(A+'dtkrt.js','utf8');
const krrtk=fs.readFileSync(A+'krrtk.js','utf8');
const spartan=fs.readFileSync(A+'spartan.b64','utf8').trim();
const favIco='data:image/png;base64,'+fs.readFileSync(A+'favicon.b64','utf8').trim();
const omark='data:image/png;base64,'+fs.readFileSync(A+'monogram.b64','utf8').trim();          // crossed-O (393/370)
const logoTall='data:image/png;base64,'+fs.readFileSync('./assets/logo_tall.b64','utf8').trim(); // tall hoks (764/1388)
const LOOP_B64=fs.readFileSync('./assets/hall-loop.b64','utf8').trim();
const fig=n=>'data:image/png;base64,'+fs.readFileSync(F+n+'.png').toString('base64');
const F_capsule=fig('capsule'),F_arch=fig('archetypes'),F_format=fig('format'),F_field=fig('field'),
      F_place=fig('placement'),F_fin=fig('finishes'),F_grain=fig('ground_grain'),F_contact=fig('contact');

const moSec=(n,lab,body)=>`<section class="mo-sec"><div class="mo-rail"><span class="mo-num">${n}</span><span class="mo-lab">${lab}</span></div><div class="mo-col">${body}</div></section>`;
const PLLS_MO=`
  <div class="mo-hero"><div class="mo-rail"><span class="mo-eye">💊 PLLS</span></div>
    <div><span class="mo-eye">Making of · an illustrated essay</span><h1 class="mo-h1">It started on a<br>kitchen table</h1></div></div>
  <div class="mo-leadwrap"><div></div><p class="mo-lead">One figure per idea — and every image on this page is rendered from the same code that makes the work.</p></div>
  ${moSec('00','The pile',`
    <p>For a while my father was ill, and every morning his medicine came out onto the table in a little pile. Capsules and tablets, and the completely absurd, random colours that medicines come in — a sunset orange next to a municipal grey next to a pink no fruit has ever been. Nobody chose those colours to go together.</p>
    <p>He recovered. But by then I had spent a lot of mornings looking at that pile, and I had started to see compositions in it. PLLS is that pile. It is the only work of mine whose palette I can point to a source for: it is the medicine cabinet.</p>`)}
  <div class="mo-statement"><div class="mo-q">A capsule is not a shape. It is a distance between two points, given a thickness.</div></div>
  ${moSec('01','The capsule',`
    <p>PLLS has exactly one object, and it is barely an object. A capsule is a segment with round caps: two points, and a thickness. Because it is a <em>distance</em> and not a picture, there is no such thing as a wrong capsule — only a longer one or a fatter one.</p>
    <figure class="mo-fig"><img src="${F_capsule}" alt="one capsule"><figcaption>One capsule — two points and a thickness.</figcaption></figure>`)}
  ${moSec('02','Density —<br>the archetype',`
    <p>Before a single capsule is drawn, the system decides on a mood: how many pills there are, and how tightly they sit. I use the same four names in every hoks family.</p>
    <ul class="mo-ul"><li><b>Monument</b><span>a single capsule holding the whole sheet.</span></li><li><b>Solo</b><span>two or three, spare.</span></li><li><b>Scatter</b><span>five to eight, loose.</span></li><li><b>Swarm</b><span>eleven to twenty-two, crowded.</span></li></ul>
    <p>The numbers are <em>probabilities</em>. A Scatter is chosen far more often than a Monument; that is what makes the lone capsule rare.</p>
    <figure class="mo-fig mo-wide"><img src="${F_arch}" alt="archetypes"><figcaption>The four archetypes — Monument · Solo · Scatter · Swarm.</figcaption></figure>`)}
  ${moSec('03','Size, and the format problem',`
    <p>If you size the capsules against the short side of the sheet, a wide sheet reads as emptier and a tall sheet as more crowded, at the <em>same</em> archetype. I measured it: the horizontal came out 41% barer. The fix is to measure size against the geometric mean of the sheet.</p>
    <code class="mo-code">maxSize = √(FW · FH) · SPREAD / √num   —   SPREAD ≈ 0.715</code>
    <figure class="mo-fig mo-wide"><img src="${F_format}" alt="tri-format"><figcaption>Tri-format — one seed as three sheets, one density.</figcaption></figure>`)}
  ${moSec('04','The field',`
    <p>The capsules can occupy the whole sheet, or only a square centred inside it. One rule, two readings: a composition that runs to the edges and reads as a fragment, or one held in a square with air around it.</p>
    <figure class="mo-fig mo-wide"><img src="${F_field}" alt="field"><figcaption>Field — whole sheet vs. centred square, same seed.</figcaption></figure>`)}
  <div class="mo-statement"><div class="mo-q">Placement is not arrangement. The rule decides how much the pills are allowed to collide.</div></div>
  ${moSec('05','Placement',`
    <p>Each capsule looks for room before it commits: up to 24 tries, testing whether it can sit without pushing into its neighbours beyond the archetype's tolerance. And if after 24 tries it still finds no room, it is placed anyway — the rule admitting the sheet is full, and I keep it.</p>
    <figure class="mo-fig mo-wide"><img src="${F_place}" alt="placement"><figcaption>Overlap by archetype — Solo keeps apart, Swarm may collide.</figcaption></figure>`)}
  ${moSec('06','The skin',`
    <p>Seven finishes — the only place PLLS permits texture: solid, blend, translucent, outline, checker, gradient, ribbed. The two workhorses carry most of the sheets; the rare skins are the ones that make you lean in.</p>
    <figure class="mo-fig"><img src="${F_fin}" alt="finishes"><figcaption>The same capsule in all seven finishes.</figcaption></figure>`)}
  ${moSec('07','Ground<br>and grain',`
    <p>The ground is laid first — flat, or a diagonal gradient 30% of the time — and film grain is baked over the whole image at the end. The grain gives the piece a body, the faint tooth of paper under ink.</p>
    <figure class="mo-fig mo-wide"><img src="${F_grain}" alt="ground and grain"><figcaption>Flat ground · gradient ground · + film grain.</figcaption></figure>`)}
  ${moSec('08','The series',`
    <p>A single PLLS is only where the system happened to land that time. Seen together, the seeds are the work — the pile photographed a hundred mornings running.</p>
    <figure class="mo-fig mo-wide"><img src="${F_contact}" alt="contact sheet"><figcaption>Contact sheet — fifteen seeds.</figcaption></figure>`)}
  ${moSec('09','Scarcity —<br>the odds',`
    <p>Every trait has a fixed probability. I publish these numbers rather than hide them; I learned that from Dmitri Cherniak's <em>Ringers</em> — publish the odds, and let the collector reason about what they hold.</p>
    <div class="mo-odds"><div class="row"><span class="h">Archetype</span><span>Scatter 52% · Swarm 25% · Solo 20% · <b>Monument 3%</b></span></div><div class="row"><span class="h">Finish</span><span>solid 34% · blend 34% · translucent 15% · outline 5% · gradient 5% · <b>checker 3% · ribbed 4%</b></span></div><div class="row"><span class="h">Ground</span><span>flat 70% · gradient 30%</span></div></div>
    <p style="margin-top:22px">A Monument capsule, ribbed, on a rare palette is what I call a <em>Goose</em>: the outlier the system is capable of and almost never produces.</p>`)}
  <div class="mo-close"><div class="mo-big">The rule is the work.</div><div class="mo-sig">hoks · PLLS · 2026 &nbsp;·&nbsp; <a href="#/f/PLLS">← Back to PLLS</a></div></div>
`;

const page=`<meta charset="utf-8">
<title>hoks</title>
<link rel="icon" type="image/png" href="${favIco}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @font-face{font-family:"League Spartan";font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,${spartan}) format("woff2")}
  :root{
    --paper:#ffffff; --ink:#0a0a0a; --blue:#000ef7; --acid:#dcff32; --scrim:rgba(0,0,0,.3); --line:#e9e7e1; --mut:#8a8983; --body:#26251f;
    --geo:"League Spartan","Century Gothic",Futura,"Trebuchet MS",system-ui,sans-serif;
    --mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
    --ease-nav:cubic-bezier(.87,.17,.18,.85); --ease-links:cubic-bezier(.015,.85,.225,1); --navw:min(86vw,350px);
    --logo:url('${logoTall}'); --omark:url('${omark}'); }
  *{box-sizing:border-box} html,body{margin:0;height:100%}
  body{font-family:var(--geo); background:var(--paper); color:var(--ink); overflow:hidden}
  a{color:inherit; text-decoration:none}

  /* ── Splash carousel ── */
  #carousel{position:fixed; inset:0; background:#0c0c0c; cursor:pointer; transition:opacity .8s ease; z-index:70; overflow:hidden}
  .parallax{position:absolute; inset:0; transform:scale(1.05); transition:transform .6s cubic-bezier(.22,.61,.36,1)}
  .stage{position:absolute; inset:0; animation:kenburns 19s ease-in-out infinite alternate}
  #carousel canvas{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:opacity 1.2s ease}
  #cb{opacity:0}
  @keyframes kenburns{from{transform:scale(1) translate(0,0)} to{transform:scale(1.06) translate(-1.3%,-1%)}}
  .scrim{position:absolute; inset:0; background:var(--scrim); z-index:2; pointer-events:none}
  .lockup{position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); z-index:3; display:flex; flex-direction:column; align-items:center; gap:min(3.4vh,30px); pointer-events:none; text-align:center}
  .logo-mark{height:clamp(320px,54vh,620px); aspect-ratio:764/1388; background:var(--acid); -webkit-mask:var(--logo) center/contain no-repeat; mask:var(--logo) center/contain no-repeat; filter:drop-shadow(0 10px 46px rgba(0,0,0,.5)); animation:signal 1.9s steps(1,end) both}
  /* signal-acquiring flicker — the logo tunes in like a TV finding its channel, then locks */
  @keyframes signal{
    0%,6%{opacity:0} 10%{opacity:.55; transform:translate(-2px,1px)} 15%{opacity:.18}
    23%{opacity:.9; transform:none} 29%{opacity:.35; transform:translate(-1px,0)}
    39%{opacity:1; transform:none} 47%{opacity:.5}
    59%{opacity:1; transform:none} 71%{opacity:.72} 83%{opacity:1} 100%{opacity:1; transform:none} }
  .tvstatic{position:absolute; inset:0; z-index:2; pointer-events:none; opacity:0; background-color:#0a0a0a; background-size:170px 170px;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='170' height='170'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='3' intercept='-1.45'/%3E%3CfeFuncG type='linear' slope='3' intercept='-1.45'/%3E%3CfeFuncB type='linear' slope='3' intercept='-1.45'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); animation:snow 1.9s steps(1,end) both}
  @keyframes snow{ 0%{opacity:.32} 20%{opacity:.14} 40%{opacity:.26} 60%{opacity:.1} 80%{opacity:.16} 100%{opacity:0} }
  /* the click: logo vibrates/glitches in time with the static burst */
  @keyframes glitchLogo{ 0%{opacity:1;transform:none} 10%{opacity:.5;transform:translate(-3px,1px)} 20%{opacity:1;transform:translate(2px,-1px)}
    32%{opacity:.44;transform:translate(-2px,0)} 45%{opacity:1;transform:translate(2px,0)} 58%{opacity:.58;transform:translate(-2px,0)}
    72%{opacity:1;transform:none} 85%{opacity:.78} 100%{opacity:1;transform:none} }
  @keyframes glitchSnow{ 0%{opacity:.4} 18%{opacity:.14} 36%{opacity:.3} 55%{opacity:.1} 75%{opacity:.2} 100%{opacity:0} }
  .enter{font-family:var(--geo); font-size:12px; letter-spacing:.42em; text-transform:uppercase; color:#fff; opacity:.92; padding-left:.42em}
  @keyframes blink{50%{opacity:.25}} .enter b{animation:blink 2.4s ease-in-out infinite; font-weight:400}

  /* ── Header ── */
  #top{position:fixed; top:0; left:0; right:0; height:64px; z-index:50; display:none; align-items:center; justify-content:space-between; padding:0 clamp(20px,4vw,52px)}
  body.entered #top{display:flex}
  .logo{border:0; cursor:pointer; padding:0; display:block; height:34px; aspect-ratio:393/370; background:var(--ink); -webkit-mask:var(--omark) center/contain no-repeat; mask:var(--omark) center/contain no-repeat}
  .top-r{display:flex; align-items:center; gap:16px}
  .snd{font-family:var(--mono); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--mut); background:none; border:1px solid var(--line); border-radius:30px; padding:7px 12px; cursor:pointer}
  .snd.on{color:#0a0a0a; background:var(--acid); border-color:var(--acid)}
  .burger{background:none; border:0; cursor:pointer; width:30px; height:26px; position:relative; padding:0}
  .burger span{position:absolute; left:4px; right:4px; height:2px; background:var(--blue); transition:transform .4s var(--ease-nav), opacity .3s ease}
  .burger span:nth-child(1){top:9px} .burger span:nth-child(2){top:16px}
  body.nav-open .burger span:nth-child(1){transform:translateY(3.5px) rotate(45deg); background:#fff}
  body.nav-open .burger span:nth-child(2){transform:translateY(-3.5px) rotate(-45deg); background:#fff}

  /* ── Slide-out nav (right, blue) ── */
  #nav{position:fixed; top:0; bottom:0; right:calc(-1 * var(--navw)); width:var(--navw); background:var(--blue); z-index:40; opacity:0; padding:96px clamp(28px,4vw,44px) 40px; transition:right .4s var(--ease-nav), opacity .4s var(--ease-nav); display:flex; flex-direction:column}
  body.nav-open #nav{right:0; opacity:1}
  #nav ul{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}
  #nav .sep{height:22px}
  #nav a{display:flex; align-items:center; gap:14px; color:#fff; font-family:var(--geo); font-weight:600; font-size:17.5px; letter-spacing:.4em; line-height:2.14; text-transform:uppercase; cursor:pointer; opacity:0; transform:translateX(26px); transition:transform .9s var(--ease-links), opacity .6s var(--ease-links), color .2s ease}
  body.nav-open #nav a{opacity:.92; transform:none} body.nav-open #nav a:hover{opacity:1}
  body.nav-open #nav a.soon{opacity:.4} #nav a.soon{cursor:default}
  #nav a .em{width:20px; font-size:15px; letter-spacing:0}
  #nav a.active{color:var(--acid)}
  #nav a .tag{font-family:var(--mono); font-size:9px; letter-spacing:.14em; opacity:.8; margin-left:2px}
  body.nav-open #nav li:nth-child(1) a{transition-delay:.10s} body.nav-open #nav li:nth-child(2) a{transition-delay:.14s}
  body.nav-open #nav li:nth-child(3) a{transition-delay:.18s} body.nav-open #nav li:nth-child(4) a{transition-delay:.22s}
  body.nav-open #nav li:nth-child(5) a{transition-delay:.26s} body.nav-open #nav li:nth-child(6) a{transition-delay:.30s}
  body.nav-open #nav li:nth-child(8) a{transition-delay:.36s} body.nav-open #nav li:nth-child(9) a{transition-delay:.40s}
  body.nav-open #nav li:nth-child(10) a{transition-delay:.44s}
  #nav .nav-mark{position:absolute; top:30px; left:clamp(28px,4vw,44px); width:38px; aspect-ratio:393/370; background:var(--acid); -webkit-mask:var(--omark) center/contain no-repeat; mask:var(--omark) center/contain no-repeat; opacity:0; transform:translateY(-6px) rotate(-4deg); transition:opacity .5s var(--ease-links) .12s, transform .6s var(--ease-links) .12s}
  body.nav-open #nav .nav-mark{opacity:1; transform:none}
  #nav .who{margin-top:auto; font-family:var(--mono); font-size:11px; letter-spacing:.05em; color:rgba(255,255,255,.7); line-height:1.8}
  #scrim2{position:fixed; inset:0; background:rgba(0,0,0,.28); z-index:35; opacity:0; visibility:hidden; transition:opacity .4s ease, visibility .4s}
  body.nav-open #scrim2{opacity:1; visibility:visible}

  /* ── Interior shell ── */
  #site{position:fixed; inset:0; display:none; background:var(--paper); color:var(--ink); z-index:10}
  body.entered #site{display:block}
  .view{display:none} .view.on{display:block; animation:viewIn .5s ease both}
  @keyframes viewIn{from{opacity:0} to{opacity:1}}
  @media (prefers-reduced-motion:reduce){ .view.on{animation:none} }
  .scrollview{position:absolute; left:0; right:0; top:64px; bottom:0; overflow-y:auto}
  .page{max-width:1180px; margin:0 auto; padding:24px clamp(20px,4vw,52px) 90px}

  /* ── HALL = contact sheet (from Wall Studies) ── */
  #view-hall{position:absolute; inset:0}
  #hdesc{position:absolute; top:64px; left:0; right:0; height:38px; display:flex; align-items:center; gap:14px; padding:0 clamp(20px,4vw,52px); font-family:var(--mono); font-size:10.5px; letter-spacing:.08em; color:var(--mut); text-transform:uppercase; border-bottom:1px solid var(--line); background:var(--paper); z-index:2}
  #hdesc .lbl{color:var(--ink); font-weight:400}
  #frame{position:absolute; top:102px; left:0; right:0; bottom:0; overflow-y:auto}
  #frame.grid{padding:12px}
  #view-hall .wall{display:grid; gap:var(--g,10px); grid-template-columns:repeat(auto-fill,minmax(var(--m,150px),1fr))}
  #view-hall .tile{position:relative; margin:0; cursor:pointer} #view-hall .tile canvas{width:100%; aspect-ratio:1; display:block; background:#f2f0ec}
  #view-hall .tile::after{content:''; position:absolute; inset:0; box-shadow:inset 0 0 0 2px var(--acid); opacity:0; transition:opacity .18s; pointer-events:none} #view-hall .tile:hover::after{opacity:1}

  /* ── FAMILY ── */
  #view-family .h-em{font-size:30px; line-height:1}
  #view-family h1{font-family:var(--geo); font-weight:700; font-size:clamp(34px,6vw,64px); letter-spacing:.02em; text-transform:uppercase; margin:12px 0 4px}
  #view-family .desc{font-family:var(--mono); font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--blue)}
  #view-family .intro{max-width:60ch; margin:20px 0 0; font-size:16px; line-height:1.7; color:var(--body)}
  #view-family .rule{height:1px; background:var(--line); margin:38px 0}
  #view-family .sec-h{font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--mut); margin:0 0 16px}
  #view-family .gen{display:grid; grid-template-columns:minmax(0,1fr) 300px; gap:32px; align-items:start}
  #view-family #genwrap{position:relative; background:#f2f0ec; border-radius:4px; overflow:hidden; display:flex; align-items:center; justify-content:center; min-height:320px}
  #view-family #gen{max-width:100%; max-height:70vh; display:block; cursor:pointer}
  #view-family .plate{position:absolute; right:14px; bottom:14px; font-family:var(--mono); font-size:10.5px; letter-spacing:.05em; color:#fff; background:rgba(10,10,10,.44); backdrop-filter:blur(7px); padding:6px 10px; border-radius:7px; pointer-events:none; white-space:nowrap}
  #view-family .genhint{position:absolute; left:14px; bottom:14px; font-family:var(--mono); font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:#fff; background:rgba(10,10,10,.34); padding:5px 9px; border-radius:20px; opacity:0; transition:opacity .25s ease; pointer-events:none}
  #view-family #genwrap:hover .genhint{opacity:1}
  #view-family .specimen{border:1px solid var(--line); border-radius:14px; padding:20px 20px 18px; background:#fcfcfb; display:flex; flex-direction:column; gap:18px}
  #view-family .spec-h{font-family:var(--mono); font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--mut); display:flex; align-items:center; gap:10px} #view-family .spec-h::after{content:""; flex:1; height:1px; background:var(--line)}
  #view-family .spec-note{font-family:var(--mono); font-size:11px; line-height:1.6; color:var(--mut); margin:-4px 0 0}
  #view-family .gcol{display:flex; flex-direction:column; gap:14px}
  #view-family .rulecard{border:1px solid #14140f; border-radius:14px; padding:15px 16px 16px; background:#0b0b0a; overflow:hidden}
  #view-family .rc-h{font-family:var(--mono); font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--acid); display:flex; align-items:center; gap:9px} #view-family .rc-h::after{content:""; flex:1; height:1px; background:#1e1e18}
  #view-family .rc-code{font-family:var(--mono); font-size:10.5px; line-height:1.85; color:#e4e3dc; white-space:pre; overflow-x:auto; margin:10px 0 0}
  #view-family .rc-code .cm{color:#6f6e66} #view-family .rc-code .kw{color:var(--acid)}
  #view-family .cartela{font-family:var(--mono); font-size:12px; line-height:1.85; color:#3a3a37; border-left:2px solid var(--blue); padding-left:14px}
  #view-family .cartela .k{color:var(--mut); text-transform:uppercase; letter-spacing:.1em; font-size:10px}
  #view-family .cartela .big{font-family:var(--geo); font-weight:700; font-size:15px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink)}
  #view-family .btn{font-family:var(--geo); font-weight:600; font-size:12.5px; letter-spacing:.1em; text-transform:uppercase; border:1px solid var(--ink); background:var(--ink); color:#fff; padding:13px 16px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:9px; width:100%; transition:transform .12s ease,opacity .2s ease}
  #view-family .btn:hover{transform:translateY(-1px); opacity:.9} #view-family .btn .ri{font-size:15px}
  #view-family .wall{display:grid; grid-template-columns:repeat(auto-fill,minmax(248px,1fr)); gap:22px 18px}
  #view-family .tile{margin:0; cursor:pointer} #view-family .tile canvas{width:100%; height:auto; display:block; background:#f2f0ec; border-radius:2px; transition:opacity .4s ease}
  #view-family .tile figcaption{font-family:var(--mono); font-size:10.5px; letter-spacing:.05em; color:var(--mut); margin-top:7px; display:flex; justify-content:space-between} #view-family .tile figcaption b{color:var(--ink); font-weight:400}
  #view-family .edition{font-family:var(--mono); font-size:12px; letter-spacing:.08em; color:#3a3a37; margin-top:6px}
  /* prominent making-of band */
  #view-family .mofband{display:grid; grid-template-columns:1fr auto; gap:24px; align-items:center; margin-top:30px; padding:clamp(22px,3vw,34px); border-radius:16px; background:var(--ink); color:#fff}
  #view-family .mof-k{font-family:var(--mono); font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--acid)}
  #view-family .mof-t{font-family:var(--geo); font-weight:700; font-size:clamp(22px,3vw,30px); letter-spacing:.01em; text-transform:uppercase; line-height:1.02; margin:8px 0 6px}
  #view-family .mof-s{font-family:var(--mono); font-size:12.5px; line-height:1.6; color:#c9c8c2; max-width:52ch}
  #view-family .mof-go{font-family:var(--geo); font-weight:700; font-size:13px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink); background:var(--acid); border:0; border-radius:30px; padding:15px 26px; cursor:pointer; white-space:nowrap; transition:transform .14s ease}
  #view-family .mof-go:hover{transform:translateY(-2px)}
  #view-family .mof-go.soon{background:#2a2a26; color:#8a8983; cursor:default}
  /* next family */
  #view-family .nextfam{display:flex; justify-content:space-between; align-items:center; gap:16px; margin-top:40px; padding-top:22px; border-top:1px solid var(--line)}
  #view-family .nextfam .nl{font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--mut)}
  #view-family .nextfam .nb{font-family:var(--geo); font-weight:700; font-size:clamp(20px,3vw,28px); letter-spacing:.02em; text-transform:uppercase; color:var(--ink); cursor:pointer; display:inline-flex; align-items:center; gap:12px}
  #view-family .nextfam .nb:hover{color:var(--blue)} #view-family .nextfam .nb .em{font-size:22px}
  @media(max-width:720px){ #view-family .gen{grid-template-columns:1fr} #view-family .mofband{grid-template-columns:1fr} }

  /* lightbox */
  #lb{position:fixed; inset:0; z-index:80; display:none; background:rgba(250,249,246,.97); backdrop-filter:blur(4px)}
  #lb.on{display:grid; grid-template-columns:minmax(0,1fr) 320px}
  #lb .stagelb{display:flex; align-items:center; justify-content:center; padding:clamp(20px,4vw,60px); min-width:0}
  #lb .art{max-width:100%; max-height:86vh; display:block; box-shadow:0 20px 70px rgba(0,0,0,.18)}
  #lb #room{max-width:100%; max-height:86vh; display:none} #lb.sala .art{display:none} #lb.sala #room{display:block}
  #lb aside{border-left:1px solid var(--line); padding:clamp(20px,3vw,34px); display:flex; flex-direction:column; gap:16px; background:#fff}
  #lb h2{font-family:var(--geo); font-weight:700; font-size:26px; letter-spacing:.06em; text-transform:uppercase; margin:6px 0 0}
  #lb .rar{align-self:flex-start; font-family:var(--geo); font-weight:700; font-size:10px; letter-spacing:.12em; text-transform:uppercase; background:var(--acid); padding:4px 9px; border-radius:20px}
  #lb .lab{font-family:var(--mono); font-size:12px; line-height:1.5; color:#3a3a37; display:grid; gap:3px} #lb .lab .k{color:var(--mut); text-transform:uppercase; letter-spacing:.1em; font-size:9.5px; margin-top:8px}
  #lb .toggle{margin-top:auto; display:flex; gap:2px; background:#f4f3ef; border-radius:10px; padding:3px}
  #lb .toggle button{flex:1; font-family:var(--geo); font-weight:600; font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--mut); background:none; border:0; padding:9px; border-radius:8px; cursor:pointer} #lb .toggle button.on{background:var(--ink); color:#fff}
  #lb .close{position:absolute; top:16px; right:18px; font-size:20px; background:none; border:0; cursor:pointer; color:var(--ink); z-index:2}
  @media(max-width:720px){ #lb.on{grid-template-columns:1fr; grid-template-rows:1fr auto; overflow:auto} #lb aside{border-left:0; border-top:1px solid var(--line)} }

  /* MAKING (scoped) */
  #view-making .mo-wrap{max-width:1180px; margin:0 auto; padding:0 clamp(18px,5vw,64px)}
  #view-making .mo-hero{display:grid; grid-template-columns:180px minmax(0,600px); gap:60px; justify-content:end; align-items:end; padding:clamp(30px,7vh,80px) 0 clamp(24px,4vh,44px)}
  #view-making .mo-eye{font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--mut)}
  #view-making .mo-h1{font-family:var(--geo); font-weight:700; font-size:clamp(38px,6.6vw,74px); letter-spacing:.005em; text-transform:uppercase; line-height:.96; margin:14px 0 0}
  #view-making .mo-leadwrap{display:grid; grid-template-columns:180px minmax(0,600px); gap:60px; justify-content:end; padding-bottom:8px}
  #view-making .mo-lead{max-width:600px; font-family:var(--mono); font-size:12.5px; color:var(--mut); margin:0}
  #view-making .mo-sec{display:grid; grid-template-columns:180px minmax(0,600px); gap:60px; justify-content:end; align-items:start; padding:clamp(36px,6vh,74px) 0}
  #view-making .mo-sec+.mo-sec{border-top:1px solid var(--line)}
  #view-making .mo-rail{position:sticky; top:14px; text-align:right} #view-making .mo-hero .mo-rail{position:static}
  #view-making .mo-num{display:block; font-family:var(--mono); font-size:12px; letter-spacing:.08em; color:var(--blue)}
  #view-making .mo-lab{display:block; margin-top:7px; font-family:var(--geo); font-weight:700; font-size:13.5px; letter-spacing:.04em; text-transform:uppercase; color:var(--ink); line-height:1.2}
  #view-making .mo-col{max-width:600px; min-width:0}
  #view-making .mo-col p{font-size:17.5px; line-height:1.78; color:var(--body); margin:0 0 20px} #view-making .mo-col p:last-child{margin-bottom:0}
  #view-making em{font-style:italic}
  #view-making .mo-ul{margin:0 0 20px; padding:0; list-style:none}
  #view-making .mo-ul li{font-size:16.5px; line-height:1.55; color:var(--body); padding:9px 0; border-bottom:1px solid var(--line); display:flex; gap:14px} #view-making .mo-ul li:first-child{border-top:1px solid var(--line)}
  #view-making .mo-ul li b{font-family:var(--geo); font-weight:700; text-transform:uppercase; letter-spacing:.04em; font-size:13px; min-width:104px; color:var(--ink)}
  #view-making .mo-code{display:block; font-family:var(--mono); font-size:13px; background:#f1f0ea; padding:12px 14px; border-radius:6px; color:#3a3a37; margin:6px 0 0; line-height:1.5}
  #view-making .mo-fig{margin:30px 0 0} #view-making .mo-fig img{width:100%; display:block; border:1px solid var(--line); border-radius:3px}
  #view-making .mo-fig figcaption{font-family:var(--mono); font-size:11px; color:var(--mut); margin-top:11px; text-align:right}
  #view-making .mo-wide{margin-left:calc(-1 * (180px + 60px)); width:calc(100% + 180px + 60px)}
  #view-making .mo-statement{display:grid; grid-template-columns:180px minmax(0,600px); gap:60px; justify-content:end; padding:clamp(26px,5vh,54px) 0}
  #view-making .mo-q{grid-column:2; font-family:var(--geo); font-weight:600; font-size:clamp(22px,3vw,30px); line-height:1.34; color:var(--ink); border-left:3px solid var(--acid); padding-left:22px}
  #view-making .mo-odds{margin:24px 0 0; border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#fff}
  #view-making .mo-odds .row{display:grid; grid-template-columns:120px 1fr; gap:16px; padding:13px 18px; font-family:var(--mono); font-size:13px; line-height:1.5; color:#3a3a37} #view-making .mo-odds .row+.row{border-top:1px solid var(--line)}
  #view-making .mo-odds .row .h{color:var(--mut); text-transform:uppercase; letter-spacing:.08em; font-size:11px} #view-making .mo-odds b{color:var(--blue); font-weight:400}
  #view-making .mo-close{display:grid; grid-template-columns:180px minmax(0,600px); gap:60px; justify-content:end; padding:clamp(46px,8vh,92px) 0 clamp(70px,11vh,130px)}
  #view-making .mo-big{grid-column:2; font-family:var(--geo); font-weight:700; font-size:clamp(26px,4.2vw,40px); letter-spacing:.02em; text-transform:uppercase; color:var(--ink); line-height:1.05}
  #view-making .mo-sig{grid-column:2; margin-top:18px; font-family:var(--mono); font-size:12px; color:var(--mut)}
  #view-making .mo-sig a{color:var(--blue); font-family:var(--geo); font-weight:700; letter-spacing:.1em; text-transform:uppercase; font-size:12px; border-bottom:2px solid var(--acid); padding-bottom:2px}
  #view-making .mo-stub{max-width:620px; margin:0 auto; padding:clamp(40px,10vh,100px) clamp(18px,5vw,24px)}
  #view-making .mo-stub .k{font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--blue)}
  #view-making .mo-stub h1{font-family:var(--geo); font-weight:700; font-size:clamp(30px,6vw,52px); text-transform:uppercase; margin:14px 0 18px}
  #view-making .mo-stub p{font-size:17px; line-height:1.7; color:var(--body)}
  @media(max-width:860px){
    #view-making .mo-sec,#view-making .mo-hero,#view-making .mo-leadwrap,#view-making .mo-statement,#view-making .mo-close{grid-template-columns:1fr; gap:14px; justify-content:stretch}
    #view-making .mo-rail{position:static; text-align:left; display:flex; gap:12px; align-items:baseline} #view-making .mo-lab{margin-top:0}
    #view-making .mo-q,#view-making .mo-big,#view-making .mo-sig{grid-column:1}
    #view-making .mo-wide{margin-left:0; width:100%} #view-making .mo-fig figcaption{text-align:left} #view-making .mo-col,#view-making .mo-lead{max-width:none} }

  /* ABOUT */
  #view-about .ab{max-width:640px; margin:0 auto; padding:clamp(30px,8vh,90px) clamp(18px,5vw,24px) 100px}
  #view-about .k{font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--blue)}
  #view-about h1{font-family:var(--geo); font-weight:700; font-size:clamp(30px,6vw,54px); text-transform:uppercase; margin:14px 0 20px; letter-spacing:.02em}
  #view-about p{font-size:17.5px; line-height:1.8; color:var(--body)}

  @media (prefers-reduced-motion:reduce){.parallax,.stage,#carousel canvas,.enter b,.logo-mark{animation:none; transition:none} .parallax{transform:scale(1.03)}}
</style>

<!-- SPLASH -->
<div id="carousel">
  <div class="parallax" id="parallax"><div class="stage"><canvas id="ca"></canvas><canvas id="cb"></canvas></div></div>
  <div class="scrim"></div>
  <div class="tvstatic"></div>
  <div class="lockup"><div class="logo-mark" role="img" aria-label="hoks"></div><div class="enter" id="enterHint">click to enter <b>&#9656;</b></div></div>
</div>

<!-- HEADER -->
<header id="top">
  <button class="logo" id="logo" aria-label="hoks — home"></button>
  <div class="top-r">
    <button class="snd" id="sndBtn" title="sound">♪ Sound</button>
    <button class="burger" id="burger" aria-label="menu"><span></span><span></span></button>
  </div>
</header>

<!-- RIGHT NAV -->
<div id="scrim2"></div>
<nav id="nav" aria-label="main">
  <div class="nav-mark" aria-hidden="true"></div>
  <ul>
    <li><a data-go="#/hall" data-fam="ALL"><span class="em">&#9638;</span>All</a></li>
    <li><a data-go="#/f/PLLS" data-fam="PLLS"><span class="em">&#128138;</span>PLLS</a></li>
    <li><a data-go="#/f/DTKRT" data-fam="DTKRT"><span class="em">&#128309;</span>DTKRT</a></li>
    <li><a data-go="#/f/KRRTK" data-fam="KRRTK"><span class="em">&#128997;</span>KRRTK</a></li>
    <li><a class="soon"><span class="em">&#127761;</span>ECLPS <span class="tag">soon</span></a></li>
    <li><a class="soon"><span class="em">&#129698;</span>TRZS <span class="tag">soon</span></a></li>
    <li class="sep"></li>
    <li><a data-go="#/f/PLLS/making">Words</a></li>
    <li><a data-go="#/about">About</a></li>
    <li><a href="mailto:jm@joma.es">Contact</a></li>
  </ul>
  <div class="who">Joxemari Gallastegi<br>Donostia &middot; Stanford</div>
</nav>

<!-- SITE -->
<div id="site">
  <section class="view" id="view-hall">
    <div id="hdesc"><span>Contact sheet</span><span class="lbl" id="hlbl"></span></div>
    <div id="frame"></div>
  </section>

  <section class="view scrollview" id="view-family"><div class="page">
    <div class="h-em" id="hemem">💊</div>
    <h1 id="hname">PLLS</h1><div class="desc" id="hfdesc">capsules · pills</div>
    <p class="intro" id="hintro"></p><div class="rule"></div>
    <div class="sec-h">Generator — play with the system</div>
    <div class="gen">
      <div id="genwrap"><canvas id="gen"></canvas><div class="plate" id="plate"></div><div class="genhint">click to draw another</div></div>
      <div class="gcol">
        <aside class="specimen"><div class="spec-h">This one</div><div class="cartela" id="gcart"></div>
          <button class="btn" id="regen"><span class="ri">↻</span> Generate a new one</button>
          <div class="spec-note">Every press draws a new seed. What is kept is a single 1/1.</div></aside>
        <div class="rulecard"><div class="rc-h">The rule</div><pre class="rc-code" id="ruleCode"></pre></div>
      </div>
    </div>
    <div class="rule"></div>
    <div class="sec-h" id="galh">Selected works — each a seed, one of one</div>
    <div class="wall" id="wall"></div>
    <div class="edition" id="edtxt">Chapter I · edition of 12 · each 1/1 · archival pigment print, A3</div>
    <div class="mofband" id="mofband">
      <div><div class="mof-k">Making of</div><div class="mof-t" id="mofT">How PLLS is built</div>
        <div class="mof-s">An illustrated essay — where the rule came from, every decision, and the published odds. The thinking behind the work.</div></div>
      <button class="mof-go" id="makinglink">Read the essay →</button>
    </div>
    <div class="nextfam"><span class="nl">Next family</span><span class="nb" id="nextfam"></span></div>
  </div></section>

  <section class="view scrollview" id="view-making"><div class="mo-wrap" id="moWrap"></div></section>

  <section class="view scrollview" id="view-about"><div class="ab">
    <div class="k">About</div><h1>hoks</h1>
    <p>hoks is the generative practice of an artist trained in computer science, holding a MEng in Design at Stanford University. The work treats code as grammar and rules as form: each family is a single idea — a capsule, a lattice, a dividing square — run through controlled chance until the system, not the hand, composes the image.</p>
    <p>What is exhibited is the residue of that thinking. What is collected is the rule. Continuity with Elena Asins: structure, seriality, system.</p>
    <p style="font-family:var(--mono);font-size:13px;color:var(--mut);margin-top:26px">The rule is the work.</p>
  </div></section>
</div>

<!-- LIGHTBOX -->
<div id="lb"><button class="close" id="lbclose">✕</button>
  <div class="stagelb"><canvas class="art" id="lbart"></canvas><canvas id="room"></canvas></div>
  <aside><h2 id="lbname">PLLS</h2><div class="rar" id="lbrar" style="display:none"></div><div class="lab" id="lblab"></div>
    <div class="toggle" id="lbtoggle"><button data-v="clean" class="on">Work</button><button data-v="sala">View in a room</button></div></aside>
</div>

<script>${engine}</script>
<script>${plls}</script>
<script>${dtkrt}</script>
<script>${krrtk}</script>
<script>
(function(){
  var H=window.HOKS; if(!H)return;
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var ACTIVE=['PLLS','DTKRT','KRRTK'];
  var FAM={
    PLLS:{em:'💊',name:'PLLS',desc:'capsules · pills',fmt:'h',rule:'capsules given weather',hasMO:true,
      intro:'The capsules of PLLS given weather: mesh-gradient ground, film-grain skin. A capsule is not a shape — it is a distance between two points, given a thickness. The current direction of the work.',
      code:'capsule = (p1,p2,thick)  · a distance\\nn = weighted(archetype)  · 4 moods\\nplace = try 24×, else overlap\\nskin  = 1 of 7 finishes\\nground → film grain'},
    DTKRT:{em:'🔵',name:'DTKRT',desc:'one lattice, read twice',fmt:'h',rule:'one lattice, read twice',hasMO:false,
      intro:'One lattice read twice. A boolean mask decides which cells hold a circle; a region grown cell by cell decides which of them share a ground. The block does not decorate — it reframes.',
      code:'lattice = grid(cols,rows)\\nmask[c] = noise > t  · circle?\\nregion  = grow(cell→cell)  · shared\\nrole = luma → floor/block/dot\\nground = flat + grain'},
    KRRTK:{em:'🟥',name:'KRRTK',desc:'recursive squares',fmt:'h',rule:'a square deciding whether to divide',hasMO:false,
      intro:'Karratuak. A square deciding, again and again, whether to divide. Recursive subdivision against a threshold — structure as the only ornament.',
      code:'square(x,y,s):\\n  if s>min and rng()<split:\\n    4× square(·, s/2)  · divide\\n  else:\\n    fill(square)  · or stop'}
  };
  var NEXT={PLLS:'DTKRT', DTKRT:'KRRTK', KRRTK:'PLLS'};
  var PLLS_MO=${JSON.stringify(PLLS_MO)};
  function seed(){return (Math.random()*1e9)>>>0;}
  function randFam(){return ACTIVE[(Math.random()*ACTIVE.length)|0];}
  function fmtOf(f){return (FAM[f]&&FAM[f].fmt)||'h';}
  function dims(r,base){ if(r==='v')return [Math.round(base/1.414),base]; if(r==='pano')return [base,Math.round(base/2)]; if(r==='h')return [base,Math.round(base/1.414)]; return [base,base]; }
  function fmtName(r){ return r==='v'?'Vertical (DIN)':r==='pano'?'Panorama (2:1)':r==='h'?'Horizontal (DIN)':'Square'; }
  function draw(cv,w,h,fam,s,pal){ cv.width=w; cv.height=h; var ctx=cv.getContext('2d'); var o={params:{field:(w===h?'square':'sheet'),grainScale:1}};
    if(pal){o.palettes=[pal]; o.locked=true; o.lockedIdx=0;}
    try{H[fam].render(ctx,w,h,s,o);}catch(e){try{H.PLLS.render(ctx,w,h,s,o);}catch(_){ctx.fillStyle='#efeee9';ctx.fillRect(0,0,w,h);}} }
  function drawR(cv,w,h,fam,s){ cv.width=w; cv.height=h; var o={params:{field:(w===h?'square':'sheet'),grainScale:1}}; try{return H[fam].render(cv.getContext('2d'),w,h,s,o);}catch(e){var c=cv.getContext('2d');c.fillStyle='#efeee9';c.fillRect(0,0,w,h);return null;} }
  function traitsRar(fam,res){ try{var t=H[fam].traits(res);return (t&&t.overall)||'';}catch(e){return '';} }

  // palettes for the contact-sheet Vestaboard flashes
  var COLORS=[], PALS=[];
  try{PALS=(H.normalizePalettes?H.normalizePalettes(H.DEFAULTS):H.DEFAULTS)||[]; PALS.forEach(function(p){(p.colors||[]).forEach(function(c){if(COLORS.indexOf(c)<0)COLORS.push(c);});});}catch(e){}
  if(COLORS.length<4)COLORS=['#dcff32','#000ef7','#ff4f19','#ffd919','#111111','#f5f0ea'];
  function palColor(){return COLORS[(Math.random()*COLORS.length)|0];}

  var body=document.body;

  // ── audio: AEREA groove, plays in the hall only ──
  var LOOP_B64=${JSON.stringify(LOOP_B64)};
  var actx=null,buf=null,srcNode=null,gainN=null,sndOn=true, sndBtn=document.getElementById('sndBtn');
  sndBtn.classList.add('on'); // sound is ON by default; it starts on the first click (browsers block audio before a gesture)
  function b64buf(b64){ var bin=atob(b64), n=bin.length, u=new Uint8Array(n); for(var i=0;i<n;i++)u[i]=bin.charCodeAt(i); return u.buffer; }
  function ensureAudio(){ // create + resume SYNCHRONOUSLY inside the user gesture (Safari/iPad requirement)
    if(!actx){ actx=new (window.AudioContext||window.webkitAudioContext)(); gainN=actx.createGain(); gainN.gain.value=0.0001; gainN.connect(actx.destination);
      try{ actx.decodeAudioData(b64buf(LOOP_B64), function(b){ buf=b; if(sndOn){ playLoop(); audioForView(curView); } }, function(){}); }catch(e){} }
    if(actx.state==='suspended') actx.resume(); }
  function playLoop(){ if(!buf||srcNode)return; srcNode=actx.createBufferSource(); srcNode.buffer=buf; srcNode.loop=true; srcNode.connect(gainN); srcNode.start(); }
  var SND_FLOOR=0.13, SND_PEAK=0.62;
  function audioForView(v){ if(!actx||!sndOn)return;
    // sound lives in the contact sheet and the family rooms; it fades out to silence everywhere else
    var g = (grooveOpen && (v==='hall'||v==='family')) ? (v==='hall'?SND_FLOOR:0.11) : 0.0001, now=actx.currentTime;
    gainN.gain.cancelScheduledValues(now); gainN.gain.setTargetAtTime(g, now, 0.4); }
  // the music itself palpitates: swell on each pum, decay back down until the next change
  function pulseAccent(){ if(!actx||!sndOn||curView!=='hall'||!srcNode)return; var t=actx.currentTime, g=gainN.gain;
    g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001,g.value), t);
    g.linearRampToValueAtTime(SND_PEAK, t+0.06);          // pum — swell up
    g.exponentialRampToValueAtTime(SND_FLOOR, t+1.5); }   // then decay progressively
  function setSound(on){ sndOn=on; sndBtn.classList.toggle('on',on);
    if(on){ ensureAudio(); if(buf){ playLoop(); audioForView(curView); } }
    else if(actx){ var now=actx.currentTime; gainN.gain.cancelScheduledValues(now); gainN.gain.setTargetAtTime(0.0001,now,0.25); } }
  sndBtn.addEventListener('click',function(e){ e.stopPropagation(); setSound(!sndOn); });
  // landing "power on" — a burst of tuning static that resolves into the groove, synced to the logo flicker
  function landingSignal(){ if(!actx)return; var t=actx.currentTime, dur=0.86, n=Math.floor(actx.sampleRate*dur);
    var bf=actx.createBuffer(1,n,actx.sampleRate), ch=bf.getChannelData(0); for(var i=0;i<n;i++)ch[i]=(Math.random()*2-1)*0.9;
    var src=actx.createBufferSource(); src.buffer=bf; var bp=actx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1900; bp.Q.value=0.6;
    var g=actx.createGain(), gv=g.gain; gv.setValueAtTime(0.0001,t);
    var pts=[[0.02,0.3],[0.09,0.06],[0.15,0.26],[0.22,0.05],[0.31,0.2],[0.41,0.05],[0.52,0.13],[0.64,0.04],[0.76,0.1],[0.86,0.0001]];
    pts.forEach(function(p){ gv.exponentialRampToValueAtTime(Math.max(0.0001,p[1]), t+p[0]); });
    src.connect(bp); bp.connect(g); g.connect(actx.destination); src.start(t); src.stop(t+dur); }

  // ── SPLASH: the work PAINTS ITSELF — record the algorithm's draw calls, replay ground first, then objects one by one ──
  var ca=document.getElementById('ca'), landT=null, holdT=null, carRun=false;
  function landscape(){ var vw=Math.max(window.innerWidth,1), vh=Math.max(window.innerHeight,1); var ar=Math.max(vw/vh,1.34); var w=Math.min(vw,1600), h=Math.round(w/ar); return [w,h]; }
  var PATHOP={arc:1,ellipse:1,moveTo:1,lineTo:1,quadraticCurveTo:1,bezierCurveTo:1,arcTo:1,roundRect:1};
  var COMMIT={fill:1,stroke:1,fillRect:1,strokeRect:1,drawImage:1,putImageData:1,fillText:1,strokeText:1};
  var STYLE=['fillStyle','strokeStyle','globalAlpha','globalCompositeOperation','lineWidth','lineCap','lineJoin','miterLimit','font','textAlign','textBaseline','shadowBlur','shadowColor','shadowOffsetX','shadowOffsetY','lineDashOffset','filter','imageSmoothingEnabled','imageSmoothingQuality'];
  function record(fam,w,h,s){ var fc=document.createElement('canvas'); fc.width=w; fc.height=h; var rc=fc.getContext('2d'); var ops=[];
    var proxy=new Proxy(rc,{ get:function(t,k){ var v=t[k]; if(typeof v==='function'){ return function(){ var a=Array.prototype.slice.call(arguments); var r=v.apply(t,a); ops.push({m:k,a:a}); return r; }; } return v; },
      set:function(t,k,val){ if(STYLE.indexOf(k)>=0)ops.push({p:k,v:val}); try{t[k]=val;}catch(e){} return true; } });
    try{ H[fam].render(proxy,w,h,s,{params:{field:'sheet',grainScale:1}}); }catch(e){}
    return {rc:rc,ops:ops}; }
  function objStart(ops,w,h){ for(var i=0;i<ops.length;i++){ var o=ops[i]; if(!o.m)continue; if(PATHOP[o.m])return i;
      if((o.m==='fillRect'||o.m==='rect')&&o.a&&o.a.length>=4){ var x=o.a[0],y=o.a[1],ww=o.a[2],hh=o.a[3]; if(!(Math.abs(x)<2&&Math.abs(y)<2&&ww>=w*0.98&&hh>=h*0.98))return i; } } return ops.length; }
  function ex(rc,o){ if(o.p!==undefined){ try{rc[o.p]=o.v;}catch(e){} } else { try{ rc[o.m].apply(rc,o.a); }catch(e){} } }
  function paintCycle(){ if(!carRun)return; var d=landscape(), w=d[0], h=d[1]; var rec=record(randFam(),w,h,seed()); var rc=rec.rc, ops=rec.ops;
    rc.setTransform(1,0,0,1,0,0); rc.globalAlpha=1; rc.globalCompositeOperation='source-over'; rc.fillStyle='#0c0c0c'; rc.fillRect(0,0,w,h);
    ca.width=w; ca.height=h; var vc=ca.getContext('2d');
    function blit(){ vc.setTransform(1,0,0,1,0,0); vc.clearRect(0,0,w,h); vc.drawImage(rc.canvas,0,0); }
    var oi=objStart(ops,w,h), i=0; for(;i<oi;i++)ex(rc,ops[i]); blit();          // background/ground appears first
    if(reduce){ for(;i<ops.length;i++)ex(rc,ops[i]); blit(); return; }
    var chunks=[],cur=[]; for(var j=oi;j<ops.length;j++){ cur.push(ops[j]); if(ops[j].m&&COMMIT[ops[j].m]){ chunks.push(cur); cur=[]; } } if(cur.length)chunks.push(cur);
    var steps=Math.min(chunks.length,22)||1, per=Math.ceil(chunks.length/steps), iv=Math.max(95,Math.round(2900/steps)), ci=0;
    clearInterval(landT);
    landT=setInterval(function(){ for(var k=0;k<per&&ci<chunks.length;k++,ci++){ var ch=chunks[ci]; for(var q=0;q<ch.length;q++)ex(rc,ch[q]); } blit();
      if(ci>=chunks.length){ clearInterval(landT); landT=null; holdT=setTimeout(paintCycle,2000); } }, iv); }
  function startCar(){ if(carRun)return; carRun=true; paintCycle(); }
  function stopCar(){ carRun=false; clearInterval(landT); landT=null; clearTimeout(holdT); holdT=null; }
  function tune(){ [[document.querySelector('.logo-mark'),'glitchLogo .86s steps(1,end)'],[document.querySelector('.tvstatic'),'glitchSnow .86s steps(1,end)']].forEach(function(pr){ var el=pr[0]; if(!el)return; el.style.animation='none'; void el.offsetWidth; el.style.animation=pr[1]; }); }
  startCar();
  var par=document.getElementById('parallax'), carousel=document.getElementById('carousel');
  if(!reduce){ carousel.addEventListener('mousemove',function(e){ var r=carousel.getBoundingClientRect(); var dx=(e.clientX/r.width-0.5), dy=(e.clientY/r.height-0.5); par.style.transform='scale(1.05) translate('+(-dx*1.8)+'%,'+(-dy*1.8)+'%)'; });
    carousel.addEventListener('mouseleave',function(){ par.style.transform='scale(1.05)'; }); }
  var rzT; window.addEventListener('resize',function(){ clearTimeout(rzT); rzT=setTimeout(function(){ if(body.classList.contains('entered'))return; stopCar(); startCar(); },220); });

  // one click: the intermittent static plays, the page enters, and the AEREA groove starts INSIDE (no overlap)
  var grooveOpen=false;
  function enter(){ if(body.classList.contains('entered'))return; ensureAudio(); stopCar();
    // build the interior BEHIND the still-opaque landing, then fade the landing straight into it (never through the white body)
    body.classList.add('entered'); grooveOpen=true; if(sndOn) playLoop();
    if(!location.hash||location.hash==='#'||location.hash==='#/'){ location.hash='#/hall'; } else { route(); }
    requestAnimationFrame(function(){ carousel.style.opacity=0; });
    setTimeout(function(){ carousel.style.display='none'; }, 850); }
  function toEntrance(){ body.classList.remove('entered'); closeNav(); stopHall(); grooveOpen=false;
    if(actx&&gainN){ var now=actx.currentTime; gainN.gain.cancelScheduledValues(now); gainN.gain.setTargetAtTime(0.0001,now,0.2); }
    carousel.style.display='block'; requestAnimationFrame(function(){ carousel.style.opacity=1; }); startCar(); location.hash=''; }
  carousel.addEventListener('click',function(){
    if(body.classList.contains('entered'))return;
    ensureAudio(); if(sndOn) landingSignal();     // intermittent static plays on the click; the AEREA groove starts inside
    tune();                                        // logo vibrates in sync with the static
    enter(); });
  document.getElementById('logo').addEventListener('click',toEntrance);

  // ── NAV ──
  function openNav(){ body.classList.add('nav-open'); } function closeNav(){ body.classList.remove('nav-open'); }
  document.getElementById('burger').addEventListener('click',function(e){ e.stopPropagation(); body.classList.toggle('nav-open'); });
  document.getElementById('scrim2').addEventListener('click',closeNav);
  body.addEventListener('click',function(e){ var g=e.target.closest('[data-go]'); if(g){ e.preventDefault(); if(!body.classList.contains('entered'))enter(); location.hash=g.getAttribute('data-go'); closeNav(); } });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ closeNav(); closeLB(); } });

  // ── HALL: contact sheet (Wall Studies) ──
  var frame=document.getElementById('frame'), hlbl=document.getElementById('hlbl'), rafId=0, hallStop=null;
  function tile(w,h){ var f=document.createElement('figure'); f.className='tile'; var c=document.createElement('canvas'); f.appendChild(c); draw(c,w,h,randFam(),seed()); f._c=c; f._wh=[w,h]; return f; }
  function stopHall(){ if(rafId){cancelAnimationFrame(rafId);rafId=0;} if(hallStop){hallStop();hallStop=null;} }
  function contact(){ stopHall(); frame.innerHTML=''; frame.scrollTop=0;
    var w=document.createElement('div'); w.className='wall'; w.style.setProperty('--m','84px'); w.style.setProperty('--g','2px');
    var ts=[]; for(var i=0;i<176;i++){ var t=tile(150,150); (function(t){ t.addEventListener('click',function(){ if(t._fam)location.hash='#/f/'+t._fam; }); })(t); w.appendChild(t); ts.push(t); }
    frame.className='grid'; frame.appendChild(w);
    hlbl.textContent='a pulse sweeps from a zone, then rests';
    if(reduce){ ts.forEach(function(t){ var f=randFam(); draw(t._c,150,150,f,seed()); t._fam=f; }); return; }
    requestAnimationFrame(function(){
      var fr=frame.getBoundingClientRect();
      ts.forEach(function(t){ var r=t.getBoundingClientRect(); t._x=r.left-fr.left+r.width/2; t._y=r.top-fr.top+r.height/2; t._c0=-1e9; t._c1=-1e9; });
      var W=fr.width, Hh=fr.height, running=true, maxR=Math.sqrt(W*W+Hh*Hh);
      var SWEEP=2500, GAP=300, BAND=54, REST=1500, speed=(maxR+BAND)/SWEEP;
      var pulse=null, restUntil=0, pcount=0, SEQ=['palette','family'];
      function palPick(){ var pal=(pulse.mode==='palette'&&PALS.length)?PALS[pulse.palIdx]:null; return (pal&&pal.colors&&pal.colors.length)?pal.colors[(Math.random()*pal.colors.length)|0]:palColor(); }
      function flapColor(t){ var c=t._c,g=c.getContext('2d'); c.width=c.width; g.fillStyle=palPick(); g.fillRect(0,0,c.width,c.height); }
      function resolveImg(t){ var pal=(pulse.mode==='palette'&&PALS.length)?PALS[pulse.palIdx]:null; var fam=(pulse.mode==='family')?pulse.fam:randFam(); draw(t._c,150,150,fam,seed(),pal); t._fam=fam; }
      function loop(now){ if(!running)return;
        if(!pulse && now>=restUntil){ var mode=SEQ[pcount%SEQ.length]; pcount++; if(mode==='palette'&&!PALS.length)mode='family';
          pulse={ox:Math.random()*W, oy:Math.random()*Hh, b:[now,now+GAP], mode:mode, fam:randFam(), palIdx:(Math.random()*Math.max(1,PALS.length))|0};
          var pn=(pulse.mode==='palette'&&PALS[pulse.palIdx])?PALS[pulse.palIdx].name:'';
          hlbl.textContent=(mode==='palette'?('one palette'+(pn?' — '+pn:'')):('one family — '+pulse.fam));
          pulseAccent(); setTimeout(pulseAccent, GAP); }
        if(pulse){ var done=true;
          for(var bi=0;bi<pulse.b.length;bi++){ var rad=(now-pulse.b[bi])*speed; if(rad<0){done=false;continue;} if(rad<=maxR+BAND)done=false;
            for(var i2=0;i2<ts.length;i2++){ var t=ts[i2]; var dx=t._x-pulse.ox,dy=t._y-pulse.oy; var d=Math.sqrt(dx*dx+dy*dy);
              if(Math.abs(d-rad)<BAND){ if(bi===0){ if(now-t._c0>250){t._c0=now; flapColor(t);} } else { if(now-t._c1>250){t._c1=now; resolveImg(t);} } } } }
          if(done){ pulse=null; restUntil=now+REST; } }
        rafId=requestAnimationFrame(loop); }
      hallStop=function(){ running=false; };
      rafId=requestAnimationFrame(loop);
    });
  }

  // ── FAMILY ──
  var gen=document.getElementById('gen'), gcart=document.getElementById('gcart'), plate=document.getElementById('plate'),
      wall=document.getElementById('wall'), curFam='PLLS', genSeed, lifeTimer=null;
  function paintGen(){ var d=dims(fmtOf(curFam),1000); genSeed=seed(); var res=drawR(gen,d[0],d[1],curFam,genSeed); var rr=traitsRar(curFam,res);
    plate.textContent='hoks · '+curFam+' · #'+(genSeed%100000)+' · 1/1';
    gcart.innerHTML='<div class="big">'+curFam+'</div><div><span class="k">seed</span> '+genSeed+'</div>'+
      '<div><span class="k">format</span> '+fmtName(fmtOf(curFam))+'</div>'+
      '<div><span class="k">edition</span> 1/1 · unique print</div>'+(rr?'<div><span class="k">rarity</span> '+rr+'</div>':''); }
  function buildWall(){ wall.innerHTML=''; var gd=dims(fmtOf(curFam),520);
    for(var i=0;i<12;i++){ (function(){ var s=seed(), figE=document.createElement('figure'); figE.className='tile';
      var cv=document.createElement('canvas'); draw(cv,gd[0],gd[1],curFam,s);
      var cap=document.createElement('figcaption'); cap.innerHTML='<span>'+curFam+' · #'+(s%100000)+'</span><b>1/1</b>';
      figE.appendChild(cv); figE.appendChild(cap); figE._cv=cv;
      figE.addEventListener('click',function(){ openLB(curFam,s); }); wall.appendChild(figE); })(); }
    clearInterval(lifeTimer);
    lifeTimer=setInterval(function(){ var figs=wall.querySelectorAll('.tile'); if(!figs.length)return; var t=figs[(Math.random()*figs.length)|0], s=seed(), gd2=dims(fmtOf(curFam),520);
      t._cv.style.opacity=.12; setTimeout(function(){ draw(t._cv,gd2[0],gd2[1],curFam,s); t._cv.style.opacity=1; t.querySelector('figcaption').innerHTML='<span>'+curFam+' · #'+(s%100000)+'</span><b>1/1</b>'; },220); },1800); }
  function stopFamily(){ clearInterval(lifeTimer); lifeTimer=null; }
  function showFamily(f){ curFam=f; var m=FAM[f];
    document.getElementById('hemem').textContent=m.em; document.getElementById('hname').textContent=m.name;
    document.getElementById('hfdesc').textContent=m.desc; document.getElementById('hintro').textContent=m.intro;
    document.getElementById('galh').textContent=m.name+' — selected works · each a seed, one of one';
    document.getElementById('ruleCode').textContent=m.code||'';
    document.getElementById('mofT').textContent='How '+m.name+' is built';
    var mlink=document.getElementById('makinglink'), mband=document.getElementById('mofband');
    if(m.hasMO){ mlink.textContent='Read the essay →'; mlink.classList.remove('soon'); mband.querySelector('.mof-s').textContent='An illustrated essay — where the rule came from, every decision, and the published odds. The thinking behind the work.'; }
    else { mlink.textContent='In preparation'; mlink.classList.add('soon'); mband.querySelector('.mof-s').textContent='The illustrated essay for '+m.name+' is being written — the rule, the decisions, the published odds. Coming soon.'; }
    var nf=NEXT[f]; var nb=document.getElementById('nextfam'); nb.innerHTML=FAM[nf].em+' '+nf+' <span class="em">→</span>'; nb.setAttribute('data-go','#/f/'+nf);
    Array.prototype.forEach.call(document.querySelectorAll('#nav a[data-fam]'),function(a){ a.classList.toggle('active',a.getAttribute('data-fam')===f); });
    paintGen(); buildWall(); document.getElementById('view-family').scrollTop=0; }
  document.getElementById('regen').addEventListener('click',paintGen);
  gen.addEventListener('click',paintGen);
  document.getElementById('makinglink').addEventListener('click',function(){ location.hash='#/f/'+curFam+'/making'; });

  // ── LIGHTBOX ──
  var lb=document.getElementById('lb'), lbart=document.getElementById('lbart'), room=document.getElementById('room'),
      lblab=document.getElementById('lblab'), lbname=document.getElementById('lbname'), lbrar=document.getElementById('lbrar');
  var lbFam,lbSeed;
  function openLB(fam,s){ lbFam=fam; lbSeed=s; var ld=dims(fmtOf(fam),1600); var res=drawR(lbart,ld[0],ld[1],fam,s); var rr=traitsRar(fam,res);
    lbname.textContent=fam; if(rr){lbrar.style.display='';lbrar.textContent=rr;}else lbrar.style.display='none';
    lblab.innerHTML='<span class="k">work</span>'+fam+' · seed '+s+'<span class="k">edition</span>1 / 1 · unique print<span class="k">medium</span>Archival pigment print · A3 · 300 dpi<span class="k">year</span>2026<span class="k">rule</span>'+(FAM[fam].rule||'');
    lb.classList.remove('sala'); lb.classList.add('on');
    Array.prototype.forEach.call(document.querySelectorAll('#lbtoggle button'),function(b){b.classList.toggle('on',b.getAttribute('data-v')==='clean');}); }
  function closeLB(){ lb.classList.remove('on'); }
  document.getElementById('lbclose').addEventListener('click',closeLB);
  function drawRoom(){ var R=room.getContext('2d'); var W=1400,Hh=1000; room.width=W; room.height=Hh;
    var floorY=Hh*0.86, wallM=3.0, pxPerM=floorY/wallM;
    var g=R.createLinearGradient(0,0,0,floorY); g.addColorStop(0,'#efeee9'); g.addColorStop(1,'#e5e3dd'); R.fillStyle=g; R.fillRect(0,0,W,floorY);
    var gf=R.createLinearGradient(0,floorY,0,Hh); gf.addColorStop(0,'#d7d4cc'); gf.addColorStop(1,'#cfccc3'); R.fillStyle=gf; R.fillRect(0,floorY,W,Hh-floorY);
    R.strokeStyle='rgba(0,0,0,.08)'; R.beginPath(); R.moveTo(0,floorY); R.lineTo(W,floorY); R.stroke();
    var fh=1.70*pxPerM, fw=fh*0.26, fx=W*0.20, fy=floorY-fh; R.fillStyle='rgba(10,10,10,.14)';
    R.beginPath(); R.ellipse(fx,fy+fh*0.09,fw*0.16,fw*0.16,0,0,7); R.fill();
    R.beginPath(); R.moveTo(fx-fw*0.22,fy+fh*0.18); R.quadraticCurveTo(fx,fy+fh*0.16,fx+fw*0.22,fy+fh*0.18); R.lineTo(fx+fw*0.18,floorY); R.lineTo(fx-fw*0.18,floorY); R.closePath(); R.fill();
    var isSq=(lbart.width===lbart.height); var pieceH=(isSq?0.60:0.70)*pxPerM, ar=lbart.width/lbart.height, pieceW=pieceH*ar;
    var cx=W*0.62, cy=floorY-1.45*pxPerM, matt=pieceH*0.10, fr=Math.max(4,pieceH*0.02); var x=cx-pieceW/2, y=cy-pieceH/2;
    R.save(); R.shadowColor='rgba(0,0,0,.22)'; R.shadowBlur=28; R.shadowOffsetY=14; R.fillStyle='#1a1a1a'; R.fillRect(x-matt-fr,y-matt-fr,pieceW+2*(matt+fr),pieceH+2*(matt+fr)); R.restore();
    R.fillStyle='#fff'; R.fillRect(x-matt,y-matt,pieceW+2*matt,pieceH+2*matt); R.drawImage(lbart,x,y,pieceW,pieceH);
    var lx=x+pieceW+matt+fr+28, ly=cy-pieceH*0.16; R.fillStyle='#1a1a1a'; R.font='700 15px ui-monospace, Menlo, monospace'; R.textBaseline='top'; R.fillText('hoks',lx,ly);
    R.font='13px ui-monospace, Menlo, monospace'; R.fillStyle='#3a3a37'; R.fillText(lbFam+' · seed '+lbSeed, lx, ly+24); R.fillText('1/1 · archival pigment print', lx, ly+44); R.fillText('A3 · 300 dpi · 2026', lx, ly+64); }
  Array.prototype.forEach.call(document.querySelectorAll('#lbtoggle button'),function(b){ b.addEventListener('click',function(){ var v=b.getAttribute('data-v'); Array.prototype.forEach.call(document.querySelectorAll('#lbtoggle button'),function(x){x.classList.toggle('on',x===b);}); if(v==='sala'){ drawRoom(); lb.classList.add('sala'); } else lb.classList.remove('sala'); }); });

  // ── MAKING ──
  var moWrap=document.getElementById('moWrap');
  function showMaking(f){ closeLB();
    if(FAM[f].hasMO){ moWrap.innerHTML=PLLS_MO; }
    else { moWrap.innerHTML='<div class="mo-stub"><div class="k">'+FAM[f].em+' '+f+' · making of</div><h1>The notebook is<br>in preparation</h1><p>'+FAM[f].intro+'</p><p style="font-family:var(--mono);font-size:13px;color:var(--mut);margin-top:24px">Every family gets its illustrated essay — the rule, the decisions, the published odds. <a href="#/f/'+f+'" style="color:var(--blue);border-bottom:2px solid var(--acid)">← Back to '+f+'</a></p><p style="font-family:var(--geo);font-weight:700;text-transform:uppercase;font-size:24px;margin-top:36px">The rule is the work.</p></div>'; }
    document.getElementById('view-making').scrollTop=0; }

  // ── ROUTER ──
  var VIEWS=['hall','family','making','about'], curView='hall';
  function setView(v){ VIEWS.forEach(function(x){ document.getElementById('view-'+x).classList.toggle('on', x===v); }); curView=v; audioForView(v); }
  function route(){ var h=location.hash.replace(/^#\\/?/,''); var parts=h.split('/').filter(Boolean);
    if(!body.classList.contains('entered')){ if(parts.length){ carousel.style.display='none'; carousel.style.opacity=0; body.classList.add('entered'); stopCar(); } else { return; } }
    if(curView==='hall' && !(parts[0]==='hall'||!parts.length)) stopHall();
    if(!parts.length || parts[0]==='hall'){ setView('hall'); contact(); return; }
    if(parts[0]==='about'){ setView('about'); stopFamily(); return; }
    if(parts[0]==='f'){ var fam=(parts[1]||'PLLS').toUpperCase(); if(!FAM[fam])fam='PLLS';
      if(parts[2]==='making'){ setView('making'); stopFamily(); showMaking(fam); return; }
      setView('family'); showFamily(fam); return; }
    setView('hall'); contact(); }
  window.addEventListener('hashchange',route);
  // deep link: if loaded with a route hash, skip splash
  if(location.hash && location.hash!=='#' && location.hash!=='#/'){ route(); }
})();
</script>
`;
fs.writeFileSync('./site.html', page);
console.log('written', Math.round(page.length/1024)+'KB');
