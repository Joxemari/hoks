(function() {
const FAVICON = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white'/><circle cx='50' cy='50' r='40' fill='%23111'/></svg>">`;

const SITE_KEY = 'hoks-site-content';
const SITE_DEFAULTS = {
  aboutText: 'Joxemari Gallastegi is a generative artist based in Spain. His work is characterised by bold form, vibrant colour, and the beauty of controlled randomness — algorithmic systems that make each piece unique by design.',
  footerEmail: 'joxemgallastegi@gmail.com',
  footerInstagram: 'https://instagram.com'
};

function getSiteContent() {
  try { return { ...SITE_DEFAULTS, ...JSON.parse(localStorage.getItem(SITE_KEY) || '{}') }; }
  catch(e) { return { ...SITE_DEFAULTS }; }
}

const NAV_CSS = `
*, *::before, *::after { box-sizing: border-box; }
body { font-family: 'Courier New', Courier, monospace; }
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem; height: 52px;
  background: #fff; border-bottom: 1px solid #e8e8e8;
}
.nav-logo {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none; color: #111;
}
.nav-logo-dot {
  width: 14px; height: 14px; border-radius: 50%;
  background: #111; flex-shrink: 0;
}
.nav-logo-name {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px; font-weight: 400; letter-spacing: 0.08em;
  color: #111;
}
.nav-links {
  display: flex; gap: 2.5rem; list-style: none;
  align-items: center; margin: 0; padding: 0;
}
.nav-links a, .nav-work-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px; font-weight: 400; letter-spacing: 0.12em;
  text-transform: uppercase; text-decoration: none;
  color: #bbb; transition: color 0.15s; cursor: pointer;
}
.nav-links a:hover, .nav-links a.active,
.nav-work.active > .nav-work-label { color: #111; }
.nav-work { position: relative; padding-bottom: 8px; margin-bottom: -8px; }
.nav-work-label { display: block; }
.nav-work-dropdown {
  position: absolute; top: calc(100% + 4px); right: 0;
  background: #fff; border: 1px solid #e8e8e8;
  padding: 4px 0; list-style: none; min-width: 100px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  opacity: 0; visibility: hidden; pointer-events: none;
  transition: opacity 0.15s, visibility 0.15s;
}
.nav-work:hover .nav-work-dropdown {
  opacity: 1; visibility: visible; pointer-events: auto;
}
.nav-work-dropdown li a {
  display: block; padding: 6px 14px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px; letter-spacing: 0.10em; text-transform: uppercase;
  color: #bbb; white-space: nowrap; text-decoration: none;
  transition: color 0.15s;
}
.nav-work-dropdown li a:hover, .nav-work-dropdown li a.active { color: #111; }
.site-footer {
  padding: 1.2rem 2rem; border-top: 1px solid #e8e8e8;
  display: flex; align-items: center; justify-content: space-between;
  font-family: 'Courier New', Courier, monospace; background: #fff;
}
.footer-copy { font-size: 10px; color: #ccc; letter-spacing: 0.08em; text-transform: uppercase; }
.footer-links { display: flex; gap: 1.5rem; }
.footer-links a {
  font-size: 10px; color: #ccc; text-decoration: none;
  letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.15s;
}
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
const isWork = path === 'index.html' || path === '' || path === 'pills.html';
const isAbout = path === 'about.html';
const isPalettes = path === 'palettes.html';

const nav = document.createElement('nav');
nav.innerHTML = `
  <a class="nav-logo" href="index.html">
    <span class="nav-logo-dot"></span>
    <span class="nav-logo-name">hoks</span>
  </a>
  <ul class="nav-links">
    <li class="nav-work${isWork?' active':''}">
      <span class="nav-work-label">Work</span>
      <ul class="nav-work-dropdown">
        <li><a href="pills.html"${path==='pills.html'?' class="active"':''}>Pills</a></li>
      </ul>
    </li>
    <li><a href="about.html"${isAbout?' class="active"':''}>About</a></li>
    <li><a href="palettes.html"${isPalettes?' class="active"':''}>Palettes</a></li>
  </ul>`;
document.body.insertBefore(nav, document.body.firstChild);

// Make content grow so footer sits at bottom
document.querySelectorAll('main, #main-content, .about-wrap, .work-section').forEach(el => el.style.flex = '1');

// Dynamic footer from site content
const c = getSiteContent();
const footer = document.createElement('footer');
footer.className = 'site-footer';
footer.innerHTML = `
  <span class="footer-copy">© 2026 hoks</span>
  <div class="footer-links">
    <a href="mailto:${c.footerEmail}">Contact</a>
    <a href="${c.footerInstagram}" target="_blank">Instagram</a>
  </div>`;
document.body.appendChild(footer);

// Dynamic about text
if (isAbout) {
  const aboutEl = document.getElementById('about-text');
  if (aboutEl) aboutEl.textContent = c.aboutText;
}
})();
