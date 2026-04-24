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
.nav-logo {
  display: flex; align-items: center;
  text-decoration: none;
}
.nav-logo-dot {
  width: 16px; height: 16px; border-radius: 50%;
  background: #111; flex-shrink: 0;
}
.nav-links {
  display: flex; gap: 2.5rem; list-style: none;
  align-items: center; margin: 0; padding: 0;
}
.nav-links a {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px; font-weight: 400; letter-spacing: 0.12em;
  text-transform: uppercase; text-decoration: none;
  color: #bbb; transition: color 0.15s;
}
.nav-links a:hover { color: #111; }
.nav-links a.active { color: #111; }
.site-footer {
  padding: 1.2rem 2rem;
  border-top: 1px solid #e8e8e8;
  display: flex; align-items: center; justify-content: space-between;
  font-family: 'Courier New', Courier, monospace;
  background: #fff;
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
  </a>
  <ul class="nav-links">
    <li><a href="index.html"${isWork ? ' class="active"' : ''}>Work</a></li>
    <li><a href="about.html"${isAbout ? ' class="active"' : ''}>About</a></li>
    <li><a href="palettes.html"${isPalettes ? ' class="active"' : ''}>Palettes</a></li>
  </ul>`;
document.body.insertBefore(nav, document.body.firstChild);

// Push main content so footer sits at bottom
document.querySelectorAll('main, #main-content, .about-wrap, .work-section').forEach(el => el.style.flex = '1');

const footer = document.createElement('footer');
footer.className = 'site-footer';
footer.innerHTML = `
  <span class="footer-copy">© 2026 hoks</span>
  <div class="footer-links">
    <a href="mailto:joxemgallastegi@gmail.com">Contact</a>
    <a href="https://instagram.com" target="_blank">Instagram</a>
  </div>`;
document.body.appendChild(footer);
})();
