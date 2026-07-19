(function() {
const FAVICON = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white'/><circle cx='50' cy='50' r='40' fill='%23111'/></svg>">`;

const NAV_CSS = `
*, *::before, *::after { box-sizing: border-box; }
body { font-family: 'Courier New', Courier, monospace; }
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem; height: 52px;
  background: #fff; border-bottom: 1px solid #e8e8e8;
}
.nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #111; }
.nav-logo-dot { width: 14px; height: 14px; border-radius: 50%; background: #111; flex-shrink: 0; }
.nav-logo-name { font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 400; letter-spacing: 0.08em; color: #111; }
.nav-links { display: flex; gap: 2.5rem; list-style: none; align-items: center; margin: 0; padding: 0; }
@media (max-width: 600px) {
  .nav-links { gap: 1.2rem; }
  .nav-links a, .nav-work-label { font-size: 10px; letter-spacing: 0.06em; }
  nav { padding: 0 1rem; }
}
.nav-links a, .nav-work-label {
  font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 400;
  letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
  color: #bbb; transition: color 0.15s; cursor: pointer; user-select: none;
}
.nav-links a:hover, .nav-links a.active { color: #111; }
.nav-work-label:hover { color: #111; }
.nav-work.active > .nav-work-label { color: #111; }
.nav-work { position: relative; }
.nav-work-dropdown {
  position: absolute; top: calc(100% + 12px); right: -16px;
  background: #fff; border-top: 2px solid #111;
  border-left: 1px solid #e8e8e8; border-right: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8;
  padding: 8px 0; list-style: none; min-width: 140px;
  opacity: 0; visibility: hidden; pointer-events: none;
  transform: translateY(-6px); transition: opacity 0.15s, visibility 0.15s, transform 0.15s;
}
.nav-work-dropdown.open { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0); }
.nav-work-dropdown::before {
  content: ''; position: absolute; top: -7px; right: 22px;
  width: 6px; height: 6px; background: #111;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}
.nav-work-dropdown li a {
  display: block; padding: 7px 20px;
  font-family: 'Courier New', Courier, monospace; font-size: 11px;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #bbb; white-space: nowrap; text-decoration: none; transition: color 0.15s;
}
.nav-work-dropdown li a:hover, .nav-work-dropdown li a.active { color: #111; }
.site-footer {
  padding: 1.2rem 2rem; border-top: 1px solid #e8e8e8;
  display: flex; align-items: center; justify-content: space-between;
  font-family: 'Courier New', Courier, monospace; background: #fff;
}
.footer-copy { font-size: 10px; color: #ccc; letter-spacing: 0.08em; text-transform: uppercase; }
.footer-links { display: flex; gap: 1.5rem; }
.footer-links a { font-size: 10px; color: #ccc; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.15s; }
.footer-links a:hover { color: #111; }
body { display: flex; flex-direction: column; min-height: 100vh; }
`;

const style = document.createElement('style');
style.textContent = NAV_CSS;
document.head.appendChild(style);

if (!document.querySelector('link[rel="icon"]')) {
  document.head.insertAdjacentHTML('beforeend', FAVICON);
}

const path = window.location.pathname.split('/').pop() || 'index.html';
const isWork = ['index.html','','pills.html','krrtk.html','dtk.html','bzrs.html','krrtkg.html','dtkg.html','pllsg.html'].includes(path);
const isAbout = path === 'about.html';
const isPalettes = path === 'palettes.html';

const nav = document.createElement('nav');
nav.innerHTML = `
  <div style="display:flex;align-items:center;gap:10px;">
    <a class="nav-logo" href="index.html">
      <span class="nav-logo-dot"></span>
      <span class="nav-logo-name">hoks</span>
    </a>
    <span id="nav-admin-badge" style="display:none;font-family:'Courier New',Courier,monospace;font-size:8px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:#c0392b;color:#fff;padding:2px 7px;border-radius:2px;cursor:pointer;" onclick="window.location.href='admin.html'">ADMIN</span>
  </div>
  <ul class="nav-links">
    <li class="nav-work${isWork?' active':''}">
      <span class="nav-work-label" id="nav-work-label">Work</span>
      <ul class="nav-work-dropdown" id="nav-work-dropdown">
        <li data-slug="pills"><a href="pills.html"${path==='pills.html'?' class="active"':''}>PLLS</a></li>
        <li data-slug="krrtk"><a href="krrtk.html"${path==='krrtk.html'?' class="active"':''}>KRRTK</a></li>
        <li data-slug="dtk"><a href="dtk.html"${path==='dtk.html'?' class="active"':''}>DTK</a></li>
        <li data-slug="bzrs"><a href="bzrs.html"${path==='bzrs.html'?' class="active"':''}>BZRS</a></li>
        <li data-slug="krrtkg"><a href="krrtkg.html"${path==='krrtkg.html'?' class="active"':''}>KRRTKG</a></li>
        <li data-slug="dtkg"><a href="dtkg.html"${path==='dtkg.html'?' class="active"':''}>DTKG</a></li>
        <li data-slug="pllsg"><a href="pllsg.html"${path==='pllsg.html'?' class="active"':''}>PLLSG</a></li>
      </ul>
    </li>
    <li><a href="about.html"${isAbout?' class="active"':''}>About</a></li>
    <li><a href="palettes.html"${isPalettes?' class="active"':''}>Palettes</a></li>
  </ul>`;
document.body.insertBefore(nav, document.body.firstChild);

const _isAdmin = sessionStorage.getItem('hoks-admin-session') === '1' ||
                 localStorage.getItem('hoks-admin-session')   === '1';
if (_isAdmin) {
  const badge = document.getElementById('nav-admin-badge');
  if (badge) badge.style.display = '';
}

const workLabel = document.getElementById('nav-work-label');
const workDropdown = document.getElementById('nav-work-dropdown');
if (workLabel && workDropdown) {
  workLabel.addEventListener('click', e => { e.stopPropagation(); workDropdown.classList.toggle('open'); });
  document.addEventListener('click', () => workDropdown.classList.remove('open'));
  workDropdown.addEventListener('click', e => e.stopPropagation());

  // El dropdown lista solo las familias activas de data/works.json.
  // Si el fetch falla, se dejan visibles todas (degradación segura).
  fetch('https://raw.githubusercontent.com/Joxemari/hoks/main/data/works.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : null)
    .then(works => {
      if (!Array.isArray(works) || !works.length) return;
      const activeSlugs = new Set(works.filter(w => w.active).map(w => w.slug));
      workDropdown.querySelectorAll('li[data-slug]').forEach(li => {
        if (!activeSlugs.has(li.dataset.slug)) li.style.display = 'none';
      });
    })
    .catch(() => {});
}

document.querySelectorAll('main, #main-content, .about-wrap, .work-section').forEach(el => el.style.flex = '1');

// Footer — Instagram aparece solo cuando esté configurado en site.json
const footer = document.createElement('footer');
footer.className = 'site-footer';
footer.innerHTML = `
  <span class="footer-copy">© 2026 hoks</span>
  <div class="footer-links" id="footer-links">
    <a href="mailto:joxemgallastegi@gmail.com">Contact</a>
  </div>`;
document.body.appendChild(footer);

fetch('https://raw.githubusercontent.com/Joxemari/hoks/main/data/site.json?t=' + Date.now())
  .then(r => r.ok ? r.json() : null)
  .then(d => {
    const fl = document.getElementById('footer-links');
    if (fl && d?.footerInstagram) {
      const a = document.createElement('a');
      a.href = d.footerInstagram;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Instagram';
      fl.appendChild(a);
    }
  })
  .catch(() => {});
})();
