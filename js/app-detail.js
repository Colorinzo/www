document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(location.search).get('id');
  const app = id ? getAppById(id) : null;
  if (!app) {
    renderNotFound();
    return;
  }
  renderApp(app);
  renderRelated(app);
});

function renderApp(app) {
  document.title = `${app.name} — Витрина`;
  const cat = getCategory(app.category);
  const hasStoreLink = app.storeUrl && app.storeUrl !== '#';

  document.getElementById('appDetail').innerHTML = `
    <div class="detail-top">
      <div class="detail-icon">${iconMarkup(app)}</div>
      <div class="detail-head">
        <span class="tag" style="--tag-color:${cat.color}">${escapeHtml(cat.label)}</span>
        <h1>${escapeHtml(app.name)}</h1>
        ${app.developer ? `<p class="developer">${escapeHtml(app.developer)}</p>` : ''}
        ${hasStoreLink
          ? `<a class="cta-button" href="${escapeHtml(app.storeUrl)}" target="_blank" rel="noopener">Открыть в App Store</a>`
          : `<span class="cta-button disabled">Ссылка появится позже</span>`}
      </div>
    </div>
    <p class="detail-tagline">${escapeHtml(app.tagline)}</p>
    ${app.description ? `<div class="detail-description">${escapeHtml(app.description).replace(/\n/g, '<br>')}</div>` : ''}
    ${app.screenshots && app.screenshots.length
      ? `<div class="screens-strip">${app.screenshots.map((src) => `<img src="${escapeHtml(src)}" alt="Скриншот приложения ${escapeHtml(app.name)}" loading="lazy">`).join('')}</div>`
      : ''}
    <p class="added-meta">Добавлено в «Витрину»: ${formatDate(app.addedAt)}</p>
  `;
}

function renderRelated(app) {
  const related = getAllApps()
    .filter((a) => a.id !== app.id && a.category === app.category)
    .slice(0, 3);
  const slot = document.getElementById('relatedSlot');
  if (!related.length) {
    slot.innerHTML = '';
    return;
  }
  slot.innerHTML = `
    <h2>Похожие приложения</h2>
    <div class="feed-grid">${related.map(cardMarkup).join('')}</div>`;
}

function renderNotFound() {
  document.title = 'Приложение не найдено — Витрина';
  document.getElementById('appDetail').innerHTML = `
    <p class="empty-state">Такого приложения нет — возможно, ссылка устарела или его удалили.</p>`;
}
