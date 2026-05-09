(async function () {
  const grid = document.getElementById('grid');
  const filters = document.getElementById('filters');
  if (!grid || !filters) return;

  let repos = [];
  try {
    const res = await fetch('/data/repos.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    repos = await res.json();
    if (!Array.isArray(repos)) throw new Error('repos.json: expected an array');
  } catch (err) {
    console.error('repos.js: failed to load', err);
    grid.innerHTML = `<p>Could not load repositories. See console.</p>`;
    grid.removeAttribute('aria-busy');
    return;
  }

  const langs = unique(repos.map(r => r.language));
  const kinds = unique(repos.map(r => r.kind));

  const params = new URLSearchParams(location.search);
  const state = {
    lang: (params.get('lang') || 'all').toLowerCase(),
    kind: (params.get('kind') || 'all').toLowerCase(),
  };

  filters.innerHTML = `
    <div class="group" data-axis="lang">
      ${chip('all', 'All', state.lang === 'all')}
      ${langs.map(l => chip(l.toLowerCase(), l, state.lang === l.toLowerCase())).join('')}
    </div>
    <div class="sep"></div>
    <div class="group" data-axis="kind">
      ${chip('all', 'All kinds', state.kind === 'all')}
      ${kinds.map(k => chip(k.toLowerCase(), k, state.kind === k.toLowerCase())).join('')}
    </div>
  `;

  filters.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.chip');
    if (!btn) return;
    const axis = btn.parentElement.dataset.axis;
    state[axis] = btn.dataset.value;
    syncURL();
    render();
    refreshChips();
  });

  render();

  function render() {
    const filtered = repos
      .filter(r => state.lang === 'all' || r.language.toLowerCase() === state.lang)
      .filter(r => state.kind === 'all' || r.kind.toLowerCase() === state.kind)
      .sort((a, b) =>
        Number(!!b.featured) - Number(!!a.featured) ||
        Number(!!a.archived) - Number(!!b.archived) ||
        a.name.localeCompare(b.name)
      );

    if (filtered.length === 0) {
      grid.innerHTML = `<p>No repositories match those filters.</p>`;
    } else {
      grid.innerHTML = filtered.map(card).join('');
    }
    grid.removeAttribute('aria-busy');
  }

  function refreshChips() {
    filters.querySelectorAll('.chip').forEach(c => {
      const axis = c.parentElement.dataset.axis;
      c.setAttribute('aria-pressed', state[axis] === c.dataset.value ? 'true' : 'false');
    });
  }

  function syncURL() {
    const p = new URLSearchParams();
    if (state.lang !== 'all') p.set('lang', state.lang);
    if (state.kind !== 'all') p.set('kind', state.kind);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  function card(r) {
    const tags = (r.tags || []).map(t => `<span class="tag">${escape(t)}</span>`).join('');
    const meta = [r.language, r.kind, r.featured ? 'Featured' : null, r.archived ? 'Archived' : null]
      .filter(Boolean).map(escape).join(' · ');
    const safeUrl = /^https?:\/\//i.test(r.url) ? escape(r.url) : '#';
    return `
      <article class="repo-card${r.archived ? ' archived' : ''}" id="${escape(r.id)}">
        <h2 class="name"><a href="${safeUrl}" rel="noopener">${escape(r.name)}</a></h2>
        <p class="meta">${meta}</p>
        <p class="tagline">${escape(r.tagline)}</p>
        ${tags ? `<div class="tags">${tags}</div>` : ''}
      </article>
    `;
  }

  function chip(value, label, pressed) {
    return `<button class="chip" data-value="${escape(value)}" aria-pressed="${pressed ? 'true' : 'false'}">${escape(label)}</button>`;
  }

  function unique(arr) {
    const seen = new Map();
    for (const v of arr) {
      if (!v) continue;
      const key = String(v).toLowerCase();
      if (!seen.has(key)) seen.set(key, v);
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }

  function escape(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }
})();
