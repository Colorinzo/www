/**
 * APPDROP — Логика каталога, рендер карточек по референсам,
 * автозаполнение из Apple iTunes Search API и Админ-панель
 */

const STORAGE_KEY = 'appdrop_catalog_v1';
const CLOUD_CONFIG_KEY = 'appdrop_cloud_config_v1';
const ADMIN_PIN = '2026'; // Поменяй на свой PIN-код
const ITEMS_PER_PAGE = 6;

// Резервная копия начальной базы (на случай запуска index.html напрямую без локального сервера)
const FALLBACK_DATA = [
  {
    id: 'pushr-app',
    name: 'Pushr',
    tagline: 'Counts your push-ups automatically using facial recognition technology.',
    category: 'Спорт и Здоровье',
    layout: 'split',
    price: 'Бесплатно',
    rating: 4.9,
    developer: 'Pushr Fitness Labs',
    appStoreUrl: 'https://apps.apple.com/us/app/pushr-push-up-counter/id6478849200',
    iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80',
    screenshotUrl: '',
    presetScreen: 'pushr',
    rawImage: false,
    featured: true,
    createdAt: '2026-10-14T10:00:00Z',
    description: 'Минималистичный трекер отжиманий в чисто чёрном OLED-дизайне. Достаточно положить iPhone на пол перед собой — приложение автоматически считает каждое повторение через фронтальную камеру и Face ID, ведёт статистику по дням недели и суммирует глобальный рекорд всех пользователей в мире.',
    highlights: [
      'Автоматический подсчёт отжиманий лицом без касания экрана',
      'Наглядный календарь серии (Streak) по дням недели и статистика за месяц',
      'Глобальный счётчик отжиманий комьюнити со всего мира'
    ]
  },
  {
    id: 'chatgpt-official',
    name: 'ChatGPT',
    tagline: 'Официальный ИИ-ассистент от OpenAI с синхронизацией истории',
    category: 'AI и Нейросети',
    layout: 'mockup',
    price: 'Бесплатно',
    rating: 4.9,
    developer: 'OpenAI',
    appStoreUrl: 'https://apps.apple.com/us/app/chatgpt/id6448311069',
    iconUrl: 'https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?w=256&auto=format&fit=crop&q=80',
    screenshotUrl: '',
    presetScreen: 'chatgpt',
    rawImage: false,
    featured: true,
    createdAt: '2026-10-13T18:30:00Z',
    description: 'Официальный клиент ChatGPT для iOS. Полностью бесплатный базовый доступ, моментальная синхронизация чатов между всеми устройствами, голосовой режим и эталонный тактильный отклик при генерации текста.',
    highlights: [
      'Бесплатное официальное приложение с последними моделями OpenAI',
      'Полный контроль над историей чатов и приватностью данных',
      'Мгновенная синхронизация диалогов между iPhone, iPad и Mac'
    ]
  },
  {
    id: 'apple-games-library',
    name: 'Apple Arcade & Library',
    tagline: 'Единый игровой хаб с достижениями, событиями и коллекцией без рекламы',
    category: 'Игры и Arcade',
    layout: 'mockup',
    price: 'Подписка',
    rating: 4.8,
    developer: 'Apple Inc.',
    appStoreUrl: 'https://apps.apple.com/us/story/id1477058939',
    iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=256&auto=format&fit=crop&q=80',
    screenshotUrl: '',
    presetScreen: 'library',
    rawImage: false,
    featured: false,
    createdAt: '2026-10-12T15:00:00Z',
    description: 'Обновлённая игровая библиотека объединяет твои установленные хиты вроде Stardew Valley и Hello Kitty Island Adventure, карточки свежих игровых ивентов и счётчик выполненных достижений Game Center в одном лаконичном интерфейсе.',
    highlights: [
      'Быстрый запуск недавно скачанных игр в одно касание',
      'Отслеживание игровых событий (Events) и редких ачивок',
      'Полное отсутствие встроенной рекламы и донат-таймеров'
    ]
  },
  {
    id: 'blackmagic-cam',
    name: 'Blackmagic Camera',
    tagline: 'Профессиональные кино-настройки камеры iPhone бесплатно',
    category: 'Дизайн и Фото',
    layout: 'editorial',
    price: 'Бесплатно',
    rating: 4.9,
    developer: 'Blackmagic Design',
    appStoreUrl: 'https://apps.apple.com/us/app/blackmagic-camera/id6449580241',
    iconUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=256&auto=format&fit=crop&q=80',
    screenshotUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
    presetScreen: '',
    rawImage: false,
    featured: false,
    createdAt: '2026-10-11T12:10:00Z',
    description: 'Кинематографический интерфейс от создателей DaVinci Resolve. Позволяет вручную выставлять выдержку, ISO, баланс белого, снимать в Apple ProRes Log и сразу выгружать исходники в облако.',
    highlights: [
      'Полностью бесплатно без подписок и водяных знаков',
      'Ручной контроль затвора, фокуса, зебры и гистограммы',
      'Поддержка записи в Apple Log и ProRes'
    ]
  }
];

let state = {
  apps: [],
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  currentPage: 1,
  isAdminUnlocked: false
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await loadAppsData();
  bindEvents();
  renderAll();
});

// Загрузка данных (Облако JSONBin -> LocalStorage -> data.json -> Fallback)
async function loadAppsData() {
  const cloudCfg = getCloudConfig();
  if (cloudCfg.binId) {
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${cloudCfg.binId}/latest`, {
        headers: cloudCfg.apiKey ? { 'X-Master-Key': cloudCfg.apiKey } : {}
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.record)) {
          state.apps = json.record;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.apps));
          return;
        }
      }
    } catch (e) {
      console.warn('Не удалось загрузить облачную базу, используем локальную:', e);
    }
  }

  const savedLocal = localStorage.getItem(STORAGE_KEY);
  if (savedLocal) {
    try {
      state.apps = JSON.parse(savedLocal);
      return;
    } catch (e) {}
  }

  try {
    const response = await fetch('data.json');
    if (response.ok) {
      state.apps = await response.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.apps));
      return;
    }
  } catch (e) {
    // Если открыто через file:// без локального сервера
  }

  state.apps = FALLBACK_DATA;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.apps));
}

function saveAppsData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.apps));
  renderAll();
  renderAdminPostsList();
}

// ==========================================
// ГЕНЕРАЦИЯ ЭКРАНА IPHONE (ПО РЕФЕРЕНСАМ ИЛИ СКРИНШОТУ)
// ==========================================
function buildIphoneMockupHTML(app) {
  if (app.rawImage && app.screenshotUrl) {
    return `
      <div class="iphone-stage" data-open-id="${app.id}">
        <img src="${escapeHtml(app.screenshotUrl)}" alt="${escapeHtml(app.name)}" style="max-height:420px; border-radius:24px; object-fit:contain;" />
      </div>
    `;
  }

  let screenInner = '';

  if (app.presetScreen === 'chatgpt') {
    screenInner = `
      <div class="screen-preset-chatgpt">
        <div>
          <div class="cg-title">Welcome to<br/>ChatGPT</div>
          <div class="cg-sub">This official app is free, syncs your history across devices, and brings you the latest model improvements from OpenAI.</div>
          <div class="cg-points">
            <div class="cg-point">
              <span class="cg-point-icon">🔭</span>
              <div>
                <div class="cg-point-title">ChatGPT can be inaccurate</div>
                <div class="cg-point-desc">ChatGPT may provide inaccurate information about people, places, or facts.</div>
              </div>
            </div>
            <div class="cg-point">
              <span class="cg-point-icon">🔒</span>
              <div>
                <div class="cg-point-title">Don’t share sensitive info</div>
                <div class="cg-point-desc">Chats may be reviewed by our AI trainers to improve our systems.</div>
              </div>
            </div>
            <div class="cg-point">
              <span class="cg-point-icon">⚙️</span>
              <div>
                <div class="cg-point-title">Control your chat history</div>
                <div class="cg-point-desc">Decide whether new chats on this device will appear in your history.</div>
              </div>
            </div>
          </div>
        </div>
        <div class="cg-btn">Continue</div>
      </div>
    `;
  } else if (app.presetScreen === 'pushr') {
    screenInner = `
      <div class="screen-preset-pushr">
        <div class="pushr-header">
          <span>push</span>
          <span>⚙️</span>
        </div>
        <div class="pushr-box">
          <div class="pushr-big-row">
            <span class="pushr-38">38</span>
            <span class="pushr-label">push-ups<br/>today</span>
          </div>
          <div class="pushr-mini-stats">
            <div><strong>38</strong>this week</div>
            <div><strong>38</strong>this month</div>
            <div><strong>38</strong>so far</div>
          </div>
        </div>
        <div class="pushr-box">
          <div style="display:flex;justify-content:space-between;font-size:0.65rem;font-weight:700;">
            <span>this week</span>
            <span>🔥 1</span>
          </div>
          <div class="pushr-days">
            <span>S</span><span>M</span><span>T</span><span>W</span>
            <span class="pushr-day-active">T</span>
            <span>F</span><span>S</span>
          </div>
        </div>
        <div class="pushr-box">
          <div style="display:flex;justify-content:space-between;font-size:0.62rem;color:#a1a1aa;">
            <span>global push-ups</span>
            <span>🌐</span>
          </div>
          <div class="pushr-global-num">653,466</div>
        </div>
        <div class="pushr-start-btn">start workout</div>
      </div>
    `;
  } else if (app.presetScreen === 'library') {
    screenInner = `
      <div class="screen-preset-library">
        <div class="lib-head">
          <span>Library</span>
          <span class="lib-avatar">👩🏻</span>
        </div>
        <div class="lib-pill lib-pill-red">
          <div><strong>🕹️ Apple Arcade</strong><span>2 Games Added</span></div>
          <b>›</b>
        </div>
        <div class="lib-pill lib-pill-amber">
          <div><strong>📅 Events</strong><span>See What's New</span></div>
          <b>›</b>
        </div>
        <div class="lib-pill lib-pill-blue">
          <div><strong>🏆 Achievements</strong><span>1,984 Completed</span></div>
          <b>›</b>
        </div>
        <div class="lib-subhead">Your Games</div>
        <div class="lib-game-row">
          <div><strong>🐔 Stardew Valley</strong><div style="font-size:0.55rem;color:#8e8e93;">Recently Downloaded</div></div>
          <span class="lib-game-play">Play</span>
        </div>
        <div class="lib-game-row">
          <div><strong>🎀 Hello Kitty Island...</strong><div style="font-size:0.55rem;color:#8e8e93;">Apple Arcade</div></div>
          <span class="lib-game-play">Play</span>
        </div>
      </div>
    `;
  } else if (app.screenshotUrl) {
    screenInner = `<img class="iphone-screen-img" src="${escapeHtml(app.screenshotUrl)}" alt="${escapeHtml(app.name)}" loading="lazy" />`;
  } else {
    screenInner = `
      <div class="screen-preset-chatgpt" style="align-items:center;justify-content:center;text-align:center;">
        <img src="${escapeHtml(app.iconUrl || 'https://placehold.co/128x128/222/fff?text=App')}" style="width:68px;height:68px;border-radius:18px;margin-bottom:12px;" />
        <div class="cg-title">${escapeHtml(app.name)}</div>
        <div class="cg-sub">${escapeHtml(app.tagline)}</div>
        <div class="cg-btn">Get on App Store</div>
      </div>
    `;
  }

  return `
    <div class="iphone-stage" data-open-id="${app.id}" title="Нажми для чтения полного обзора">
      <div class="iphone-frame">
        <div class="iphone-screen">
          <div class="iphone-statusbar">
            <span>9:41</span>
            <div class="dynamic-island"></div>
            <div class="status-icons">▂▄▆ █</div>
          </div>
          <div class="iphone-screen-body">
            ${screenInner}
          </div>
          <div class="iphone-home-indicator"></div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// РЕНДЕР КАРТОЧЕК И СЕТКИ
// ==========================================
function renderCardHTML(app, isFeaturedSlot = false) {
  const iconFallback = 'https://placehold.co/128x128/1f1f24/ffffff?text=iOS';
  const iconSrc = app.iconUrl || iconFallback;

  // Формат 1: Split-витрина (как на референсе Pushr)
  if (app.layout === 'split' && isFeaturedSlot) {
    return `
      <article class="app-card card-split">
        ${buildIphoneMockupHTML(app)}
        <div class="split-right">
          <div class="card-top-bar" style="width:100%;margin-bottom:4px;">
            <span class="category-tag">${escapeHtml(app.category)}</span>
            <span class="rating-pill">★ ${Number(app.rating || 4.9).toFixed(1)}</span>
          </div>
          <img class="app-squircle-icon" src="${escapeHtml(iconSrc)}" alt="${escapeHtml(app.name)}" />
          <h3 class="split-title" data-open-id="${app.id}" style="cursor:pointer;">${escapeHtml(app.name)}</h3>
          <p class="split-pitch">${escapeHtml(app.tagline)}</p>
          <p class="card-excerpt">${escapeHtml(app.description)}</p>
          <div class="card-actions-row" style="width:100%;">
            <a href="${escapeHtml(app.appStoreUrl)}" target="_blank" rel="noopener" class="appstore-btn">
              <span> App Store</span>
              <span style="opacity:0.65;font-weight:500;">· ${escapeHtml(app.price || 'Бесплатно')}</span>
            </a>
            <button class="qr-btn" data-open-id="${app.id}" title="Открыть QR-код и обзор">QR / Обзор</button>
          </div>
        </div>
      </article>
    `;
  }

  // Формат 2 и 3: Карточка с мокапом (ChatGPT / Library) или Редакционная карточка
  const cardClass = isFeaturedSlot ? 'app-card card-mockup' : 'app-card card-editorial';
  return `
    <article class="${cardClass}" style="padding:24px;">
      <div>
        <div class="card-top-bar">
          <span class="category-tag">${escapeHtml(app.category)}</span>
          <span class="rating-pill">★ ${Number(app.rating || 4.9).toFixed(1)}</span>
        </div>
        ${buildIphoneMockupHTML(app)}
        <div class="card-body">
          <div class="card-app-header">
            <img class="card-mini-icon" src="${escapeHtml(iconSrc)}" alt="${escapeHtml(app.name)}" />
            <div>
              <h3 class="card-title" data-open-id="${app.id}">${escapeHtml(app.name)}</h3>
              <div class="card-tagline">${escapeHtml(app.developer || 'App Store')}</div>
            </div>
          </div>
          <p class="card-excerpt">${escapeHtml(app.tagline)} — ${escapeHtml(app.description)}</p>
        </div>
      </div>

      <div class="card-actions-row">
        <a href="${escapeHtml(app.appStoreUrl)}" target="_blank" rel="noopener" class="appstore-btn">
          <span> Скачать</span>
          <span style="opacity:0.65;font-weight:500;">· ${escapeHtml(app.price || 'Free')}</span>
        </a>
        <button class="details-btn" data-open-id="${app.id}">Обзор и QR</button>
      </div>
    </article>
  `;
}

function getFilteredApps() {
  return state.apps
    .filter(app => {
      const matchesCat = state.activeCategory === 'all' || app.category === state.activeCategory;
      const q = state.searchQuery.trim().toLowerCase();
      const matchesQuery = !q ||
        app.name.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    })
    .sort((a, b) => {
      if (state.sortBy === 'rating') {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
}

function renderAll() {
  const filtered = getFilteredApps();
  document.getElementById('totalAppsCounter').textContent = `${filtered.length} приложений в базе`;

  const featuredSection = document.getElementById('featuredSection');
  const featuredGrid = document.getElementById('featuredGrid');
  const feedGrid = document.getElementById('feedGrid');

  // Показываем верхний Bento-блок "Выбор редакции", если не включен текстовый поиск
  const featuredApps = filtered.filter(a => a.featured).slice(0, 2);

  if (featuredApps.length > 0 && state.currentPage === 1 && !state.searchQuery) {
    featuredSection.classList.remove('hidden');
    featuredGrid.innerHTML = featuredApps.map(app => renderCardHTML(app, true)).join('');
  } else {
    featuredSection.classList.add('hidden');
  }

  // Пагинация основной ленты (как на Rozetked)
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  if (state.currentPage > totalPages) state.currentPage = 1;

  const visibleItems = filtered.slice(0, state.currentPage * ITEMS_PER_PAGE);
  feedGrid.innerHTML = visibleItems.map(app => renderCardHTML(app, false)).join('');

  // Кнопка "Показать ещё" и номера страниц
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  loadMoreBtn.style.display = visibleItems.length < filtered.length ? 'inline-block' : 'none';

  const pageNumbers = document.getElementById('pageNumbers');
  pageNumbers.innerHTML = '';
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `page-num-btn ${i === state.currentPage ? 'active' : ''}`;
      btn.textContent = i;
      btn.addEventListener('click', () => {
        state.currentPage = i;
        renderAll();
        window.scrollTo({ top: 320, behavior: 'smooth' });
      });
      pageNumbers.appendChild(btn);
    }
  }
}

// ==========================================
// МОДАЛЬНОЕ ОКНО: ПОЛНЫЙ ОБЗОР + QR-КОД НА APP STORE
// ==========================================
function openAppDetailModal(appId) {
  const app = state.apps.find(a => a.id === appId);
  if (!app) return;

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(app.appStoreUrl)}`;
  const highlightsHTML = Array.isArray(app.highlights) && app.highlights.length
    ? `
      <div class="detail-highlights">
        <strong style="font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-secondary);">Ключевые фишки приложения</strong>
        ${app.highlights.map(h => `<div class="highlight-item"><span>✦</span><span>${escapeHtml(h)}</span></div>`).join('')}
      </div>
    `
    : '';

  const content = document.getElementById('appDetailContent');
  content.innerHTML = `
    <div class="detail-header">
      <img class="app-squircle-icon" src="${escapeHtml(app.iconUrl || 'https://placehold.co/128x128/222/fff?text=iOS')}" alt="${escapeHtml(app.name)}" />
      <div>
        <span class="category-tag">${escapeHtml(app.category)}</span>
        <h2 style="font-size:1.8rem;font-weight:800;margin-top:6px;">${escapeHtml(app.name)}</h2>
        <p style="color:var(--text-secondary);font-size:0.9rem;">${escapeHtml(app.developer || 'App Store')} · ★ ${Number(app.rating || 4.9).toFixed(1)} · ${escapeHtml(app.price)}</p>
      </div>
    </div>

    <div class="detail-grid">
      <div>
        <p style="font-size:1.05rem;font-weight:700;margin-bottom:10px;">${escapeHtml(app.tagline)}</p>
        <p style="color:var(--text-secondary);white-space:pre-line;line-height:1.65;">${escapeHtml(app.description)}</p>
        ${highlightsHTML}
        <div style="margin-top:20px;display:flex;gap:12px;">
          <a href="${escapeHtml(app.appStoreUrl)}" target="_blank" rel="noopener" class="appstore-btn">
             Открыть в App Store (${escapeHtml(app.price)})
          </a>
        </div>
      </div>

      <div class="qr-card-box">
        <img src="${qrApiUrl}" alt="QR-код для скачивания" />
        <div style="font-size:0.82rem;font-weight:700;">Скачать с iPhone</div>
        <p style="font-size:0.74rem;color:var(--text-secondary);margin-top:4px;">Наведи камеру айфона, чтобы сразу открыть страницу в App Store</p>
      </div>
    </div>
  `;

  document.getElementById('appDetailModal').classList.add('open');
}

// ==========================================
// УМНЫЙ ИМПОРТ ИЗ APP STORE (ITUNES SEARCH API)
// ==========================================
async function searchItunesAppStore() {
  const rawQuery = document.getElementById('itunesQueryInput').value.trim();
  const country = document.getElementById('itunesCountrySelect').value;
  const resultsBox = document.getElementById('itunesResultsList');

  if (!rawQuery) return;
  resultsBox.classList.remove('hidden');
  resultsBox.innerHTML = '<div style="font-size:0.85rem;color:var(--text-secondary);">Ищем в базе Apple App Store...</div>';

  try {
    // Проверяем, вставил ли админ прямую ссылку вида apps.apple.com/.../id123456789
    const idMatch = rawQuery.match(/id(\d{6,15})/);
    let endpoint = '';
    if (idMatch) {
      endpoint = `https://itunes.apple.com/lookup?id=${idMatch[1]}&country=${country}`;
    } else {
      endpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(rawQuery)}&country=${country}&entity=software&limit=4`;
    }

    const res = await fetch(endpoint);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      resultsBox.innerHTML = '<div style="font-size:0.85rem;color:#f87171;">Ничего не найдено. Попробуй переключить регион (US / RU) или ввести точное название.</div>';
      return;
    }

    resultsBox.innerHTML = data.results.map((item, idx) => `
      <div class="itunes-item" data-itunes-idx="${idx}">
        <img src="${escapeHtml(item.artworkUrl100)}" alt="" />
        <div style="overflow:hidden;">
          <div style="font-weight:700;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(item.trackName)}</div>
          <div style="font-size:0.74rem;color:var(--text-secondary);">${escapeHtml(item. primaryGenreName || '')} · ★ ${Number(item.averageUserRating || 4.8).toFixed(1)}</div>
        </div>
      </div>
    `).join('');

    resultsBox.querySelectorAll('.itunes-item').forEach(el => {
      el.addEventListener('click', () => {
        const picked = data.results[Number(el.dataset.itunesIdx)];
        fillFormFromItunes(picked);
        resultsBox.classList.add('hidden');
      });
    });
  } catch (err) {
    resultsBox.innerHTML = `<div style="font-size:0.85rem;color:#f87171;">Ошибка запроса к iTunes API: ${escapeHtml(err.message)}</div>`;
  }
}

function fillFormFromItunes(item) {
  document.getElementById('appNameInput').value = item.trackName || '';
  document.getElementById('appStoreUrlInput').value = item.trackViewUrl || '';
  document.getElementById('appIconUrlInput').value = (item.artworkUrl512 || item.artworkUrl100 || '').replace('100x100bb', '512x512bb');
  document.getElementById('appScreenshotUrlInput').value = (item.screenshotUrls && item.screenshotUrls[0]) ? item.screenshotUrls[0] : '';
  document.getElementById('appPriceInput').value = item.formattedPrice === 'Free' ? 'Бесплатно' : (item.formattedPrice || 'Бесплатно');
  document.getElementById('appRatingInput').value = item.averageUserRating ? Number(item.averageUserRating).toFixed(1) : '4.9';
  document.getElementById('appDeveloperInput').value = item.artistName || '';

  if (item.description && !document.getElementById('appDescriptionInput').value) {
    const firstParagraph = item.description.split('\n').filter(Boolean).slice(0, 2).join(' ');
    document.getElementById('appDescriptionInput').value = firstParagraph.slice(0, 360);
  }
  if (!document.getElementById('appTaglineInput').value) {
    document.getElementById('appTaglineInput').value = `${item.primaryGenreName || 'iOS'} приложение от ${item.artistName || 'разработчика'}`;
  }
}

// ==========================================
// УПРАВЛЕНИЕ ПОСТАМИ В АДМИНКЕ
// ==========================================
function renderAdminPostsList() {
  const listEl = document.getElementById('adminPostsList');
  document.getElementById('adminPostsCount').textContent = state.apps.length;

  listEl.innerHTML = state.apps.map(app => `
    <div class="admin-post-row">
      <div class="admin-post-info">
        <img src="${escapeHtml(app.iconUrl || 'https://placehold.co/80x80/222/fff?text=App')}" alt="" />
        <div>
          <div style="font-weight:800;font-size:0.95rem;">${escapeHtml(app.name)} ${app.featured ? '⭐' : ''}</div>
          <div style="font-size:0.78rem;color:var(--text-secondary);">${escapeHtml(app.category)} · Формат: ${escapeHtml(app.layout)}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="secondary-btn" data-edit-id="${app.id}">Редактировать</button>
        <button class="ghost-btn" data-delete-id="${app.id}" style="color:#f87171;">Удалить</button>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', () => editPostInAdmin(btn.dataset.editId));
  });

  listEl.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Удалить эту публикацию?')) {
        state.apps = state.apps.filter(a => a.id !== btn.dataset.deleteId);
        saveAppsData();
      }
    });
  });
}

function editPostInAdmin(id) {
  const app = state.apps.find(a => a.id === id);
  if (!app) return;

  document.getElementById('postIdInput').value = app.id;
  document.getElementById('appNameInput').value = app.name;
  document.getElementById('appTaglineInput').value = app.tagline;
  document.getElementById('appCategoryInput').value = app.category;
  document.getElementById('appLayoutInput').value = app.layout || 'editorial';
  document.getElementById('appPriceInput').value = app.price || 'Бесплатно';
  document.getElementById('appStoreUrlInput').value = app.appStoreUrl;
  document.getElementById('appIconUrlInput').value = app.iconUrl || '';
  document.getElementById('appScreenshotUrlInput').value = app.screenshotUrl || '';
  document.getElementById('appRatingInput').value = app.rating || 4.9;
  document.getElementById('appDeveloperInput').value = app.developer || '';
  document.getElementById('appDescriptionInput').value = app.description || '';
  document.getElementById('appHighlightsInput').value = (app.highlights || []).join('\n');
  document.getElementById('appFeaturedInput').checked = Boolean(app.featured);
  document.getElementById('appRawImageInput').checked = Boolean(app.rawImage);

  switchAdminTab('editor');
  document.getElementById('savePostBtn').textContent = 'Сохранить изменения';
}

function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });
  document.querySelectorAll('.admin-tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `tab-${tabName}`);
  });
}

// Облачная синхронизация JSONBin
function getCloudConfig() {
  try {
    return JSON.parse(localStorage.getItem(CLOUD_CONFIG_KEY)) || { binId: '', apiKey: '' };
  } catch {
    return { binId: '', apiKey: '' };
  }
}

async function syncToCloud() {
  const binId = document.getElementById('jsonBinIdInput').value.trim();
  const apiKey = document.getElementById('jsonBinKeyInput').value.trim();
  const statusEl = document.getElementById('cloudSyncStatus');

  localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify({ binId, apiKey }));
  if (!binId || !apiKey) {
    statusEl.textContent = 'Укажите Bin ID и X-Master-Key для облачной выгрузки.';
    return;
  }

  statusEl.textContent = 'Синхронизация с облаком...';
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
      },
      body: JSON.stringify(state.apps)
    });
    if (res.ok) {
      statusEl.style.color = '#30d158';
      statusEl.textContent = '✓ База успешно опубликована в облако! Все пользователи видят актуальную версию.';
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (e) {
    statusEl.style.color = '#f87171';
    statusEl.textContent = `Ошибка облачной синхронизации: ${e.message}`;
  }
}

// ==========================================
// СОБЫТИЯ И ПЕРЕКЛЮЧАТЕЛИ
// ==========================================
function bindEvents() {
  // Переключение категорий
  document.getElementById('categoryPills').addEventListener('click', e => {
    const btn = e.target.closest('.cat-pill');
    if (!btn) return;
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    state.activeCategory = btn.dataset.category;
    state.currentPage = 1;
    renderAll();
  });

  // Сброс по клику на логотип
  document.getElementById('resetFilterLogo').addEventListener('click', e => {
    e.preventDefault();
    state.activeCategory = 'all';
    state.searchQuery = '';
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.category === 'all'));
    renderAll();
  });

  // Поиск
  document.getElementById('searchInput').addEventListener('input', e => {
    state.searchQuery = e.target.value;
    state.currentPage = 1;
    renderAll();
  });

  // Сортировка
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.sortBy = btn.dataset.sort;
      renderAll();
    });
  });

  // Загрузить ещё
  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    state.currentPage += 1;
    renderAll();
  });

  // Делегирование клика на открытие обзора приложения
  document.body.addEventListener('click', e => {
    const trigger = e.target.closest('[data-open-id]');
    if (trigger) {
      openAppDetailModal(trigger.dataset.openId);
    }
  });

  document.getElementById('closeDetailModal').addEventListener('click', () => {
    document.getElementById('appDetailModal').classList.remove('open');
  });

  // Открытие админки (кнопка или Shift + A)
  document.getElementById('openAdminBtn').addEventListener('click', openAdminModal);
  document.addEventListener('keydown', e => {
    if (e.shiftKey && (e.key === 'A' || e.key === 'Ф') && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openAdminModal();
    }
  });

  document.getElementById('closeAdminModal').addEventListener('click', () => {
    document.getElementById('adminModal').classList.remove('open');
  });

  // Вход по PIN
  document.getElementById('adminLoginBtn').addEventListener('click', checkAdminPin);
  document.getElementById('adminPinInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') checkAdminPin();
  });

  // Вкладки админки
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => switchAdminTab(tab.dataset.tab));
  });

  // Автопоиск в App Store
  document.getElementById('itunesSearchBtn').addEventListener('click', searchItunesAppStore);
  document.getElementById('itunesQueryInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchItunesAppStore();
    }
  });

  // Сохранение / публикация нового приложения
  document.getElementById('appPostForm').addEventListener('submit', async e => {
    e.preventDefault();
    const existingId = document.getElementById('postIdInput').value;
    const highlightsRaw = document.getElementById('appHighlightsInput').value;

    const newApp = {
      id: existingId || 'app-' + Date.now(),
      name: document.getElementById('appNameInput').value.trim(),
      tagline: document.getElementById('appTaglineInput').value.trim(),
      category: document.getElementById('appCategoryInput').value,
      layout: document.getElementById('appLayoutInput').value,
      price: document.getElementById('appPriceInput').value.trim() || 'Бесплатно',
      appStoreUrl: document.getElementById('appStoreUrlInput').value.trim(),
      iconUrl: document.getElementById('appIconUrlInput').value.trim(),
      screenshotUrl: document.getElementById('appScreenshotUrlInput').value.trim(),
      rating: parseFloat(document.getElementById('appRatingInput').value) || 4.9,
      developer: document.getElementById('appDeveloperInput').value.trim() || 'App Store',
      description: document.getElementById('appDescriptionInput').value.trim(),
      highlights: highlightsRaw.split('\n').map(s => s.trim()).filter(Boolean),
      featured: document.getElementById('appFeaturedInput').checked,
      rawImage: document.getElementById('appRawImageInput').checked,
      presetScreen: '',
      createdAt: new Date().toISOString()
    };

    if (existingId) {
      const idx = state.apps.findIndex(a => a.id === existingId);
      if (idx !== -1) {
        newApp.presetScreen = state.apps[idx].presetScreen || '';
        state.apps[idx] = newApp;
      }
    } else {
      state.apps.unshift(newApp);
    }

    saveAppsData();

    // Если настроено облако JSONBin — автоматически пушим туда
    const cfg = getCloudConfig();
    if (cfg.binId && cfg.apiKey) {
      await syncToCloud();
    }

    resetAdminForm();
    alert('Приложение успешно опубликовано!');
  });

  document.getElementById('resetFormBtn').addEventListener('click', resetAdminForm);

  // Экспорт JSON
  document.getElementById('downloadJsonBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state.apps, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('copyJsonBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(state.apps, null, 2));
    alert('JSON-код базы скопирован в буфер обмена!');
  });

  document.getElementById('resetDefaultDataBtn').addEventListener('click', () => {
    if (confirm('Сбросить все локальные изменения к исходным референсам?')) {
      state.apps = [...FALLBACK_DATA];
      saveAppsData();
    }
  });

  document.getElementById('saveCloudConfigBtn').addEventListener('click', syncToCloud);
}

function openAdminModal() {
  const cfg = getCloudConfig();
  document.getElementById('jsonBinIdInput').value = cfg.binId || '';
  document.getElementById('jsonBinKeyInput').value = cfg.apiKey || '';
  renderAdminPostsList();
  document.getElementById('adminModal').classList.add('open');
}

function checkAdminPin() {
  const val = document.getElementById('adminPinInput').value.trim();
  if (val === ADMIN_PIN) {
    state.isAdminUnlocked = true;
    document.getElementById('adminAuthView').classList.add('hidden');
    document.getElementById('adminPanelView').classList.remove('hidden');
    document.getElementById('adminAuthError').textContent = '';
  } else {
    document.getElementById('adminAuthError').textContent = 'Неверный PIN-код (по умолчанию: 2026)';
  }
}

function resetAdminForm() {
  document.getElementById('appPostForm').reset();
  document.getElementById('postIdInput').value = '';
  document.getElementById('savePostBtn').textContent = 'Опубликовать на сайте';
}

// Тема (Dark OLED / Studio Light)
function initTheme() {
  const saved = localStorage.getItem('appdrop_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('appdrop_theme', next);
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
