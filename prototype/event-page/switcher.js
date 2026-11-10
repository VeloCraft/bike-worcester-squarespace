/*
 * PROTOTYPE chrome, not design. A floating bar that flips the variants in
 * variants.css. Throwaway.
 */
(() => {
  const VARIANTS = [
    ['A', 'Today (reference)'],
    ['B', 'Poster'],
    ['C', 'Dossier'],
    ['D', 'Timeline'],
    ['E', 'Hero band'],
  ];
  const KEYS = VARIANTS.map((v) => v[0]);
  const name = (k) => (VARIANTS.find((v) => v[0] === k) || VARIANTS[0])[1];

  const read = () => {
    const want = (new URLSearchParams(location.search).get('variant') || 'A').toUpperCase();
    return KEYS.includes(want) ? want : 'A';
  };

  let current = read();
  let bar;

  const apply = (key) => {
    current = key;
    document.documentElement.dataset.proto = key;
    const url = new URL(location.href);
    if (key === 'A') url.searchParams.delete('variant');
    else url.searchParams.set('variant', key);
    history.replaceState(null, '', url);
    if (bar) {
      bar.label.textContent = `${key} — ${name(key)}`;
      bar.root.dataset.variant = key;
    }
  };

  const cycle = (step) => apply(KEYS[(KEYS.indexOf(current) + step + KEYS.length) % KEYS.length]);

  const build = () => {
    const root = document.createElement('div');
    root.id = 'prototype-bar';
    root.setAttribute('data-prototype', 'event-page-variants');

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.textContent = '◀';
    prev.title = 'Previous variant (←)';
    prev.addEventListener('click', () => cycle(-1));

    const label = document.createElement('span');
    label.className = 'prototype-bar-label';

    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = '▶';
    next.title = 'Next variant (→)';
    next.addEventListener('click', () => cycle(1));

    root.append(prev, label, next);
    document.body.append(root);
    bar = { root, label };

    document.addEventListener('keydown', (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowLeft') cycle(-1);
      if (e.key === 'ArrowRight') cycle(1);
    });
  };

  const start = () => {
    build();
    apply(current);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
