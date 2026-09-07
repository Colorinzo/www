(() => {
  "use strict";

  /*
   * ВАЖНО: в статическом фронтенде невозможно сделать секретный PIN.
   * Он хранится здесь только как локальный convenience gate.
   * Для реальной защиты нужен сервер/API с проверкой секрета на сервере.
   */
  const ADMIN_PIN = "2026";
  const SESSION_KEY = "vitrina.admin.session.v1";
  const store = window.VitrinaStore;

  const loginPanel = document.getElementById("loginPanel");
  const adminPanel = document.getElementById("adminPanel");
  const loginForm = document.getElementById("loginForm");
  const pinInput = document.getElementById("pinInput");
  const loginError = document.getElementById("loginError");
  const logoutButton = document.getElementById("logoutButton");

  const form = document.getElementById("appForm");
  const formTitle = document.getElementById("formTitle");
  const status = document.getElementById("formStatus");
  const dataStatus = document.getElementById("dataStatus");
  const list = document.getElementById("adminList");
  const countLabel = document.getElementById("countLabel");

  const fields = {
    id: document.getElementById("appId"),
    name: document.getElementById("name"),
    category: document.getElementById("category"),
    tagline: document.getElementById("tagline"),
    releaseDate: document.getElementById("releaseDate"),
    description: document.getElementById("description"),
    iconUrl: document.getElementById("iconUrl"),
    storeUrl: document.getElementById("storeUrl"),
    screenshots: document.getElementById("screenshots"),
    featured: document.getElementById("featured")
  };

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  function showAdmin() {
    loginPanel.hidden = true;
    adminPanel.hidden = false;
    renderCategories();
    renderList();
  }

  function showLogin() {
    loginPanel.hidden = false;
    adminPanel.hidden = true;
  }

  function renderCategories() {
    fields.category.innerHTML = store.DATA.categories.map((item) =>
      `<option value="${store.escapeHtml(item.id)}">${store.escapeHtml(item.label)}</option>`
    ).join("");
  }

  function resetForm() {
    form.reset();
    fields.id.value = "";
    fields.storeUrl.value = "";
    formTitle.textContent = "Новое приложение";
    status.textContent = "";
  }

  function fillForm(app) {
    fields.id.value = app.id;
    fields.name.value = app.name;
    fields.category.value = app.category;
    fields.tagline.value = app.tagline;
    fields.releaseDate.value = app.releaseDate;
    fields.description.value = app.description;
    fields.iconUrl.value = app.iconUrl;
    fields.storeUrl.value = app.storeUrl === "#" ? "" : app.storeUrl;
    fields.screenshots.value = app.screenshots.join("\n");
    fields.featured.checked = app.featured;
    formTitle.textContent = `Редактирование: ${app.name}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function readForm() {
    const id = fields.id.value.trim() || store.makeUniqueId(fields.name.value);
    const screenshots = fields.screenshots.value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      id,
      name: fields.name.value.trim(),
      category: fields.category.value,
      tagline: fields.tagline.value.trim(),
      description: fields.description.value.trim(),
      iconUrl: fields.iconUrl.value.trim(),
      storeUrl: fields.storeUrl.value.trim() || "#",
      screenshots,
      featured: fields.featured.checked,
      releaseDate: fields.releaseDate.value
    };
  }

  function renderList() {
    const apps = store.getApps();
    countLabel.textContent = String(apps.length);

    list.innerHTML = apps.map((app) => `
      <article class="admin-item">
        <div class="admin-item-main">
          ${store.iconMarkup(app, "admin-icon")}
          <div>
            <h3>${store.escapeHtml(app.name)} ${app.featured ? "★" : ""}</h3>
            <p>${store.escapeHtml(store.categoryLabel(app.category))} · ${store.escapeHtml(app.id)}</p>
          </div>
        </div>
        <div class="button-row">
          <button class="button small" type="button" data-edit="${store.escapeHtml(app.id)}">Изменить</button>
          <button class="button small danger" type="button" data-delete="${store.escapeHtml(app.id)}">Удалить</button>
        </div>
      </article>
    `).join("");

    list.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        const app = store.getAppById(button.dataset.edit);
        if (app) fillForm(app);
      });
    });

    list.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", () => {
        const app = store.getAppById(button.dataset.delete);
        if (!app) return;
        if (!window.confirm(`Удалить «${app.name}»?`)) return;

        try {
          store.removeApp(app.id);
          renderList();
          status.textContent = "Удалено.";
        } catch (error) {
          status.textContent = error.message;
        }
      });
    });
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loginError.hidden = pinInput.value === ADMIN_PIN;
    if (!loginError.hidden) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    pinInput.value = "";
    showAdmin();
  });

  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
  });

  document.getElementById("resetButton").addEventListener("click", resetForm);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";

    try {
      const data = readForm();
      if (fields.id.value) {
        store.updateApp(fields.id.value, data);
        status.textContent = "Изменения сохранены.";
      } else {
        store.createApp(data);
        status.textContent = "Приложение добавлено.";
      }
      resetForm();
      renderList();
    } catch (error) {
      status.textContent = error.message || "Не удалось сохранить.";
    }
  });

  document.getElementById("exportButton").addEventListener("click", () => {
    try {
      store.exportApps();
      dataStatus.textContent = "JSON экспортирован.";
    } catch (error) {
      dataStatus.textContent = error.message;
    }
  });

  document.getElementById("importInput").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const apps = await store.importAppsFromFile(file);
      dataStatus.textContent = `Импортировано: ${apps.length}.`;
      resetForm();
      renderList();
    } catch (error) {
      dataStatus.textContent = error.message || "Импорт не удался.";
    } finally {
      event.target.value = "";
    }
  });

  renderCategories();
  if (isLoggedIn()) showAdmin();
  else showLogin();
})();
