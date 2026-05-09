(async function () {
  const list = document.getElementById('timeline');
  if (!list) return;

  try {
    const res = await fetch('/data/experience.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const entries = await res.json();
    if (!Array.isArray(entries)) throw new Error('experience.json: expected an array');
    list.innerHTML = entries.map(renderEntry).join('');
  } catch (err) {
    console.error('experience.js: failed to render', err);
    list.innerHTML = `<li><p>Could not load experience data. See console.</p></li>`;
  } finally {
    list.removeAttribute('aria-busy');
  }

  function renderEntry(e) {
    const tags = (e.tags || []).map(t => `<span class="tag">${escape(t)}</span>`).join('');
    const company = e.company ? `<div class="company">${escape(e.company)}</div>` : '';
    return `
      <li id="${escape(e.id)}">
        <div class="date">${escape(e.displayDate)}</div>
        <div>
          <h2 class="role">${escape(e.role)}</h2>
          ${company}
          <p class="blurb">${escape(e.blurb)}</p>
          ${tags ? `<div class="tags">${tags}</div>` : ''}
        </div>
      </li>
    `;
  }

  function escape(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }
})();
