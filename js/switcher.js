/* Плашка «Концепт 1 · 2 · 3» для показу замовнику.
   Щоб прибрати її з фінального сайту, видаліть рядок <script src="js/switcher.js"> у HTML. */
(function () {
  const CONCEPTS = [
    { n: 1, href: 'concept-1.html', name: 'Мінімал' },
    { n: 2, href: 'concept-2.html', name: 'Вечір' },
    { n: 3, href: 'concept-3.html', name: 'Креслення' },
  ];
  const file = location.pathname.split('/').pop() || 'index.html';
  const current = CONCEPTS.find((c) => c.href === file);

  const css = `
  .cswitch{position:fixed;z-index:90;left:calc(16px + env(safe-area-inset-left,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));
    display:flex;align-items:center;gap:4px;padding:5px 5px 5px 14px;border-radius:999px;
    background:rgba(28,31,29,.86);color:#F3F1EC;font:400 13px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    box-shadow:0 6px 24px rgba(0,0,0,.22);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
  .cswitch__label{margin-right:6px;opacity:.75}
  .cswitch a{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:32px;padding:0 10px;border-radius:999px;color:inherit;text-decoration:none;
    transition:background-color .2s}
  .cswitch a:hover{background:rgba(243,241,236,.14)}
  .cswitch a[aria-current="page"]{background:#F3F1EC;color:#1C1F1D}
  .cswitch a span{display:none}
  .cswitch a[aria-current="page"] span{display:inline;margin-left:6px}
  .cswitch a:focus-visible{outline:2px solid #F3F1EC;outline-offset:2px}
  @media (max-width:640px){.cswitch{bottom:calc(76px + env(safe-area-inset-bottom,0px));left:calc(12px + env(safe-area-inset-left,0px))}}
  @media print{.cswitch{display:none}}`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const nav = document.createElement('nav');
  nav.className = 'cswitch';
  nav.setAttribute('aria-label', 'Концепти дизайну');
  nav.innerHTML = '<span class="cswitch__label">Концепт</span>' + CONCEPTS.map((c) =>
    `<a href="${c.href}" title="${c.name}"${current && current.n === c.n ? ' aria-current="page"' : ''}>${c.n}<span>${c.name}</span></a>`
  ).join('');
  document.body.appendChild(nav);
})();
