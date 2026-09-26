(() => {
  const KEY = "vitrina.apps.v3";

  const MAX_IMPORT_BYTES = 1024 * 1024;
  const MAX_APPS = 250;

  const protocols = new Set([
    "https:"
  ]);

  function validUrl(value) {
    try {
      const url = new URL(String(value));

      return protocols.has(url.protocol);
    } catch {
      return false;
    }
  }

  function clean(value, max = 500) {
    return typeof value === "string"
      ? value.trim().slice(0, max)
      : "";
  }

  function slugify(value) {
    return clean(value, 100)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      || "app";
  }

  function uniqueSlug(base, used) {
    let slug = base;
    let number = 2;

    while (used.has(slug)) {
      slug = `${base}-${number++}`;
    }

    return slug;
  }

  function normalizeApp(
    raw,
    index = 0,
    usedIds = new Set(),
    usedSlugs = new Set()
  ) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const name = clean(raw.name, 100);
    const description = clean(
      raw.description,
      500
    );
    const category = clean(
      raw.category,
      50
    );
    const icon = clean(
      raw.icon,
      1000
    );
    const storeUrl = clean(
      raw.storeUrl,
      1000
    );

    if (
      !name ||
      !description ||
      !category ||
      !validUrl(icon) ||
      !validUrl(storeUrl)
    ) {
      return null;
    }

    const id =
      clean(raw.id, 100) ||
      `${slugify(name)}-${index + 1}`;

    const base =
      clean(raw.slug, 100) ||
      slugify(name);

    const slug = usedSlugs.has(base)
      ? uniqueSlug(base, usedSlugs)
      : base;

    if (usedIds.has(id)) {
      return null;
    }

    const screenshots =
      Array.isArray(raw.screenshots)
        ? raw.screenshots
            .filter(validUrl)
            .slice(0, 8)
        : [];

    return {
      id,
      name,
      slug,
      description,
      category,
      icon,
      storeUrl,
      screenshots,
      featured: raw.featured === true
    };
  }

  function normalizeApps(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    const result = [];

    const ids = new Set();
    const slugs = new Set();

    const limit =
      Math.min(
        value.length,
        MAX_APPS
      );

    for (let i = 0; i < limit; i++) {
      const app = normalizeApp(
        value[i],
        i,
        ids,
        slugs
      );

      if (!app) {
        continue;
      }

      ids.add(app.id);
      slugs.add(app.slug);

      result.push(app);
    }

    return result;
  }

  function load() {
    try {
      const saved =
        localStorage.getItem(KEY);

      if (saved) {
        const parsed =
          JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return normalizeApps(parsed);
        }
      }
    } catch {
      // Повреждённые данные
      // игнорируются.
    }

    return normalizeApps(
      window.DEFAULT_APPS || []
    );
  }

  function save(apps) {
    const cleanApps =
      normalizeApps(apps);

    localStorage.setItem(
      KEY,
      JSON.stringify(cleanApps)
    );

    return cleanApps;
  }

  function reset() {
    localStorage.removeItem(KEY);

    return normalizeApps(
      window.DEFAULT_APPS || []
    );
  }

  window.VitrinaStore = {
    KEY,
    MAX_IMPORT_BYTES,

    validUrl,
    normalizeApp,
    normalizeApps,

    load,
    save,
    reset
  };
})();