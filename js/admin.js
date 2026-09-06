/**
 * ⚠️ ADMIN_PASSWORD хранится прямо в коде страницы и виден в исходном тексте
 * файла любому, кто откроет его в браузере. Это не настоящая защита — она
 * лишь не пускает случайных посетителей сайта в панель. Если сайт публичный
 * и важно, чтобы админку не открыл кто попало, стоит рано или поздно
 * перенести проверку пароля на сервер. Поменяйте пароль на свой ниже.
 */
const ADMIN_PASSWORD = 'vitrina2026';
const SESSION_KEY = 'vitrina_admin_session';

document.addEventListener('DOMContentLoaded', () => {
  populateCategorySelect();

  if (sessionStorage.getItem(SESSION_KEY) === 'ok') showPanel();

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('appForm').addEventListener('submit', handleSubmit);
  document.getElementById('cancelEditBtn').addEventListener('click', resetForm);
  document.getElementById('exportBtn').addEventListener('click', handleExport);
  document.getElementById('importInput').addEventListener('change', handleImport);
});

function handleLogin(e) {
  e.preventDefault();
  const value = document.getElementById('passwordInput').value;
  if (value === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'ok');
    showPanel();
  } else {
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = 'Неверный пароль';
    errorEl.hidden = false;
  }
}

function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
}

function showPanel() {
  document.getElementById('loginGate').hidden = true;
  document.getElementById('adminPanel').hidden = false;
  renderAdminList();
}

function populateCategorySelect() {
  document.getElementById('fieldCategory').innerHTML = CATEGORIES
    .map((c) => `<option value="${c.id}">${escapeHtml(c.label)}</option>`)
    .join('');
}

function handleSubmit(e) {
  e.preventDefault();
  const existingId = document.getElementById('appId').value;
  const name = document.getElementById('fieldName').value.trim();
  const existing = existingId ? getAppById(existingId) : null;

  const app = {
    id: existingId || slugify(name),
    name,
    developer: document.getElementById('fieldDeveloper').value.trim(),
    category: document.getElementById('fieldCategory').value,
    tagline: document.getElementById('fieldTagline').value.trim(),
    description: document.getElementById('fieldDescription').value.trim(),
    storeUrl: document.getElementById('fieldUrl').value.trim(),
    icon: document.getElementById('fieldIcon').value.trim(),
    screenshots: document
      .getElementById('fieldScreens')
      .value.split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    featured: document.getElementById('fieldFeatured').checked,
    addedAt: existing ? existing.addedAt : todayIso(),
  };

  upsertApp(app);
  resetForm();
  renderAdminList();
  showStatus(existingId ? 'Изменения сохранены.' : 'Приложение добавлено.');
}

function resetForm() {
  document.getElementById('appForm').reset();
  document.getElementById('appId').value = '';
  document.getElementById('submitBtn').textContent = 'Добавить приложение';
  document.getElementById('cancelEditBtn').hidden = true;
}

function renderAdminList() {
  const apps = getAllApps();
  const list = document.getElementById('adminList');

  if (!apps.length) {
    list.innerHTML = '<p class="empty-state">Приложений пока нет — добавьте первое через форму выше.</p>';
    return;
  }

  list.innerHTML = apps
    .map(
      (app) => `
      <div class="admin-row">
        <div class="admin-row-icon">${iconMarkup(app)}</div>
        <div class="admin-row-body">
          <strong>${escapeHtml(app.name)}</strong>
          <span>${escapeHtml(getCategory(app.category).label)}${app.featured ? ' · главная карточка' : ''}</span>
        </div>
        <div class="admin-row-actions">
          <button type="button" data-edit="${app.id}">Изменить</button>
          <button type="button" data-delete="${app.id}" class="danger">Удалить</button>
        </div>
      </div>`
    )
    .join('');

  list.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => editApp(btn.dataset.edit)));
  list.querySelectorAll('[data-delete]').forEach((btn) => btn.addEventListener('click', () => removeApp(btn.dataset.delete)));
}

function editApp(id) {
  const app = getAppById(id);
  if (!app) return;

  document.getElementById('appId').value = app.id;
  document.getElementById('fieldName').value = app.name || '';
  document.getElementById('fieldDeveloper').value = app.developer || '';
  document.getElementById('fieldCategory').value = app.category || '';
  document.getElementById('fieldTagline').value = app.tagline || '';
  document.getElementById('fieldDescription').value = app.description || '';
  document.getElementById('fieldUrl').value = app.storeUrl || '';
  document.getElementById('fieldIcon').value = app.icon || '';
  document.getElementById('fieldScreens').value = (app.screenshots || []).join('\n');
  document.getElementById('fieldFeatured').checked = !!app.featured;
  document.getElementById('submitBtn').textContent = 'Сохранить изменения';
  document.getElementById('cancelEditBtn').hidden = false;

  document.getElementById('appForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function removeApp(id) {
  const app = getAppById(id);
  if (!app) return;
  if (!confirm(`Удалить «${app.name}»?`)) return;
  deleteApp(id);
  renderAdminList();
  showStatus('Приложение удалено.');
}

function handleExport() {
  const blob = new Blob([exportAppsAsJson()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'apps-export.json';
  a.click();
  URL.revokeObjectURL(url);
  showStatus('Файл apps-export.json скачан. Как опубликовать изменения для всех — см. README.md.');
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      importAppsFromJson(reader.result);
      renderAdminList();
      showStatus('Импорт выполнен.');
    } catch (err) {
      alert(`Не получилось прочитать файл: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
}

function showStatus(message) {
  const el = document.getElementById('adminStatus');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => { el.hidden = true; }, 4000);
}
