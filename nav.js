(function() {
const FAVICON = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white'/><circle cx='50' cy='50' r='40' fill='%23111'/></svg>">`;

const NAV_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; }
body { font-family: 'Courier New', Courier, monospace; }
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem; height: 52px;
  background: #fff; border-bottom: 1px solid #e8e8e8;
}
.nav-logo {
  display: flex; align-items: center;
  text-decoration: none; color: #111;
}
.nav-logo-dot {
  width: 18px; height: 18px; border-radius: 50%;
  background: #111; flex-shrink: 0;
}
.nav-links {
  display: flex; gap: 2.5rem; list-style: none;
  align-items: center; margin: 0; padding: 0;
}
.nav-links a, .nav-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px; font-weight: 400; letter-spacing: 0.12em;
  text-transform: uppercase; text-decoration: none;
  color: #aaa; transition: color 0.15s; cursor: pointer;
}
.nav-links a:hover, .nav-links a.active { color: #111; }
.nav-dropdown { position: relative; }
.nav-dropdown::after {
  content: ''; position: absolute;
  top: 100%; left: -10px; right: -10px; height: 1rem;
}
.dropdown {
  position: absolute; top: calc(100% + 0.6rem); right: 0;
  background: #fff; border: 1px solid #e8e8e8;
  border-radius: 2px; padding: 4px 0; list-style: none;
  min-width: 110px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  opacity: 0; visibility: hidden;
  transition: opacity 0.18s, visibility 0.18s; pointer-events: none;
}
.nav-dropdown:hover .dropdown { opacity: 1; visibility: visible; pointer-events: auto; }
.dropdown li a {
  display: block; padding: 6px 14px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px; letter-spacing: 0.10em; text-transform: uppercase;
  color: #aaa; white-space: nowrap; text-decoration: none;
}
.dropdown li a:hover { color: #111; }
/* Common footer */
.site-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e8e8e8;
  display: flex; align-items: center; justify-content: space-between;
  font-family: 'Courier New', Courier, monospace;
  margin-top: auto;
}
.footer-copy { font-size: 10px; color: #aaa; letter-spacing: 0.08em; text-transform: uppercase; }
.footer-links { display: flex; gap: 1.5rem; }
.footer-links a {
  font-size: 10px; color: #aaa; text-decoration: none;
  letter-spacing: 0.08em; text-transform: uppercase;
  transition: color 0.15s;
}
.footer-links a:hover { color: #111; }
body {
  display: flex; flex-direction: column; min-height: 100vh;
}
main, #main-content, .layout, .about-wrap, .work-section {
  flex: 1;
}
`;

const style = document.createElement('style');
style.textContent = NAV_CSS;
document.head.appendChild(style);

// Favicon
if (!document.querySelector('link[rel="icon"]')) {
  document.head.insertAdjacentHTML('beforeend', FAVICON);
}

const path = window.location.pathname.split('/').pop() || 'index.html';
const isAbout = path === 'about.html';
const isPalettes = path === 'palettes.html';
const works = [{ name: 'Pills', href: 'pills.html' }];
const workLinks = works.map(w =>
  `<li><a href="${w.href}"${path === w.href ? ' class="active"' : ''}>${w.name}</a></li>`
).join('\n');

const nav = document.createElement('nav');
nav.innerHTML = `
  <a class="nav-logo" href="index.html">
    <span class="nav-logo-dot"></span>
  </a>
  <ul class="nav-links">
    <li class="nav-dropdown">
      <span class="nav-label${works.some(w=>w.href===path)?' active':''}">Work</span>
      <ul class="dropdown">${workLinks}</ul>
    </li>
    <li><a href="about.html"${isAbout?' class="active"':''}>About</a></li>
    <li><a href="palettes.html"${isPalettes?' class="active"':''}>Palettes</a></li>
  </ul>`;
document.body.insertBefore(nav, document.body.firstChild);

// Common footer — inject before </body>
const footer = document.createElement('footer');
footer.className = 'site-footer';
footer.innerHTML = `
  <span class="footer-copy">© 2026 HOKS</span>
  <div class="footer-links">
    <a href="mailto:joxemgallastegi@gmail.com">Contact</a>
    <a href="https://instagram.com" target="_blank">Instagram</a>
  </div>`;
document.body.appendChild(footer);
})();
