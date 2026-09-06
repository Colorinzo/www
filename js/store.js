/**
 * store.js
 * -----------------------------------------------------------------------
 * Единый слой данных для всех страниц сайта.
 *
 * Приложения из apps-data.js (SEED_APPS) — это то, что видят ВСЕ посетители,
 * потому что этот файл лежит на сервере. Всё, что вы добавляете или меняете
 * через админку, сохраняется локально в localStorage ЭТОГО браузера поверх
 * SEED_APPS — это удобно для черновиков, но не публикует изменения для всех.
 * Чтобы опубликовать их — см. инструкцию в шапке apps-data.js и в README.md.
 */

const STORAGE_KEY = 'vitrina_overrides_v1';

// ---- работа с localStorage -------------------------------------------

function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { added: [], edited: {}, deleted: [] };
    const parsed = JSON.parse(raw);
    return {
      added: parsed.added || [],
      edited: parsed.edited || {},
      deleted: parsed.deleted || [],
    };
  } catch (e) {
    console.warn('Не удалось прочитать сохранённые изменения:', e);
    return { added: [], edited: {}, deleted: [] };
  }
}

function saveOverrides(overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

// ---- CRUD поверх SEED_APPS ---------------------------------------------

function getAllApps() {
  const overrides = loadOverrides();
  const fromSeed = SEED_APPS
    .filter((app) => !overrides.deleted.includes(app.id))
    .map((app) => (overrides.edited[app.id] ? { ...app, ...overrides.edited[app.id] } : app));
  const all = [...fromSeed, ...overrides.added];
  return all.sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''));
}

function getAppById(id) {
  return getAllApps().find((a) => a.id === id) || null;
}

function isSeedApp(id) {
  return SEED_APPS.some((a) => a.id === id);
}

function upsertApp(appData) {
  const overrides = loadOverrides();
  if (isSeedApp(appData.id)) {
    overrides.edited[appData.id] = appData;
  } else {
    const idx = overrides.added.findIndex((a) => a.id === appData.id);
    if (idx >= 0) overrides.added[idx] = appData;
    else overrides.added.push(appData);
  }
  saveOverrides(overrides);
}

function deleteApp(id) {
  const overrides = loadOverrides();
  if (isSeedApp(id)) {
    if (!overrides.deleted.includes(id)) overrides.deleted.push(id);
    delete overrides.edited[id];
  } else {
    overrides.added = overrides.added.filter((a) => a.id !== id);
  }
  saveOverrides(overrides);
}

function slugify(name) {
  const base = (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\wа-яё\s-]/gi, '')
    .replace(/\s+/g, '-');
  return base || `app-${Date.now()}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// ---- экспорт / импорт для переноса данных ------------------------------

function exportAppsAsJson() {
  return JSON.stringify(getAllApps(), null, 2);
}

function importAppsFromJson(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) throw new Error('Ожидался список приложений (массив)');
  saveOverrides({
    added: parsed,
    edited: {},
    deleted: SEED_APPS.map((a) => a.id),
  });
}

// ---- категории -----------------------------------------------------------

function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || { id: 'other', label: 'Другое', color: '#97969C' };
}

// ---- общая разметка, используемая на нескольких страницах ---------------

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (s) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]
  ));
}

function hashHue(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

function iconMarkup(app) {
  if (app.icon) {
    return `<img src="${escapeHtml(app.icon)}" alt="" loading="lazy">`;
  }
  const letter = (app.name || '?').trim().charAt(0).toUpperCase();
  const hue = hashHue(app.name || app.id || 'app');
  return `<span class="icon-fallback" style="--hue:${hue}">${escapeHtml(letter)}</span>`;
}

function cardMarkup(app) {
  const cat = getCategory(app.category);
  return `
    <a class="app-card" href="app.html?id=${encodeURIComponent(app.id)}" data-cat="${app.category}" data-name="${escapeHtml((app.name || '').toLowerCase())}">
      <div class="app-card-icon">${iconMarkup(app)}</div>
      <div class="app-card-body">
        <h3>${escapeHtml(app.name)}</h3>
        <p>${escapeHtml(app.tagline)}</p>
        <span class="tag" style="--tag-color:${cat.color}">${escapeHtml(cat.label)}</span>
      </div>
    </a>`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function chevronSvg() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>';
}

function cardMarkup(app) {
  const cat = getCategory(app.category);
  return `
    <a class="app-card" href="app.html?id=${encodeURIComponent(app.id)}" data-cat="${app.category}" data-name="${escapeHtml((app.name || '').toLowerCase())}">
      <div class="app-card-icon">${iconMarkup(app)}</div>
      <div class="app-card-body">
        <h3>${escapeHtml(app.name)}</h3>
        <p>${escapeHtml(app.tagline)}</p>
        <span class="tag">${escapeHtml(cat.label)}</span>
      </div>
      <span class="chevron" aria-hidden="true">${chevronSvg()}</span>
    </a>`;
}

function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || { id: 'other', label: 'Другое' };
}


