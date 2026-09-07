(() => {
  "use strict";

  const store = window.VitrinaStore;
  const state = { category: "all", query: "", featuredOnly: false };

  const feed = document.getElementById("feed");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const filters = document.getElementById("categoryFilters");
  const featuredOnly = document.getElementById("featuredOnly");

  function cardMarkup(app) {
    const detailUrl = `app.html?id=${encodeURIComponent(app.id)}`;
    const category = store.escapeHtml(store.categoryLabel(app.category));
    const safeName = store.escapeHtml(app.name);
    const safeTagline = store.escapeHtml(app.tagline);
    const date = store.escapeHtml(app.releaseDate);

    return `
      <article class="app-card">
        <a class="app-card-link" href="${detailUrl}" aria-label="Открыть ${safeName}">
          <div class="card-top">
            ${store.iconMarkup(app)}
            <span class="category">${category}</span>
          </div>
          <div class="card-body">
            <div class="card-title-row">
              <h2>${safeName}</h2>
              ${app.featured ? '<span class="featured-mark" title="Избранное" aria-label="Избранное">★</span>' : ""}
            </div>
            <p>${safeTagline}</p>
          </div>
          <div class="card-footer">
            <span>${date}</span>
            <span>Подробнее →</span>
          </div>
        </a>
      </article>`;
  }

  function matches(app) {
    const query = state.query.toLowerCase();
    const text = `${app.name} ${app.tagline} ${app.description}`.toLowerCase();

    return (
      (state.category === "all" || app.category === state.category) &&
      (!state.featuredOnly || app.featured) &&
      (!query || text.includes(query))
    );
  }

  function renderFilters() {
    const categories = [{ id: "all", label: "Все" }, ...store.DATA.categories];
    filters.innerHTML = categories.map((item) => `
      <button
        class="filter-button ${state.category === item.id ? "active" : ""}"
        type="button"
        role="tab"
        aria-selected="${state.category === item.id}"
        data-category="${store.escapeHtml(item.id)}"
      >${store.escapeHtml(item.label)}</button>
    `).join("");
  }

  function bindImageFallbacks() {
    feed.querySelectorAll("img[data-fallback]").forEach((img) => {
      img.addEventListener("error", () => {
        const fallback = document.createElement("div");
        fallback.className = img.className + " icon-fallback";
        fallback.setAttribute("aria-hidden", "true");
        fallback.textContent = img.dataset.fallback || "?";
        img.replaceWith(fallback);
      }, { once: true });
    });
  }

  function render() {
    const apps = store.getApps().filter(matches);
    feed.innerHTML = apps.map(cardMarkup).join("");
    emptyState.hidden = apps.length !== 0;
    bindImageFallbacks();
  }

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    renderFilters();
    render();
  });

  searchInput.addEventListener("input", () => {
    state.query = searchInput.value.trim();
    render();
  });

  featuredOnly.addEventListener("change", () => {
    state.featuredOnly = featuredOnly.checked;
    render();
  });

  renderFilters();
  render();
})();
