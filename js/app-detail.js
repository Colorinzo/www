(() => {
  "use strict";

  const store = window.VitrinaStore;
  const root = document.getElementById("appDetail");
  const id = new URLSearchParams(window.location.search).get("id");
  const app = id ? store.getAppById(id) : null;

  function setMeta(name, content, property = false) {
    if (!content) return;
    let node = document.head.querySelector(property ? `meta[property="${name}"]` : `meta[name="${name}"]`);
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute(property ? "property" : "name", name);
      document.head.appendChild(node);
    }
    node.content = content;
  }

  function render() {
    if (!app) {
      document.title = "Не найдено — Vitrina";
      root.innerHTML = `
        <section class="panel not-found">
          <p class="eyebrow">404</p>
          <h1>Приложение не найдено</h1>
          <p class="muted">Возможно, запись была удалена или ссылка устарела.</p>
          <a class="button primary" href="index.html">Вернуться в каталог</a>
        </section>`;
      return;
    }

    const safeName = store.escapeHtml(app.name);
    const safeTagline = store.escapeHtml(app.tagline);
    const safeDescription = store.escapeHtml(app.description);
    const category = store.escapeHtml(store.categoryLabel(app.category));
    const releaseDate = store.escapeHtml(app.releaseDate);

    document.title = `${app.name} — Vitrina`;
    setMeta("description", app.tagline);
    setMeta("og:title", app.name, true);
    setMeta("og:description", app.tagline, true);

    const storeLink = store.isSafeUrl(app.storeUrl, { allowHash: true }) && app.storeUrl !== "#"
      ? `<a class="button primary" href="${store.escapeHtml(app.storeUrl)}" target="_blank" rel="noopener noreferrer">Открыть в App Store ↗</a>`
      : "";

    const screenshots = app.screenshots.map((url, index) => `
      <figure class="screenshot">
        <img src="${store.escapeHtml(url)}" alt="${safeName} — скриншот ${index + 1}" loading="lazy" decoding="async">
      </figure>
    `).join("");

    root.innerHTML = `
      <article class="detail">
        <div class="detail-head">
          <div class="detail-icon-wrap">${store.iconMarkup(app, "detail-icon")}</div>
          <div>
            <p class="eyebrow">${category}</p>
            <h1>${safeName}</h1>
            <p class="detail-tagline">${safeTagline}</p>
          </div>
        </div>

        <div class="detail-meta">
          <span>Релиз: ${releaseDate}</span>
          ${app.featured ? "<span>★ Избранное</span>" : ""}
        </div>

        <div class="detail-description">
          <p>${safeDescription}</p>
        </div>

        <div class="button-row">${storeLink}</div>

        ${screenshots ? `<section class="screenshots"><h2>Скриншоты</h2><div class="screenshots-grid">${screenshots}</div></section>` : ""}
      </article>`;

    root.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        img.closest("figure, .detail-icon-wrap")?.classList.add("image-error");
        img.remove();
      }, { once: true });
    });
  }

  render();
})();
