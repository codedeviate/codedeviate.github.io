(async function () {
  const slot = (name) => document.querySelector(`[data-include="${name}"]`);

  async function inject(name, target) {
    const res = await fetch(`/partials/${name}.html`);
    if (!res.ok) {
      console.error(`include: failed to load ${name} (HTTP ${res.status})`);
      return;
    }
    const html = await res.text();
    target.outerHTML = html;
  }

  const headerSlot = slot('header');
  const footerSlot = slot('footer');
  if (headerSlot) await inject('header', headerSlot);
  if (footerSlot) await inject('footer', footerSlot);

  const here = document.body.dataset.page;
  if (here) {
    const link = document.querySelector(`nav a[data-nav="${here}"]`);
    if (link) link.setAttribute('aria-current', 'page');
  }

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-header nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})().catch(err => console.error('include: unhandled', err));
