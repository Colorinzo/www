(() => {
  "use strict";

  const DATA = window.VITRINA_DATA;
  const STORAGE_KEY = "vitrina.apps.v2";
  const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
  const MAX_APPS = 500;
  const MAX_SCREENSHOTS = 8;
  const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  const CATEGORY_IDS = new Set(DATA.categories.map((item) => item.id));

  function text(value, max) {
    return typeof value === "string" && value.trim().length > 0 && value.length <= max;
  }

  function isSafeUrl(value, { allowHash = false } = {}) {
    if (allowHash && value === "#") return true;
    if (!text(value, 1000)) return false;
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }

  function normalizeScreenshots(value) {
    if (!Array.isArray(value)) return null;
    if (value.length > MAX_SCREENSHOTS) return null;
    const result = [];
    for (const item of value) {
      if (!isSafeUrl(item)) return null;
      result.push(item.trim());
    }
    return [...new Set(result)];
  }

  function validateApp(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return { ok: false, error: "Запись приложения должна быть объектом." };
    }

    const app = {
      id: String(input.id ?? "").trim(),
      name: String(input.name ?? "").trim(),
      category: String(input.category ?? "").trim(),
      tagline: String(input.tagline ?? "").trim(),
      description: String(input.description ?? "").trim(),
      iconUrl: String(input.iconUrl ?? "").trim(),
      storeUrl: String(input.storeUrl ?? "#").trim() || "#",
      screenshots: input.screenshots,
      featured: input.featured === true,
      releaseDate: String(input.releaseDate ?? "").trim()
    };

    if (!ID_RE.test(app.id) || app.id.length > 80) return { ok: false, error: "Некорректный id." };
    if (!text(app.name, 80)) return { ok: false, error: `Некорректное название у "${app.id}".` };
    if (!CATEGORY_IDS.has(app.category)) return { ok: false, error: `Некорректная категория у "${app.id}".` };
    if (!text(app.tagline, 140)) return { ok: false, error: `Некорректный tagline у "${app.id}".` };
    if (!text(app.description, 3000)) return { ok: false, error: `Некорректное описание у "${app.id}".` };
    if (!isSafeUrl(app.iconUrl)) return { ok: false, error: `Некорректный URL иконки у "${app.id}".` };
    if (!isSafeUrl(app.storeUrl, { allowHash: true })) return { ok: false, error: `Некорректный URL магазина у "${app.id}".` };

    const screenshots = normalizeScreenshots(app.screenshots);
    if (!screenshots) return { ok: false, error: `Некорректные скриншоты у "${app.id}".` };
    app.screenshots = screenshots;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(app.releaseDate) || Number.isNaN(Date.parse(`${app.releaseDate}T00:00:00`))) {
      return { ok: false, error: `Некорректная дата у "${app.id}".` };
    }

    return { ok: true, app };
  }

  function validateCollection(value) {
    if (!Array.isArray(value)) return { ok: false, error: "JSON должен содержать массив приложений." };
    if (value.length > MAX_APPS) return { ok: false, error: `Слишком много приложений. Максимум: ${MAX_APPS}.` };

    const ids = new Set();
    const apps = [];
    let featuredCount = 0;

    for (const item of value) {
      const result = validateApp(item);
      if (!result.ok) return result;
      if (ids.has(result.app.id)) return { ok: false, error: `Дубликат id: ${result.app.id}.` };
      ids.add(result.app.id);
      if (result.app.featured) featuredCount += 1;
      apps.push(result.app);
    }

    if (featuredCount > 1) return { ok: false, error: "Избранным может быть только одно приложение." };
    return { ok: true, apps };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadApps() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DATA.seedApps);

      const parsed = JSON.parse(raw);
      const result = validateCollection(parsed);
      if (!result.ok) {
        console.warn("Vitrina: повреждённые локальные данные, используются seed-данные.", result.error);
        return clone(DATA.seedApps);
      }
      return result.apps;
    } catch (error) {
      console.warn("Vitrina: не удалось загрузить данные.", error);
      return clone(DATA.seedApps);
    }
  }

  function saveApps(apps) {
    const result = validateCollection(apps);
    if (!result.ok) throw new Error(result.error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.apps));
    return result.apps;
  }

  function getApps() {
    return loadApps();
  }

  function getAppById(id) {
    return getApps().find((app) => app.id === id) || null;
  }

  function createApp(app) {
    const apps = getApps();
    const result = validateApp(app);
    if (!result.ok) throw new Error(result.error);
    if (apps.some((item) => item.id === result.app.id)) throw new Error("Приложение с таким id уже существует.");

    if (result.app.featured) {
      for (const item of apps) item.featured = false;
    }
    apps.push(result.app);
    saveApps(apps);
    return result.app;
  }

  function updateApp(id, patch) {
    const apps = getApps();
    const index = apps.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Приложение не найдено.");

    const result = validateApp({ ...apps[index], ...patch, id });
    if (!result.ok) throw new Error(result.error);

    if (result.app.featured) {
      for (const item of apps) item.featured = false;
    }
    apps[index] = result.app;
    saveApps(apps);
    return result.app;
  }

  function removeApp(id) {
    const apps = getApps().filter((app) => app.id !== id);
    if (apps.length === getApps().length) throw new Error("Приложение не найдено.");
    saveApps(apps);
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "app";
  }

  function makeUniqueId(name, currentId = "") {
    const base = slugify(name);
    const ids = new Set(getApps().map((app) => app.id).filter((id) => id !== currentId));
    let candidate = base;
    let number = 2;
    while (ids.has(candidate)) candidate = `${base}-${number++}`;
    return candidate;
  }

  function exportApps() {
    const apps = getApps();
    const blob = new Blob([JSON.stringify(apps, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vitrina-apps-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importAppsFromFile(file) {
    if (!(file instanceof File)) throw new Error("Файл не выбран.");
    if (file.size > MAX_IMPORT_BYTES) throw new Error("Файл слишком большой. Максимум 2 MB.");

    const raw = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Файл не является корректным JSON.");
    }

    const result = validateCollection(parsed);
    if (!result.ok) throw new Error(result.error);
    saveApps(result.apps);
    return result.apps;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function iconMarkup(app, className = "app-icon") {
    const src = isSafeUrl(app.iconUrl) ? app.iconUrl : "";
    const fallback = escapeHtml((app.name || "?").slice(0, 1).toUpperCase());
    if (!src) return `<div class="${className} icon-fallback" aria-hidden="true">${fallback}</div>`;
    return `<img class="${className}" src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" data-fallback="${fallback}">`;
  }

  function categoryLabel(id) {
    return DATA.categories.find((item) => item.id === id)?.label || id;
  }

  window.VitrinaStore = {
    DATA,
    STORAGE_KEY,
    MAX_IMPORT_BYTES,
    getApps,
    getAppById,
    createApp,
    updateApp,
    removeApp,
    saveApps,
    validateApp,
    validateCollection,
    makeUniqueId,
    exportApps,
    importAppsFromFile,
    escapeHtml,
    iconMarkup,
    categoryLabel,
    isSafeUrl
  };
})();
