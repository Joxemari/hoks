(function() {
  const NAV_CSS = `
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.4rem 2rem;
  background: rgba(255,255,255,0.94); backdrop-filter: blur(8px);
  border-bottom: 1px solid #e8e8e8;
  font-family: 'Nunito', sans-serif;
}
.nav-logo { font-size: 14px; font-weight: 700; letter-spacing: 0.02em; text-decoration: none; color: #111; }
.nav-links { display: flex; gap: 2rem; list-style: none; align-items: center; }
.nav-links > li > a { font-size: 13px; font-weight: 400; letter-spacing: 0.02em; text-decoration: none; color: #aaa; transition: color 0.15s; }
.nav-links > li > a:hover, .nav-links > li > a.active { color: #111; }
.nav-label { font-size: 13px; font-weight: 400; letter-spacing: 0.02em; color: #aaa; transition: color 0.15s; cursor: default; }
.nav-dropdown { position: relative; }
.nav-dropdown > a { position: relative; }
.nav-dropdown > a::after { content: ''; display: block; position: absolute; left: 0; right: 0; height: 20px; bottom: -20px; }
.dropdown { display: none; position: absolute; top: calc(100% + 10px); left: 0; background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; padding: 6px 0; list-style: none; min-width: 140px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.dropdown li a { display: block; padding: 8px 16px; font-size: 13px; color: #aaa; white-space: nowrap; text-decoration: none; }
.dropdown li a:hover { color: #111; }
.nav-dropdown:hover .dropdown { display: block; }
`;

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = NAV_CSS;
  document.head.appendChild(style);

  // Detect active page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const isWork = path === 'index.html' || path === 'pills.html';
  const isAbout = path === 'about.html';
  const isPalettes = path === 'palettes.html';

  // Works list — add new projects here only
  const works = [
    { name: 'Pills', href: 'pills.html' },
  ];

  const workLinks = works.map(w =>
    `<li><a href="${w.href}"${path === w.href ? ' class="active"' : ''}>${w.name}</a></li>`
  ).join('\n        ');

  const nav = document.createElement('nav');
  nav.innerHTML = `
  <a class="nav-logo" href="index.html">hoks</a>
  <ul class="nav-links">
    <li class="nav-dropdown">
      <span class="nav-label">work</span>
      <ul class="dropdown">
        ${workLinks}
      </ul>
    </li>
    <li><a href="about.html"${isAbout ? ' class="active"' : ''}>about</a></li>
    <li><a href="palettes.html"${isPalettes ? ' class="active"' : ''}>palettes</a></li>
  </ul>`;

  document.body.insertBefore(nav, document.body.firstChild);
})();
