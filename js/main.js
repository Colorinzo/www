document.addEventListener('DOMContentLoaded', () => {
  const apps = getAllApps();
  renderCategoryNav();
  renderFeatured(apps);
  renderGrid(apps);
  document.getElementById('searchInput').addEventListener('input', applyFilters);
});

function renderCategoryNav() {
  const nav = document.getElementById('categoryNav');
  const pills = [{ id: 'all', label: 'Всё' }, ...CATEGORIES];
  nav.innerHTML = pills
    .map((c, i) => `<button class="nav-pill${i === 0 ? ' active' : ''}" data-cat="${c.id}">${escapeHtml(c.label)}</button>`)
    .join('');
  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-pill');
    if (!btn) return;
    nav.querySelectorAll('.nav-pill').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
  });
}

function renderFeatured(apps) {
  const slot = document.getElementById('featuredSlot');
  const featured = apps.find((a) => a.featured) || apps[0];
  if (!featured) {
    slot.innerHTML = '';
    return;
  }
  const cat = getCategory(featured.category);
  slot.innerHTML = `
    <a class="featured-card" href="app.html?id=${encodeURIComponent(featured.id)}">
      <div class="featured-icon">${iconMarkup(featured)}</div>
      <div class="featured-body">
        <span class="tag">${escapeHtml(cat.label)}</span>
        <h2>${escapeHtml(featured.name)}</h2>
        <p>${escapeHtml(featured.tagline)}</p>
      </div>
      <span class="featured-chevron" aria-hidden="true">${chevronSvg()}</span>
    </a>`;
}

function renderGrid(apps) {
  document.getElementById('feedGrid').innerHTML = apps.map(cardMarkup).join('');
}

function applyFilters() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const activeCat = document.querySelector('.nav-pill.active')?.dataset.cat || 'all';
  const cards = document.querySelectorAll('.app-card');
  let visible = 0;
  cards.forEach((card) => {
    const matchesCat = activeCat === 'all' || card.dataset.cat === activeCat;
    const matchesQuery = !query || card.dataset.name.includes(query);
    const show = matchesCat && matchesQuery;
    card.style.display = show ? '' : 'none';
    if (show) visible += 1;
  });
  document.getElementById('emptyState').hidden = visible !== 0;
}
