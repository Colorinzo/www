(() => {
  const store = window.VitrinaStore;

  const root =
    document.getElementById("appDetail");

  const empty =
    document.getElementById("detailEmpty");

  const params =
    new URLSearchParams(
      window.location.search
    );

  const slug = params.get("slug");

  const app =
    store.load().find(
      item => item.slug === slug
    );

  if (!app) {
    empty.hidden = false;
    return;
  }

  document.title =
    `${app.name} — Vitrina`;

  /* =========================
     HERO
  ========================= */

  const hero =
    document.createElement("section");

  hero.className =
    "detail-hero";

  const icon =
    document.createElement("img");

  icon.className =
    "detail-icon";

  icon.src =
    app.icon;

  icon.alt =
    `${app.name} — иконка`;

  icon.referrerPolicy =
    "no-referrer";

  icon.onerror = () => {
    icon.removeAttribute("src");

    icon.style.background =
      "linear-gradient(145deg,#292a30,#111114)";
  };

  const copy =
    document.createElement("div");

  copy.className =
    "detail-copy";

  const category =
    document.createElement("p");

  category.className =
    "detail-category";

  category.textContent =
    app.category;

  const title =
    document.createElement("h1");

  title.className =
    "detail-title";

  title.textContent =
    app.name;

  copy.append(
    category,
    title
  );

  hero.append(
    icon,
    copy
  );

  /* =========================
     DESCRIPTION
  ========================= */

  const description =
    document.createElement("p");

  description.className =
    "detail-description";

  description.textContent =
    app.description;

  /* =========================
     ACTIONS
  ========================= */

  const actions =
    document.createElement("div");

  actions.className =
    "detail-actions";

  const storeLink =
    document.createElement("a");

  storeLink.className =
    "button button-primary";

  storeLink.href =
    app.storeUrl;

  storeLink.target =
    "_blank";

  storeLink.rel =
    "noopener noreferrer";

  storeLink.textContent =
    "Открыть в App Store ↗";

  const back =
    document.createElement("a");

  back.className =
    "button";

  back.href =
    "index.html";

  back.textContent =
    "← Назад";

  actions.append(
    storeLink,
    back
  );

  /* =========================
     META
  ========================= */

  const meta =
    document.createElement("div");

  meta.className =
    "meta-grid";

  const metaItems = [
    [
      "Категория",
      app.category
    ],
    [
      "Статус",
      app.featured
        ? "★ Избранное"
        : "В каталоге"
    ]
  ];

  metaItems.forEach(
    ([labelText, valueText]) => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "meta-item";

      const label =
        document.createElement(
          "span"
        );

      label.className =
        "meta-label";

      label.textContent =
        labelText;

      const value =
        document.createElement(
          "span"
        );

      value.className =
        "meta-value";

      value.textContent =
        valueText;

      item.append(
        label,
        value
      );

      meta.appendChild(item);
    }
  );

  root.append(
    hero,
    description,
    actions,
    meta
  );

  /* =========================
     SCREENSHOTS
  ========================= */

  if (app.screenshots.length) {
    const screenshots =
      document.createElement(
        "div"
      );

    screenshots.className =
      "screenshots";

    app.screenshots.forEach(
      (url, index) => {
        const frame =
          document.createElement(
            "div"
          );

        frame.className =
          "screenshot-frame";

        const image =
          document.createElement(
            "img"
          );

        image.src = url;

        image.alt =
          `${app.name} — скриншот ${
            index + 1
          }`;

        image.loading =
          "lazy";

        image.referrerPolicy =
          "no-referrer";

        image.onerror = () => {
          frame.remove();
        };

        frame.appendChild(image);

        screenshots.appendChild(
          frame
        );
      }
    );

    root.appendChild(
      screenshots
    );
  }
})();