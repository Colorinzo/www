(() => {
  const store = window.VitrinaStore;

  const feed =
    document.getElementById("feed");

  const empty =
    document.getElementById("emptyState");

  const search =
    document.getElementById("searchInput");

  const filters =
    document.getElementById(
      "categoryFilters"
    );

  const featured =
    document.getElementById(
      "featuredOnly"
    );

  const count =
    document.getElementById(
      "resultCount"
    );

  const appCount =
    document.getElementById(
      "appCount"
    );

  let apps = store.load();
  let category = "Все";

  if (appCount) {
    appCount.textContent =
      apps.length;
  }

  function renderFilters() {
    const categories = [
      "Все",
      ...new Set(
        apps.map(
          app => app.category
        )
      )
    ];

    filters.replaceChildren();

    categories.forEach(name => {
      const button =
        document.createElement(
          "button"
        );

      button.type = "button";

      button.className =
        `chip${
          name === category
            ? " active"
            : ""
        }`;

      button.textContent = name;

      button.setAttribute(
        "role",
        "tab"
      );

      button.setAttribute(
        "aria-selected",
        String(
          name === category
        )
      );

      button.onclick = () => {
        category = name;

        renderFilters();
        render();
      };

      filters.appendChild(button);
    });
  }

  function createCard(app) {
    const article =
      document.createElement(
        "article"
      );

    article.className =
      `app-card${
        app.featured
          ? " featured"
          : ""
      }`;

    const top =
      document.createElement(
        "div"
      );

    top.className =
      "card-top";

    const img =
      document.createElement(
        "img"
      );

    img.className =
      "app-icon";

    img.src = app.icon;

    img.alt =
      `${app.name} — иконка`;

    img.loading = "lazy";

    img.referrerPolicy =
      "no-referrer";

    img.onerror = () => {
      img.removeAttribute(
        "src"
      );

      img.style.background =
        "linear-gradient(145deg,#292a30,#111114)";
    };

    const info =
      document.createElement(
        "div"
      );

    const title =
      document.createElement(
        "h2"
      );

    title.className =
      "app-title";

    title.textContent =
      app.name;

    const category =
      document.createElement(
        "p"
      );

    category.className =
      "app-category";

    category.textContent =
      app.category;

    info.append(
      title,
      category
    );

    top.append(
      img,
      info
    );

    const description =
      document.createElement(
        "p"
      );

    description.className =
      "app-description";

    description.textContent =
      app.description;

    const bottom =
      document.createElement(
        "div"
      );

    bottom.className =
      "card-bottom";

    const favorite =
      document.createElement(
        "span"
      );

    favorite.className =
      "favorite-label";

    favorite.textContent =
      app.featured
        ? "★ Избранное"
        : "";

    const link =
      document.createElement(
        "a"
      );

    link.className =
      "detail-link";

    link.href =
      `app.html?slug=${encodeURIComponent(
        app.slug
      )}`;

    link.textContent =
      "Подробнее →";

    bottom.append(
      favorite,
      link
    );

    article.append(
      top,
      description,
      bottom
    );

    return article;
  }

  function render() {
    const query =
      search.value
        .trim()
        .toLowerCase();

    const filtered =
      apps.filter(app => {
        const searchable =
          `${app.name} ${app.description} ${app.category}`
            .toLowerCase();

        const matchesSearch =
          searchable.includes(query);

        const matchesCategory =
          category === "Все" ||
          app.category === category;

        const matchesFeatured =
          !featured.checked ||
          app.featured;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesFeatured
        );
      });

    feed.replaceChildren(
      ...filtered.map(
        createCard
      )
    );

    empty.hidden =
      filtered.length !== 0;

    if (count) {
      count.textContent =
        `${filtered.length} ${
          filtered.length === 1
            ? "приложение"
            : "приложений"
        }`;
    }
  }

  search.addEventListener(
    "input",
    render
  );

  featured.addEventListener(
    "change",
    render
  );

  const focusSearch =
    document.getElementById(
      "focusSearch"
    );

  if (focusSearch) {
    focusSearch.onclick = () => {
      search.focus();

      search.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    };
  }

  const navSearch =
    document.getElementById(
      "navSearch"
    );

  if (navSearch) {
    navSearch.onclick = () => {
      search.focus();

      search.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    };
  }

  renderFilters();
  render();
})();